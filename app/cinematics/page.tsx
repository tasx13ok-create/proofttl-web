import CinematicsStudio from '../../components/CinematicsStudio'
import '../cinematics-v3.css'

export const metadata = {
  title: 'Cinematics — ProofTTL',
  description: 'Direct, storyboard, and render coherent AI-generated cinematic scenes with local previs available as a secondary tool.',
  robots: { index: false, follow: false },
}

export default function CinematicsPage() {
  return (
    <main className="app-page cinematic-page">
      <section className="cine-page-head app-shell">
        <div><span>CINEMATICS</span><strong>DIRECT · STORYBOARD · RENDER · CUT</strong></div>
        <nav><a href="/worlds/">WORLDS</a><a href="/studio/">STUDIO</a><a href="/files/">FILES</a><a href="/connections/">CONNECTIONS</a></nav>
      </section>
      <section className="app-shell cine-page-body"><CinematicsStudio /></section>
    </main>
  )
}
