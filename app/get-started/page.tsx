export const metadata = {
  title: 'Get started — ProofTTL',
}

export default function GetStartedPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <span className="app-meta">CURRENT ENVIRONMENT · BASE SEPOLIA TESTNET</span>
      </div>

      <section className="onboarding-wrap">
        <div className="app-progress" aria-label="Onboarding progress">
          <span>ACCOUNT</span><span>→</span><span>PROFILE</span><span>→</span><span className="active">GET STARTED</span>
        </div>

        <div className="onboarding-card">
          <p className="app-kicker">STEP 3 OF 3</p>
          <h1 className="app-title">Pay for verification, not a subscription.</h1>
          <p className="app-copy">ProofTTL currently exposes a single x402 pay-per-verification path. An account is optional and does not gate access to the machine API.</p>

          <div className="price-preview">
            <div>
              <p className="app-kicker">FACT LEASE ISSUANCE</p>
              <strong>$0.001</strong>
              <span>per verification</span>
            </div>
            <div className="app-meta">X402 · EXACT · USDC · BASE SEPOLIA TESTNET</div>
          </div>

          <div className="app-table">
            <div className="app-table-row"><span>Source retrieval</span><span>Included</span><span>✓</span></div>
            <div className="app-table-row"><span>Exact / semantic verification</span><span>Included</span><span>✓</span></div>
            <div className="app-table-row"><span>SHA-256 fingerprint</span><span>Included</span><span>✓</span></div>
            <div className="app-table-row"><span>Fact Lease issuance</span><span>Included</span><span>✓</span></div>
            <div className="app-table-row"><span>Automatic TTL monitoring</span><span>Included</span><span>✓</span></div>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href="/console">OPEN CONSOLE PREVIEW →</a>
            <a className="button button-secondary" href="/#api">READ THE API</a>
          </div>

          <p className="app-note">No subscription is being created here. When accounts are live, this screen will simply explain the active pricing model before entering the Console.</p>
        </div>
      </section>
    </main>
  )
}
