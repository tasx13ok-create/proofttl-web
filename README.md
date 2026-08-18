# ProofTTL Web

Production-facing frontend shell for ProofTTL.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment

`NEXT_PUBLIC_PROOFTTL_API_URL` controls the public ProofTTL API base URL and defaults in code to:

`https://proofttl.tasx13ok.workers.dev`

## Important behavior

- The browser demo submits the real ProofTTL request schema: `claim`, `source_url`, and `ttl_seconds`.
- An unsigned browser request to the protected `/verify` route should receive HTTP 402. The frontend reports that honestly instead of fabricating a successful payment.
- x402 wallet/payment handling is not embedded in this frontend yet.
- Login, customer data, billing management, and admin features are intentionally not faked here. They should only be exposed after real backend/auth implementations exist.

## Backend

Core service repository: `tasx13ok-create/proofttl`.

## Production domain plan

- Current live API: `https://proofttl.tasx13ok.workers.dev`
- Planned production API hostname: `https://api.proofttl.com`

The frontend should switch to the custom hostname only after `proofttl.com` is registered, active on Cloudflare, and the Worker custom domain is attached.
