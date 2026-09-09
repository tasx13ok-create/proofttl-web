# ProofTTL deployment

Production is https://proofttl-web.vercel.app/ on **Vercel**. The backend is https://proofttl.tasx13ok.workers.dev on **Cloudflare Workers**. Older Pages instructions and statements that login was disabled were stale.

Next.js static export produces out/. Vercel also runs api/auth-proxy.js and api/runtime-proxy.js, routed by vercel.json. These implement first-party auth cookies and narrow customer runtime access. Serving out/ alone does not reproduce the integrated buyer flow. Production headers come from vercel.json; public/_headers is static-host compatibility.

Install with npm ci --no-audit --no-fund. Copy .env.example to .env.local. Run npm run check (typecheck, export and release guards), then npm run dev for public-page UI work. Ordinary next dev does not run standalone Vercel API functions. For integrated local tests use a separately configured test backend and Vercel's local runtime. The proxies use the fixed production Worker hostname: changing NEXT_PUBLIC_PROOFTTL_API_URL alone does not retarget them. Never submit synthetic payment/customer writes to production while testing local UI.

The current offer is $1,500 USD, scope first. Backend secrets stay in Cloudflare. NEXT_PUBLIC values are public browser configuration, never secrets. Auth public URL, web URL, trusted origins, OAuth callbacks and passkey RP/origin must agree with the Vercel hostname.

Use a review branch and the existing Vercel Git integration. Confirm CI and deployed commit. A local build is not deployment. Inspect home, audit, sample, services, FAQ, trust, about, login and audit status at desktop and mobile widths. Anonymous /api/auth/get-session should return JSON null. Readiness is configuration evidence, not proof of completed login/payment.

TypeScript excludes generated out/; the intake source check normalizes Windows CRLF. This fixes repeat builds without deleting source. Use a reviewed git revert or provider rollback if needed; never force-push or delete customer data. No hosting migration or custom domain is needed.

Read ../proofttl/OPERATIONS/OWNER-GUIDE.md for full commands and ../proofttl/OPERATIONS/STATUS.md for actual verification/deployment state.

