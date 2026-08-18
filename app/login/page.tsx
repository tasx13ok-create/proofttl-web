import AuthLoginPanel from '../../components/AuthLoginPanel'

export const metadata = {
  title: 'Sign in — ProofTTL',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <a className="app-back" href="/">← BACK TO PROOFTTL</a>
      </div>

      <section className="auth-wrap">
        <AuthLoginPanel />
      </section>
    </main>
  )
}
