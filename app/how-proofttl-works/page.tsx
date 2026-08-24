import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How ProofTTL Works — Source-Backed Claim Verification',
  description: 'See how ProofTTL scopes, checks, documents, and delivers source-backed verdicts for high-stakes factual claims before payment and publication.',
  alternates: { canonical: '/how-proofttl-works/' },
  robots: { index: true, follow: true },
}

const process = [
  ['1 · SUBMIT', 'Send the exact factual claims you want checked, why they matter, and your deadline. No card is required to submit an intake.'],
  ['2 · SCOPE', 'ProofTTL reviews the claim set and confirms what will be checked, the expected output, price, and turnaround before asking for payment.'],
  ['3 · PAY', 'After scope confirmation, ProofTTL creates the Stripe payment request for the agreed service. Raw card details are handled by Stripe rather than stored by ProofTTL.'],
  ['4 · VERIFY', 'Each scoped claim is checked against relevant accessible public evidence, prioritizing authoritative and primary sources where appropriate.'],
  ['5 · VERDICT', 'Each checked claim receives a SUPPORTED, CONTRADICTED, or UNKNOWN verdict. UNKNOWN is preserved when the evidence is not strong enough for a responsible conclusion.'],
  ['6 · DELIVER', 'You receive the agreed verification output with evidence links, verdict context, and signed Fact Lease records for the checked source observations.'],
] as const

const verdicts = [
  ['SUPPORTED', 'The examined public evidence supports the scoped factual claim as written.'],
  ['CONTRADICTED', 'The examined evidence materially conflicts with the scoped claim.'],
  ['UNKNOWN', 'The available evidence does not justify calling the claim supported or contradicted.'],
] as const

const boundaries = [
  ['Scope before payment', 'Submitting an intake does not charge a card. The claim set and service are confirmed first.'],
  ['Evidence over confidence scores', 'ProofTTL documents what the examined sources support instead of returning an unexplained percentage.'],
  ['Time matters', 'A Fact Lease records a source-backed observation at a point in time. Monitoring can detect later source changes; it is not a claim of permanent truth.'],
  ['Public-source service', 'The standard verification service is built around accessible public evidence. Private/internal evidence requires separate scoping.'],
  ['Professional boundaries', 'ProofTTL does not replace legal, medical, financial, regulatory, accounting, or other professional advice.'],
] as const

function Matrix({ rows }: { rows: readonly (readonly [string, string])[] }) {
  return <div className="app-table">{rows.map(([name, description]) => <div className="app-table-row" key={name}><span>{name}</span><span>{description}</span></div>)}</div>
}

export default function HowProofTTLWorksPage() {
  return (
    <main className="app-page audit-sales-page">
      <section className="app-shell" style={{ padding: '38px 0 110px', display: 'grid', gap: 18 }}>
        <section className="onboarding-card" style={{ padding: 30 }}>
          <p className="app-kicker">HOW PROOFTTL WORKS</p>
          <h1 className="app-title" style={{ maxWidth: 900 }}>From a risky claim to an evidence-backed verdict.</h1>
          <p className="app-copy" style={{ maxWidth: 940 }}>ProofTTL is a scope-first verification service. You submit the claims before paying, the exact work is confirmed, and each accepted claim is checked against public evidence with uncertainty left visible.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="/audit/#audit-intake">START VERIFICATION →</a>
            <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE AUDIT</a>
            <a className="text-link" href="/trust/">Payment + trust boundary ↗</a>
          </div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">THE CUSTOMER FLOW</p>
          <h2>Six explicit steps. No mystery checkout.</h2>
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
          <h2>Evidence attached to the claim it actually supports.</h2>
          <div className="pricing-cards">
            <article><span className="plan-label">CLAIM</span><h3>Exact assertion</h3><p>The factual statement is preserved closely enough that the verdict cannot quietly drift to an easier claim.</p></article>
            <article><span className="plan-label">EVIDENCE</span><h3>Inspectable sources</h3><p>Relevant public source links and context are attached to the checked assertion so the result can be reviewed.</p></article>
            <article><span className="plan-label">FACT LEASE</span><h3>Signed observation record</h3><p>The source observation can be represented as a signed, time-bounded Fact Lease rather than a claim of permanent universal truth.</p></article>
          </div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">SERVICE OPTIONS</p>
          <h2>Choose the scope that matches the downside.</h2>
          <div className="pricing-cards">
            <article>
              <span className="plan-label">CLAIM STRESS TEST</span>
              <div className="price">$129<span> one-time</span></div>
              <p>3–5 high-stakes claims with a target 48-hour turnaround after payment and scope confirmation.</p>
              <a className="button button-primary" href="/audit/#audit-intake">Start Stress Test</a>
            </article>
            <article className="featured-plan">
              <span className="plan-label">FULL VERIFICATION AUDIT</span>
              <div className="price">$500<span> one-time</span></div>
              <p>10–25 claims, a verification report, signed Fact Leases, and 7 days of monitoring. A prior $129 Stress Test is credited in full toward the audit.</p>
              <a className="button button-primary" href="/audit/#audit-intake">Start Full Audit</a>
            </article>
          </div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">BOUNDARIES</p>
          <h2>What ProofTTL does — and does not — promise.</h2>
          <Matrix rows={boundaries} />
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">TECHNICAL NOTE</p>
          <h2>The customer service is separate from experimental protocol tooling.</h2>
          <p className="app-copy">ProofTTL also maintains technical Fact Lease infrastructure and an app assistant called L.O.V.E. Those product capabilities are separate from the human verification purchase flow. The service described on this page uses the scope-first commercial workflow and Stripe payment path above; customers do not need testnet tokens, a crypto wallet, Studio, Workspace, or any other internal tool to buy a verification.</p>
          <div className="hero-actions"><a className="text-link" href="/docs/">Technical documentation ↗</a></div>
        </section>

        <section className="onboarding-card" style={{ padding: 30 }}>
          <p className="app-kicker">READY TO CHECK THE CLAIMS?</p>
          <h2>Submit them first. Pay only after the scope is clear.</h2>
          <div className="hero-actions"><a className="button button-primary" href="/audit/#audit-intake">START WITH 3–5 CLAIMS — $129 →</a><a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE</a></div>
        </section>
      </section>
    </main>
  )
}
