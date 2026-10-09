# ProofTTL Redirect-to-Verification Distribution Plan

Status: proposed implementation specification. This document does not claim the features below are implemented or deployed.

## Objective

Turn the existing ProofTTL API and MCP into a measurable distribution loop. Rather than asking every prospective user to adopt a new tool, make it easy for people and compatible applications to route a specific claim to ProofTTL, inspect the evidence, and share the resulting audit.

Keep the existing verification engine, API, MCP, Fact Lease protocol, and paid human-audit workflow. Build distribution around them; do not rebuild working verification infrastructure.

## Product principle

**Route the claim to evidence, not the person to a sales pitch.**

A ProofTTL entry point should have one clear purpose:
- inspect an existing verification report;
- verify a public claim or source; or
- request a scoped human-reviewed audit.

Never present an unverified claim as false merely because it has not been checked. Preserve the existing SUPPORTED, CONTRADICTED, and UNKNOWN distinction and the product's time-bounded evidence limitations.

## Existing surfaces to preserve

The repository README documents these existing surfaces:
- Website: https://proofttl-web.vercel.app/
- Paid audit intake: https://proofttl-web.vercel.app/audit/
- Sample audit: https://proofttl-web.vercel.app/audit/sample/
- Technical API: https://proofttl.tasx13ok.workers.dev
- MCP endpoint: https://proofttl-web.vercel.app/api/mcp/
- API discovery: GET /openapi.json
- Machine-readable identity: GET /.well-known/proofttl.json

The technical API / Fact Lease protocol and the human-reviewed commercial audit are separate systems and must remain clearly distinguished. The README describes x402 verification as testnet-oriented; do not market it as mainnet production settlement.

## Proposed user journeys

### 1. Direct claim handoff

A referrer sends a visitor to a first-party ProofTTL entry point with a public claim or source URL. ProofTTL explains what will be checked before starting any billable or resource-intensive operation.

Prefer a server-issued opaque submission identifier over embedding claim text in a URL. Do not place private claims, access tokens, API keys, customer identifiers, or sensitive source material in query parameters, analytics events, or referrer-visible URLs.

For public, non-sensitive claims, a short human-readable claim may be supported only if it is length-bounded, encoded safely, and treated as untrusted input. URLs are not a storage system.

### 2. Evidence-first report sharing

Each completed verification should be shareable through a stable, read-only report URL when the owner has explicitly chosen to publish it. The report should identify:
- the exact claim and source(s) examined;
- the verdict (SUPPORTED, CONTRADICTED, or UNKNOWN);
- the observation/verification time and applicable freshness or expiry window;
- evidence supporting and challenging the claim;
- limitations, scope, and what was not checked;
- whether the result is machine-generated, human-reviewed, or both;
- an obvious path to run a new verification.

Private audit submissions and account-owned reports must not become public by default. Use unguessable identifiers and server-side authorization for private reports. A signed Fact Lease is not, by itself, permission to publish confidential underlying material.

### 3. MCP / API distribution

Keep the existing MCP and API as the execution layer. Make integration documentation copyable and specific:
- how a compatible agent discovers the ProofTTL capability;
- the exact input schema and supported claim/source requirements;
- how to interpret all three verdicts;
- timeout, error, rate-limit, and payment behavior;
- how to link users to a report or a new audit without exposing secrets;
- how to disclose that the check was performed by an external service.

Do not imply that ChatGPT, Claude, Gemini, or any other provider will automatically invoke ProofTTL without a configured integration or provider-supported action. Third-party integrations are a distribution target, not a guaranteed referral source.

### 4. Paid audit conversion

Keep the paid offers and intake rules that are documented in the repository authoritative. The public handoff may direct users to the existing intake when their needs require human review. Do not represent the $299 Rapid Claim Check's email-based intake as automated fulfillment. Do not request payment for the $1,500 Fact Audit until scope is confirmed through the existing workflow.

## Suggested route contract

Implement only after checking current route conventions and avoiding collisions with existing routes.

- /verify or /check: first-party entry page for a new public claim/source verification.
- /r/[publicReportId]: read-only published report, only if a public-report authorization model exists.
- /go/[campaignId]: optional first-party campaign/referral redirect; allowlist destinations and never create an open redirect.
- Existing /audit/ and /audit/sample/ remain canonical commercial/sample routes.

Do not ship duplicate routes if equivalent functionality already exists. Prefer extending the existing route and API contract.

## Attribution and measurement

Collect the minimum event set needed to decide whether redirect distribution works:
- referral_landing_view
- verification_started
- verification_completed
- report_shared
- report_opened
- paid_audit_intake_started
- paid_audit_scope_confirmed
- paid_audit_payment_completed

Event properties should be privacy-preserving and bounded: campaign/referrer category, route, outcome, coarse duration, and a random correlation ID. Do not log raw claim text, source page contents, auth credentials, payment details, or user-provided secrets.

Measure:
1. referral landing → verification start;
2. start → completion;
3. completed report → report share;
4. report open → follow-on verification;
5. referral source → qualified paid intake;
6. repeat use by source/integration.

Use the metrics to compare referral links, MCP/API integrations, and direct outreach. Avoid vanity metrics as the primary success criterion.

## Security and correctness requirements

- No arbitrary external redirect targets; use an allowlist or internal-only redirect destinations.
- Treat all query parameters, claim text, source URLs, and MCP input as untrusted.
- Preserve existing SSRF protections for source fetching and redirect revalidation.
- Never let a report ID alone bypass authorization for private audit/customer records.
- Do not expose private audit content through static export, public sitemap, search indexing, logs, or analytics.
- Keep payment amounts and payment state server-controlled.
- Do not bypass existing rate limits, quotas, x402 gates, or human approval requirements.
- Preserve UNKNOWN when the evidence does not justify a stronger verdict.
- Avoid language implying universal truth, permanent validity, or professional certification.
- Include a clear timestamp/freshness window and a way to request a new check.
- Add regression tests for encoded input, oversized input, malformed URLs, open redirects, private report access, unpublished reports, query-string leakage, attribution events, and paid intake handoff.

## Rollout sequence

### Phase 0 — audit existing behavior
Inspect current app routes, API/MCP schemas, auth ownership rules, report persistence, analytics, and deployment checks. Record which capabilities already exist. Do not duplicate them.

### Phase 1 — lowest-risk distribution surface
Ship a shareable, privacy-safe entry URL into an existing verification flow and improve the result's share/copy controls if missing. Add tests and event instrumentation. Avoid changing the verification algorithm or payment rails.

### Phase 2 — published report links
Add explicit publish/unpublish controls and server-enforced visibility rules. Keep private customer reports private by default. Add noindex controls unless a report is explicitly intended for public discovery.

### Phase 3 — integration handoff
Document a minimal MCP/API example that invokes the existing capability and returns a first-party report or verification entry URL. Add integration-specific instructions and clear attribution.

### Phase 4 — optimize from evidence
Review funnel conversion, failure rates, latency, repeat usage, and qualified paid leads. Only then expand to browser extensions, CMS integrations, or provider partnerships.

## Acceptance criteria

A release is not complete until:
- an external referral can reach the correct existing verification workflow;
- public claims are not confused with private customer submissions;
- an audit can be shared only according to explicit visibility/authorization rules;
- the three verdicts and freshness limitations remain visible;
- MCP/API behavior is unchanged unless separately tested and versioned;
- analytics do not capture claim text or secrets;
- open redirects, SSRF, and unauthorized report access are covered by tests;
- existing typecheck, build, MCP contract, product, auth, and discovery checks pass;
- the deployment is verified before any public launch claim is made.

## Non-goals

- Rewriting the existing MCP or API.
- Claiming automatic distribution through third-party AI providers without an actual integration.
- Making every report public or indexable by default.
- Treating a referral click as proof of market demand.
- Changing the current pricing, payment rails, or audit fulfillment process as part of the redirect work.
- Claiming this plan has shipped before implementation, testing, and deployment.

## First engineering task

Audit the current codebase and choose the smallest existing route/API extension that supports a privacy-safe claim handoff. Implement it on a feature branch, add regression tests, run the repository's documented release checks, and open a reviewable pull request. Do not merge or deploy until the tests and current architecture confirm the behavior.
