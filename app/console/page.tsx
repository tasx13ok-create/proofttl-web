export const metadata = {
  title: 'Console — ProofTTL',
}

const nav = ['Overview', 'Fact Leases', 'Usage', 'Payments', 'API', 'Security', 'Support', 'Account']

export default function ConsolePage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <div className="app-meta">CUSTOMER CONSOLE · PREVIEW</div>
      </div>

      <div className="app-shell console-layout">
        <aside className="app-sidebar" aria-label="Console navigation">
          {nav.map((item, index) => (
            <a className={index === 0 ? 'active' : ''} href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>
          ))}
          <a href="/login">Log out preview</a>
        </aside>

        <section className="console-main">
          <header className="console-heading" id="overview">
            <div>
              <p className="app-kicker">PROOFTTL CONSOLE</p>
              <h1>Overview</h1>
              <p className="app-copy">The customer account backend is not connected yet. These are production-ready empty states, not fabricated metrics.</p>
            </div>
            <span className="app-status">AUTH NOT CONNECTED</span>
          </header>

          <div className="console-grid">
            <article className="console-panel">
              <h2>ACTIVE FACT LEASES</h2>
              <div className="console-number">—<small>Connect account history to populate</small></div>
            </article>
            <article className="console-panel">
              <h2>REVOKED</h2>
              <div className="console-number">—<small>No customer data loaded</small></div>
            </article>
            <article className="console-panel">
              <h2>EXPIRED</h2>
              <div className="console-number">—<small>No customer data loaded</small></div>
            </article>

            <article className="console-panel wide" id="fact-leases">
              <h2>RECENT FACT LEASES</h2>
              <div className="app-empty">
                <div className="app-empty-meta">EMPTY STATE</div>
                <strong>No account-scoped Fact Leases loaded.</strong>
                Lease history will appear here after authentication, payer/account attribution, and customer data access rules are implemented.
              </div>
            </article>

            <article className="console-panel" id="usage">
              <h2>USAGE</h2>
              <div className="app-empty">
                <div className="app-empty-meta">NO METRICS</div>
                <strong>Usage data is not connected.</strong>
                Future views can summarize verification and monitoring activity without inventing numbers.
              </div>
            </article>

            <article className="console-panel wide" id="payments">
              <h2>X402 PAYMENT HISTORY</h2>
              <div className="app-table">
                <div className="app-table-head"><span>TRANSACTION</span><span>NETWORK</span><span>AMOUNT</span></div>
              </div>
              <div className="app-empty">
                <div className="app-empty-meta">NO ACCOUNT-SCOPED PAYMENTS</div>
                <strong>Payment attribution is not connected yet.</strong>
                The eventual table will show x402 transaction history, payer wallet, network, amount, transaction hash, and related Fact Lease where available.
              </div>
            </article>

            <article className="console-panel" id="api">
              <h2>API</h2>
              <div className="app-empty">
                <div className="app-empty-meta">PUBLIC API</div>
                <strong>No API key required today.</strong>
                ProofTTL currently uses x402 for protected verification rather than fabricated account API keys.
              </div>
            </article>

            <article className="console-panel wide" id="security">
              <h2>SECURITY</h2>
              <div className="app-empty">
                <div className="app-empty-meta">PLANNED SECURITY CENTER</div>
                <strong>Provider connections, MFA, passkeys, recovery codes, and session management will live here.</strong>
                None are shown as enabled until the real authentication backend and threat model are complete.
              </div>
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
                <div className="app-empty-meta">ACCOUNT BACKEND PENDING</div>
                <strong>No personal account data is being stored by this frontend.</strong>
                Profile, connected providers, account deletion, and session controls will be enabled only after the production account model exists.
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}
