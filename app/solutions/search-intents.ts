export type SearchIntent = {
  slug: string
  title: string
  description: string
  eyebrow: string
  heading: string
  lede: string
  problem: string
  benefits: string[]
  example: string
}

export const SEARCH_INTENTS: SearchIntent[] = [
  {
    slug: 'fact-verification-api',
    title: 'Fact Verification API for AI and Automation | ProofTTL',
    description: 'Verify a claim against a public source, receive a source-backed verdict, and give the result an explicit expiry time.',
    eyebrow: 'FACT VERIFICATION API',
    heading: 'Verify a fact without pretending it stays true forever.',
    lede: 'ProofTTL evaluates a claim against a public source and returns a time-bound Fact Lease with evidence, a source fingerprint, and an expiry.',
    problem: 'A normal fact-checking response gives you a verdict. Software also needs to know which source produced that verdict and when it should stop trusting it.',
    benefits: ['Source-backed SUPPORTS / CONTRADICTS / UNKNOWN verdicts', 'Explicit TTL and lease state', 'SHA-256 source fingerprint', 'Automatic monitoring while the lease is active'],
    example: 'Example.com is intended for illustrative examples in documents.'
  },
  {
    slug: 'claim-verification-api',
    title: 'Claim Verification API with Source Evidence | ProofTTL',
    description: 'Check whether a public source supports or contradicts a specific claim and receive an expiring machine-readable result.',
    eyebrow: 'CLAIM VERIFICATION API',
    heading: 'Turn a claim and a source into a machine-readable verdict.',
    lede: 'Send ProofTTL the exact assertion you care about, the source URL you want evaluated, and the trust window your application can accept.',
    problem: 'Applications often need to verify one precise assertion, not summarize an entire webpage. ProofTTL keeps the claim, source, evidence, verdict, and lifetime tied together.',
    benefits: ['Precise claim-level verification', 'Evidence retained with the lease', 'Public-source validation and SSRF protections', 'Simple HTTP API for agents and services'],
    example: 'The documentation states that this feature is available on the current release.'
  },
  {
    slug: 'ai-agent-verification',
    title: 'AI Agent Fact Verification and Freshness API | ProofTTL',
    description: 'Give AI agents source-backed facts with explicit expiry instead of relying on stale unbounded assertions.',
    eyebrow: 'AI AGENT VERIFICATION',
    heading: 'Give agents evidence they know when to distrust.',
    lede: 'ProofTTL is verification infrastructure for agents that need to act on web facts without treating a one-time observation as permanent truth.',
    problem: 'Agents can retrieve information quickly, but retrieved facts can become stale. A Fact Lease gives an agent a verdict, source, evidence, fingerprint, and a deadline for re-checking trust.',
    benefits: ['Machine-readable lease lifecycle', 'Evidence provenance', 'Freshness encoded as TTL', 'x402 pay-per-verification for machine clients'],
    example: 'The vendor currently lists this API feature as generally available.'
  },
  {
    slug: 'source-monitoring-api',
    title: 'Source Monitoring API for Verified Claims | ProofTTL',
    description: 'Monitor whether the source behind a verified claim changes enough that the original verdict can no longer be maintained.',
    eyebrow: 'SOURCE MONITORING',
    heading: 'Monitor the evidence behind a decision, not just the URL.',
    lede: 'ProofTTL can re-check active Fact Leases and revoke a lease when changing source evidence no longer supports the original verdict.',
    problem: 'A generic page-change alert tells you that HTML changed. It does not tell you whether the claim your software relied on is still supported.',
    benefits: ['Claim-aware monitoring', 'ACTIVE / REVOKED / EXPIRED lifecycle', 'Source fingerprint comparison', 'Reverification tied to the original lease'],
    example: 'The pricing page currently lists the product at the stated amount.'
  },
  {
    slug: 'stale-data-detection',
    title: 'Stale Data Detection for AI and Automated Systems | ProofTTL',
    description: 'Detect when source-backed information should no longer be trusted by assigning verified claims a finite lifetime.',
    eyebrow: 'STALE DATA DETECTION',
    heading: 'Make stale truth visible before it becomes a bug.',
    lede: 'ProofTTL adds a trust window to web-derived facts so applications can stop relying on old observations and request fresh verification.',
    problem: 'Many systems store a fact but lose the context of when it was observed. ProofTTL makes freshness an explicit field rather than an assumption.',
    benefits: ['Finite trust windows', 'Lease expiry timestamps', 'Current versus issued status semantics', 'Monitoring for evidence changes'],
    example: 'The policy page currently says refunds are available within the stated period.'
  },
  {
    slug: 'evidence-verification-api',
    title: 'Evidence Verification API with Source Fingerprints | ProofTTL',
    description: 'Evaluate whether web evidence supports a claim and retain the evidence context, source URL, fingerprint, and lease lifetime.',
    eyebrow: 'EVIDENCE VERIFICATION',
    heading: 'Keep the evidence attached to the verdict.',
    lede: 'ProofTTL returns more than a boolean. Fact Leases preserve the claim, evidence, source identity, source fingerprint, verdict, and expiration context.',
    problem: 'A detached yes/no result is difficult to audit later. ProofTTL keeps enough context for another machine or developer to understand why the verdict existed.',
    benefits: ['Evidence included with the result', 'Normalized source fingerprint', 'Explicit reason and confidence fields', 'Readable lease endpoint for later inspection'],
    example: 'The source states that the service supports this integration.'
  },
  {
    slug: 'x402-verification-api',
    title: 'x402 Pay-Per-Use Verification API | ProofTTL',
    description: 'Use HTTP 402 and x402 to pay per Fact Lease verification without requiring a traditional subscription or account flow.',
    eyebrow: 'X402 VERIFICATION API',
    heading: 'Machine-payable verification over ordinary HTTP.',
    lede: 'ProofTTL protects Fact Lease issuance with x402 so compatible machine clients can receive a payment challenge, settle, and retry the request.',
    problem: 'Small automated verification calls do not always fit seat-based SaaS billing. x402 lets the verification request itself carry the payment flow.',
    benefits: ['$0.001 testnet Fact Lease issuance', 'Base Sepolia + USDC test path', 'HTTP 402 payment challenge', 'No subscription required for the protocol path'],
    example: 'The source currently supports the claim my agent is about to act on.'
  },
  {
    slug: 'fact-leases',
    title: 'Fact Leases: Expiring Source-Backed Facts | ProofTTL',
    description: 'Learn how ProofTTL Fact Leases combine claim verification, source evidence, fingerprints, monitoring, and explicit expiry.',
    eyebrow: 'FACT LEASES',
    heading: 'A receipt for what a source supported at a specific time.',
    lede: 'A Fact Lease is ProofTTL’s machine-readable record of a verified claim plus the source, evidence, fingerprint, issued verdict, current state, and expiry.',
    problem: 'Software needs more than “true” or “false.” It needs provenance, time, and a way to represent when the evidence has changed or the trust window has ended.',
    benefits: ['Source-backed issuance record', 'Time-bound trust window', 'Monitoring and revocation', 'Designed for machines and AI agents'],
    example: 'This source supports the claim for the next 300 seconds unless monitoring invalidates it first.'
  }
]

export function getSearchIntent(slug: string) {
  return SEARCH_INTENTS.find((intent) => intent.slug === slug)
}
