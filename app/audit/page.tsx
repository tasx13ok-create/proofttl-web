import AuditIntakeForm from '../../components/AuditIntakeForm'

export const metadata = {
  title: 'Claim Stress Test & Verification Audit — ProofTTL',
  description: 'Pressure-test high-stakes claims against primary sources before you publish, sell, raise, or defend them.',
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
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <span className="app-meta">EARLY CUSTOMER PILOT · SCOPE BEFORE PAYMENT</span>
      </div>

      <section className="onboarding-wrap">
        <div className="onboarding-card">
          <p className="app-kicker">BEFORE THE MARKET SEES THE CLAIM</p>
          <h1 className="app-title">Pressure-test the claims that can cost you money if they are wrong.</h1>
          <p className="app-copy">
            If you are about to publish, raise, sell, launch, or defend factual claims, ProofTTL checks those exact claims against public primary sources and returns source-backed verdicts before someone else finds the problem first.
          </p>

          <div className="pricing-cards" style={{ marginTop: 24 }}>
            <article>
              <span className="plan-label">LOW-FRICTION ENTRY</span>
              <div className="price">$129<span> one-time</span></div>
              <h2>Claim Stress Test</h2>
              <p>3–5 high-stakes claims · same verification method · signed Fact Leases · 48-hour turnaround · no ongoing monitoring.</p>
              <a className="button button-primary" href="#audit-intake">START WITH 3–5 CLAIMS →</a>
            </article>
            <article className="featured-plan">
              <span className="plan-label">FLAGSHIP AUDIT</span>
              <div className="price">$500<span> one-time</span></div>
              <h2>Full Verification Audit</h2>
              <p>10–25 claims · full source-backed report · signed Fact Leases · contradictions prioritized · 7-day monitoring · 3–5 business-day turnaround.</p>
              <a className="button button-primary" href="#audit-intake">START FULL AUDIT →</a>
            </article>
          </div>

          <p className="app-note" style={{ marginTop: 16 }}>
            Start small without losing money: a completed $129 Stress Test can be upgraded to the $500 Full Audit for <strong>$371 more</strong>.
          </p>

          <div className="app-table" aria-label="Shared verification deliverables">
            {sharedDeliverables.map(([title, description]) => (
              <div className="app-table-row" key={title}>
                <span>{title}</span>
                <span>{description}</span>
                <span>✓</span>
              </div>
            ))}
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">SEE THE WORK BEFORE YOU BUY</p>
            <p className="app-copy">
              Review the public sample first. ProofTTL shows its sources, verdict logic, uncertainty, and signed evidence instead of asking you to trust a black-box summary.
            </p>
            <div className="hero-actions">
              <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE AUDIT</a>
              <a className="button button-secondary" href="/docs/">READ THE METHOD</a>
              <a className="button button-secondary" href="/trust.html">TRUST CENTER</a>
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">THE MOMENTS THIS IS FOR</p>
            <p className="app-copy">
              Product launches · fundraising and investor diligence · customer-facing sales claims · pricing and API documentation · client deliverables · competitive research · public announcements · claims under scrutiny.
            </p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">WHAT HAPPENS NEXT</p>
            <div className="app-table">
              <div className="app-table-row"><span>1. Submit</span><span>Tell us the exact claims, context, and deadline.</span><span>NOW</span></div>
              <div className="app-table-row"><span>2. Scope</span><span>Within 24 hours, we confirm the claims, source priorities, format, and turnaround.</span><span>NO PAYMENT</span></div>
              <div className="app-table-row"><span>3. Pay</span><span>Payment is requested only after you approve the scope.</span><span>THEN</span></div>
              <div className="app-table-row"><span>4. Deliver</span><span>You receive verdicts, evidence, signed Fact Leases, and the agreed report.</span><span>RESULT</span></div>
            </div>
          </div>

          <AuditIntakeForm />

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">LIMITS, NOT MARKETING FOG</p>
            <p className="app-copy">
              UNKNOWN stays UNKNOWN. A signed Fact Lease shows what the examined sources supported at a point in time; it does not create outside authority, guarantee future truth, or replace legal, financial, medical, or regulatory professional judgment. If a material source was missed, one re-review of that claim is included.
            </p>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href="#audit-intake">SUBMIT CLAIMS FOR SCOPE REVIEW →</a>
            <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE</a>
          </div>
        </div>
      </section>
    </main>
  )
}
