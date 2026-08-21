import SecurityCenter from '../../components/SecurityCenter'
import AccountWorkspacePanel from '../../components/AccountWorkspacePanel'
import ConsoleAccountActions from '../../components/ConsoleAccountActions'
import { AccountEntitlementTelemetry, AssistantUsageTelemetry, LeaseTrustTelemetry, ReadinessTelemetry } from '../../components/ConsoleTelemetry'

export const metadata = {
  title: 'Console',
  robots: { index: false, follow: false },
}

const nav = ['Overview', 'Fact Leases', 'Usage', 'Payments', 'API', 'Security', 'Support', 'Account']

export default function ConsolePage() {
  return (
    <main className="app-page console-page">
      <div className="app-shell console-layout">
        <aside className="app-sidebar" aria-label="Console navigation">
          {nav.map((item, index) => (
            <a className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>
          ))}
          <a href="/studio/">Studio · Code / Models / Terminal</a>
          <a href="/verify-lease.html">Verify Lease</a>
          <a href="/lease-ops.html">Lease Ops</a>
          <ConsoleAccountActions />
        </aside>

        <section className="console-main">
          <header className="console-heading" id="overview">
            <div>
              <p className="app-kicker">PROOFTTL CUSTOMER CONSOLE</p>
              <h1>Overview</h1>
              <p className="app-copy">Public verification remains independently inspectable. Signed-in customer data is keyed to authenticated account ownership rather than inferred from a browser or reference alone.</p>
            </div>
            <span className="app-status">PROTOCOL TESTNET</span>
          </header>

          <div className="console-grid">
            <article className="console-panel wide"><h2>DEPLOYMENT READINESS</h2><ReadinessTelemetry /></article>
            <article className="console-panel wide"><h2>LEASE TRUST LAYER</h2><LeaseTrustTelemetry /></article>
            <article className="console-panel"><h2>ACTIVE FACT LEASES</h2><div className="console-number">—<small>Account-scoped lease attribution pending</small></div></article>
            <article className="console-panel"><h2>REVOKED</h2><div className="console-number">—<small>No fabricated customer metrics</small></div></article>
            <article className="console-panel"><h2>EXPIRED</h2><div className="console-number">—<small>No fabricated customer metrics</small></div></article>

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
              <p className="app-note">The free allowance is shared between typed and voice assistant requests and resets daily in UTC. Account subscription billing is not enabled; commercial verification audits use a separate live Stripe checkout after scope approval.</p>
            </article>

            <article className="console-panel wide" id="payments">
              <h2>PROTOCOL PAYMENT HISTORY</h2>
              <div className="app-table"><div className="app-table-head"><span>TRANSACTION</span><span>NETWORK</span><span>AMOUNT</span></div></div>
              <div className="app-empty">
                <div className="app-empty-meta">X402 ATTRIBUTION PENDING</div>
                <strong>No wallet is silently assigned to your account.</strong>
                Protocol payment history will appear only after ProofTTL can cryptographically verify that a payer wallet belongs to the signed-in customer. Commercial audit payments are tracked separately through Stripe.
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
              <div className="app-empty"><div className="app-empty-meta">SUPPORT</div><strong>Technical support currently routes to GitHub issues.</strong><a className="text-link" href="https://github.com/tasx13ok-create/proofttl/issues" target="_blank" rel="noreferrer">OPEN ISSUES ↗</a></div>
            </article>

            <article className="console-panel wide" id="account">
              <h2>ACCOUNT PLAN + OWNED DATA</h2>
              <AccountEntitlementTelemetry />
              <div style={{ marginTop: 18 }}><AccountWorkspacePanel /></div>
              <p className="app-note">Provider linking, account deletion, payer-wallet ownership, and account-scoped Fact Lease attribution remain locked until their authorization flows are complete.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}