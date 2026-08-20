import FilesCenter from '../../components/FilesCenter'

export const metadata = { title: 'Files — ProofTTL', description: 'Account-owned text, code, JSON and project artifacts for Workspace, Studio and Worlds.' }

export default function FilesPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div><div className="app-meta">FILES / NATIVE ARTIFACT LAYER</div><small style={{ color: 'var(--muted-foreground)' }}>Workspace notes · code · scene specs · structured artifacts</small></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><a className="text-link" href="/studio/">STUDIO</a><a className="text-link" href="/worlds/">WORLDS</a><a className="text-link" href="/workspace/">WORKSPACE</a></div>
      </div>
      <section className="app-shell" style={{ padding: '28px 0 110px', display: 'grid', gap: 18 }}>
        <div className="onboarding-card">
          <p className="app-kicker">FILES</p>
          <h1 className="app-title">The stuff L.O.V.E. helps you make needs a home.</h1>
          <p className="app-copy">Files is the native account-owned artifact layer for bounded text, Markdown, JSON, code and scripts. Studio projects, notes and Worlds scene specifications can share the same product vocabulary instead of disappearing into unrelated tools.</p>
          <div className="hero-actions"><a className="button button-primary" href="/workspace/">ASK L.O.V.E. →</a><a className="button button-secondary" href="/studio/">OPEN STUDIO</a><a className="button button-secondary" href="/worlds/">OPEN WORLDS</a></div>
        </div>
        <FilesCenter />
        <section className="console-panel wide">
          <p className="app-kicker">OWNERSHIP + STORAGE BOUNDARY</p><h2>Native files are useful without pretending to be every cloud drive.</h2>
          <div className="app-table">
            <div className="app-table-row"><span>TEXT / MARKDOWN / JSON</span><span>Native account-owned bounded artifacts.</span><span>SUPPORTED</span></div>
            <div className="app-table-row"><span>CODE / SCRIPTS</span><span>Stored as artifacts; running them is a separate Studio/sandbox permission.</span><span>SEPARATE EXECUTION</span></div>
            <div className="app-table-row"><span>3D SCENE JSON</span><span>Worlds can export a structured scene contract that fits this artifact model.</span><span>PORTABLE</span></div>
            <div className="app-table-row"><span>DELETE</span><span>Destructive file actions remain sensitive under the universal action policy.</span><span>CONFIRM</span></div>
            <div className="app-table-row"><span>DRIVE / DROPBOX / ONEDRIVE</span><span>Not claimed until a real provider connection is added.</span><span>LOCKED</span></div>
          </div>
        </section>
      </section>
    </main>
  )
}
