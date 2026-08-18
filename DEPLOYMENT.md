# ProofTTL Web — zero-cost deployment

The current ProofTTL frontend is intentionally deployable as a static Next.js export. This fits the current testnet product because verification happens client-side against the separate ProofTTL Worker API and account/auth controls are still non-functional previews.

## Current production target

- Frontend: a free Cloudflare Pages `*.pages.dev` hostname
- API: `https://proofttl.tasx13ok.workers.dev`
- Custom domain: not required

## Cloudflare Pages setup

In the Cloudflare dashboard:

1. Open **Workers & Pages**.
2. Select **Create application**.
3. Select **Pages**.
4. Choose **Import an existing Git repository**.
5. Select `tasx13ok-create/proofttl-web`.
6. Use production branch `main`.
7. Choose the **Next.js (Static HTML Export)** framework preset.
8. Build command: `npx next build`
9. Build output directory: `out`
10. Add this build environment variable:

```text
NEXT_PUBLIC_PROOFTTL_API_URL=https://proofttl.tasx13ok.workers.dev
```

11. Deploy.

Cloudflare will assign the project a `*.pages.dev` hostname. Git-connected Pages deployments rebuild automatically when `main` changes.

## Why static export is safe for the current frontend

The current frontend does not require a server-side Next.js runtime:

- the live verifier uses a browser `fetch` to the separate Worker API
- login is deliberately disabled until real authentication exists
- onboarding is a preview only
- Console data is currently honest empty-state UI
- Support currently routes to GitHub issues
- there are no Server Actions or application API routes

`next.config.mjs` uses:

```js
output: 'export'
trailingSlash: true
```

`next build` must produce the `out/` directory.

## Build gate

Run locally when dependencies are installed:

```powershell
npm install
npm run check:export
```

`check:export` requires these outputs to exist:

- `out/index.html`
- `out/login/index.html`
- `out/onboarding/index.html`
- `out/get-started/index.html`
- `out/console/index.html`
- `out/support/index.html`
- `out/_headers`

GitHub Actions performs the same static-export checks on pushes to `main`.

## Security headers

Static-export mode does not use Next.js server response headers. ProofTTL places its current static response rules in:

```text
public/_headers
```

Cloudflare Pages copies this file into the built output and applies those rules to static responses.

Current rules include:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- camera/microphone/geolocation disabled through `Permissions-Policy`
- `X-Frame-Options: DENY`

Do not add a strict Content Security Policy without testing the generated Next.js application; an incorrect CSP can break framework scripts.

## When real authentication arrives

Static Pages is a deployment choice for the current public/testnet frontend, not a permanent architecture promise.

When `/login` becomes functional, reevaluate the frontend runtime. Real authentication may require server-side callbacks, secure sessions/cookies, CSRF controls, email verification, and other server functionality described in `AUTH-SECURITY.md`.

At that point, migrate the frontend to a suitable Cloudflare Workers/full-stack deployment rather than weakening the auth design to preserve static hosting.

## No-spend rule

This deployment path does not require purchasing a custom domain. Keep the assigned `*.pages.dev` hostname until ProofTTL itself justifies paying for a domain.
