import type { Metadata } from 'next'
import SharedProductHeader from '../../components/SharedProductHeader'

const SITE_URL = 'https://proofttl-web.vercel.app'

export const metadata: Metadata = {
  title: 'AI Fact Checker — Verify Claims With Sources',
  description: 'Use ProofTTL to verify consequential AI-generated claims against public sources with explicit SUPPORTED, CONTRADICTED, or UNKNOWN verdicts.',
  alternates: { canonical: '/ai-fact-checker/' },
  robots: { index: true, follow: true },
  keywords: ['AI fact checker', 'fact check AI output', 'verify AI claims with sources', 'AI claim verification', 'source-backed fact checking', 'ProofTTL'],
  openGraph: { title: 'AI Fact Checker — Verify AI Claims With Sources | ProofTTL', description: 'Check consequential AI-generated factual claims against public evidence before you publish, send, sell, or rely on them.', url: '/ai-fact-checker/', type: 'website' },
}

export default function AiFactCheckerPage() {
  const structuredData = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${SITE_URL}/ai-fact-checker/#page`, url: `${SITE_URL}/ai-fact-checker/`, name: 'AI Fact Checker — Verify Claims With Sources', description: 'ProofTTL checks consequential factual claims against public sources and returns source-backed verdicts.', isPartOf: { '@id': `${SITE_URL}/#website` }, about: { '@id': `${SITE_URL}/audit/#claim-verification-service` } },
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'Can ProofTTL fact-check AI-generated output?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. ProofTTL checks factual claims regardless of which model produced the text and compares them with accessible public evidence.' } },
      { '@type': 'Question', name: 'Does ProofTTL provide sources?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Checked claims receive evidence links and an explicit SUPPORTED, CONTRADICTED, or UNKNOWN verdict rather than an unsupported truth score.' } },
      { '@type': 'Question', name: 'What happens when evidence is inconclusive?', acceptedAnswer: { '@type': 'Answer', text: 'The verdict can remain UNKNOWN. ProofTTL does not manufacture certainty when available evidence is insufficient.' } },
    ] },
  ] }

  return <main className="app-page audit-sales-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SharedProductHeader />
    <section className="onboarding-wrap"><div className="audit-sales-card">
      <header className="audit-sales-hero"><p className="app-kicker">AI FACT CHECKER / SOURCE-BACKED VERIFICATION</p><h1 className="app-title">Find the expensive wrong answer before your customer does.</h1><p className="app-copy">Send ProofTTL 10–25 real AI outputs or consequential claims. We decompose the factual assertions, rank them by damage-if-wrong, deeply verify the highest-risk findings against authoritative evidence, run a contradiction pass, and prepare the result for human approval.</p><div className="audit-sales-actions"><a className="button button-secondary" href="/audit/sample/">See a sample audit</a></div><p className="app-note" style={{ marginTop: 12 }}>Fixed scope: $1,500. Up to 25 outputs or claims reviewed, with deep verification of the highest-risk findings. Human approval is required before customer-facing publication.</p></header>
      <section className="audit-sales-proof"><article><p className="app-kicker">CONSEQUENCE FIRST</p><h2>Verify what could actually hurt.</h2><p className="app-copy">Not every sentence deserves equal effort. ProofTTL identifies atomic factual claims and prioritizes the ones most likely to create customer, compliance, financial, or reputational damage if wrong.</p></article><article><p className="app-kicker">FOR / AGAINST / CONTRADICTION PASS</p><h2>See the evidence chain, not a confidence vibe.</h2><p className="app-copy">Important findings are checked against inspectable evidence on both sides. Verdicts remain SUPPORTED, CONTRADICTED, or UNKNOWN when the public record does not justify stronger certainty.</p></article></section>
      <section style={{ marginTop: 28 }}><p className="app-kicker">THE FACT AUDIT</p><h2 className="app-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>One deliverable built for decisions that matter.</h2><div className="audit-sales-proof"><article><h2>$1,500 fixed scope</h2><p className="app-copy">Submit 10–25 real outputs or claims. Scope is confirmed before payment so the engagement is clear before money moves.</p></article><article><h2>Evidence-backed findings</h2><p className="app-copy">Receive ranked findings, readable reasoning, authoritative source evidence, explicit verdicts, and proof artifacts suitable for review.</p></article><article><h2>Seven-day watch</h2><p className="app-copy">Important findings enter seven days of monitoring with a final re-read so a changing source does not silently invalidate the audit.</p></article></div></section>
      <section style={{ marginTop: 28 }}><p className="app-kicker">COMMON USE CASES</p><div className="audit-sales-proof"><article><h2>AI research and reports</h2><p className="app-copy">Verify market sizes, dates, company facts, policy claims, statistics, and cited assertions before a report leaves your hands.</p></article><article><h2>Sales and product claims</h2><p className="app-copy">Check competitor, pricing, feature, certification, integration, customer-count, and performance claims before publication.</p></article><article><h2>Decision-critical answers</h2><p className="app-copy">Pressure-test claims that could change a purchase, launch, client recommendation, compliance decision, or internal strategy.</p></article></div></section>
      <section style={{ marginTop: 28 }}><p className="app-kicker">WHY PROOFTTL</p><h2 className="app-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>Verification that can say “we don’t know.”</h2><p className="app-copy">ProofTTL does not pretend to inspect a model’s internal truthfulness. It asks a narrower, auditable question: <strong>what does the available evidence support about this exact claim?</strong> When evidence is insufficient or execution is incomplete, certainty is withheld instead of invented.</p><div className="audit-sales-actions" style={{ marginTop: 20 }}><a className="text-link" href="/audit/sample/">Inspect the sample deliverable <span>↗</span></a><a className="text-link" href="/how-proofttl-works/">See the method <span>↗</span></a></div></section>
    </div></section>
  </main>
}
