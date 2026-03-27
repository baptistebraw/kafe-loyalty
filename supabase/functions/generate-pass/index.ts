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
        title:        'Serendipity Coffee & Triangles',
        label:        `${firstname} ${lastname}`,
        value:        `Member - ${discount}% discount`,
        color:        '#7a9e8f',
        logoURL:      'https://loyalty.kafe.paris/assets/kafe-wordmark.png',
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
    // Note: spread (...) crashes on large buffers — use a loop instead
    const buffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

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
