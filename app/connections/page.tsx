import ConnectionsCenter from '../../components/ConnectionsCenter'

export const metadata = { title: 'Connections — ProofTTL' }

export default function ConnectionsPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">CONNECTIONS · PROVIDERS / MODELS / RAILS</div>
      </div>
      <section className="app-shell" style={{ paddingBottom: 100, display: 'grid', gap: 18 }}>
        <div className="onboarding-card">
          <p className="app-kicker">PROOFTTL CONNECTIONS</p>
          <h1 className="app-title">Connect providers once. Let L.O.V.E. orchestrate them with scoped permission.</h1>
          <p className="app-copy">Connections is the integration control plane for identity providers, AI models, developer tooling, work apps, storage, payment infrastructure, and future financial providers.</p>
          <div className="hero-actions" style={{ marginTop: 18 }}>
            <a className="button button-primary" href="/workspace/">OPEN WORKSPACE →</a>
            <a className="button button-secondary" href="/console/#security">SECURITY</a>
          </div>
        </div>

        <section className="console-panel wide">
          <p className="app-kicker">LIVE CONNECTION DISCOVERY</p>
          <h2>Truthful provider state.</h2>
          <ConnectionsCenter />
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">CONNECTION CONTRACT</p>
          <h2>Secrets stay behind the API.</h2>
          <p className="app-copy">Provider credentials stay server-side. The browser receives capability status and scoped controls, never raw infrastructure secrets. Every future integration must declare what it can read, what it can modify, and which actions require confirmation before L.O.V.E. can route work through it.</p>
        </section>
      </section>
    </main>
  )
}
