import type { Metadata } from 'next'
import ProductDetailShell from '../../components/ProductDetailShell'

export const metadata: Metadata = {
  title: 'How ProofTTL Works — Source-Backed Fact Audits',
  description: 'See how ProofTTL scopes, verifies, documents, and monitors consequential AI outputs and factual claims in the $1,500 Fact Audit.',
  alternates: { canonical: '/how-proofttl-works/' },
  robots: { index: true, follow: true },
}

const steps = [
  ['01', 'Submit', 'Send 10–25 real AI outputs or consequential factual claims. No card is required to submit an intake.'],
  ['02', 'Decompose', 'ProofTTL isolates atomic factual assertions and separates the claims that actually need evidence.'],
  ['03', 'Rank', 'Claims are ordered by consequence so the highest-risk failures receive the deepest verification effort.'],
  ['04', 'Verify', 'Relevant public evidence is examined with authoritative and primary sources prioritized where appropriate.'],
  ['05', 'Challenge', 'A separate contradiction pass looks for evidence that weakens or negates the preliminary conclusion.'],
  ['06', 'Approve + watch', 'Customer-facing findings require human approval, then important findings enter a seven-day watch.'],
] as const

export default function HowProofTTLWorksPage() {
  return <ProductDetailShell
    active="method"
    eyebrow="Method"
    title={<>From an AI answer<br/><em>to inspectable proof.</em></>}
    description={<>ProofTTL is designed around one idea: confidence should come after evidence, not before it. The Fact Audit turns real outputs into scoped claims, challenges them, and preserves uncertainty when the record is incomplete.</>}
    actions={<><a className="primary" href="/audit/#audit-intake">Start Fact Audit <span>↗</span></a><a href="/audit/sample/">View sample</a></>}
  >
    <section className="ptl-method-flow">
      {steps.map(([number,title,copy]) => <article key={number}><span>{number}</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}
    </section>

    <section className="ptl-detail-section"><header><span>Verdict discipline</span><h2>Three outcomes. No forced certainty.</h2><p>Each verdict stays attached to the exact proposition and the evidence actually examined.</p></header><div className="ptl-verdict-grid"><article className="supported"><span>SUPPORTED</span><p>The examined public evidence supports the scoped factual claim as written.</p></article><article className="contradicted"><span>CONTRADICTED</span><p>The examined evidence materially conflicts with the scoped claim.</p></article><article className="unknown"><span>UNKNOWN</span><p>The available evidence does not justify calling the claim supported or contradicted.</p></article></div></section>

    <section className="ptl-method-diagram">
      <div className="ptl-method-column"><span>Input</span><strong>Real customer-facing output</strong><p>Preserve the original wording and context.</p></div><b>→</b><div className="ptl-method-column"><span>Evidence</span><strong>FOR + AGAINST</strong><p>Prefer inspectable authoritative sources.</p></div><b>→</b><div className="ptl-method-column"><span>Judgment</span><strong>Verdict + uncertainty</strong><p>Challenge first, then finalize.</p></div><b>→</b><div className="ptl-method-column"><span>Delivery</span><strong>Human-approved finding</strong><p>Monitor important claims for seven days.</p></div>
    </section>

    <section className="ptl-detail-section"><header><span>What you receive</span><h2>A complete finding, not a pile of links.</h2></header><div className="ptl-three-up"><article><span>Ranked findings</span><strong>Consequence first</strong><p>Separate low-impact noise from the claims most likely to create customer, compliance, financial, or reputational damage.</p></article><article><span>Evidence</span><strong>FOR / AGAINST</strong><p>Important findings remain tied to inspectable sources and a preserved contradiction pass.</p></article><article><span>Proof + watch</span><strong>Human-approved</strong><p>Approved findings ship with a readable proof artifact and seven days of monitoring on important claims.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>Boundaries</span><h2>The limits are part of the method.</h2></header><div className="ptl-boundary-list"><article><strong>Scope before payment</strong><p>Submitting an intake does not charge a card. ProofTTL confirms the engagement before the $1,500 payment request is created.</p></article><article><strong>Public-source service</strong><p>The standard Fact Audit is built around accessible public evidence. Private or internal evidence requires separate scoping.</p></article><article><strong>Human publication gate</strong><p>Customer-facing findings are not automatically published during the launch workflow.</p></article><article><strong>Professional boundaries</strong><p>ProofTTL does not replace legal, medical, financial, regulatory, accounting, or other professional advice.</p></article></div></section>

    <section className="ptl-detail-cta"><div><span>One launch offer</span><h2>$1,500 Fact Audit</h2><p>10–25 real outputs or claims, deep verification of the highest-risk findings, human approval, proof/report delivery, and seven days of monitoring.</p></div><a href="/audit/#audit-intake">Start Fact Audit <span>↗</span></a></section>
  </ProductDetailShell>
}
