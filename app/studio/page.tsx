import StudioWorkbench from '../../components/StudioWorkbench'

export const metadata = {
  title: 'Studio — ProofTTL',
  description: 'ProofTTL Studio combines a coding workspace, routed AI model playground, and browser-safe PowerShell-style terminal.',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">STUDIO · CODE / MODELS / TERMINAL</div>
      </div>

      <section className="app-shell" style={{ paddingBottom: 90 }}>
        <StudioWorkbench />
      </section>
    </main>
  )
}
