import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ProofTTL handles account, audit-intake, verification, usage, and payment-related information.',
  alternates: { canonical: '/privacy/' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <main className="app-page audit-sales-page">
      <section className="onboarding-wrap">
        <article className="audit-sales-card">
          <header className="audit-sales-hero">
            <p className="app-kicker">PROOFTTL / PRIVACY</p>
            <h1 className="app-title">Privacy Policy</h1>
            <p className="app-copy">Effective August 21, 2026. This page describes the information ProofTTL handles when you use the website, customer account, verification services, and related product surfaces.</p>
          </header>

          <section className="audit-sales-proof">
            <article><p className="app-kicker">WHAT YOU PROVIDE</p><h2>Account and verification information.</h2><p className="app-copy">ProofTTL may receive your name, email address, account-provider profile data, company or project name, website or document URLs, factual claims, verification context, deadlines, support messages, and other information you intentionally submit.</p></article>
            <article><p className="app-kicker">PAYMENTS</p><h2>Stripe handles payment-card details.</h2><p className="app-copy">When a scoped paid service is approved, checkout is handled by Stripe. ProofTTL receives payment status and transaction identifiers needed to connect the payment to the scoped request; ProofTTL does not intentionally collect or store your full payment-card number through its own audit forms.</p></article>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">HOW INFORMATION IS USED</p>
            <ul className="audit-clean-list">
              <li>Authenticate accounts and protect customer-only product surfaces.</li>
              <li>Review, scope, perform, deliver, and support verification work.</li>
              <li>Connect an audit request, payment state, and delivery state to the correct customer account.</li>
              <li>Operate product features such as L.O.V.E., account preferences, tasks, files, automations, and usage limits when those features are used.</li>
              <li>Prevent fraud, abuse, unauthorized access, and security incidents.</li>
              <li>Measure reliability, debug failures, and improve ProofTTL.</li>
              <li>Comply with applicable legal obligations.</li>
            </ul>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">LOCAL BROWSER STORAGE</p>
            <h2>Some draft state stays in your browser.</h2>
            <p className="app-copy">The audit intake can save an unfinished draft in local browser storage so signing in does not erase your work. ProofTTL also uses browser storage where needed for product state and return-to-page behavior. Clearing site data in your browser removes locally stored values.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">SERVICE PROVIDERS</p>
            <h2>ProofTTL relies on infrastructure and identity providers.</h2>
            <p className="app-copy">Depending on the feature you use, information may be processed by providers that support hosting, edge/runtime infrastructure, authentication, payment processing, source verification, or account sign-in. Current product infrastructure includes Vercel, Cloudflare, Stripe, and enabled sign-in providers such as GitHub, Google, or Discord. Those providers process information under their own terms and privacy policies.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">LOGS, SECURITY, AND RETENTION</p>
            <p className="app-copy">ProofTTL may keep security, request, payment-state, verification, and operational records for as long as reasonably necessary to provide the service, protect accounts, investigate abuse, preserve audit history, resolve disputes, or satisfy legal requirements. No internet service can promise absolute security, but ProofTTL uses access controls, server-side credentials, authenticated customer routes, and other technical safeguards intended to reduce risk.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">ADVERTISING</p>
            <p className="app-copy">The commercial homepage and paid audit funnel are not designed around advertising. Certain documentation or solution pages may load third-party advertising only when that feature is enabled; any advertising provider may process data under its own privacy policy.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">YOUR CHOICES</p>
            <ul className="audit-clean-list">
              <li>You can sign out of your ProofTTL account at any time.</li>
              <li>You can clear locally saved browser drafts and site data through your browser.</li>
              <li>You can contact ProofTTL support to ask about account data, correction, or deletion requests. Some records may need to be retained for security, payment, contractual, or legal reasons.</li>
            </ul>
          </section>

          <section className="audit-offer-summary" style={{ marginTop: 28 }}>
            <div><span>DO NOT SUBMIT</span><strong>Passwords or secret keys</strong><small>Never place credentials, private keys, authentication secrets, or full payment-card details into claim text or support messages.</small></div>
            <div><span>SUPPORT</span><strong>Questions about privacy?</strong><small>Use the public ProofTTL support surface so the request can be tracked.</small></div>
            <p><a className="text-link" href="/support/">OPEN SUPPORT →</a> &nbsp; <a className="text-link" href="/terms/">TERMS OF SERVICE →</a></p>
          </section>
        </article>
      </section>
    </main>
  )
}
