// Supabase Edge Function — sync-square-sales
// Synchronise les ventes Square → table sales dans Supabase.
// Appelable manuellement ou via cron.
// GET  → sync les 7 derniers jours
// POST { "start_date": "2026-04-01", "end_date": "2026-04-15" } → sync une période

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SQUARE_TOKEN     = Deno.env.get('SQUARE_ACCESS_TOKEN') ?? '';
const SQUARE_LOCATION  = Deno.env.get('SQUARE_LOCATION_ID') ?? '';

const SQUARE_API = 'https://connect.squareup.com/v2';
const SQUARE_VERSION = '2025-01-23';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Centimes → euros
function cents(money: { amount?: number } | undefined): number {
  return (money?.amount ?? 0) / 100;
}

// ISO datetime → { date: 'YYYY-MM-DD', time: 'HH:MM:SS' } en timezone Paris
function parseDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  // Format en Europe/Paris
  const parts = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}:${get('second')}`,
  };
}

// Fetch toutes les commandes Square sur une période (avec pagination)
async function fetchOrders(startAt: string, endAt: string): Promise<any[]> {
  const allOrders: any[] = [];
  let cursor: string | undefined;

  do {
    const body: any = {
      location_ids: [SQUARE_LOCATION],
      query: {
        filter: {
          date_time_filter: {
            created_at: { start_at: startAt, end_at: endAt },
          },
          state_filter: { states: ['COMPLETED'] },
        },
        sort: { sort_field: 'CREATED_AT', sort_order: 'ASC' },
      },
      limit: 500,
    };
    if (cursor) body.cursor = cursor;

    const res = await fetch(`${SQUARE_API}/orders/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SQUARE_TOKEN}`,
        'Square-Version': SQUARE_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Square API ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (data.orders) allOrders.push(...data.orders);
    cursor = data.cursor;
  } while (cursor);

  return allOrders;
}

// Transforme une commande Square en lignes pour la table sales
function orderToRows(order: any): any[] {
  const { date, time } = parseDateTime(order.created_at);
  const tenderId = order.tenders?.[0]?.id ?? null;

  return (order.line_items ?? [])
    .filter((li: any) => li.item_type === 'ITEM')
    .map((li: any) => ({
      date,
      time,
      category: null, // sera mappé côté dashboard
      item: li.name ?? 'Inconnu',
      qty: parseFloat(li.quantity) || 1,
      product_sales: cents(li.variation_total_price_money ?? li.base_price_money),
      discounts: -cents(li.total_discount_money),
      net_sales: cents(li.total_money),
      tax: cents(li.total_tax_money),
      gross_sales: cents(li.total_money) + cents(li.total_tax_money),
      transaction_id: order.id,
      payment_id: tenderId,
      dining_option: null,
      employee: null,
      notes: li.note || null,
    }));
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Déterminer la période
    let startDate: string;
    let endDate: string;

    if (req.method === 'POST') {
      const body = await req.json();
      startDate = body.start_date;
      endDate = body.end_date;
    } else {
      // Par défaut : 7 derniers jours
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = weekAgo.toISOString().slice(0, 10);
      endDate = now.toISOString().slice(0, 10);
    }

    const startAt = `${startDate}T00:00:00Z`;
    const endAt = `${endDate}T23:59:59Z`;

    // 1. Fetch les commandes Square
    const orders = await fetchOrders(startAt, endAt);

    // 2. Transformer en lignes (sales) + pourboires (order_tips)
    const rows = orders.flatMap(orderToRows);

    const tipRows = orders
      .filter(o => o.created_at)
      .map(o => {
        const { date, time } = parseDateTime(o.created_at);
        return {
          order_id: o.id,
          date,
          time,
          tip_amount: cents(o.total_tip_money),
        };
      });

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    let inserted = 0;
    let skipped = 0;
    let tipsUpserted = 0;
    let tipsSum = 0;

    if (rows.length > 0) {
      // 3a. Upsert dans sales par batch de 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await sb
          .from('sales')
          .upsert(batch, { onConflict: 'transaction_id,item,time', ignoreDuplicates: true });

        if (error) {
          console.error('sales upsert error:', error);
          skipped += batch.length;
        } else {
          inserted += batch.length;
        }
      }
    }

    // 3b. Upsert pourboires (un seul row par ordre, on update si tip change)
    if (tipRows.length > 0) {
      for (let i = 0; i < tipRows.length; i += 100) {
        const batch = tipRows.slice(i, i + 100);
        const { error } = await sb
          .from('order_tips')
          .upsert(batch, { onConflict: 'order_id' });

        if (error) {
          console.error('order_tips upsert error:', error);
        } else {
          tipsUpserted += batch.length;
          tipsSum += batch.reduce((s, r) => s + Number(r.tip_amount || 0), 0);
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        period: { start: startDate, end: endDate },
        orders: orders.length,
        rows: rows.length,
        inserted,
        skipped,
        tips_upserted: tipsUpserted,
        tips_total_eur: Math.round(tipsSum * 100) / 100,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
