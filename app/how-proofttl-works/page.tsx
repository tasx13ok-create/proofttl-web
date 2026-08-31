import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How ProofTTL Works — Source-Backed Fact Audits',
  description: 'See how ProofTTL scopes, verifies, documents, and monitors consequential AI outputs and factual claims in the $1,500 Fact Audit.',
  alternates: { canonical: '/how-proofttl-works/' },
  robots: { index: true, follow: true },
}

const process = [
  ['1 · SUBMIT', 'Send 10–25 real AI outputs or consequential factual claims, why they matter, and your deadline. No card is required to submit an intake.'],
  ['2 · DECOMPOSE + RANK', 'ProofTTL isolates atomic factual assertions and ranks them by consequence so the highest-risk findings receive the deepest verification effort.'],
  ['3 · SCOPE + PAY', 'ProofTTL confirms the scope before creating the Stripe payment request. The Fact Audit is $1,500 fixed scope; raw card details are handled by Stripe rather than stored by ProofTTL.'],
  ['4 · VERIFY', 'Important claims are checked against relevant accessible public evidence with authoritative and primary sources prioritized where appropriate, including evidence FOR and AGAINST.'],
  ['5 · CONTRADICTION PASS + VERDICT', 'A separate contradiction pass challenges the evidence set before each finding is finalized as SUPPORTED, CONTRADICTED, or UNKNOWN. UNKNOWN remains valid when evidence does not justify certainty.'],
  ['6 · HUMAN APPROVAL + DELIVERY', 'Customer-facing findings require human approval before publication. The audit deliverable includes evidence, readable reasoning, proof artifacts, and seven days of monitoring on important findings with a final re-read.'],
] as const

const verdicts = [
  ['SUPPORTED', 'The examined public evidence supports the scoped factual claim as written.'],
  ['CONTRADICTED', 'The examined evidence materially conflicts with the scoped claim.'],
  ['UNKNOWN', 'The available evidence does not justify calling the claim supported or contradicted.'],
] as const

const boundaries = [
  ['Scope before payment', 'Submitting an intake does not charge a card. The engagement is confirmed before the $1,500 payment request is created.'],
  ['Evidence over confidence vibes', 'ProofTTL documents what the examined sources support instead of presenting unexplained certainty.'],
  ['Human approval', 'Customer-facing findings are not published automatically during the launch workflow. Human approval is required.'],
  ['Time matters', 'Important findings enter a seven-day watch with a final re-read because evidence can change after the initial audit.'],
  ['Public-source service', 'The standard Fact Audit is built around accessible public evidence. Private or internal evidence requires separate scoping.'],
  ['Professional boundaries', 'ProofTTL does not replace legal, medical, financial, regulatory, accounting, or other professional advice.'],
] as const

function Matrix({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return <div className="app-table how-works-matrix">{rows.map(([name, description]) => <div className="app-table-row" key={name}><span>{name}</span><span>{description}</span></div>)}</div>
}

export default function HowProofTTLWorksPage() {
  return (
    <main className="app-page audit-sales-page how-works-page">
      <section className="app-shell how-works-shell">
        <section className="onboarding-card how-works-card">
          <p className="app-kicker">HOW PROOFTTL WORKS</p>
          <h1 className="app-title" style={{ maxWidth: 900 }}>From a risky AI output to a defensible evidence trail.</h1>
          <p className="app-copy" style={{ maxWidth: 940 }}>ProofTTL sells one launch engagement: the <strong>$1,500 Fact Audit</strong>. Submit 10–25 real outputs or claims, identify what could cause the most damage if wrong, verify the highest-risk findings deeply, require human approval, and keep the important findings under watch for seven days.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="/audit/#audit-intake">START FACT AUDIT →</a>
            <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE AUDIT</a>
            <a className="text-link" href="/trust/">Payment + trust boundary ↗</a>
          </div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">THE CUSTOMER FLOW</p>
          <h2>Six explicit steps from intake to monitored findings.</h2>
          <Matrix rows={process} />
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">THE VERDICTS</p>
          <h2>Uncertainty is a valid result.</h2>
          <p className="app-copy">ProofTTL does not force every claim into a yes/no answer just to look decisive.</p>
          <Matrix rows={verdicts} />
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">WHAT YOU RECEIVE</p>
          <h2>A customer-ready audit, not a loose collection of links.</h2>
          <div className="pricing-cards">
            <article><span className="plan-label">RANKED FINDINGS</span><h3>Consequence first</h3><p>The audit separates low-impact noise from the claims most likely to create customer, compliance, financial, or reputational damage.</p></article>
            <article><span className="plan-label">EVIDENCE</span><h3>FOR / AGAINST</h3><p>Important findings are tied to inspectable authoritative evidence and challenged with a contradiction pass before finalization.</p></article>
            <article><span className="plan-label">PROOF + WATCH</span><h3>Human-approved delivery</h3><p>Approved proof artifacts and the report are delivered with seven days of monitoring on important findings and a final re-read.</p></article>
          </div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">ONE LAUNCH OFFER</p>
          <h2>$1,500 Fact Audit</h2>
          <div className="pricing-cards">
            <article className="featured-plan">
              <span className="plan-label">FACT AUDIT</span>
              <div className="price">$1,500<span> fixed scope</span></div>
              <p>10–25 real outputs or claims reviewed, with deep verification of the highest-risk findings, evidence FOR and AGAINST, a contradiction pass, human approval before customer-facing publication, proof/report delivery, and seven days of monitoring on important findings.</p>
              <a className="button button-primary" href="/audit/#audit-intake">Start Fact Audit</a>
            </article>
          </div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">BOUNDARIES</p>
          <h2>What ProofTTL does — and does not — promise.</h2>
          <Matrix rows={boundaries} />
        </section>

        <section className="onboarding-card how-works-card">
          <p className="app-kicker">READY TO AUDIT THE OUTPUT?</p>
          <h2>Submit the real outputs first. Pay only after the scope is clear.</h2>
          <div className="hero-actions"><a className="button button-primary" href="/audit/#audit-intake">START A $1,500 FACT AUDIT →</a><a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE</a></div>
        </section>
      </section>
    </main>
  )
}
