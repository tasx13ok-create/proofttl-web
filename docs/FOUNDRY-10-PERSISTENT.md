# FOUNDRY-10 persistent control plane

FOUNDRY-10 is a supervised revenue-experiment runtime. It does not count generated ideas, checkout creation, page visits, or model confidence as revenue.

## Production topology

- **Operator UI:** `/foundry10/` on the ProofTTL Vercel deployment.
- **Browser API:** same-origin `/api/foundry10/*` Vercel function proxy.
- **Authentication:** the existing ProofTTL owner session. The browser does not receive or persist an operator key.
- **Persistent state:** Supabase Postgres tables prefixed `f10_`.
- **Runtime:** Supabase Edge Function `foundry10-api`.
- **Autonomous scheduler:** Supabase `pg_cron`, one guarded cycle every 15 minutes.
- **Free discovery:** direct public Ask HN data through the Algolia HN API. Discovery is capped by backlog and at most three new experiments per discovery run.
- **Launch processor:** an hourly condition-watch processes only explicitly approved `payment_link` approvals, creates one live Stripe Product/Price/Payment Link, writes Stripe IDs back to the ledger, generates a one-time buyer delivery capability, and queues distribution. Idempotency is keyed to the approval/experiment IDs.
- **Buyer fulfillment:** Stripe redirects paid buyers to `/foundry-delivery/` with a fragment-only access token. Only the SHA-256 digest is persisted; the browser clears the fragment before calling the private no-store delivery proxy.
- **Distribution processor:** an hourly condition-watch acts only on explicitly approved `outbound_message` approvals and may schedule one truthful text-only Threads post through Metricool. No DMs, mass email, fake social proof, or unsupported channel automation.
- **Revenue reconciliation:** successful Stripe Checkout Sessions for the live $5 Release Gate are reconciled by the connected hourly FOUNDRY Revenue Sync automation. Only paid completed sessions count. Refunds are negative economics adjustments.
- **3D office:** Three.js control visualization driven by persistent agent/experiment state, with interactive orbit/zoom, agent desks, finance/risk stations, earnings wall, and experiment table.

## Task lifecycle

`validation -> strategy -> build -> listing -> public-listing approval -> payment-link approval -> launch -> distribution plan -> outbound approval -> analytics`

Important tasks require two independent agent touches. A single hard rejection from the paired validator stops the experiment. Regulated/high-consequence signals escalate to operator review.

## Economic governor

Only realized economics in `f10_events` affect the governor.

- Revenue <= $25: $0 reinvestment
- $25-$100: up to 20%
- $100-$500: up to 25%
- > $500: up to 30%

Recorded costs reduce the remaining reinvestment ceiling.

## Safety boundaries

- No automatic outbound messages, public listings, payment-link creation, account integration, or pricing change without an approval record.
- Payment-link creation and outbound distribution are separate approvals; approving one does not implicitly approve the other.
- Paid artifact access is capability-token gated. The token is never committed to GitHub, stored in event payloads, or exposed in Stripe metadata.
- No paid inference while realized revenue remains below the governor threshold.
- Prohibited/weapon/drug/gambling/malware/political-persuasion opportunity signals are rejected by discovery.
- Public problem posts are treated as signals, never proof of willingness to pay.
- Owner controls can pause, kill, approve/reject, manually run discovery, run a cycle, and record realized economics.
- The scheduler endpoint is rate-limited and is not exposed by the browser proxy.

## Source-of-truth files

- `supabase/functions/foundry10-api/index.ts`
- `supabase/foundry10/schema.sql`
- `supabase/foundry10/scheduler.sql`
- `api/foundry10-proxy.js`
- `api/foundry-offer.js`
- `api/foundry-delivery.js`
- `app/foundry10/Foundry10Client.tsx`
- `app/foundry-delivery/FoundryDeliveryClient.tsx`
- `scripts/check-foundry10-control.mjs`
