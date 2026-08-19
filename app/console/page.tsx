import SecurityCenter from '../../components/SecurityCenter'
import { AccountEntitlementTelemetry, AssistantUsageTelemetry, LeaseTrustTelemetry, ReadinessTelemetry } from '../../components/ConsoleTelemetry'

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
          <a href="/studio/">Studio · Code / Models / Terminal</a>
          <a href="/verify-lease.html">Verify Lease</a>
          <a href="/lease-ops.html">Lease Ops</a>
          <a href="/login/">Sign in / switch account</a>
        </aside>

        <section className="console-main">
          <header className="console-heading" id="overview">
            <div>
              <p className="app-kicker">PROOFTTL CONSOLE</p>
              <h1>Overview</h1>
              <p className="app-copy">Public verification is live independently of customer accounts. Live infrastructure, signing, monitoring, and assistant usage are shown below; account-scoped lease/payment history remains locked until ownership can be verified server-side.</p>
            </div>
            <span className="app-status">TESTNET</span>
          </header>

          <div className="console-grid">
            <article className="console-panel wide">
              <h2>DEPLOYMENT READINESS</h2>
              <ReadinessTelemetry />
            </article>

            <article className="console-panel wide">
              <h2>LEASE TRUST LAYER</h2>
              <LeaseTrustTelemetry />
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
              <h2>FACT LEASE OPERATIONS</h2>
              <div className="app-empty">
                <div className="app-empty-meta">PUBLIC TRUST TOOLS AVAILABLE</div>
                <strong>Inspect, verify, export, share, diagnose, or prepare a renewal for any Lease ID.</strong>
                Account-scoped Lease lists stay hidden until ProofTTL can prove payer/account ownership rather than guessing it.
                <a className="text-link" href="/verify-lease.html">VERIFY SIGNATURE + EVENT CHAIN →</a>
                <a className="text-link" href="/lease-ops.html">OPEN LEASE OPERATIONS →</a>
              </div>
            </article>

            <article className="console-panel wide" id="usage">
              <h2>AI USAGE</h2>
              <AssistantUsageTelemetry />
              <p className="app-note">The free allowance is shared between typed and voice assistant requests and resets daily in UTC. Account entitlements are server-controlled; paid billing is not enabled yet.</p>
            </article>

            <article className="console-panel wide" id="payments">
              <h2>X402 PAYMENT HISTORY</h2>
              <div className="app-table"><div className="app-table-head"><span>TRANSACTION</span><span>NETWORK</span><span>AMOUNT</span></div></div>
              <div className="app-empty">
                <div className="app-empty-meta">PAYMENT ATTRIBUTION PENDING</div>
                <strong>No wallet is silently assigned to your account.</strong>
                Payment history will appear only after ProofTTL can cryptographically verify that a payer wallet belongs to the signed-in customer.
              </div>
            </article>

            <article className="console-panel" id="api">
              <h2>API + STUDIO</h2>
              <div className="app-empty">
                <div className="app-empty-meta">DEVELOPER SURFACES</div>
                <strong>Use the public x402 API directly or open Studio for code, model help, and terminal-style commands.</strong>
                <a className="text-link" href="/docs/">OPEN DEVELOPER DOCS →</a>
                <a className="text-link" href="/studio/">OPEN PROOFTTL STUDIO →</a>
              </div>
            </article>

            <article className="console-panel wide security-panel" id="security"><h2>SECURITY</h2><SecurityCenter /></article>

            <article className="console-panel" id="support">
              <h2>SUPPORT</h2>
              <div className="app-empty"><div className="app-empty-meta">TESTNET</div><strong>Support currently routes to GitHub issues.</strong><a className="text-link" href="https://github.com/tasx13ok-create/proofttl/issues" target="_blank" rel="noreferrer">OPEN ISSUES ↗</a></div>
            </article>

            <article className="console-panel wide" id="account">
              <h2>ACCOUNT PLAN</h2>
              <AccountEntitlementTelemetry />
              <p className="app-note">Profile changes, provider linking, account deletion, and payer-wallet ownership remain locked until their server-side authorization flows are complete.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}
