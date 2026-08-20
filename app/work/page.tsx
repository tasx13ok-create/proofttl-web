import WorkTaskCenter from '../../components/WorkTaskCenter'

export const metadata = { title: 'Work — ProofTTL', description: 'Native tasks now; connected email, calendar and work providers later through the same L.O.V.E. permission model.' }

export default function WorkPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div><div className="app-meta">WORK / NATIVE TASKS + CONNECTED CONTEXT</div><small style={{ color: 'var(--muted-foreground)' }}>Your work layer without pretending the inbox is connected.</small></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><a className="text-link" href="/workspace/">WORKSPACE</a><a className="text-link" href="/files/">FILES</a><a className="text-link" href="/connections/">CONNECTIONS</a></div>
      </div>
      <section className="app-shell" style={{padding:'28px 0 110px',display:'grid',gap:18}}>
        <div className="onboarding-card">
          <p className="app-kicker">WORK</p>
          <h1 className="app-title">Tasks are native. Everything else plugs in honestly.</h1>
          <p className="app-copy">The Work layer begins with account-owned tasks you can actually create, prioritize, complete and delete. Email, calendar and connected documents will join the same context only when their real provider authorization exists.</p>
          <div className="hero-actions"><a className="button button-primary" href="/workspace/">ASK L.O.V.E. →</a><a className="button button-secondary" href="/connections/">VIEW PROVIDERS</a></div>
        </div>

        <section className="console-panel wide"><WorkTaskCenter /></section>

        <section className="console-panel wide">
          <p className="app-kicker">CONNECTED WORK CONTRACT</p><h2>Read, draft, send and schedule are different permissions.</h2>
          <div className="app-table">
            <div className="app-table-row"><span>SHOW MY TASKS</span><span>Reads native account-owned task state.</span><span>NATIVE</span></div>
            <div className="app-table-row"><span>FIND AN EMAIL</span><span>Requires authorized mail read/search access.</span><span>LOCKED</span></div>
            <div className="app-table-row"><span>DRAFT A REPLY</span><span>AI can help write once the message/context is actually available.</span><span>CONTEXT-BOUND</span></div>
            <div className="app-table-row"><span>SEND THE EMAIL</span><span>Sending is a sensitive provider action and requires explicit user confirmation.</span><span>CONFIRM</span></div>
            <div className="app-table-row"><span>WHAT'S ON MY CALENDAR?</span><span>Requires real calendar read access; no event is invented.</span><span>LOCKED</span></div>
            <div className="app-table-row"><span>SCHEDULE THIS</span><span>Exact event/time/attendees must be resolved before provider modification.</span><span>MODIFY</span></div>
          </div>
        </section>
      </section>
    </main>
  )
}
