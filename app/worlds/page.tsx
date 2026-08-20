import WorldBuilder from '../../components/WorldBuilder'

export const metadata = {
  title: 'Worlds / 3D Studio — ProofTTL',
  description: 'Build and preview structured 3D environments in the browser, then grow them toward L.O.V.E.-driven scene generation and game project export.',
}

export default function WorldsPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div>
          <div className="app-meta">WORLDS / CREATIVE SYSTEM</div>
          <small style={{ color: 'var(--muted-foreground)' }}>Real WebGL preview · structured scene contract · provider honesty</small>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a className="text-link" href="/studio/">STUDIO</a>
          <a className="text-link" href="/files/">FILES</a>
          <a className="text-link" href="/workspace/">WORKSPACE</a>
        </div>
      </div>
      <section className="app-shell" style={{ paddingBottom: 110 }}><WorldBuilder /></section>
    </main>
  )
}
