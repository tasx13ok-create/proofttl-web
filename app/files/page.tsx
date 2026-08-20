import FilesCenter from '../../components/FilesCenter'

export const metadata = { title: 'Files — ProofTTL' }

export default function FilesPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">FILES · NATIVE LIBRARY / FUTURE CONNECTED STORAGE</div>
      </div>
      <section className="app-shell" style={{ paddingBottom: 100, display: 'grid', gap: 18 }}>
        <div className="onboarding-card">
          <p className="app-kicker">PROOFTTL FILES</p>
          <h1 className="app-title">One account-owned place for what you create.</h1>
          <p className="app-copy">ProofTTL now has a native small-file layer for text, markdown, JSON, code, and scripts. External drives and document providers can connect into this area later without changing the ownership model.</p>
          <div className="hero-actions" style={{ marginTop: 18 }}><a className="button button-primary" href="/workspace/">ASK L.O.V.E. →</a><a className="button button-secondary" href="/studio/">OPEN STUDIO</a><a className="button button-secondary" href="/connections/">CONNECTIONS</a></div>
        </div>
        <FilesCenter />
        <section className="console-panel wide">
          <p className="app-kicker">BOUNDARY</p><h2>Native files are not a fake cloud drive.</h2>
          <p className="app-copy">The current library stores bounded text/code artifacts owned by the authenticated ProofTTL account. It does not claim Google Drive, Dropbox, OneDrive, or arbitrary binary-file integration until those providers are actually connected. Delete remains a sensitive capability in the universal action policy.</p>
        </section>
      </section>
    </main>
  )
}
