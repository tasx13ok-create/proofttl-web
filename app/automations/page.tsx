import AutomationCenter from '../../components/AutomationCenter'

export const metadata = { title: 'Automations — ProofTTL' }

export default function AutomationsPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">AUTOMATIONS · DEFINITIONS / POLICY / FUTURE EXECUTION</div>
      </div>
      <section className="app-shell" style={{ paddingBottom: 100, display: 'grid', gap: 18 }}>
        <div className="onboarding-card">
          <p className="app-kicker">PROOFTTL AUTOMATIONS</p>
          <h1 className="app-title">Turn repeat work into rules L.O.V.E. can coordinate.</h1>
          <p className="app-copy">Automation definitions are account-owned and inherit the same capability/risk policy as direct actions. The execution engine is deliberately separate and remains disconnected until each provider can be invoked safely.</p>
          <div className="hero-actions" style={{ marginTop: 18 }}><a className="button button-primary" href="/workspace/">OPEN WORKSPACE →</a><a className="button button-secondary" href="/connections/">CONNECTIONS</a></div>
        </div>
        <section className="console-panel wide"><AutomationCenter /></section>
      </section>
    </main>
  )
}
