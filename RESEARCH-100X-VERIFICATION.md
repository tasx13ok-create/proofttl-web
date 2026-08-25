# ProofTTL 100x Verification Research Roadmap

## Goal

ProofTTL should not compete as another instant AI fact checker. The product should become the independent verification layer used when a factual claim is consequential enough that the buyer needs to defend the conclusion later.

The benchmark is not prettier copy. The benchmark is whether a buyer comparing ProofTTL with automated tools can immediately see a different trust model, a stronger audit trail, and a lower chance of false confidence.

## Competitive baseline

### Genspark

Observed positioning and capabilities:

- Paste a claim, article, or URL.
- Automatic claim extraction and prioritization.
- Live searches across multiple source types.
- Up to 30 verification iterations.
- Screenshot evidence.
- Verbatim quotations.
- Secondary-model validation of screenshots.
- Evidence-for and evidence-against presentation.
- TRUE / FALSE / PARTIALLY TRUE verdicts.
- Multi-model cross-checking.
- Fast self-service workflow.

Strength: speed, breadth, inspectability, and an excellent demonstration of evidence retrieval.

Weakness to attack: automated retrieval still leaves the buyer responsible for whether the search space, source authority, claim boundaries, temporal scope, exceptions, and missing evidence were handled correctly.

### Jenova

Observed positioning and capabilities:

- Real-time cross-platform retrieval.
- Google, Reddit, YouTube, GitHub, marketplaces, academic sources, and specialist agents.
- Source-backed answers rather than memory-only generation.
- Persistent research context.
- Citation existence and semantic-support checking.
- API availability.
- Explicit framing as a research accelerator rather than an oracle.

Strength: breadth and workflow integration.

Weakness to attack: retrieval coverage is not the same as an independent claim audit. Cross-platform volume can increase apparent confidence without establishing a principled evidence hierarchy.

### Manus

Observed positioning and capabilities:

- Upload files, paste URLs, or enter text.
- Accepts broad input formats.
- Extracts/checks factual claims against authoritative sources.
- Fast automated workflow.

Strength: frictionless intake and immediate utility.

Weakness to attack: generic automated fact checking is easy to understand but difficult to defend when the cost of an incorrect verdict is high.

## External verification standards worth adopting

The International Fact-Checking Network's Code of Principles provides a strong standard for source and methodology transparency. Relevant practices include:

- identify significant evidence so readers can replicate the work;
- prefer suitable primary sources over secondary sources;
- check key elements against more than one named source where appropriate;
- disclose relevant source interests or conflicts;
- publish the methodology;
- present relevant evidence that supports AND undermines the claim;
- apply the same evidence standard to equivalent claims;
- maintain an open corrections process.

NIST's Generative AI Profile explicitly treats confident false output/confabulation as a material risk, especially in consequential decision making. ProofTTL should therefore optimize for preventing false confidence, not maximizing the fraction of claims that receive a decisive verdict.

## Product thesis

### Category

**Independent claim verification for consequential decisions.**

AI fact checking is an acquisition keyword. It should not become the product boundary.

### Core promise

ProofTTL should answer:

> What exact claim was tested, what is the strongest evidence for it, what is the strongest evidence against it, why were those sources weighted the way they were, what remains unknown, what temporal window does this conclusion cover, and can another person reproduce the verification?

## 100x differentiators to build

### 1. Claim contract

Before research begins, freeze the exact proposition being tested.

Record:

- original wording;
- normalized wording;
- entities;
- quantities;
- geography;
- applicable date/time;
- implied comparisons;
- material ambiguities;
- exclusions;
- what evidence would count as support or contradiction.

This prevents a verifier from accidentally proving an easier adjacent claim.

### 2. Evidence hierarchy

Every source should carry an explicit role and quality assessment, not merely a URL.

Suggested dimensions:

- primary / secondary / tertiary;
- official / independent;
- direct observation / interpretation;
- recency;
- jurisdiction/geographic relevance;
- methodological quality;
- source incentives or conflicts;
- whether the source supports the whole claim or only one component.

The report should explain why the strongest source was considered strongest.

### 3. Adversarial contradiction pass

After a provisional verdict is reached, run a deliberately separate second pass whose job is to defeat it.

Search specifically for:

- exceptions;
- later corrections;
- superseding documents;
- contradictory primary records;
- changed pricing/features/certifications;
- alternate definitions;
- date mismatches;
- denominator or population differences;
- evidence that the cited source is being misread.

A verdict should not finalize until the contradiction pass is recorded.

### 4. Evidence-for / evidence-against ledger

Never hide conflicting evidence.

For each claim, expose:

- strongest supporting evidence;
- strongest contradicting evidence;
- insufficient/ambiguous evidence;
- rejected evidence and why it was rejected.

This should be more rigorous than a generic list of links.

### 5. Citation entailment check

Separate two questions:

1. Does the source exist?
2. Does the source actually support the exact sentence?

Record support as full, partial, contextual-only, contradictory, or irrelevant.

This is especially valuable for AI-generated reports and legal/research citations.

### 6. Temporal validity / TTL

Make ProofTTL's name operational.

Each material source observation should record:

- observed_at;
- source publication/update date where available;
- freshness class;
- expected volatility;
- recommended recheck date;
- conditions that would invalidate the conclusion.

The final claim verdict should have a validity window rather than implying permanent truth.

### 7. Reproducible evidence packet

A buyer should be able to hand the result to a colleague, client, auditor, editor, or investor.

Packet contents should include:

- claim contract;
- search/research scope;
- source list;
- evidence excerpts within copyright limits;
- source snapshots/hashes where legally and technically appropriate;
- support/contradiction mapping;
- timestamps;
- analyst notes;
- final verdict;
- uncertainty explanation;
- signed Fact Lease identifier;
- correction/version history.

### 8. Source conflict disclosure

Where the source has a material interest in the claim, say so.

Examples:

- vendor proving its own certification;
- company press release supporting its own growth number;
- sponsored research;
- trade association estimates;
- competitor claims;
- affiliate/review content.

Do not automatically reject these sources; label the incentive and seek independent corroboration.

### 9. Claim materiality score

Prioritize human effort around the consequence of being wrong.

Potential dimensions:

- financial impact;
- publication/reputation exposure;
- legal/compliance exposure;
- decision leverage;
- reversibility;
- source volatility;
- confidence gap between available evidence and claim certainty.

This can determine research depth and monitoring cadence.

### 10. UNKNOWN as a premium feature

Do not optimize to avoid UNKNOWN.

A defensible UNKNOWN should include:

- what was searched;
- what evidence is missing;
- why existing evidence is insufficient;
- what new evidence could resolve the claim;
- whether the claim should be softened, removed, or deferred.

The product wins trust by refusing fake certainty.

### 11. Correction and version chain

Every verification should be versioned.

If a source changes or new evidence appears:

- retain the old verdict;
- issue the new verdict;
- state exactly what changed;
- link the versions;
- update the Fact Lease state;
- notify monitored customers where applicable.

### 12. Claim-maker evidence request

For suitable commercial/due-diligence claims, allow ProofTTL to record whether the claimant/vendor was asked to provide substantiation and what was supplied.

This creates a useful distinction between:

- claim supported by public evidence;
- claim supported only by claimant-provided evidence;
- claimant failed to substantiate;
- claim contradicted by public evidence.

## Buyer wedges

Do not initially sell to everyone who wants to know whether something is true.

Highest-value wedges:

1. AI-generated reports before they reach clients or executives.
2. Marketing and website claims before publication.
3. Vendor/product claims before a purchase decision.
4. Startup pitch/deck statistics before investor distribution.
5. Research/citation verification before publication.
6. Public due-diligence claim packs where a wrong assertion has material cost.

## Output language

Primary verdicts remain:

- `SUPPORTED`
- `CONTRADICTED`
- `UNKNOWN`

Add structured sub-status instead of adding fuzzy truth labels:

- `FULL_SUPPORT`
- `PARTIAL_SUPPORT`
- `SCOPE_MISMATCH`
- `STALE_EVIDENCE`
- `SOURCE_CONFLICT`
- `INSUFFICIENT_PRIMARY_EVIDENCE`
- `CLAIM_TOO_BROAD`
- `CLAIM_NOT_FALSIFIABLE`

This preserves a simple top-level verdict while exposing why.

## Website changes implied by this research

The `/ai-fact-checker/` page already targets the correct generic query family, but it currently emphasizes sources, explicit verdicts, and UNKNOWN. It should evolve to make the trust-model difference impossible to miss.

Add sections for:

- Automated AI fact checker vs independent verification.
- The adversarial contradiction pass.
- Primary-source preference and source-quality explanation.
- Evidence-for/evidence-against reporting.
- Claim-boundary freezing before research.
- Time-limited conclusions / recheck dates.
- Reproducibility and correction/version history.
- A concrete sample showing how an apparently supported claim fails under scope/date/exception analysis.

Do not make feature claims on the site until the corresponding workflow exists.

## Search strategy

Use `AI fact checker` as the head term, but build authority around higher-intent clusters where the product has a defensible reason to win:

- independent AI claim verification;
- high-stakes AI fact checking;
- verify AI-generated report before publishing;
- source-backed claim verification;
- verify citations support claims;
- verify marketing claims with sources;
- vendor claim verification;
- fact check pitch deck statistics;
- independent verification of 3–5 claims;
- evidence audit for AI output;
- claim verification report;
- adversarial fact checking;
- source verification service;
- AI hallucination verification with sources.

## Immediate build order

### P0 — trust model

1. Formalize a public verification methodology.
2. Add explicit source hierarchy rules.
3. Add evidence-for/evidence-against sections to the audit artifact.
4. Add an adversarial contradiction checklist/pass.
5. Add correction/version policy.
6. Add temporal-validity fields and recheck guidance.

### P1 — buyer-visible proof

7. Upgrade the public sample audit to demonstrate all P0 mechanics.
8. Update `/ai-fact-checker/` to compare instant automated checks with independent verification without making unsupported competitor claims.
9. Build a citation-verification service page.
10. Build a vendor/product-claim verification page.
11. Publish a transparent methodology page and link it from every audit.

### P2 — defensibility and scale

12. Structured evidence quality scoring.
13. Claim materiality/depth scoring.
14. Source snapshot/hash provenance where appropriate.
15. Machine-readable verification packet.
16. Monitoring notifications when evidence changes.
17. Public correction/version ledger.

## Success test

ProofTTL is meaningfully differentiated when a buyer can answer YES to all of these:

- I know exactly what proposition was tested.
- I can see evidence on both sides.
- I can tell which evidence is primary and why it was trusted.
- I can see what the verifier tried to find to disprove the conclusion.
- I know what remains uncertain.
- I know when the conclusion may become stale.
- I can reproduce or audit the work.
- I can see whether the result has changed since issuance.

If the product cannot demonstrate those things, it is still too close to a generic AI fact checker.