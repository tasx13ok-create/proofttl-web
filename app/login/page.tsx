import AuthLoginPanel from '../../components/AuthLoginPanel'

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to your ProofTTL workspace with a configured identity provider or passkey.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <main className="app-page login-page-clean">
      <section className="auth-wrap">
        <a className="app-back login-back" href="/">← BACK TO PROOFTTL</a>
        <AuthLoginPanel />
      </section>
    </main>
  )
}
