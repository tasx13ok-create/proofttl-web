import AutomationCenter from '../../components/AutomationCenter'

export const metadata = { title: 'Automations — ProofTTL', description: 'Account-owned automation definitions tied to the same L.O.V.E. capability and risk policy as direct actions.' }

export default function AutomationsPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div><div className="app-meta">AUTOMATIONS / RULES + PERMISSION</div><small style={{ color: 'var(--muted-foreground)' }}>Definitions are native · provider execution remains explicit</small></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><a className="text-link" href="/workspace/">WORKSPACE</a><a className="text-link" href="/connections/">CONNECTIONS</a></div>
      </div>
      <section className="app-shell" style={{ padding: '28px 0 110px', display: 'grid', gap: 18 }}>
        <div className="onboarding-card">
          <p className="app-kicker">AUTOMATIONS</p>
          <h1 className="app-title">Turn repeat work into rules without handing away unlimited authority.</h1>
          <p className="app-copy">Automation definitions are account-owned and capability-bound. They inherit the same risk model as direct L.O.V.E. actions. Execution stays separate so a recurring rule cannot magically bypass provider permissions or sensitive-action confirmation.</p>
          <div className="hero-actions"><a className="button button-primary" href="/workspace/">OPEN WORKSPACE →</a><a className="button button-secondary" href="/connections/">VIEW PROVIDERS</a></div>
        </div>
        <section className="console-panel wide"><AutomationCenter /></section>
        <section className="console-panel wide">
          <p className="app-kicker">AUTOMATION SAFETY</p><h2>Recurring does not mean pre-authorized forever.</h2>
          <div className="app-table">
            <div className="app-table-row"><span>READ / SUMMARIZE</span><span>Can eventually run unattended when the connected provider/policy explicitly allows it.</span><span>LOWER RISK</span></div>
            <div className="app-table-row"><span>CREATE / MODIFY</span><span>Execution policy depends on the capability and reversibility.</span><span>CONTEXT</span></div>
            <div className="app-table-row"><span>MONEY / SEND / DELETE / SECURITY</span><span>Sensitive automation definitions cannot silently turn into unattended authority.</span><span>PER-RUN CONFIRM</span></div>
            <div className="app-table-row"><span>PROVIDER MISSING</span><span>The rule can exist, but execution remains disconnected instead of simulating success.</span><span>LOCKED</span></div>
            <div className="app-table-row"><span>RECEIPT</span><span>Future executions use the same action ledger as direct Workspace actions.</span><span>AUDITABLE</span></div>
          </div>
        </section>
      </section>
    </main>
  )
}
