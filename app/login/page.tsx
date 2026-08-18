export const metadata = {
  title: 'Sign in — ProofTTL',
}

const providers = ['Google', 'GitHub', 'Discord']

export default function LoginPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <a className="app-back" href="/">← BACK TO PROOFTTL</a>
      </div>

      <section className="auth-wrap">
        <div className="auth-card">
          <p className="app-kicker">OPTIONAL CUSTOMER ACCOUNT</p>
          <h1 className="app-title">Welcome to ProofTTL.</h1>
          <p className="app-copy">Sign in to manage Fact Leases, usage, payments, security settings, and support. The public x402 API remains usable without an account.</p>

          <div className="provider-grid" aria-label="Planned sign-in providers">
            {providers.map((provider) => (
              <button key={provider} type="button" className="provider-button" disabled>
                CONTINUE WITH {provider.toUpperCase()} · CONNECTION PENDING
              </button>
            ))}
          </div>

          <div className="auth-divider">OR</div>

          <form className="app-form" aria-label="Email sign-in preview">
            <label className="app-input-label">
              EMAIL ADDRESS
              <input type="email" placeholder="you@example.com" disabled />
            </label>
            <button type="button" className="button button-secondary full-button" disabled>
              CONTINUE WITH EMAIL
            </button>
          </form>

          <p className="app-note"><strong>Authentication is not live yet.</strong> These controls are intentionally disabled until ProofTTL is connected to a real OAuth/email authentication provider, session store, verification flow, and MFA policy.</p>
          <p className="app-note">Planned account flow: Sign in → profile setup → current pricing → Console.</p>
        </div>
      </section>
    </main>
  )
}
