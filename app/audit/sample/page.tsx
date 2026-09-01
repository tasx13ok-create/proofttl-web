import ProductDetailShell from '../../../components/ProductDetailShell'

export const metadata = {
  title: 'Sample Verification Audit',
  description: 'Inspect a public ProofTTL verification sample showing source-backed verdicts, documentation drift, uncertainty handling, and the evidence behind each claim.',
  alternates: { canonical: '/audit/sample/' },
  openGraph: { title: 'ProofTTL Sample Verification Audit', description: 'See how ProofTTL pressure-tests time-sensitive claims against public primary sources before you buy.', url: '/audit/sample/', type: 'article' },
}

const claims = [
  ['PX-001', 'Perplexity Max costs $200/month or $2,000/year on the web app.', 'SUPPORTED', 'MEDIUM'],
  ['PX-002', 'Perplexity Enterprise Pro costs $40 per active seat per month or $400 per year.', 'SUPPORTED', 'HIGH'],
  ['PX-003', 'Perplexity Enterprise Max costs $325 per active seat per month or $3,250 per year.', 'SUPPORTED', 'HIGH'],
  ['PX-004', "Perplexity's current Max Search-model roster includes GPT-5.6 Sol and Claude Opus 5.", 'SUPPORTED', 'HIGH'],
  ['PX-005', "Perplexity's current Pro and Max Search-model roster includes Gemini 3.1 Pro.", 'SUPPORTED', 'HIGH'],
  ['PX-006', "Perplexity's documentation is fully synchronized on which advanced models Max users can access.", 'CONTRADICTED', 'HIGH'],
] as const

const sources = [
  ['S1', 'Perplexity Max — Help Center', 'https://www.perplexity.ai/help-center/en/articles/11680686-perplexity-max'],
  ['S2', 'Enterprise Pricing and Billing FAQ', 'https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions'],
  ['S3', 'Advanced AI models included in subscription', 'https://www.perplexity.ai/help-center/en/articles/10354919-what-advanced-ai-models-are-included-in-my-subscription'],
  ['S4', 'What is Perplexity Pro?', 'https://www.perplexity.ai/help-center/en/articles/9385876-what-is-perplexity-pro'],
] as const

export default function SampleAuditPage() {
  return <ProductDetailShell
    active="sample"
    eyebrow="Sample finding · PTTL-DEMO-PX-20260818-001"
    title={<>A believable claim.<br/><em>Then the contradiction.</em></>}
    description={<>This sample reviews six time-sensitive statements in public Perplexity documentation. Five survive. One fails only after two current first-party pages are compared.</>}
    actions={<a href="/how-proofttl-works/">See the method</a>}
  >
    <section className="ptl-finding-hero">
      <div className="ptl-finding-meta"><span>Claim PX-006</span><span>Observed Aug 18, 2026</span><span>High consequence</span></div>
      <blockquote>“Perplexity&apos;s documentation is fully synchronized on which advanced models Max users can access.”</blockquote>
      <p>The important word is <strong>fully</strong>. ProofTTL keeps the proposition intact instead of quietly weakening it until the evidence fits.</p>
    </section>

    <section className="ptl-evidence-compare">
      <article className="support"><div className="ptl-evidence-label"><i/> Evidence for</div><h2>S3 looks clean on its own.</h2><p>The current advanced-model page explicitly lists model availability and notes that availability can change. Examined alone, the documentation appears internally consistent.</p><span className="source-chip">S3 · first-party · current</span></article>
      <article className="against"><div className="ptl-evidence-label"><i/> Contradiction pass</div><h2>S4 breaks the universal claim.</h2><p>Another current first-party help article references a different set of Max model examples. Both pages can exist while “fully synchronized” is false.</p><span className="source-chip">S4 · first-party · current</span></article>
    </section>

    <section className="ptl-verdict-card contradicted"><div><span>Verdict</span><strong>CONTRADICTED</strong></div><p>The inspected documentation is not fully synchronized. The verdict is intentionally narrow: it does not imply the product is defective or that every help page is stale.</p><div className="ptl-verdict-foot"><span>Exact claim preserved</span><span>Contradiction retained</span><span>Human-readable scope</span></div></section>

    <section className="ptl-detail-section"><header><span>Audit overview</span><h2>Six claims. One material break.</h2><p>The table is secondary. The finding stays primary.</p></header><div className="ptl-claim-list">{claims.map(([id, claim, verdict, risk]) => <article key={id}><div><small>{id} · {risk}</small><strong>{claim}</strong></div><span className={verdict === 'SUPPORTED' ? 'supported' : 'contradicted'}>{verdict}</span></article>)}</div></section>

    <section className="ptl-detail-section"><header><span>Why TTL matters</span><h2>Supported is not permanently true.</h2><p>Pricing, model rosters, limits, policies, and capabilities can change after a check. ProofTTL records the evidence-access date and knows when a claim deserves another look.</p></header><div className="ptl-three-up"><article><span>Observed</span><strong>Aug 18, 2026</strong><p>Point-in-time evidence.</p></article><article><span>Volatility</span><strong>High</strong><p>Pricing and model availability move quickly.</p></article><article><span>Recheck when</span><strong>Source changes</strong><p>A cited page changes, disappears, or is superseded.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>Source index</span><h2>Every source remains inspectable.</h2></header><div className="ptl-source-list">{sources.map(([id,title,href]) => <a key={id} href={href} target="_blank" rel="noreferrer"><span>{id}</span><strong>{title}</strong><b>↗</b></a>)}</div></section>

    <section className="ptl-detail-cta"><div><span>Fact Audit scope</span><h2>Up to 25 real outputs. Fixed $1,500 scope.</h2><p>Consequence ranking, deep verification of the highest-risk findings, human approval, proof/report delivery, and a seven-day watch.</p></div></section>

    <p className="ptl-detail-note">Public demonstration only. This is not a commissioned audit of Perplexity, an endorsement, an accusation, or legal, financial, medical, regulatory, certification, or compliance advice.</p>
  </ProductDetailShell>
}
