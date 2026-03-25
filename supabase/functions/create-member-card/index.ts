// Supabase Edge Function — create-member-card
// Crée une carte member (5%) à la volée depuis la landing page.
// Le QR de la landing pointe vers /join — chaque signup crée une nouvelle carte.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const WALLETWALLET_API_KEY = Deno.env.get('WALLETWALLET_API_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOGO_BASE64 = 'data:image/png;base64,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';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { firstname, lastname, email } = await req.json();

    if (!firstname || !lastname || !email) {
      return new Response(JSON.stringify({ error: 'Champs manquants' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Créer le client Supabase avec le service role (pour insérer sans restriction RLS)
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Générer un code unique pour la carte
    const code = crypto.randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase();

    // Vérifier si l'email a déjà une carte active
    const { data: existing } = await sb
      .from('loyalty_cards')
      .select('id, code')
      .eq('client_email', email)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: 'email_exists' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Créer la carte en DB
    const { data: card, error: insertError } = await sb
      .from('loyalty_cards')
      .insert({
        code,
        tier: 'member',
        discount: 5,
        status: 'active',
        client_firstname: firstname,
        client_lastname: lastname,
        client_email: email,
        activated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Générer le pass Apple Wallet via WalletWallet
    let pkpass: string | null = null;
    let walletError: string | null = null;
    try {
      const passResp = await fetch('https://api.walletwallet.dev/api/pkpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALLETWALLET_API_KEY}`,
        },
        body: JSON.stringify({
          barcodeValue: code,
          barcodeFormat: 'QR',
          title: 'member',
          label: `${firstname} ${lastname}`,
          value: '5% discount',
          color: '#7a9e8f',
          logoURL: LOGO_BASE64,
          expirationDays: 365,
        }),
      });

      if (passResp.ok) {
        const contentType = passResp.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          // Certaines versions retournent { pkpass: "base64..." }
          const json = await passResp.json();
          pkpass = json.pkpass ?? null;
        } else {
          // WalletWallet retourne le binaire .pkpass directement
          const buffer = await passResp.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          bytes.forEach(b => binary += String.fromCharCode(b));
          pkpass = btoa(binary);
        }
      } else {
        walletError = `HTTP ${passResp.status}: ${await passResp.text()}`;
        console.error('WalletWallet error:', walletError);
      }
    } catch (e) {
      walletError = String(e);
      console.warn('WalletWallet fetch error:', e);
    }

    return new Response(JSON.stringify({ success: true, code, pkpass, walletError }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
