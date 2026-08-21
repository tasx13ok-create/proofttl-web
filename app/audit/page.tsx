import AuditIntakeForm from '../../components/AuditIntakeForm'

export const metadata = {
  title: 'Claim Stress Test & Verification Audit',
  description: 'Pressure-test 3–5 high-stakes claims for $129, or run a full $500 verification audit. ProofTTL checks claims against primary sources before you publish, sell, raise, or defend them.',
  alternates: { canonical: '/audit/' },
  openGraph: {
    title: 'ProofTTL Claim Stress Test & Verification Audit',
    description: 'Source-backed claim verification starting at $129. Scope is confirmed before payment.',
    url: '/audit/',
    type: 'website',
  },
}

export default function AuditPage() {
  return (
    <main className="app-page audit-sales-page">
      <section className="onboarding-wrap">
        <div className="audit-sales-card">
          <header className="audit-sales-hero">
            <p className="app-kicker">SOURCE-BACKED CLAIM VERIFICATION</p>
            <h1 className="app-title">Find the claim that breaks before someone else does.</h1>
            <p className="app-copy">Send the factual claims you are about to publish, sell, raise on, launch, or defend. ProofTTL checks them against public primary sources and returns explicit verdicts with evidence.</p>
            <div className="audit-sales-trustline">
              <span>NO CARD TO SUBMIT</span>
              <span>SCOPE BEFORE PAYMENT</span>
              <span>REVIEW WITHIN 24H</span>
            </div>
          </header>

          <div className="audit-offer-summary" aria-label="Verification offer summary">
            <div>
              <span>START SMALL</span>
              <strong>$129 Claim Stress Test</strong>
              <small>3–5 claims · 48-hour turnaround</small>
            </div>
            <div>
              <span>FULL REVIEW</span>
              <strong>$500 Verification Audit</strong>
              <small>10–25 claims · 3–5 business-day turnaround</small>
            </div>
            <p>Start at $129 and upgrade later for <strong>$371 more</strong>. Your first payment is credited in full.</p>
          </div>

          <AuditIntakeForm />

          <section className="audit-sales-proof">
            <div>
              <p className="app-kicker">WHAT YOU GET</p>
              <ul className="audit-clean-list">
                <li>SUPPORTED, CONTRADICTED, or UNKNOWN for every checked claim</li>
                <li>Primary-source links and the evidence used for each verdict</li>
                <li>Signed ProofTTL Fact Leases tied to the source observation</li>
                <li>A concise summary you can hand to a client, teammate, investor, or reviewer</li>
              </ul>
            </div>
            <div className="audit-sample-card">
              <p className="app-kicker">WANT PROOF FIRST?</p>
              <p className="app-copy">Inspect the public sample and see the claim set, sources, verdict logic, contradictions, and uncertainty handling.</p>
              <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE AUDIT →</a>
            </div>
          </section>

          <section className="audit-sales-steps">
            <p className="app-kicker">WHAT HAPPENS NEXT</p>
            <div className="audit-step-grid">
              <div><strong>1</strong><span>Submit claims</span><small>No payment.</small></div>
              <div><strong>2</strong><span>Scope review</span><small>Within 24 hours.</small></div>
              <div><strong>3</strong><span>Approve + pay</span><small>Secure Stripe checkout.</small></div>
              <div><strong>4</strong><span>Receive results</span><small>Evidence + verdicts.</small></div>
            </div>
          </section>

          <p className="app-note audit-limit-note">UNKNOWN stays UNKNOWN. ProofTTL records what examined sources supported at a point in time; it does not create legal authority, guarantee future truth, or replace professional legal, financial, medical, or regulatory judgment.</p>
        </div>
      </section>
    </main>
  )
}