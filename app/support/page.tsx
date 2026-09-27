import type { Metadata } from 'next'
import ProductDetailShell from '../../components/ProductDetailShell'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with a ProofTTL Rapid Claim Check, Fact Audit, payment status, account access, or public website issue without exposing private customer information publicly.',
  alternates: { canonical: '/support/' },
  robots: { index: true, follow: true },
}

const routes = [
  ['00', 'Rapid Claim Check · no account required', 'After your $299 purchase, look for the ProofTTL intake email at the address used for checkout, including your spam folder. Reply to that email with your claims or questions. Full Fact Audit status is a separate signed-in workflow.', '#rapid-help', 'Rapid Check next steps'],
  ['01', 'Existing Fact Audit', 'Check ownership, payment, fulfillment, and delivery state in the signed-in audit status flow.', '/audit/status/', 'Open private status'],
  ['02', 'Before you buy', 'Review the method and scope before using the audit control in the header.', '/how-proofttl-works/', 'Review the method'],
  ['03', 'Account or security', 'Use the private account path first. Do not place cookies, tokens, identifiers, or private customer material in public channels.', '/trust/', 'Review trust boundary'],
  ['04', 'Public website bug', 'Use GitHub only for reproducible public-site defects after removing secrets and customer information.', 'https://github.com/tasx13ok-create/proofttl-web/issues', 'Open website issues ↗'],
] as const

export default function SupportPage() {
  return <>
    <ProductDetailShell
      active="support"
      eyebrow="Support"
      title={<>Get the right help.<br/><em>Keep private details private.</em></>}
      description={<>ProofTTL routes customer, payment, and account questions through private product flows. Public channels are reserved for reproducible website defects that can be described without exposing customer information.</>}
      actions={<><a className="primary" href="mailto:ProofTTL.Support@gmail.com">Email support <span>↗</span></a><a href="/audit/status/">Fact Audit status</a></>}
    >
      <section id="rapid-help" className="ptl-detail-section" aria-labelledby="rapid-help-title"><header><span>Rapid Claim Check · $299</span><h2 id="rapid-help-title">Your next step after checkout.</h2><p>ProofTTL emails you to collect up to five public, redacted, or de-identified claims. Use the email address you entered at Stripe checkout; a ProofTTL account is not required.</p></header><div className="ptl-three-up"><article><span>01 · Prepare</span><strong>Keep the exact wording</strong><p>List up to five factual claims, where you plan to use them, and any relevant public source links. Remove personal details and confidential material.</p></article><article><span>02 · Submit</span><strong>Reply to your intake email</strong><p>Check your inbox and spam folder for the ProofTTL intake message. Send your claims and context in that thread.</p></article><article><span>03 · Follow up</span><strong>No intake email?</strong><p>Email <a href="mailto:ProofTTL.Support@gmail.com?subject=Rapid%20Claim%20Check%20support">ProofTTL.Support@gmail.com</a> from the address used at checkout. Include your purchase date and public or redacted claims. Do not send card details, passwords, or confidential files. If you already have an intake thread, reply there.</p></article></div></section>

      <section className="ptl-support-router" aria-label="Support routes">
        {routes.map(([number,title,copy,href,label]) => <article key={number}>
          <span>{number}</span>
          <div><h2>{title}</h2><p>{copy}</p></div>
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{label}</a>
        </article>)}
      </section>

      <section className="ptl-detail-section"><header><span>Private by default</span><h2>Customer support should not create a second security problem.</h2><p>Use the private audit and account flows for anything connected to a real customer, payment, or verification request.</p></header><div className="ptl-three-up"><article><span>Audit status</span><strong>Signed-in lookup</strong><p>Review request state, payment readiness, fulfillment, and delivery without exposing the request publicly.</p></article><article><span>Payment</span><strong>Scope before checkout</strong><p>No card is required at intake. Stripe checkout is created only after the Fact Audit scope is confirmed.</p></article><article><span>Account access</span><strong>Return-to-page sign-in</strong><p>If sign-in is required, ProofTTL routes you through the account flow and back to the private customer surface.</p></article></div></section>

      <section className="ptl-support-warning"><div><span>Never post publicly</span><h2>Card details, session cookies, auth tokens, private claims, or customer documents.</h2></div><p>A public bug report should contain only the minimum reproduction needed to explain a public website defect. Remove identifiers, screenshots with customer data, payment references, and private source material before posting.</p></section>

      <section className="ptl-detail-section"><header><span>Fastest path</span><h2>Start where the problem actually lives.</h2></header><div className="ptl-boundary-list"><article><strong>Payment or delivery question</strong><p>For a Rapid Claim Check, reply in your ProofTTL intake email thread. For a full Fact Audit, open the private audit status page.</p></article><article><strong>New Fact Audit</strong><p>Use the single audit control in the top-right header after reviewing scope.</p></article><article><strong>Security or account question</strong><p>Review the Trust Center and use the signed-in account flow.</p></article><article><strong>Public site defect</strong><p>Use GitHub only after stripping all private information.</p></article></div></section>

      <section className="ptl-detail-cta"><div><span>Need customer help now?</span><h2>Talk to ProofTTL Support.</h2><p>For Rapid Claim Check intake, missing emails, or account access problems, contact ProofTTL.Support@gmail.com. No ProofTTL login is required to email us.</p></div><a href="mailto:ProofTTL.Support@gmail.com">Email support <span>↗</span></a></section>
    </ProductDetailShell>

    <style>{`
      .ptl-detail-cta p,.ptl-three-up p{overflow-wrap:anywhere}.ptl-detail-help.active{background:#282a30;color:#f4f5f7}.ptl-detail-help.active b{color:#a8c7fa}.ptl-support-router{border-top:1px solid var(--ptl-line)}.ptl-support-router article{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:22px;align-items:center;padding:25px 0;border-bottom:1px solid var(--ptl-line)}.ptl-support-router article>span{color:#6f737c;font-size:9px}.ptl-support-router h2{margin:0;font-size:22px;letter-spacing:-.035em;font-weight:540}.ptl-support-router p{max-width:710px;margin:8px 0 0;color:#858992;font-size:11px;line-height:1.65}.ptl-support-router article>a{min-height:38px;display:flex;align-items:center;padding:0 14px;border-radius:19px;background:#24252a;color:#bfc2c8;font-size:10px;font-weight:600;white-space:nowrap}.ptl-support-router article>a:hover{background:#2a2b30;color:#fff}.ptl-support-warning{margin-top:110px;padding:34px;display:grid;grid-template-columns:1fr .85fr;gap:42px;align-items:end;border:1px solid rgba(233,154,159,.12);border-radius:22px;background:rgba(38,27,29,.22)}.ptl-support-warning span{color:#d6969c;font-size:9px;text-transform:uppercase;letter-spacing:.06em}.ptl-support-warning h2{max-width:680px;margin:13px 0 0;font-size:clamp(28px,3.5vw,42px);line-height:1.08;letter-spacing:-.04em;font-weight:520}.ptl-support-warning>p{margin:0;color:#8c898e;font-size:11px;line-height:1.7}@media(max-width:900px){.ptl-support-router article{grid-template-columns:42px 1fr}.ptl-support-router article>a{grid-column:2;width:max-content}.ptl-support-warning{grid-template-columns:1fr;align-items:start}}@media(max-width:560px){.ptl-support-router article{grid-template-columns:32px 1fr;gap:12px}.ptl-support-router article>a{grid-column:1/3;width:100%;justify-content:center}.ptl-support-warning{padding:24px}.ptl-support-warning h2{font-size:30px}}
    `}</style>
  </>
}
