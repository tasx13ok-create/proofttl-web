import StudioWorkbench from '../../components/StudioWorkbench'
import StudioRunnerPanel from '../../components/StudioRunnerPanel'

export const metadata = {
  title: 'Studio — ProofTTL',
  description: 'Code, model-assisted creation, projects and isolated execution inside the L.O.V.E. Workspace creation stack.',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div><div className="app-meta">STUDIO / CODE + MODELS + EXECUTION</div><small style={{ color: 'var(--muted-foreground)' }}>Build here · render in Worlds · keep artifacts in Files · deploy through connected providers</small></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><a className="text-link" href="/worlds/">WORLDS</a><a className="text-link" href="/files/">FILES</a><a className="text-link" href="/connections/">CONNECTIONS</a><a className="text-link" href="/workspace/">WORKSPACE</a></div>
      </div>

      <section className="app-shell" style={{ padding: '28px 0 100px', display: 'grid', gap: 18 }}>
        <section className="onboarding-card">
          <p className="app-kicker">CREATION STACK</p>
          <h1 className="app-title">Vibe code without hiding where execution actually happens.</h1>
          <p className="app-copy">Studio is the code/model side of Workspace. L.O.V.E. can help reason about projects and code; safe runtime jobs stay isolated from production infrastructure; Worlds handles browser 3D scene composition; Files owns portable artifacts; Vercel/GitHub remain provider-gated until their scoped connections are ready.</p>
          <div className="hero-actions"><a className="button button-primary" href="/worlds/">OPEN 3D WORLDS →</a><a className="button button-secondary" href="/files/">OPEN FILES</a><a className="button button-secondary" href="/connections/">PROVIDER STATUS</a></div>
        </section>

        <StudioWorkbench />
        <StudioRunnerPanel />

        <section className="console-panel wide">
          <p className="app-kicker">FROM IDEA TO DEPLOYMENT</p><h2>One project can cross multiple Workspace capabilities.</h2>
          <div className="app-table">
            <div className="app-table-row"><span>1 · ASK</span><span>Describe the app, game mechanic, script, website or system you want to build.</span><span>L.O.V.E.</span></div>
            <div className="app-table-row"><span>2 · CODE</span><span>Use Studio/model assistance to create, review and debug project files.</span><span>STUDIO</span></div>
            <div className="app-table-row"><span>3 · RUN</span><span>Approved JavaScript, Python or Bash execution goes to an isolated runner only when configured.</span><span>SANDBOX</span></div>
            <div className="app-table-row"><span>4 · RENDER</span><span>Build and inspect structured browser 3D scenes in Worlds.</span><span>WORLDS</span></div>
            <div className="app-table-row"><span>5 · STORE</span><span>Keep bounded code, notes and scene JSON as account-owned artifacts.</span><span>FILES</span></div>
            <div className="app-table-row"><span>6 · SHIP</span><span>GitHub/Vercel actions use scoped provider adapters and confirmation policy — never production-shell shortcuts.</span><span>CONNECTIONS</span></div>
          </div>
        </section>
      </section>
    </main>
  )
}
