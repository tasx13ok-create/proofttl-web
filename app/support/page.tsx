import type { Metadata } from 'next'
import ProductDetailShell from '../../components/ProductDetailShell'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with a ProofTTL Fact Audit, payment status, account access, or public website issue without exposing private customer information publicly.',
  alternates: { canonical: '/support/' },
  robots: { index: true, follow: true },
}

const routes = [
  ['01', 'Existing Fact Audit', 'Check ownership, payment, fulfillment, and delivery state in the signed-in audit status flow.', '/audit/status/', 'Open private status'],
  ['02', 'Before you buy', 'Send the outputs first. No card is required at intake, and scope is confirmed before a payment request exists.', '/audit/#audit-intake', 'Open Fact Audit intake'],
  ['03', 'Account or security', 'Use the private account path first. Do not place cookies, tokens, identifiers, or private customer material in public channels.', '/trust/', 'Review trust boundary'],
  ['04', 'Public website bug', 'Use GitHub only for reproducible public-site defects after removing secrets and customer information.', 'https://github.com/tasx13ok-create/proofttl-web/issues', 'Open website issues ↗'],
] as const

export default function SupportPage() {
  return <ProductDetailShell
    active="support"
    eyebrow="Support"
    title={<>Get the right help.<br/><em>Keep private details private.</em></>}
    description={<>ProofTTL routes customer, payment, and account questions through private product flows. Public channels are reserved for reproducible website defects that can be described without exposing customer information.</>}
    actions={<><a className="primary" href="/audit/status/">Check my audit <span>↗</span></a><a href="/audit/#audit-intake">Start Fact Audit</a></>}
  >
    <section className="ptl-support-router" aria-label="Support routes">
      {routes.map(([number,title,copy,href,label]) => <article key={number}>
        <span>{number}</span>
        <div><h2>{title}</h2><p>{copy}</p></div>
        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{label}</a>
      </article>)}
    </section>

    <section className="ptl-detail-section"><header><span>Private by default</span><h2>Customer support should not create a second security problem.</h2><p>Use the private audit and account flows for anything connected to a real customer, payment, or verification request.</p></header><div className="ptl-three-up"><article><span>Audit status</span><strong>Signed-in lookup</strong><p>Review request state, payment readiness, fulfillment, and delivery without exposing the request publicly.</p></article><article><span>Payment</span><strong>Scope before checkout</strong><p>No card is required at intake. Stripe checkout is created only after the Fact Audit scope is confirmed.</p></article><article><span>Account access</span><strong>Return-to-page sign-in</strong><p>If sign-in is required, ProofTTL routes you through the account flow and back to the private customer surface.</p></article></div></section>

    <section className="ptl-support-warning"><div><span>Never post publicly</span><h2>Card details, session cookies, auth tokens, private claims, or customer documents.</h2></div><p>A public bug report should contain only the minimum reproduction needed to explain a public website defect. Remove identifiers, screenshots with customer data, payment references, and private source material before posting.</p></section>

    <section className="ptl-detail-section"><header><span>Fastest path</span><h2>Start where the problem actually lives.</h2></header><div className="ptl-boundary-list"><article><strong>Payment or delivery question</strong><p>Open the private audit status page first.</p></article><article><strong>New Fact Audit</strong><p>Submit 10–25 real outputs through the scope-first intake.</p></article><article><strong>Security or account question</strong><p>Review the Trust Center and use the signed-in account flow.</p></article><article><strong>Public site defect</strong><p>Use GitHub only after stripping all private information.</p></article></div></section>

    <section className="ptl-detail-cta"><div><span>Need customer help now?</span><h2>Open your private Fact Audit status.</h2><p>Keep the request, payment state, and delivery information tied to the signed-in account instead of moving it into a public support channel.</p></div><a href="/audit/status/">Check audit status <span>↗</span></a></section>
  </ProductDetailShell>
}
