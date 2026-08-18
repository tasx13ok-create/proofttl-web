export const metadata = {
  title: 'Verification Audit — ProofTTL',
  description: 'A paid ProofTTL verification audit for high-value claims, AI outputs, research, product pages, and documentation.',
}

const deliverables = [
  ['10–25 factual claims', 'We audit the claims that matter most to your product, research, or AI output.'],
  ['Signed Fact Leases', 'Each verified claim receives a source-backed, expiring ProofTTL lease with evidence and verdict.'],
  ['Contradiction report', 'Unsupported, contradicted, and uncertain claims are separated instead of flattened into one confidence score.'],
  ['7-day monitoring', 'We keep watching the underlying sources and flag material evidence changes during the pilot.'],
  ['Human-readable summary', 'You receive a concise audit summary alongside the machine-readable lease records.'],
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
          <h1 className="app-title">Stop shipping claims nobody can prove.</h1>
          <p className="app-copy">
            Send us the factual claims that matter most. ProofTTL checks them against their sources, issues signed expiring Fact Leases, separates supported claims from contradictions and unknowns, and keeps watching the evidence for seven days.
          </p>

          <div className="price-preview">
            <div>
              <p className="app-kicker">EARLY PILOT</p>
              <strong>$500</strong>
              <span>one-time · 10–25 claims · 7-day monitoring</span>
            </div>
            <div className="app-meta">HIGH-TOUCH · MANUAL DELIVERY · LIMITED EARLY SLOTS</div>
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
            <p className="app-kicker">GOOD FIRST USE CASES</p>
            <p className="app-copy">
              AI or agent outputs · product and pricing claims · investor or research material · API/documentation claims · competitor intelligence · source-backed reports.
            </p>
          </div>

          <div className="hero-actions">
            <a
              className="button button-primary"
              href="mailto:tasx13ok@gmail.com?subject=ProofTTL%20Verification%20Audit&body=I%27m%20interested%20in%20the%20%24500%20ProofTTL%20Verification%20Audit.%0A%0ACompany%20or%20project%3A%0AWhat%20I%20want%20verified%3A%0AApproximate%20number%20of%20claims%3A%0ADeadline%20(if%20any)%3A"
            >
              START A $500 AUDIT →
            </a>
            <a className="button button-secondary" href="/docs/">SEE HOW FACT LEASES WORK</a>
          </div>

          <p className="app-note">
            This is an early high-touch pilot, not a self-service subscription. Scope is confirmed before payment. ProofTTL reports what the supplied sources support; it does not replace legal, financial, medical, or regulatory professional judgment.
          </p>
        </div>
      </section>
    </main>
  )
}
