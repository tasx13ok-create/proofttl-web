import CinematicsStudio from '../../components/CinematicsStudio'

export const metadata = {
  title: 'Cinematics — ProofTTL',
  description: 'Direct short cinematic scenes in the browser while heavy world, animation, render and video jobs stay in cloud provider infrastructure.',
  robots: { index: false, follow: false },
}

export default function CinematicsPage() {
  return (
    <main className="app-page cinematic-page">
      <section className="cine-page-head app-shell">
        <div><span>CINEMATICS</span><strong>DIRECT · GENERATE · RENDER · EXPORT</strong></div>
        <nav><a href="/worlds/">WORLDS</a><a href="/studio/">STUDIO</a><a href="/files/">FILES</a><a href="/connections/">CONNECTIONS</a></nav>
      </section>
      <section className="app-shell cine-page-body"><CinematicsStudio /></section>
    </main>
  )
}
