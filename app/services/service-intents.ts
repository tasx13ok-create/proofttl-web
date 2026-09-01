export type ServiceFaq = {
  question: string
  answer: string
}

export type ServiceIntent = {
  slug: string
  title: string
  description: string
  eyebrow: string
  heading: string
  lede: string
  problem: string
  whoFor: string
  benefits: string[]
  examples: string[]
  faq: ServiceFaq[]
}

const factAuditFaq: ServiceFaq[] = [
  {
    question: 'What does ProofTTL cost?',
    answer: 'ProofTTL sells one launch engagement: the $1,500 Fact Audit for up to 25 real outputs or claims. Scope is confirmed before a payment request is created.',
  },
  {
    question: 'What happens after I submit?',
    answer: 'ProofTTL reviews the intake, confirms the scope, then creates the fixed-price payment request. Customer-facing findings require human approval before publication.',
  },
  {
    question: 'Does the audit include monitoring?',
    answer: 'Yes. Important findings are monitored for seven days and receive a final reread before the watch closes.',
  },
]

const commonBenefits = [
  'Up to 25 real outputs or factual claims',
  'Consequence ranking before deep verification',
  'Authoritative evidence FOR and AGAINST',
  'Explicit SUPPORTED / CONTRADICTED / UNKNOWN verdicts',
  'Human approval before customer-facing publication',
  'Seven-day watch on important findings',
]

export const SERVICE_INTENTS: ServiceIntent[] = [
  {
    slug: 'ai-claim-verification',
    title: 'AI Claim Verification Service | ProofTTL',
    description: 'Verify consequential AI-generated factual claims against accessible public evidence with the $1,500 ProofTTL Fact Audit.',
    eyebrow: 'AI CLAIM VERIFICATION',
    heading: 'Verify the AI claim before it becomes your problem.',
    lede: 'ProofTTL isolates consequential factual assertions, ranks them by downside, and deeply verifies the highest-risk findings against inspectable evidence.',
    problem: 'AI can produce fluent claims that sound settled while the underlying fact is stale, incomplete, or wrong. A generic confidence score does not show what supports the exact sentence you are about to use.',
    whoFor: 'Teams using ChatGPT, Claude, Gemini, Copilot, Perplexity, custom agents, RAG systems, or AI-assisted research for customer-facing or decision-critical work.',
    benefits: commonBenefits,
    examples: ['“This vendor is SOC 2 Type II certified.”', '“This market grew 38% last year.”', '“This product supports SAML SSO on the current plan.”'],
    faq: factAuditFaq,
  },
  {
    slug: 'ai-output-fact-checking',
    title: 'AI Output Fact-Checking Service | ProofTTL',
    description: 'Fact-check AI-written reports, briefs, sales copy, research, and answers with source-backed verdicts through the $1,500 Fact Audit.',
    eyebrow: 'AI OUTPUT FACT-CHECKING',
    heading: 'Turn AI-written output into claims you can defend.',
    lede: 'ProofTTL reviews the factual assertions inside AI-assisted work, prioritizes claims by consequence, and verifies the highest-risk findings against authoritative sources.',
    problem: 'Long AI output can contain dozens of assertions, but only a subset can create meaningful customer, compliance, financial, or reputational downside. Those are the claims worth verifying first.',
    whoFor: 'Operators, consultants, agencies, researchers, founders, analysts, and teams shipping AI-assisted documents or customer-facing material.',
    benefits: commonBenefits,
    examples: ['AI-generated market research', 'AI-assisted client reports', 'AI-written sales or product copy'],
    faq: factAuditFaq,
  },
  {
    slug: 'ai-hallucination-checking',
    title: 'AI Hallucination Claim Checking | ProofTTL',
    description: 'Check suspicious or high-consequence AI claims against public evidence instead of relying on a generic hallucination score.',
    eyebrow: 'AI HALLUCINATION CHECKING',
    heading: 'Do not score the vibe. Verify the claim that matters.',
    lede: 'ProofTTL is built for concrete factual verification: isolate the risky assertion, inspect the strongest accessible evidence, challenge the evidence set, and record an explicit verdict.',
    problem: 'Hallucination detectors can estimate risk, but buyers and reviewers still need to know what source supports or contradicts the specific factual claim.',
    whoFor: 'Anyone with AI-generated factual statements they need to rely on, publish, present, or defend.',
    benefits: commonBenefits,
    examples: ['“The FDA approved this use in 2025.”', '“Competitor X charges $49 per user.”', '“The company announced 2 million active users.”'],
    faq: factAuditFaq,
  },
  {
    slug: 'pre-publication-fact-checking',
    title: 'Pre-Publication Fact-Checking Service | ProofTTL',
    description: 'Check consequential factual claims before an article, report, pitch, website, launch, or public statement goes live.',
    eyebrow: 'PRE-PUBLICATION FACT-CHECKING',
    heading: 'Find the expensive correction before your audience does.',
    lede: 'ProofTTL pressure-tests factual claims before publication so unsupported numbers, outdated policy statements, and overconfident assertions can be caught while they are still cheap to fix.',
    problem: 'Once a claim is public, the cost can become a correction, credibility hit, client problem, lost deal, or durable screenshot rather than a simple edit.',
    whoFor: 'Publishers, agencies, founders, consultants, researchers, analysts, and teams releasing factual material under their name or brand.',
    benefits: commonBenefits,
    examples: ['Launch announcements', 'Research reports', 'Investor decks and public claims'],
    faq: factAuditFaq,
  },
  {
    slug: 'marketing-claim-verification',
    title: 'Marketing Claim Verification Service | ProofTTL',
    description: 'Verify factual marketing, product, comparison, performance, and company claims before campaigns or sales material go live.',
    eyebrow: 'MARKETING CLAIM VERIFICATION',
    heading: 'Make the claim persuasive without making it indefensible.',
    lede: 'ProofTTL checks the factual layer underneath marketing copy: numbers, comparisons, feature availability, company statements, market statistics, and other externally verifiable assertions.',
    problem: 'Marketing language moves fast. A number from an old deck or a feature claim copied from a stale page can become a credibility problem the moment a customer checks it.',
    whoFor: 'Marketing teams, agencies, founders, product marketers, sales teams, and consultants publishing factual claims about products, markets, companies, or competitors.',
    benefits: commonBenefits,
    examples: ['“Used by more than 10,000 teams.”', '“The only platform with feature X.”', '“Customers save 30% on average.”'],
    faq: factAuditFaq,
  },
  {
    slug: 'startup-claim-verification',
    title: 'Startup Claim Verification for Pitches, Launches & Fundraising | ProofTTL',
    description: 'Pressure-test startup market, competitor, product, and industry claims before a pitch, launch, investor meeting, or diligence process.',
    eyebrow: 'STARTUP CLAIM VERIFICATION',
    heading: 'Pressure-test the sentence an investor or customer is most likely to challenge.',
    lede: 'ProofTTL checks externally verifiable startup claims before they reach a pitch deck, fundraising conversation, launch page, or public announcement.',
    problem: 'A deck can be directionally right and still contain one brittle statistic or comparison that causes the whole presentation to feel less credible when challenged.',
    whoFor: 'Founders and small teams preparing pitches, fundraising materials, launch claims, competitive positioning, or investor updates.',
    benefits: commonBenefits,
    examples: ['“This is a $12B market growing 22% annually.”', '“No competitor offers this workflow.”', '“The category has doubled since 2023.”'],
    faq: factAuditFaq,
  },
  {
    slug: 'due-diligence-claim-verification',
    title: 'Due Diligence Claim Verification Service | ProofTTL',
    description: 'Independently check selected public factual claims in vendor, partner, acquisition, investment, or procurement diligence.',
    eyebrow: 'DUE DILIGENCE CLAIM VERIFICATION',
    heading: 'Verify the public claim before you let it into the decision.',
    lede: 'ProofTTL independently checks selected public claims made by a vendor, partner, company, or project and returns the evidence and verdicts behind the review.',
    problem: 'Diligence often includes claims copied between websites, decks, press releases, and third-party summaries. Repetition is not the same thing as independent support.',
    whoFor: 'Operators, procurement teams, consultants, founders, analysts, and buyers who need a source-backed check on a defined set of public claims.',
    benefits: commonBenefits,
    examples: ['Security or compliance claims', 'Partnership and customer claims', 'Product availability or geographic coverage claims'],
    faq: factAuditFaq,
  },
  {
    slug: 'research-claim-verification',
    title: 'Research Claim Verification & Source Checking | ProofTTL',
    description: 'Check factual assertions, statistics, dates, product facts, and source-backed statements in research before they are cited or delivered.',
    eyebrow: 'RESEARCH CLAIM VERIFICATION',
    heading: 'Keep the citation attached to the claim it actually supports.',
    lede: 'ProofTTL verifies selected research claims against inspectable sources and records the evidence used for each verdict instead of treating a bibliography as proof of every sentence.',
    problem: 'Research can look well sourced while individual statements quietly outrun what the cited source actually says. Claim-level verification catches that gap.',
    whoFor: 'Researchers, analysts, consultants, writers, agencies, founders, and AI-assisted research workflows.',
    benefits: commonBenefits,
    examples: ['Market statistics', 'Historical dates and policy statements', 'Product, company, or industry facts'],
    faq: factAuditFaq,
  },
  {
    slug: 'website-claim-audit',
    title: 'Website Claim Audit & Fact-Checking Service | ProofTTL',
    description: 'Audit factual claims on a website, landing page, product page, pricing page, or company profile against current public evidence.',
    eyebrow: 'WEBSITE CLAIM AUDIT',
    heading: 'Audit the facts your website keeps repeating after everyone forgets where they came from.',
    lede: 'ProofTTL checks selected factual claims already live or about to go live on your website and identifies statements that are unsupported, contradicted, or stale.',
    problem: 'Websites accumulate facts over time: customer counts, product availability, pricing claims, certifications, market numbers, comparisons, and old launch copy. Those claims can remain visible long after their evidence changes.',
    whoFor: 'Founders, agencies, product teams, marketing teams, consultants, and businesses updating or relaunching public websites.',
    benefits: commonBenefits,
    examples: ['Homepage statistics', 'Pricing and plan claims', 'Product, integration, certification, or coverage statements'],
    faq: factAuditFaq,
  },
  {
    slug: 'source-backed-fact-checking',
    title: 'Source-Backed Fact-Checking Service | ProofTTL',
    description: 'Get explicit factual verdicts tied to inspectable public evidence through the $1,500 ProofTTL Fact Audit.',
    eyebrow: 'SOURCE-BACKED FACT CHECKING',
    heading: 'A verdict is only useful when the evidence is inspectable.',
    lede: 'ProofTTL documents the sources examined, separates evidence FOR and AGAINST, runs a contradiction pass, and preserves UNKNOWN when the record does not justify certainty.',
    problem: 'A confident answer without an evidence trail is difficult to review, defend, or repair. ProofTTL keeps the factual claim attached to the evidence used to judge it.',
    whoFor: 'Teams that need reviewable evidence behind consequential factual claims before publication, launch, sales, research delivery, or a decision.',
    benefits: commonBenefits,
    examples: ['Company and product facts', 'Pricing and policy claims', 'Market, research, and public-record assertions'],
    faq: factAuditFaq,
  },
]

export function getServiceIntent(slug: string) {
  return SERVICE_INTENTS.find((intent) => intent.slug === slug)
}
