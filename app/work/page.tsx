import WorkTaskCenter from '../../components/WorkTaskCenter'

export const metadata = { title: 'Work — ProofTTL' }

export default function WorkPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">WORK · TASKS / FUTURE MAIL / CALENDAR</div>
      </div>
      <section className="app-shell" style={{paddingBottom:100,display:'grid',gap:18}}>
        <div className="onboarding-card">
          <p className="app-kicker">PROOFTTL WORK</p>
          <h1 className="app-title">Your work context without another pile of tabs.</h1>
          <p className="app-copy">Work now starts with native account-owned tasks. Email and calendar stay connection-gated until real provider OAuth exists; when they arrive they plug into this same surface and the same L.O.V.E. permission model.</p>
          <div className="hero-actions" style={{marginTop:18}}><a className="button button-primary" href="/workspace/">ASK L.O.V.E. →</a><a className="button button-secondary" href="/connections/">CONNECTIONS</a></div>
        </div>
        <section className="console-panel wide"><WorkTaskCenter /></section>
        <section className="console-panel wide"><p className="app-kicker">CONNECTED WORK</p><h2>Email + calendar remain locked until their real providers are connected.</h2><p className="app-copy">ProofTTL will not invent inbox messages, calendar events, or external task state. Read access, drafting, sending, scheduling, and changes will each declare their provider permissions and pass through the central action policy.</p></section>
      </section>
    </main>
  )
}
