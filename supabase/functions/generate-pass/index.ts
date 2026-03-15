// Supabase Edge Function — generate-pass
// Calls WalletWallet API server-side to avoid CORS issues

const WALLETWALLET_API_KEY = Deno.env.get('WALLETWALLET_API_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, tier, discount, firstname, lastname } = await req.json();

    if (!code || !tier || !discount || !firstname || !lastname) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tierLabels: Record<string, string> = {
      silver: 'Silver −5%',
      gold: 'Gold −10%',
      black: 'Black −20%',
    };

    const colorPresets: Record<string, string> = {
      silver: 'light',
      gold: 'dark',
      black: 'dark',
    };

    // Call WalletWallet API
    const resp = await fetch('https://api.walletwallet.dev/api/pkpass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WALLETWALLET_API_KEY}`,
      },
      body: JSON.stringify({
        barcodeValue: code,
        barcodeFormat: 'QR',
        title: 'Kafé — Carte de fidélité',
        label: `${firstname} ${lastname}`,
        value: tierLabels[tier] ?? tier,
        colorPreset: colorPresets[tier] ?? 'dark',
        expirationDays: 730,
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('WalletWallet error:', err);
      return new Response(JSON.stringify({ error: 'WalletWallet API error', detail: err }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the .pkpass file as base64
    const buffer = await resp.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    return new Response(JSON.stringify({ pkpass: base64 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
