import type { Metadata } from 'next'
import AuditIntakeForm from '../../components/AuditIntakeForm'

const SITE_URL = 'https://proofttl-web.vercel.app'
const AUDIT_FAQ = [
  { question: 'What does the $1,500 Fact Audit include?', answer: 'Up to 25 real AI outputs or factual claims, consequence ranking, deep verification of the highest-risk findings, primary-source evidence, a customer-ready audit deliverable, and seven days of monitoring on the important findings.' },
  { question: 'Does ProofTTL automatically publish findings?', answer: 'No. Evidence can be assembled by the system, but customer-facing findings require explicit human approval before publication.' },
  { question: 'What happens if the evidence is not strong enough?', answer: 'The verdict stays UNKNOWN. ProofTTL does not force uncertain or incomplete evidence into a supported or contradicted result.' },
  { question: 'Do I pay before scope is confirmed?', answer: 'No. Submit the real outputs first. ProofTTL confirms fit and scope before sending the fixed-price payment request.' },
]

export const metadata: Metadata = {
  title: 'ProofTTL Fact Audit — Adversarial Verification for AI Outputs',
  description: 'A fixed-price $1,500 Fact Audit for up to 25 real AI outputs or claims: consequence ranking, primary-source verification, evidence-backed findings, and seven-day monitoring.',
  keywords: ['AI fact audit', 'AI output verification', 'AI hallucination audit', 'claim verification service', 'source-backed fact checking'],
  alternates: { canonical: '/audit/' },
  openGraph: { title: 'ProofTTL Fact Audit', description: 'Find the expensive wrong answer before your customer does.', url: '/audit/', type: 'website' },
}

export default function AuditPage() {
  const structuredData = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', '@id': `${SITE_URL}/audit/#service`, name: 'ProofTTL Fact Audit', serviceType: 'Adversarial verification of AI outputs and factual claims', url: `${SITE_URL}/audit/`, provider: { '@id': `${SITE_URL}/#organization` }, areaServed: 'Worldwide', offers: { '@type': 'Offer', price: '1500', priceCurrency: 'USD' }, description: 'Review of up to 25 real outputs or claims with consequence ranking, primary-source evidence, human-approved findings, and seven-day monitoring.' },
    { '@type': 'FAQPage', '@id': `${SITE_URL}/audit/#faq`, mainEntity: AUDIT_FAQ.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
  ] }

  return <main className="app-page audit-sales-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <section className="onboarding-wrap"><div className="audit-sales-card">
      <header className="audit-sales-hero">
        <p className="app-kicker">ADVERSARIAL FACT AUDIT</p>
        <h1 className="app-title">Find the expensive wrong answer before your customer does.</h1>
        <p className="app-copy">Send up to 25 real outputs your users actually see. ProofTTL isolates the factual claims, ranks them by damage-if-wrong, verifies the highest-risk findings against authoritative sources, and shows exactly what holds, what breaks, and what needs fixing.</p>
        <div className="audit-sales-trustline"><span>FIXED $1,500</span><span>PRIMARY SOURCES</span><span>HUMAN APPROVAL</span><span>7-DAY WATCH</span></div>
      </header>

      <div className="audit-offer-summary" aria-label="Fact Audit offer summary">
        <div><span>FIXED SCOPE</span><strong>$1,500 Fact Audit</strong><small>Up to 25 outputs / claims · 3–5 business days</small></div>
        <div><span>DELIVERABLE</span><strong>Evidence, verdicts, fixes</strong><small>Highest-risk findings deep-verified</small></div>
        <p>Built for teams shipping AI answers where a confidently wrong output is expensive, visible, or hard to defend.</p>
      </div>

      <AuditIntakeForm />

      <section className="audit-sales-proof">
        <div><p className="app-kicker">WHAT YOU GET</p><ul className="audit-clean-list">
          <li>Up to 25 real outputs decomposed into auditable factual claims</li>
          <li>Findings ranked by consequence if the output is wrong</li>
          <li>Authoritative evidence with explicit FOR / AGAINST reasoning and contradiction checks</li>
          <li>SUPPORTED, CONTRADICTED, or UNKNOWN without forced certainty</li>
          <li>Customer-ready proof pages and concise recommended fixes for material failures</li>
          <li>Seven days of monitoring on important findings, followed by a final re-read</li>
        </ul></div>
        <div className="audit-sample-card"><p className="app-kicker">WANT PROOF FIRST?</p><p className="app-copy">Inspect a public sample before sending anything. The artifact shows the claim, authoritative evidence, verdict logic, uncertainty, and repair.</p><a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE AUDIT →</a></div>
      </section>

      <section className="audit-sales-steps"><p className="app-kicker">HOW IT RUNS</p><div className="audit-step-grid">
        <div><strong>1</strong><span>Send real outputs</span><small>Up to 25.</small></div>
        <div><strong>2</strong><span>Risk + evidence pass</span><small>Primary sources first.</small></div>
        <div><strong>3</strong><span>Human approval</span><small>No auto-publication.</small></div>
        <div><strong>4</strong><span>Audit + watch</span><small>Deliver, monitor, re-read.</small></div>
      </div></section>

      <section style={{ margin: '28px 34px 0' }} aria-labelledby="audit-faq-heading"><div style={{ paddingBottom: 14 }}><p className="app-kicker">COMMON QUESTIONS</p><h2 id="audit-faq-heading" style={{ margin: 0, fontSize: 'clamp(24px,3vw,32px)' }}>Before you send the outputs.</h2></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 10 }}>{AUDIT_FAQ.map((item) => <article key={item.question} style={{ minHeight: 154, padding: 18, border: '1px solid rgba(148,163,184,.11)', borderRadius: 12 }}><h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{item.question}</h3><p className="app-copy" style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>{item.answer}</p></article>)}</div></section>

      <p className="app-note audit-limit-note">ProofTTL records what examined sources support at a point in time. It does not create legal authority, guarantee future truth, or replace professional legal, financial, medical, or regulatory judgment.</p>
    </div></section>
  </main>
}
