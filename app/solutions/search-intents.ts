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
    slug: 'ai-output-risk-audit',
    title: 'AI Output Risk Audit | ProofTTL',
    description: 'Audit consequential AI outputs before customers, reviewers, or decision-makers rely on them.',
    eyebrow: 'AI OUTPUT RISK',
    heading: 'Find the AI claim with the most expensive failure mode.',
    lede: 'ProofTTL ranks submitted outputs by consequence, then deeply verifies the highest-risk factual findings against accessible authoritative evidence.',
    problem: 'Not every questionable sentence deserves equal effort. The dangerous one is the claim that can create customer, compliance, financial, or reputational damage if it is wrong.',
    benefits: ['10–25 real outputs or claims per Fact Audit', 'Consequence ranking before deep verification', 'Evidence FOR and AGAINST', 'Human approval before customer-facing publication', 'Seven-day watch on important findings'],
    example: 'An AI-generated product answer makes a factual promise a customer may rely on.'
  },
  {
    slug: 'pre-launch-claim-audit',
    title: 'Pre-Launch Claim Audit | ProofTTL',
    description: 'Pressure-test factual claims in launches, websites, reports, decks, and customer-facing material before publication.',
    eyebrow: 'PRE-LAUNCH CLAIM AUDIT',
    heading: 'Catch the correction while it is still an edit.',
    lede: 'ProofTTL checks consequential factual assertions before they become public, preserving contradictions and uncertainty instead of forcing every claim into a confident answer.',
    problem: 'A stale statistic, unsupported comparison, or overbroad product claim is cheap to fix before launch and expensive to explain after customers see it.',
    benefits: ['Fixed $1,500 scope', 'Up to 25 outputs or claims', 'Authoritative source review', 'Contradiction pass before verdict', 'Proof/report delivery after human approval'],
    example: 'A launch page claims a capability, certification, market statistic, or competitor difference.'
  },
  {
    slug: 'source-backed-due-diligence',
    title: 'Source-Backed Due Diligence Claims | ProofTTL',
    description: 'Verify selected public claims used in vendor, procurement, partner, investment, or operational decisions.',
    eyebrow: 'DUE DILIGENCE CLAIMS',
    heading: 'Do not let repetition masquerade as independent support.',
    lede: 'ProofTTL isolates the exact public claims entering a decision and records what the examined evidence supports, contradicts, or leaves unresolved.',
    problem: 'A claim repeated across a deck, website, press release, and third-party summary can still trace back to one unsupported source.',
    benefits: ['Exact claim scoping', 'Primary and authoritative sources prioritized', 'SUPPORTED / CONTRADICTED / UNKNOWN verdicts', 'Evidence trail for reviewers', 'Seven-day watch on important findings'],
    example: 'A vendor claims a certification, partnership, product capability, or geographic availability.'
  },
  {
    slug: 'website-fact-audit',
    title: 'Website Fact Audit | ProofTTL',
    description: 'Audit important factual claims on a website or product surface against current public evidence.',
    eyebrow: 'WEBSITE FACT AUDIT',
    heading: 'Check the facts your site keeps repeating after the evidence changes.',
    lede: 'ProofTTL verifies selected website claims against current evidence and flags statements that are contradicted, unsupported, or too broad for the available record.',
    problem: 'Websites accumulate old pricing, product, customer, certification, and market claims. Those statements can stay visible long after the evidence that once supported them changes.',
    benefits: ['Highest-risk website claims prioritized', 'Current-source verification', 'Repair guidance for weak claims', 'Human-approved customer-facing findings', 'Seven-day monitoring on important findings'],
    example: 'A homepage or pricing page repeats a factual claim that has not been rechecked recently.'
  },
]

export function getSearchIntent(slug: string) {
  return SEARCH_INTENTS.find((intent) => intent.slug === slug)
}
