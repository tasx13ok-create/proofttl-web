import TrustCenter from '../../components/TrustCenter'

export const metadata = {
  title: 'Trust Center — ProofTTL',
  description: 'Live ProofTTL health, authentication, Workspace readiness, commercial readiness, and trust boundaries.',
}

export default function TrustPage() {
  return <main className="app-page">
    <div className="app-shell app-topbar">
      <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
      <div className="app-meta">TRUST CENTER · LIVE READINESS</div>
    </div>
    <section className="app-shell" style={{ paddingBottom: 100 }}>
      <TrustCenter />
    </section>
  </main>
}
