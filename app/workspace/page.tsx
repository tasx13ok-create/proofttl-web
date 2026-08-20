import ProofTTLOSWorkspace from '../../components/ProofTTLOSWorkspace'
import ActionHistoryPanel from '../../components/ActionHistoryPanel'

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
      <section className="app-shell" style={{ paddingBottom: 100, display: 'grid', gap: 18 }}>
        <ProofTTLOSWorkspace />
        <section className="console-panel wide">
          <p className="app-kicker">ACCOUNT ACTION LEDGER</p>
          <h2>One receipt trail across every capability.</h2>
          <p className="app-copy">As connected capabilities gain execution rights, their planned, confirmation-gated, completed, failed, and cancelled actions can share one account-owned history instead of disappearing inside separate apps.</p>
          <ActionHistoryPanel />
        </section>
      </section>
    </main>
  )
}
