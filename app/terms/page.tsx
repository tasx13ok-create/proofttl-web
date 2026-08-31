import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of ProofTTL and the $1,500 source-backed Fact Audit service.',
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
            <p className="app-copy">Effective August 31, 2026. These terms apply to use of ProofTTL, including customer accounts, the Fact Audit service, technical product surfaces, and related verification work.</p>
          </header>

          <section className="audit-sales-proof">
            <article><p className="app-kicker">THE SERVICE</p><h2>ProofTTL verifies scoped factual claims against examined evidence.</h2><p className="app-copy">ProofTTL may return SUPPORTED, CONTRADICTED, or UNKNOWN verdicts, source evidence, reports, and signed proof records. A verdict records what the examined evidence supports at a point in time. It is not a guarantee of permanent truth, legal authority, certification, or professional advice.</p></article>
            <article><p className="app-kicker">PAID WORK</p><h2>Scope is confirmed before payment.</h2><p className="app-copy">Submitting an intake does not itself create a paid engagement. ProofTTL reviews the requested output or claim set and confirms the scope and expected delivery before a payment request is created. The approved scope controls the work to be delivered.</p></article>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">FACT AUDIT SCOPE</p>
            <p className="app-copy">ProofTTL's launch offer is one fixed-price <strong>$1,500 Fact Audit</strong>. The standard scope accepts 10–25 real AI outputs or consequential factual claims for review, with deep verification concentrated on the highest-risk findings. The workflow includes consequence ranking, authoritative evidence review, evidence FOR and AGAINST where available, a contradiction pass, human approval before customer-facing publication, proof/report delivery, and seven days of monitoring on important findings with a final re-read.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">YOUR RESPONSIBILITIES</p>
            <ul className="audit-clean-list">
              <li>Provide output, claim text, and context you have the right to submit.</li>
              <li>Do not use ProofTTL to violate law, privacy rights, intellectual-property rights, security controls, or third-party terms.</li>
              <li>Do not submit passwords, private keys, authentication secrets, full payment-card data, malware, or material intended to compromise ProofTTL or another system.</li>
              <li>Review delivered verification results in context before relying on them for a consequential decision.</li>
              <li>Use qualified legal, medical, financial, regulatory, or other professional advisers when the decision requires that expertise.</li>
            </ul>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PRICING AND PAYMENT</p>
            <p className="app-copy">The standard Fact Audit price is <strong>$1,500 USD</strong> for the confirmed fixed scope. A customer is charged only after scope is confirmed and checkout is created. Payment processing is handled through the payment provider shown at checkout; ProofTTL does not store raw card details. A materially different request may require separate scoping rather than silently changing the agreed engagement.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">CANCELLATION, REFUNDS, AND SCOPE CHANGES</p>
            <p className="app-copy">Any cancellation, refund, or scope-change terms communicated in the approved scope or payment flow apply to that engagement. If no special term is stated, contact ProofTTL support as soon as possible. ProofTTL does not promise that completed research or verification work can be reversed after it has been performed.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PUBLIC SOURCES AND THIRD PARTIES</p>
            <p className="app-copy">Verification quality depends on the accessibility, accuracy, completeness, and freshness of the evidence available for the scoped claim. Third-party websites, APIs, identity providers, payment providers, and source publishers are outside ProofTTL's control. A source can change, disappear, correct itself, or become unavailable after a verification is issued.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">HUMAN APPROVAL AND MONITORING</p>
            <p className="app-copy">Customer-facing Fact Audit findings require human approval before publication in the launch workflow. Important findings can enter the included seven-day monitoring period, followed by a final re-read. Monitoring reduces the chance that a source change goes unnoticed during that period; it does not guarantee that every real-world change will be detected immediately or that a factual proposition remains true forever.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PROOF RECORDS</p>
            <p className="app-copy">ProofTTL may represent a verification result as a signed, time-bounded record tied to claim, evidence, verdict, and time context. Cryptographic signing can establish that a particular ProofTTL record was issued without turning the underlying factual proposition into permanent or legally certified truth.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">AVAILABILITY</p>
            <p className="app-copy">ProofTTL is under active development. Features, limits, providers, technical routes, and preview functionality can change. Experimental or protocol surfaces are separate from the live human-facing Fact Audit payment workflow and should not be treated as production financial infrastructure unless explicitly stated otherwise.</p>
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
