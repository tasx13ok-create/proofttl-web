import StudioWorkbench from '../../components/StudioWorkbench'
import StudioRunnerPanel from '../../components/StudioRunnerPanel'
import './studio-hotfix.css'

export const metadata = {
  title: 'Studio — ProofTTL',
  description: 'Code, model-assisted creation, projects and isolated execution inside the L.O.V.E. Workspace creation stack.',
  robots: { index: false, follow: false },
}

export default function StudioPage() {
  return (
    <main className="studio-page">
      <header className="studio-pagebar">
        <div className="studio-pagebar-title">
          <span>STUDIO</span>
          <strong>Code</strong>
        </div>
        <nav aria-label="Studio navigation">
          <a href="/workspace/">WORKSPACE</a>
          <a href="/worlds/">WORLDS</a>
          <a href="/cinematics/">CINEMATICS</a>
          <a href="/files/">FILES</a>
          <a href="/connections/">CONNECTIONS</a>
        </nav>
      </header>

      <section className="studio-page-body">
        <StudioWorkbench />
        <StudioRunnerPanel />
      </section>
    </main>
  )
}
