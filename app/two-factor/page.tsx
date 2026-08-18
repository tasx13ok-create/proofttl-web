import TwoFactorChallenge from '../../components/TwoFactorChallenge'

export const metadata = {
  title: 'Two-factor verification — ProofTTL',
  robots: { index: false, follow: false },
}

export default function TwoFactorPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <a className="app-back" href="/login/">← BACK TO SIGN IN</a>
      </div>
      <section className="auth-wrap">
        <TwoFactorChallenge />
      </section>
    </main>
  )
}
