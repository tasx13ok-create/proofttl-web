import type { Metadata } from 'next'
import ProductDetailShell from '../../components/ProductDetailShell'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ProofTTL handles account, audit-intake, verification, usage, and payment-related information.',
  alternates: { canonical: '/privacy/' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return <ProductDetailShell
    active="none"
    eyebrow="Privacy · Effective August 21, 2026"
    title={<>Private information<br/><em>stays on the private path.</em></>}
    description={<>This policy describes the information ProofTTL handles when you use the website, customer account, verification services, and related product surfaces.</>}
    actions={<><a href="/trust/">Trust Center</a><a href="/support/">Support</a></>}
  >
    <section className="ptl-three-up">
      <article><span>What you provide</span><strong>Account + verification data</strong><p>Name, email, company or project details, URLs, factual claims, verification context, deadlines, support messages, and other information you intentionally submit.</p></article>
      <article><span>Payments</span><strong>Stripe handles card details</strong><p>ProofTTL receives payment status and transaction identifiers needed to connect a payment to the scoped request, not your raw full card number through its audit forms.</p></article>
      <article><span>Local browser state</span><strong>Drafts can stay local</strong><p>Unfinished audit intake state may be saved in browser storage so signing in does not erase work. Clearing site data removes locally stored values.</p></article>
    </section>

    <section className="ptl-detail-section"><header><span>How information is used</span><h2>Only for operating, protecting, and improving the service.</h2></header><div className="ptl-boundary-list"><article><strong>Accounts</strong><p>Authenticate users and protect customer-only product surfaces.</p></article><article><strong>Verification work</strong><p>Review, scope, perform, deliver, and support verification requests.</p></article><article><strong>Customer state</strong><p>Connect audit, payment, fulfillment, and delivery state to the correct account.</p></article><article><strong>Security</strong><p>Prevent fraud, abuse, unauthorized access, and investigate incidents.</p></article><article><strong>Reliability</strong><p>Measure failures, debug product behavior, and improve ProofTTL.</p></article><article><strong>Legal obligations</strong><p>Retain or process records where reasonably necessary to comply with applicable requirements.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>Service providers</span><h2>Infrastructure providers process data only where the product needs them.</h2><p>Depending on the feature used, information may pass through providers supporting hosting, runtime infrastructure, authentication, payment processing, source verification, or sign-in.</p></header><div className="ptl-three-up"><article><span>Infrastructure</span><strong>Vercel + Cloudflare</strong><p>Hosting, edge/runtime, and related delivery infrastructure.</p></article><article><span>Payments</span><strong>Stripe</strong><p>Checkout and payment processing after scope confirmation.</p></article><article><span>Identity</span><strong>Enabled sign-in providers</strong><p>Providers such as GitHub, Google, or Discord process sign-in under their own terms and policies.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>Logs, security, and retention</span><h2>Operational records exist because the service has to be accountable.</h2><p>ProofTTL may retain security, request, payment-state, verification, and operational records as reasonably necessary to provide the service, protect accounts, investigate abuse, preserve audit history, resolve disputes, or satisfy legal requirements.</p></header></section>

    <section className="ptl-detail-cta"><div><span>Do not submit</span><h2>Passwords, secret keys, auth tokens, or full payment-card details.</h2><p>Never place credentials, private keys, authentication secrets, or raw full payment-card data into claim text, audit context, or support messages.</p></div></section>

    <section className="ptl-detail-section"><header><span>Your choices</span><h2>You control local state and account access.</h2></header><div className="ptl-boundary-list"><article><strong>Sign out</strong><p>You can sign out of your ProofTTL account at any time.</p></article><article><strong>Clear local data</strong><p>Browser-saved drafts and site state can be removed through your browser.</p></article><article><strong>Account data questions</strong><p>Use Support for correction or deletion requests. Some records may need to be retained for security, contractual, payment, or legal reasons.</p></article><article><strong>Advertising</strong><p>ProofTTL does not currently load third-party advertising on the public product or documentation experience.</p></article></div></section>

    <p className="ptl-detail-note">No internet service can promise absolute security. ProofTTL uses access controls, server-side credentials, authenticated customer routes, and other safeguards intended to reduce risk.</p>
  </ProductDetailShell>
}
