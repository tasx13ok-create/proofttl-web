# ProofTTL Web

Production-facing frontend shell for ProofTTL.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

On PowerShell, you can use:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

## Environment

`NEXT_PUBLIC_PROOFTTL_API_URL` controls the public ProofTTL API base URL and defaults in code to:

`https://proofttl.tasx13ok.workers.dev`

## Current routes

- `/` — public marketing site and real browser `/verify` request flow
- `/login/` — disabled/future-ready Google, GitHub, Discord, and email login UI
- `/onboarding/` — private-profile onboarding preview
- `/get-started/` — current x402 testnet pricing handoff
- `/console/` — customer Console with honest empty states
- `/support/` — support surface; testnet issues route to GitHub

## Important behavior

- The browser demo submits the real ProofTTL request schema: `claim`, `source_url`, and `ttl_seconds`.
- An unsigned browser request to the protected `/verify` route should receive HTTP 402. The frontend reports that honestly instead of fabricating a successful payment.
- x402 wallet/payment handling is not embedded in this frontend yet.
- Login, customer data, account payment history, and admin functionality are intentionally not faked. They should only become functional after real backend/auth implementations exist.
- Authentication requirements and acceptance criteria are documented in `AUTH-SECURITY.md`.

## Static production build

The current testnet frontend is configured as a Next.js static export:

```bash
npm run check:export
```

A successful build produces `out/`, including all current routes and the Cloudflare Pages `_headers` file.

See `DEPLOYMENT.md` for the zero-cost Cloudflare Pages deployment path.

## Backend

Core service repository: `tasx13ok-create/proofttl`.

## Zero-cost launch target

- API: `https://proofttl.tasx13ok.workers.dev`
- Frontend: free Cloudflare Pages `*.pages.dev` hostname after deployment
- Custom domain: not required for launch

Do not make a custom domain a launch dependency. Revisit domain registration only if the project later has a reason and budget for it.
