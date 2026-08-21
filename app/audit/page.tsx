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

const sharedDeliverables = [
  ['Clear verdict for every claim', 'SUPPORTED, CONTRADICTED, or UNKNOWN — with the evidence used to reach that result.'],
  ['Source-backed evidence package', 'Each result includes the source, evidence excerpt, timestamped observation, and a signed ProofTTL Fact Lease.'],
  ['Contradictions surfaced first', 'Material conflicts and unsupported statements are separated so you know what needs attention before you ship.'],
  ['Human-readable summary', 'You receive a concise result you can hand to a client, teammate, manager, investor, or reviewer.'],
]

export default function AuditPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/" aria-label="ProofTTL home">
          <img src="/proofttl-logo.png" width="32" height="32" alt="" aria-hidden="true" style={{ objectFit: 'contain' }} />
          <span>PROOF<span className="brand-muted">TTL</span></span>
        </a>
        <span className="app-meta">SCOPE BEFORE PAYMENT · REVIEW WITHIN 24H</span>
      </div>

      <section className="onboarding-wrap">
        <div className="onboarding-card">
          <p className="app-kicker">BEFORE THE MARKET SEES THE CLAIM</p>
          <h1 className="app-title">Find the claim that breaks before someone else does.</h1>
          <p className="app-copy">
            Send the exact factual claims you are about to publish, sell, raise on, launch, or defend. ProofTTL checks them against public primary sources and returns source-backed verdicts before the problem becomes public.
          </p>

          <div className="pricing-cards" style={{ marginTop: 24 }}>
            <article className="featured-plan">
              <span className="plan-label">START HERE</span>
              <div className="price">$129<span> one-time</span></div>
              <h2>Claim Stress Test</h2>
              <p>3–5 high-stakes claims · source-backed verdicts · signed Fact Leases · 48-hour turnaround · no ongoing monitoring.</p>
              <a className="button button-primary" href="#audit-intake">SUBMIT 3–5 CLAIMS — NO PAYMENT NOW →</a>
            </article>
            <article>
              <span className="plan-label">LARGER CLAIM SET</span>
              <div className="price">$500<span> one-time</span></div>
              <h2>Full Verification Audit</h2>
              <p>10–25 claims · full source-backed report · signed Fact Leases · contradictions prioritized · 7-day monitoring · 3–5 business-day turnaround.</p>
              <a className="button button-secondary" href="#audit-intake">SUBMIT FULL AUDIT SCOPE →</a>
            </article>
          </div>

          <p className="app-note" style={{ marginTop: 16 }}>
            <strong>No card is required to submit.</strong> We confirm the exact scope first. If you approve it, you receive the payment link. A completed $129 Stress Test can later be upgraded to the $500 Full Audit for <strong>$371 more</strong>.
          </p>

          <AuditIntakeForm />

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">WHAT YOUR $129 GETS YOU</p>
            <div className="app-table" aria-label="Shared verification deliverables">
              {sharedDeliverables.map(([title, description]) => (
                <div className="app-table-row" key={title}>
                  <span>{title}</span>
                  <span>{description}</span>
                  <span>✓</span>
                </div>
              ))}
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">SEE THE WORK BEFORE YOU BUY</p>
            <p className="app-copy">
              Want proof before submitting? Inspect the public sample. It shows the claim set, sources, verdict logic, contradictions, and uncertainty instead of asking you to trust a black-box summary.
            </p>
            <div className="hero-actions">
              <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE AUDIT →</a>
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">WHAT HAPPENS AFTER YOU SUBMIT</p>
            <div className="app-table">
              <div className="app-table-row"><span>1. Submit</span><span>Send the exact claims, context, and deadline.</span><span>NOW</span></div>
              <div className="app-table-row"><span>2. Scope</span><span>Within 24 hours, we confirm what will be checked and the turnaround.</span><span>$0</span></div>
              <div className="app-table-row"><span>3. Approve + pay</span><span>If the scope matches what you need, you receive a secure card checkout.</span><span>THEN</span></div>
              <div className="app-table-row"><span>4. Deliver</span><span>You receive the agreed verdicts, evidence, signed Fact Leases, and report.</span><span>RESULT</span></div>
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">LIMITS, NOT MARKETING FOG</p>
            <p className="app-copy">
              UNKNOWN stays UNKNOWN. A signed Fact Lease shows what the examined sources supported at a point in time; it does not create outside authority, guarantee future truth, or replace legal, financial, medical, or regulatory professional judgment. If a material source was missed, one re-review of that claim is included.
            </p>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href="#audit-intake">SUBMIT CLAIMS — NO PAYMENT NOW →</a>
            <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE</a>
          </div>
        </div>
      </section>
    </main>
  )
}
