import ProofTTLOSWorkspace from '../../components/ProofTTLOSWorkspace'
import ActionHistoryPanel from '../../components/ActionHistoryPanel'
import WorkspaceLaunchpad from '../../components/WorkspaceLaunchpad'

export const metadata = {
  title: 'Workspace — ProofTTL',
  description: 'The universal L.O.V.E. command center for verification, coding, files, work, automations, money, integrations and account-controlled actions.',
}

export default function WorkspacePage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div>
          <div className="app-meta">WORKSPACE / L.O.V.E. CONTROL LAYER</div>
          <small style={{ color: 'var(--muted-foreground)' }}>Ask first. The system chooses the capability.</small>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <a className="text-link" href="/connections/">CONNECTIONS</a>
          <a className="text-link" href="/trust/">TRUST</a>
          <a className="text-link" href="/login/">ACCOUNT</a>
        </div>
      </div>
      <section className="app-shell" style={{ paddingBottom: 100, display: 'grid', gap: 18 }}>
        <WorkspaceLaunchpad />
        <ProofTTLOSWorkspace />
        <section className="console-panel wide">
          <p className="app-kicker">ACCOUNT ACTION LEDGER</p>
          <h2>One receipt trail across every capability.</h2>
          <p className="app-copy">Planned, confirmation-gated, completed, failed, and cancelled actions share one account-owned history. Connected tools do not get invisible authority.</p>
          <ActionHistoryPanel />
        </section>
      </section>
    </main>
  )
}
