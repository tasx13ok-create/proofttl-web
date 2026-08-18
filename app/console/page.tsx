import SecurityCenter from '../../components/SecurityCenter'
import { AssistantUsageTelemetry, ReadinessTelemetry } from '../../components/ConsoleTelemetry'

export const metadata = {
  title: 'Console — ProofTTL',
  robots: { index: false, follow: false },
}

const nav = ['Overview', 'Fact Leases', 'Usage', 'Payments', 'API', 'Security', 'Support', 'Account']

export default function ConsolePage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">CUSTOMER CONSOLE · TESTNET</div>
      </div>

      <div className="app-shell console-layout">
        <aside className="app-sidebar" aria-label="Console navigation">
          {nav.map((item, index) => (
            <a className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>
          ))}
          <a href="/login/">Sign in / switch account</a>
        </aside>

        <section className="console-main">
          <header className="console-heading" id="overview">
            <div>
              <p className="app-kicker">PROOFTTL CONSOLE</p>
              <h1>Overview</h1>
              <p className="app-copy">Public verification is live independently of customer accounts. Live infrastructure and anonymous assistant usage are shown below; account-scoped lease/payment history remains locked until ownership can be verified server-side.</p>
            </div>
            <span className="app-status">TESTNET</span>
          </header>

          <div className="console-grid">
            <article className="console-panel wide">
              <h2>DEPLOYMENT READINESS</h2>
              <ReadinessTelemetry />
            </article>

            <article className="console-panel">
              <h2>ACTIVE FACT LEASES</h2>
              <div className="console-number">—<small>Account-scoped lease attribution pending</small></div>
            </article>
            <article className="console-panel">
              <h2>REVOKED</h2>
              <div className="console-number">—<small>No fabricated customer metrics</small></div>
            </article>
            <article className="console-panel">
              <h2>EXPIRED</h2>
              <div className="console-number">—<small>No fabricated customer metrics</small></div>
            </article>

            <article className="console-panel wide" id="fact-leases">
              <h2>RECENT FACT LEASES</h2>
              <div className="app-empty">
                <div className="app-empty-meta">ACCOUNT ATTRIBUTION PENDING</div>
                <strong>No account-scoped Fact Leases loaded.</strong>
                Lease history will appear only after ProofTTL has a verifiable payer/account linking mechanism and server-side ownership checks.
              </div>
            </article>

            <article className="console-panel wide" id="usage">
              <h2>AI USAGE</h2>
              <AssistantUsageTelemetry />
              <p className="app-note">The free allowance is shared between typed and voice assistant requests and resets daily in UTC. Paid membership is not enabled yet.</p>
            </article>

            <article className="console-panel wide" id="payments">
              <h2>X402 PAYMENT HISTORY</h2>
              <div className="app-table">
                <div className="app-table-head"><span>TRANSACTION</span><span>NETWORK</span><span>AMOUNT</span></div>
              </div>
              <div className="app-empty">
                <div className="app-empty-meta">PAYMENT ATTRIBUTION PENDING</div>
                <strong>No wallet is silently assigned to your account.</strong>
                Payment history will appear only after ProofTTL can cryptographically verify that a payer wallet belongs to the signed-in customer.
              </div>
            </article>

            <article className="console-panel" id="api">
              <h2>API</h2>
              <div className="app-empty">
                <div className="app-empty-meta">PUBLIC X402 API</div>
                <strong>No account API key is required today.</strong>
                ProofTTL currently protects verification with x402 rather than inventing customer API keys before an account authorization model exists.
                <a className="text-link" href="/docs/">OPEN DEVELOPER DOCS →</a>
              </div>
            </article>

            <article className="console-panel wide security-panel" id="security">
              <h2>SECURITY</h2>
              <SecurityCenter />
            </article>

            <article className="console-panel" id="support">
              <h2>SUPPORT</h2>
              <div className="app-empty">
                <div className="app-empty-meta">TESTNET</div>
                <strong>Support currently routes to GitHub issues.</strong>
                <a className="text-link" href="https://github.com/tasx13ok-create/proofttl/issues" target="_blank" rel="noreferrer">OPEN ISSUES ↗</a>
              </div>
            </article>

            <article className="console-panel wide" id="account">
              <h2>ACCOUNT</h2>
              <div className="app-empty">
                <div className="app-empty-meta">AUTH-BACKED PROFILE</div>
                <strong>Profile controls stay unavailable until a real authenticated session exists.</strong>
                Provider linking, email changes, account deletion, and any personal profile fields require server-side authorization and recent-authentication checks before they will be exposed here.
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}
