import TrustCenter from '../../components/TrustCenter'

export const metadata = {
  title: 'Trust Center',
  description: 'Live ProofTTL health, authentication, Workspace readiness, commercial readiness, and trust boundaries.',
  alternates: { canonical: '/trust/' },
}

export default function TrustPage() {
  return (
    <main className="app-page">
      <section className="app-shell" style={{ paddingTop: 34, paddingBottom: 100 }}>
        <TrustCenter />
      </section>
    </main>
  )
}