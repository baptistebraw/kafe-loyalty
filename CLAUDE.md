# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Kafé loyalty is a static-HTML multi-page app for the Parisian coffee shop "Serendipity Coffee & Triangles" (brand: Kafé). It bundles three loosely-related tools behind one Supabase project:

1. **Loyalty program** — Silver/Gold/Black tier cards (5/10/20% discount) + a public `member` tier (5%) created via self-service signup. Cards are issued as QR codes that add to Apple Wallet (`.pkpass` via WalletWallet) and Google Wallet (signed JWT).
2. **KPI dashboard** — reads/imports Square POS sales, classifies items into business categories, displays revenue charts and Top-10 products.
3. **Catering landing + admin** — editable marketing page backed by a single `catering_content` row.

All UI text is in **French**. Do not translate unless explicitly asked.

## Architecture

### No build system
There is no package.json, bundler, or compile step. Every `*.html` file at the repo root is a standalone page that loads Supabase JS, Chart.js, html5-qrcode, qrcodejs, etc. from CDNs. Edit HTML/JS/CSS in-place and deploy — Vercel serves the files as-is.

Consequence: do **not** introduce a build tool, framework, or `npm` dependency without explicit request. Shared logic is currently duplicated across pages by design.

### Routing
`vercel.json` rewrites:
- `/` → `catering.html` (domain `catering.kafe.paris`)
- `/kpi` → `kpi.html`
- `/import-sales` → `import-sales.html`

All other pages are reached directly by filename (e.g. `/dashboard.html`, `/join.html`, `/scanner.html`). The loyalty domain is `loyalty.kafe.paris`.

### Supabase backend

Single project: `https://hnnqbcfmoppcspewchxh.supabase.co`. The anon key is **intentionally embedded** in every HTML page — RLS policies are what gate access, not secrecy of the anon key. Never commit the service-role key; it lives only in edge-function env vars.

Tables referenced by the frontend:
- `loyalty_cards` — `code, tier, discount, status, client_firstname, client_lastname, client_email, activated_at, notes, ...`
- `sales` — Square line items (see `supabase/migrations/001_create_sales.sql`; unique on `(transaction_id, item, time)`)
- `catering_content` — single row (`id=1`) with a JSON `data` column driving catering.html
- `scan_logs` — written by scanner.html on each verify

Auth: pages that must be gated use `sb.auth.signInWithPassword({ email, password })` and call `sb.auth.getSession()` on load to auto-skip the login screen. There is no sign-up flow for staff — accounts are created in Supabase dashboard.

### Edge functions (`supabase/functions/*/index.ts`, Deno runtime)

- `create-member-card` — called by `join.html`. Inserts a `loyalty_cards` row (tier=`member`, discount=5), then generates **both** an Apple Wallet `.pkpass` (via WalletWallet API) and a Google Wallet save URL (inline JWT signing — does **not** call the sibling function, to avoid inter-function HTTP). Dedupes on `client_email` where `status='active'`.
- `generate-pass` — server-side proxy to WalletWallet (avoids browser CORS). Used by `activate.html` for physical cards.
- `google-wallet-pass` — builds and RS256-signs the Google Wallet JWT. `ISSUER_ID` and `CLASS_ID` are hard-coded; `kafe_loyalty_member` is the loyalty class.
- `sync-square-sales` — fetches Square `orders/search` (paginated), transforms line items, upserts into `sales` with `onConflict: 'transaction_id,item,time', ignoreDuplicates: true`. `GET` = last 7 days, `POST {start_date, end_date}` = custom range. Timezone is **Europe/Paris** and amounts come in centimes → euros.

Edge-function env vars (set in Supabase dashboard):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WALLETWALLET_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (PEM, `\n` literals are handled), `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`.

### Page map
| Page | Purpose |
|---|---|
| `catering.html` | Public catering landing (renders from `catering_content.data`) |
| `catering-admin.html` | Auth-gated editor for `catering_content` |
| `dashboard.html` | Merchant dashboard: create individual cards, print batches, list/search cards |
| `join.html` | Public signup → calls `create-member-card` |
| `activate.html` | Scan target from printed QR → activates a pre-issued card + provisions wallet passes |
| `scanner.html` | Staff camera scanner (html5-qrcode) → reads code, fetches card, writes `scan_logs` |
| `verify.html` | Same as scanner but keyboard/manual entry flow |
| `kpi.html` | Sales KPI dashboard — reads `sales`, classifies items, renders Chart.js charts |
| `import-sales.html` | Manual CSV upload path for Square exports (alternative to `sync-square-sales`) |
| `labels.html` / `print.html` / `qr-flyer.html` | Printable layouts (labels, batched cards, single flyer) |

### Sales classification (critical for KPI)

`kpi.html` contains the Square → business-category mapping:
- `BARISTA_PATTERNS`, `FOOD_PATTERNS`, `PATISSERIE_PATTERNS`, `FRIGO_PATTERNS` — exact match **or** `startsWith(pattern + ' ')` to absorb Square variants (e.g. `Latte Vanille`).
- `IGNORE_ITEMS` — modifiers like `Lait végétal` that must not count as their own line.
- `normalizeItem()` collapses variant names (`Triangle seul`/`Triangle` → `Triangle`, `Combo Triangle …` → `Combo Triangle`, etc.) so Top-10 aggregation is meaningful.

When adding new menu items, update these lists in `kpi.html` — otherwise the item falls into `Autre` and skews reporting.

## Development

### Running locally
Any static file server works. Examples:
```
python3 -m http.server 8000
# or
npx serve .
```
Then open `http://localhost:8000/<page>.html`. Supabase calls go to production — there is no local Supabase. Be careful when testing mutations (`loyalty_cards`, `sales`, `catering_content`).

### Supabase CLI (edge functions & migrations)
```
supabase functions serve <name>       # local run (needs env vars in .env)
supabase functions deploy <name>      # deploy single function
supabase db push                      # apply supabase/migrations/*.sql
```
`supabase/.temp/` is gitignored CLI state — do not edit.

### Deploy
Pushing to the tracked branch triggers Vercel. No tests, lint, or CI.

## Conventions

- **Embedded JS/CSS**: keep all page logic inside the HTML file it belongs to. Do not extract shared modules unless asked — the project deliberately avoids a bundler.
- **Secrets**: anon key is public; **never** paste `service_role` keys or Square/Google/WalletWallet credentials into HTML. They belong in edge-function env vars only. `google-credentials.json` is gitignored.
- **IDs**: new loyalty card `code` is `crypto.randomUUID().replace(/-/g,'').slice(0,16).toUpperCase()` — reuse this pattern for uniqueness + QR readability.
- **Money**: Square returns amounts in centimes; divide by 100 before storing. Dates/times in `sales` are always Europe/Paris wall-clock (see `parseDateTime` in `sync-square-sales`).
- **Upserts into `sales`**: always use `onConflict: 'transaction_id,item,time'` with `ignoreDuplicates: true` to stay idempotent.
- **French commit messages** are the norm (mixed with English); match the existing style of the area you are editing.
