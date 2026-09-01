import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with a ProofTTL Fact Audit, payment status, account access, or public website issue without exposing private customer information publicly.',
  alternates: { canonical: '/support/' },
  robots: { index: true, follow: true },
}

export default function SupportPage() {
  return (
    <main className="app-page audit-sales-page">
      <section className="app-shell" style={{ padding: '42px 0 100px', display: 'grid', gap: 18 }}>
        <section className="onboarding-card" style={{ padding: 30 }}>
          <p className="app-kicker">PROOFTTL / SUPPORT</p>
          <h1 className="app-title">Get to the right help without posting private details.</h1>
          <p className="app-copy">Payment, account, and customer-verification information should stay private. Public GitHub issues are reserved for reproducible website problems — never card details, personal account information, private claims, or customer documents.</p>
        </section>

        <div className="pricing-cards">
          <article>
            <span className="plan-label">EXISTING FACT AUDIT</span>
            <h2>Check payment or delivery status.</h2>
            <p>Sign in to the private audit-status page to check a Fact Audit request tied to your ProofTTL account. This keeps customer and payment state out of public channels.</p>
            <a className="button button-primary" href="/audit/status/">CHECK MY AUDIT STATUS →</a>
          </article>
          <article>
            <span className="plan-label">BEFORE YOU BUY</span>
            <h2>Use the scope-first intake.</h2>
            <p>ProofTTL sells one launch engagement: the <strong>$1,500 Fact Audit</strong> for 10–25 real outputs or consequential claims, with deep verification of the highest-risk findings. Submit the context first. No card is required to submit, and scope is confirmed before a payment request exists.</p>
            <a className="button button-primary" href="/audit/#audit-intake">OPEN FACT AUDIT INTAKE →</a>
          </article>
        </div>

        <section className="console-panel wide">
          <p className="app-kicker">ACCOUNT OR PAYMENT ACCESS</p>
          <h2>Do not put billing or account information in a public issue.</h2>
          <p className="app-copy">For an existing Fact Audit, use the signed-in audit-status workflow first. It is the customer-safe place to resolve ownership, payment confirmation, and delivery state. If you cannot sign in, use the sign-in flow from that page so ProofTTL can return you to the private status lookup afterward.</p>
          <div className="hero-actions"><a className="button button-secondary" href="/audit/status/">PRIVATE AUDIT STATUS</a><a className="text-link" href="/trust/">Security + payment boundary →</a></div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">PUBLIC WEBSITE SUPPORT</p>
          <h2>Public issues are for reproducible public website bugs only.</h2>
          <p className="app-copy">Use GitHub only when a public website defect can be described without customer secrets. Remove tokens, cookies, payment identifiers, personal information, and private claim data before posting.</p>
          <div className="hero-actions"><a className="button button-secondary" href="https://github.com/tasx13ok-create/proofttl-web/issues" target="_blank" rel="noreferrer">OPEN WEBSITE ISSUES ↗</a><a className="text-link" href="/faq/">Fact Audit FAQ →</a></div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">WHAT NOT TO SHARE PUBLICLY</p>
          <div className="app-table">
            <div className="app-table-row"><span>Card or bank details</span><span>NEVER POST PUBLICLY</span></div>
            <div className="app-table-row"><span>Session cookies / auth tokens</span><span>NEVER POST PUBLICLY</span></div>
            <div className="app-table-row"><span>Private customer claims or documents</span><span>KEEP IN THE PRIVATE WORKFLOW</span></div>
            <div className="app-table-row"><span>Public website reproduction with secrets removed</span><span>OK FOR GITHUB ISSUES</span></div>
          </div>
        </section>
      </section>
    </main>
  )
}
