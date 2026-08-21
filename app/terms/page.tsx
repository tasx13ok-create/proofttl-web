import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of ProofTTL and its paid source-backed claim verification services.',
  alternates: { canonical: '/terms/' },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <main className="app-page audit-sales-page">
      <section className="onboarding-wrap">
        <article className="audit-sales-card">
          <header className="audit-sales-hero">
            <p className="app-kicker">PROOFTTL / TERMS</p>
            <h1 className="app-title">Terms of Service</h1>
            <p className="app-copy">Effective August 21, 2026. These terms apply to use of ProofTTL, including customer accounts, verification services, technical product surfaces, and paid audit work.</p>
          </header>

          <section className="audit-sales-proof">
            <article><p className="app-kicker">THE SERVICE</p><h2>ProofTTL verifies scoped factual claims against examined evidence.</h2><p className="app-copy">ProofTTL may return SUPPORTED, CONTRADICTED, or UNKNOWN verdicts, source evidence, reports, and signed Fact Leases. A verdict records what the examined evidence supports at a point in time. It is not a guarantee of permanent truth, legal authority, certification, or professional advice.</p></article>
            <article><p className="app-kicker">PAID WORK</p><h2>Scope is confirmed before payment.</h2><p className="app-copy">Submitting an intake does not itself create a paid engagement. ProofTTL reviews the requested claim set and confirms the scope, price, and expected turnaround before a payment request is created. The approved scope controls the work to be delivered.</p></article>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">YOUR RESPONSIBILITIES</p>
            <ul className="audit-clean-list">
              <li>Provide claim text and context you have the right to submit.</li>
              <li>Do not use ProofTTL to violate law, privacy rights, intellectual-property rights, security controls, or third-party terms.</li>
              <li>Do not submit passwords, private keys, authentication secrets, full payment-card data, malware, or material intended to compromise ProofTTL or another system.</li>
              <li>Review delivered verification results in context before relying on them for a consequential decision.</li>
              <li>Use qualified legal, medical, financial, regulatory, or other professional advisers when the decision requires that expertise.</li>
            </ul>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PRICING AND PAYMENT</p>
            <p className="app-copy">Public prices may describe standard offers, including the Claim Stress Test and Full Verification Audit. A customer is charged only after the applicable scope is confirmed and a checkout is created. Prices or custom-scope terms may change before a scope is accepted. Payment processing is handled through the payment provider shown at checkout.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">CANCELLATION, REFUNDS, AND SCOPE CHANGES</p>
            <p className="app-copy">Any cancellation, refund, credit, or scope-change terms communicated in the approved scope or payment flow apply to that engagement. If no special term is stated, contact ProofTTL support as soon as possible. ProofTTL does not promise that completed research or verification work can be reversed after it has been performed.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PUBLIC SOURCES AND THIRD PARTIES</p>
            <p className="app-copy">Verification quality depends on the accessibility, accuracy, completeness, and freshness of the evidence available for the scoped claim. Third-party websites, APIs, identity providers, payment providers, and source publishers are outside ProofTTL's control. A source can change, disappear, correct itself, or become unavailable after a verification is issued.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">FACT LEASES</p>
            <p className="app-copy">A Fact Lease is a ProofTTL verification record tied to claim, evidence, verdict, and time context. Cryptographic signing can establish that a particular ProofTTL record was issued without turning the underlying factual proposition into permanent or legally certified truth. Expiry, monitoring, or revocation behavior may vary by the scoped product or technical protocol.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">AVAILABILITY</p>
            <p className="app-copy">ProofTTL is under active development. Features, limits, providers, technical routes, and preview functionality can change. Experimental or testnet surfaces are provided separately from the live human-facing paid verification service and should not be treated as production financial infrastructure unless explicitly stated otherwise.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">NO PROFESSIONAL OR OUTCOME GUARANTEE</p>
            <p className="app-copy">ProofTTL provides source-backed factual verification, not legal opinions, medical diagnosis, investment advice, regulated financial audits, credit decisions, regulatory certification, or guarantees that a customer will avoid loss, win a dispute, close a deal, publish without correction, or achieve any particular outcome.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">CHANGES AND SUPPORT</p>
            <p className="app-copy">These terms may be updated as ProofTTL changes. The effective date above identifies the current version. Questions about a specific engagement should be raised through ProofTTL support so they can be tied to the relevant account or scope.</p>
            <div className="hero-actions" style={{ marginTop: 18 }}><a className="text-link" href="/support/">OPEN SUPPORT →</a><a className="text-link" href="/privacy/">PRIVACY POLICY →</a><a className="text-link" href="/trust/">TRUST CENTER →</a></div>
          </section>
        </article>
      </section>
    </main>
  )
}
