export const metadata = {
  title: 'Verification Audit — ProofTTL',
  description: 'A paid claim-verification audit for AI outputs, research, product pages, pricing, documentation, and other high-stakes factual claims.',
}

const deliverables = [
  ['10–25 high-stakes claims', 'You choose the claims that would be costly, embarrassing, or risky to get wrong.'],
  ['Clear verdict for every claim', 'SUPPORTED, CONTRADICTED, or UNKNOWN — with the evidence used to reach that result.'],
  ['Source-backed evidence package', 'Each result includes the source, evidence excerpt, timestamped observation, and a signed ProofTTL Fact Lease.'],
  ['Contradictions surfaced first', 'Material conflicts and unsupported statements are separated so you know what needs attention before you ship.'],
  ['7-day change monitoring', 'After delivery, ProofTTL keeps watching the supplied sources and flags material evidence changes for seven days.'],
  ['Human-readable audit summary', 'You receive a concise report you can hand to a client, teammate, manager, or reviewer.'],
]

export default function AuditPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <span className="app-meta">EARLY CUSTOMER PILOT · MANUAL ONBOARDING</span>
      </div>

      <section className="onboarding-wrap">
        <div className="onboarding-card">
          <p className="app-kicker">PROOFTTL VERIFICATION AUDIT</p>
          <h1 className="app-title">Know which claims hold up before someone else checks them.</h1>
          <p className="app-copy">
            Send 10–25 factual claims from an AI output, research report, product page, pricing page, documentation set, or client deliverable. We return a defensible source-backed audit showing what is supported, what is contradicted, what remains unknown, and what evidence backs each result.
          </p>

          <div className="price-preview">
            <div>
              <p className="app-kicker">EARLY PILOT</p>
              <strong>$500</strong>
              <span>one-time · 10–25 claims · 7-day monitoring</span>
            </div>
            <div className="app-meta">SCOPE CONFIRMED BEFORE PAYMENT · HIGH-TOUCH DELIVERY</div>
          </div>

          <div className="app-table" aria-label="Audit deliverables">
            {deliverables.map(([title, description]) => (
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
              The public sample audit uses live product documentation to show how ProofTTL separates current source support from stale or internally inconsistent product facts. No fabricated signatures, customer data, or fake monitoring events.
            </p>
            <a className="text-link" href="/audit/sample/">View the public sample audit <span>→</span></a>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">BUILT FOR CLAIMS THAT CARRY CONSEQUENCES</p>
            <p className="app-copy">
              AI and agent outputs · research and diligence · product and pricing claims · API/documentation claims · competitive intelligence · source-backed client reports.
            </p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">HOW WE HANDLE DISPUTES</p>
            <p className="app-copy">
              If you disagree with a verdict or believe a material source was missed, send us the concern and we will re-review that claim once at no additional charge. We do not hide uncertainty behind a confidence score: unresolved evidence stays UNKNOWN.
            </p>
          </div>

          <div className="hero-actions">
            <a
              className="button button-primary"
              href="mailto:tasx13ok@gmail.com?subject=ProofTTL%20Verification%20Audit&body=I%27m%20interested%20in%20the%20%24500%20ProofTTL%20Verification%20Audit.%0A%0ACompany%20or%20project%3A%0AWhat%20I%20want%20verified%3A%0AApproximate%20number%20of%20claims%3A%0AWhy%20these%20claims%20matter%3A%0ADeadline%20(if%20any)%3A"
            >
              START A $500 AUDIT →
            </a>
            <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE AUDIT</a>
            <a className="button button-secondary" href="/docs/">VERIFICATION METHOD</a>
          </div>

          <p className="app-note">
            This is an early high-touch pilot, not a self-service subscription. Scope is confirmed before payment. ProofTTL reports what the supplied and discovered public sources support at the time of review; it does not replace legal, financial, medical, or regulatory professional judgment.
          </p>
        </div>
      </section>
    </main>
  )
}
