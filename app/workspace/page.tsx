import ProofTTLOSWorkspace from '../../components/ProofTTLOSWorkspace'

export const metadata = {
  title: 'Workspace — ProofTTL',
  description: 'The universal L.O.V.E. command center for ProofTTL capabilities, integrations, permissions, Studio, truth, work, money, files and automations.',
}

export default function WorkspacePage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">WORKSPACE · ONE INTERFACE / MANY SYSTEMS</div>
      </div>
      <section className="app-shell" style={{ paddingBottom: 100 }}>
        <ProofTTLOSWorkspace />
      </section>
    </main>
  )
}
