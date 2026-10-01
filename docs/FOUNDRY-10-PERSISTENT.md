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
- **Revenue reconciliation:** successful Stripe Checkout Sessions for the live $5 Release Gate are reconciled by the connected hourly FOUNDRY Revenue Sync automation. Only paid completed sessions count. Refunds are negative economics adjustments.
- **3D office:** Three.js control visualization driven by persistent agent/experiment state.

## Task lifecycle

`validation -> strategy -> build -> listing -> operator approval -> distribution -> analytics`

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
- `app/foundry10/Foundry10Client.tsx`
- `scripts/check-foundry10-control.mjs`
