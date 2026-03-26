// Supabase Edge Function — google-wallet-pass
// Génère un JWT signé pour "Add to Google Wallet" (Loyalty Object)
// Doc: https://developers.google.com/wallet/retail/loyalty-cards/web

const ISSUER_ID  = '3388000000023087064';
const CLASS_ID   = `${ISSUER_ID}.kafe_loyalty_member`;

const SA_EMAIL   = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL') ?? '';
const SA_KEY_RAW = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Helpers JWT RS256 ────────────────────────────────────────────────────────

function b64url(data: string | ArrayBuffer): string {
  const str = typeof data === 'string'
    ? data
    : String.fromCharCode(...new Uint8Array(data));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  // Nettoyer le PEM (gère les \n littéraux dans les env vars)
  const clean = pem
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');

  const der = Uint8Array.from(atob(clean), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    der.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function signJWT(payload: object, privateKey: CryptoKey): Promise<string> {
  const header  = { alg: 'RS256', typ: 'JWT' };
  const hb64    = b64url(JSON.stringify(header));
  const pb64    = b64url(JSON.stringify(payload));
  const input   = `${hb64}.${pb64}`;
  const sig     = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(input),
  );
  return `${input}.${b64url(sig)}`;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!SA_EMAIL || !SA_KEY_RAW) {
    return new Response(
      JSON.stringify({ error: 'Missing Google service account env vars' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const { code, discount, firstname, lastname } = await req.json();

    if (!code || !discount || !firstname || !lastname) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ID de l'objet : doit être unique par carte
    const objectId = `${ISSUER_ID}.${code.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    const loyaltyObject = {
      id:        objectId,
      classId:   CLASS_ID,
      state:     'ACTIVE',
      accountId: code,
      accountName: `${firstname} ${lastname}`,
      barcode: {
        type:          'QR_CODE',
        value:         code,
        alternateText: code,
      },
      loyaltyPoints: {
        label:   'Réduction',
        balance: { string: `${discount}%` },
      },
      textModulesData: [
        {
          header: 'Avantage membre',
          body:   `${discount}% de réduction à chaque visite · Coffee & Triangles, 12 rue Martel Paris 10e`,
          id:     'benefit',
        },
      ],
      linksModuleData: {
        uris: [
          {
            uri:         'https://loyalty.kafe.paris',
            description: 'Programme fidélité Kafé',
            id:          'website',
          },
        ],
      },
    };

    const jwtPayload = {
      iss:     SA_EMAIL,
      aud:     'google',
      typ:     'savetowallet',
      iat:     Math.floor(Date.now() / 1000),
      payload: { loyaltyObjects: [loyaltyObject] },
      origins: ['https://loyalty.kafe.paris', 'https://kafe-landing.vercel.app'],
    };

    const privateKey = await importPrivateKey(SA_KEY_RAW);
    const jwt        = await signJWT(jwtPayload, privateKey);
    const url        = `https://pay.google.com/gp/v/save/${jwt}`;

    return new Response(JSON.stringify({ url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('google-wallet-pass error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
