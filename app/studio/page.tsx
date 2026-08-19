import StudioWorkbench from '../../components/StudioWorkbench'
import StudioRunnerPanel from '../../components/StudioRunnerPanel'

export const metadata = {
  title: 'Studio — ProofTTL',
  description: 'ProofTTL Studio combines a multi-file coding workspace, routed AI model playground, PowerShell-style terminal, cloud projects, and isolated execution jobs.',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">STUDIO · CODE / MODELS / TERMINAL / SANDBOX</div>
      </div>

      <section className="app-shell" style={{ paddingBottom: 90 }}>
        <StudioWorkbench />
        <StudioRunnerPanel />
      </section>
    </main>
  )
}
