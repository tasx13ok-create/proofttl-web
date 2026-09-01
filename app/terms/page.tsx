import type { Metadata } from 'next'
import ProductDetailShell from '../../components/ProductDetailShell'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of ProofTTL and the $1,500 source-backed Fact Audit service.',
  alternates: { canonical: '/terms/' },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return <ProductDetailShell
    active="none"
    eyebrow="Terms · Effective August 31, 2026"
    title={<>Clear scope.<br/><em>Clear boundaries.</em></>}
    description={<>These terms govern use of ProofTTL, including customer accounts, the Fact Audit service, technical product surfaces, and related verification work.</>}
    actions={<><a href="/privacy/">Privacy</a><a href="/support/">Support</a></>}
  >
    <section className="ptl-three-up">
      <article><span>The service</span><strong>Scoped factual verification</strong><p>ProofTTL may return SUPPORTED, CONTRADICTED, or UNKNOWN verdicts, source evidence, reports, and signed proof records tied to the examined evidence and time context.</p></article>
      <article><span>Paid work</span><strong>Scope before payment</strong><p>Submitting an intake does not itself create a paid engagement. ProofTTL confirms the requested scope before checkout exists.</p></article>
      <article><span>Professional boundary</span><strong>No outcome guarantee</strong><p>ProofTTL is not legal, medical, financial, regulatory, accounting, certification, or other professional advice.</p></article>
    </section>

    <section className="ptl-detail-section"><header><span>Fact Audit scope</span><h2>One fixed launch offer.</h2><p>The standard Fact Audit is $1,500 USD for a confirmed fixed scope covering 10–25 real AI outputs or consequential factual claims.</p></header><div className="ptl-boundary-list"><article><strong>Consequence ranking</strong><p>Claims are ordered by damage-if-wrong so verification effort follows risk.</p></article><article><strong>Deep verification</strong><p>The highest-risk findings receive the deepest evidence review.</p></article><article><strong>Human approval</strong><p>Customer-facing findings require human approval before publication.</p></article><article><strong>Monitoring</strong><p>Important findings receive a seven-day watch and final reread.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>Your responsibilities</span><h2>Use the service without creating new risk.</h2></header><div className="ptl-boundary-list"><article><strong>Rights to submit</strong><p>Provide claim text, output, and context you have the right to submit.</p></article><article><strong>No abuse</strong><p>Do not use ProofTTL to violate law, privacy rights, intellectual-property rights, security controls, or third-party terms.</p></article><article><strong>No secrets</strong><p>Do not submit passwords, private keys, authentication secrets, malware, or raw full payment-card data.</p></article><article><strong>Context matters</strong><p>Review delivered verification results in context before relying on them for consequential decisions.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>Pricing + payment</span><h2>$1,500 after scope confirmation.</h2><p>A customer is charged only after scope is confirmed and checkout is created. Payment processing is handled by the provider shown at checkout; ProofTTL does not store raw card details.</p></header></section>

    <section className="ptl-detail-section"><header><span>Cancellation, refunds, and scope changes</span><h2>The approved engagement controls.</h2><p>Any cancellation, refund, or scope-change terms communicated in the approved scope or payment flow apply to that engagement. If no special term is stated, contact ProofTTL support as soon as possible.</p></header></section>

    <section className="ptl-detail-section"><header><span>Public sources + third parties</span><h2>Evidence can change outside ProofTTL.</h2><p>Verification quality depends on the accessibility, accuracy, completeness, and freshness of evidence available for the scoped claim. Third-party sites, APIs, identity providers, payment providers, and source publishers remain outside ProofTTL&apos;s control.</p></header><div className="ptl-three-up"><article><span>Source changes</span><strong>Pages can move</strong><p>A source can change, disappear, correct itself, or be superseded after a finding is issued.</p></article><article><span>Proof records</span><strong>Signing is not truth</strong><p>Cryptographic signing can establish that ProofTTL issued a particular record without making the underlying proposition permanently true.</p></article><article><span>Availability</span><strong>Active development</strong><p>Features, limits, providers, and technical surfaces may change as ProofTTL evolves.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>Human approval + monitoring</span><h2>Automation does not get the final word.</h2><p>Customer-facing Fact Audit findings require human approval before publication in the launch workflow. Monitoring reduces the chance that an important source change goes unnoticed during the included watch period, but cannot guarantee every real-world change is detected immediately.</p></header></section>

    <section className="ptl-detail-section"><header><span>Changes + support</span><h2>The effective date identifies the current version.</h2><p>These terms may be updated as ProofTTL changes. Questions about a specific engagement should be raised through Support so they can be tied to the relevant account or scope.</p></header><div className="ptl-source-list"><a href="/support/"><span>01</span><strong>Support</strong><b>↗</b></a><a href="/privacy/"><span>02</span><strong>Privacy Policy</strong><b>↗</b></a><a href="/trust/"><span>03</span><strong>Trust Center</strong><b>↗</b></a></div></section>

    <p className="ptl-detail-note">A ProofTTL verdict records what the examined evidence supports at a point in time. It is not a guarantee of permanent truth, legal authority, certification, or a particular business outcome.</p>
  </ProductDetailShell>
}
