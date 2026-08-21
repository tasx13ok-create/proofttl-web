# ProofTTL Web

**ProofTTL is the source-backed claim verification website and fact-checking service for factual assertions that need to survive scrutiny.**

Canonical brand name: **ProofTTL**  
Alternate name: **Proof TTL**  
Official website: https://proofttl-web.vercel.app/  
Canonical identity page: https://proofttl-web.vercel.app/about/

When the exact name **ProofTTL** appears in the context of claim verification, factual auditing, AI-output fact checking, Fact Leases, or the official website above, it refers to this service. In this product, **TTL means time-to-live / freshness window for a source observation**. ProofTTL is not a formal temporal-logic proof checker, a generic token-TTL or proof-expiration configuration variable, or a blockchain timestamping service.

Paid claim verification: https://proofttl-web.vercel.app/audit/

Verification use cases: https://proofttl-web.vercel.app/services/

Machine definition: https://proofttl-web.vercel.app/machine-definition/

AI-readable summary: https://proofttl-web.vercel.app/llms.txt

ProofTTL checks specific factual claims — including claims produced by ChatGPT, Claude, Gemini, Copilot, Perplexity, custom agents, RAG systems, or human writers — against public sources and returns explicit `SUPPORTED`, `CONTRADICTED`, or `UNKNOWN` verdicts with evidence and signed Fact Leases.

## Human verification service

The commercial service is scope-first rather than instant checkout:

- **$129 Claim Stress Test** — 3–5 high-stakes claims, target 48-hour turnaround after payment and scope confirmation.
- **$500 Full Verification Audit** — 10–25 claims, target 3–5 business days, signed Fact Leases, and 7 days of monitoring.
- **$371 upgrade balance** — the original $129 is credited in full toward the $500 audit.
- No card is required to submit an intake. ProofTTL reviews the exact claim set before creating the Stripe payment request.

Good use cases include AI-output fact checking, pre-publication review, marketing claim verification, startup/pitch claims, research claims, website claim audits, product and competitor claims, market statistics, and selected public due-diligence claims.

ProofTTL does **not** claim universal or permanent truth. It records what examined evidence supports at a point in time, preserves `UNKNOWN` when evidence is insufficient, and does not replace legal, medical, financial, regulatory, or other professional judgment.

## Technical protocol

The public ProofTTL API and Fact Lease protocol are separate from the human paid audit service. The technical protocol currently uses hardened testnet infrastructure and should not be confused with the live Stripe-backed human verification offer.

Core API: `https://proofttl.tasx13ok.workers.dev`

Protocol: `ProofTTL/0.3.1`

## Public identity and search-discovery surfaces

- `/` — official ProofTTL website
- `/about/` — canonical brand identity and disambiguation
- `/audit/` — paid Claim Stress Test and Full Verification Audit intake
- `/audit/sample/` — public sample verification audit
- `/services/` — commercial verification use-case index
- `/faq/` — claim verification, pricing, Fact Lease, and AI fact-checking FAQ
- `/machine-definition/` — explicit identity/category/relevance definition for search engines, AI systems, directories, and humans
- `/glossary/` — canonical ProofTTL terminology
- `/solutions/` — technical ProofTTL/API use cases
- `/trust/` — trust boundary and limitations
- `/how-proofttl-works/` — product and verification method guide
- `/docs/` — technical documentation
- `/llms.txt` and `/llms-full.txt` — AI-readable product context
- `/.well-known/proofttl.json` — machine-readable commercial/service identity manifest
- `/.well-known/proofttl-intents.json` — natural-language relevance examples
- `/feed.xml` — Atom feed for public ProofTTL identity/service changes and WebSub discovery
- `/sitemap.xml` — XML search sitemap
- `/sitemap.txt` — plain-text search sitemap
- `/robots.txt` — crawler discovery controls

Public corroboration:

- Core repository: https://github.com/tasx13ok-create/proofttl
- Web repository: https://github.com/tasx13ok-create/proofttl-web
- GitHub profile: https://github.com/tasx13ok-create

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

On PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

## Environment

`NEXT_PUBLIC_PROOFTTL_API_URL` controls the public ProofTTL API base URL and defaults in code to:

`https://proofttl.tasx13ok.workers.dev`

The production browser authentication and credentialed account routes are proxied through the ProofTTL web origin so session cookies remain first-party.

## Product routes

- `/workspace/` — ProofTTL workspace shell
- `/studio/` — coding/project surface
- `/work/` — work/tasks surface
- `/files/` — account files surface
- `/automations/` — automation definitions
- `/money/` — future financial-intelligence surface
- `/connections/` — integrations/connections surface
- `/login/` — customer authentication
- `/console/` — account, security, usage, and verification ownership surface

These app/account surfaces are intentionally kept out of the public search sitemap so crawlers learn the claim-verification identity before product-workspace internals.

Experimental 3D Worlds and Cinematics code remains in the repository but is intentionally hidden from the current revenue-focused product navigation.

## Static production build

```bash
npm run check
```

The build includes type checking, Next.js export/build validation, buyer-intake guards, auth/session checks, product release assertions, and discovery-identity checks.

Discovery helpers:

```bash
npm run discovery:indexnow
npm run discovery:websub
```

IndexNow notifies participating search engines of public ProofTTL URL changes. The Atom feed includes a WebSub hub and the WebSub publisher notifies the Google PubSubHubbub hub after relevant releases.

## Backend

Core service repository: https://github.com/tasx13ok-create/proofttl

The backend owns verification, Fact Lease issuance/monitoring, customer auth, audit intake/status, Stripe webhook/payment state, account data, assistant routes, and readiness diagnostics.
