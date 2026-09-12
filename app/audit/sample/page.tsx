import ProductDetailShell from '../../../components/ProductDetailShell'

export const metadata = {
  title: 'Sample Verification Audit — Evidence Behind a Stale Price',
  description: 'Inspect a ProofTTL self-audit with immutable repository evidence, a narrow verdict, recommended repair, and explicit limitations.',
  alternates: { canonical: '/audit/sample/' },
}

const base = 'https://github.com/tasx13ok-create/proofttl/blob/fc8bb7b5762cacb708225ae7ca7fb88e7ca37c09/'
const sources = [
  ['S1', 'README — the retired price', 'README.md'],
  ['S2', 'Intake — the $1,500 offer', 'src/audit-intake.js'],
  ['S3', 'Scope approval — exact price enforcement', 'src/audit-sales.js'],
  ['S4', 'Stripe — checkout amount validation', 'src/stripe-payments.js'],
] as const

export default function SampleAuditPage() {
  return <ProductDetailShell
    active="sample"
    eyebrow="Public demonstration · Self-audit · September 9, 2026"
    title={<>A stale price.<br/><em>A source-backed correction.</em></>}
    description={<>A real discrepancy in ProofTTL's own repository: the README advertised a retired price while the commercial code enforced $1,500. This self-audit demonstrates the evidence and reasoning format. It is not commissioned customer work or independent certification.</>}
    actions={<><a href="/audit/#audit-intake">Start your Fact Audit</a><a href="/samples/proofttl-pricing-audit.md">Read the complete evidence record</a></>}
  >
    <section className="ptl-finding-hero">
      <div className="ptl-finding-meta"><span>Finding · Pricing drift</span><span>Recorded Sep 9, 2026</span><span>Commercial consequence</span></div>
      <blockquote>“The current ProofTTL full audit costs $500.”</blockquote>
      <p><strong>Scope:</strong> the repository at commit <code>fc8bb7b</code> and the buyer-facing offer recorded in the self-audit. This finding evaluates the advertised commercial price, not historical customer transactions.</p>
    </section>
    <section className="ptl-evidence-compare">
      <article className="support"><div className="ptl-evidence-label">Evidence for</div><h2>The README says $500.</h2><p>S1 lists a “$500 Full Verification Audit.” Someone relying on that document could quote the retired offer.</p><a className="source-chip" href={base + 'README.md'} target="_blank" rel="noreferrer">S1 · immutable repository snapshot ↗</a></article>
      <article className="against"><div className="ptl-evidence-label">Evidence against</div><h2>The commercial code enforces $1,500.</h2><p>S2 sets the offer at 1500 USD. S3 rejects a different scoped price. S4 validates the checkout total against the same amount.</p><a className="source-chip" href={base + 'src/stripe-payments.js'} target="_blank" rel="noreferrer">S4 · immutable repository snapshot ↗</a></article>
    </section>
    <section className="ptl-verdict-card contradicted"><div><span>Scoped verdict</span><strong>CONTRADICTED</strong></div><p>The $500 claim conflicts with the active commercial code and buyer-facing offer examined. The evidence establishes documentation drift; it does not establish that any customer was charged incorrectly.</p><div className="ptl-verdict-foot"><span>Exact claim preserved</span><span>Conflicting evidence retained</span><span>Limits explicit</span></div></section>
    <section className="ptl-detail-section"><header><span>Consequence and repair</span><h2>Fix the quote before it reaches a buyer.</h2></header><div className="ptl-three-up">
      <article><span>Consequence</span><strong>Conflicting prices</strong><p>An owner could send an obsolete quote, or a buyer could encounter contradictory amounts. No lost customer or revenue is claimed.</p></article>
      <article><span>Recommended repair</span><strong>Align the active offer</strong><p>Update current documentation and outreach to $1,500. Preserve historical records and never silently change a customer's payment amount.</p></article>
      <article><span>Corrected wording</span><strong>$1,500 Fact Audit</strong><p>Up to 25 outputs or claims, with scope confirmed before payment. Deep verification focuses on the highest-risk findings.</p></article>
    </div></section>
    <section className="ptl-detail-section"><header><span>Uncertainty stays visible</span><h2>What this sample does not prove.</h2><p>Source inspection and mocked Stripe tests do not verify every live checkout or historical transaction. No charge was created for this sample. No independent human certification was issued.</p><p>Owner editorial review is required before presenting this as a human-approved commercial deliverable. A purchased audit's findings require explicit human approval before customer-facing delivery.</p></header></section>
    <section className="ptl-detail-section"><header><span>Source index</span><h2>Open the exact evidence.</h2><p>These links pin the repository to the examined commit, so later edits cannot silently change the cited evidence.</p></header><div className="ptl-source-list">{sources.map(([id,title,path]) => <a key={id} href={base + path} target="_blank" rel="noreferrer"><span>{id}</span><strong>{title}</strong><b>↗</b></a>)}</div></section>
    <section className="ptl-detail-section"><header><span>Freshness</span><h2>Recheck before the next quote.</h2><p>The commit evidence is immutable. The live offer is time-sensitive: recheck after pricing or deployment changes. This sample is a single finding, not a completed 25-output audit or evidence that a seven-day watch has been performed.</p></header></section>
    <section className="ptl-detail-cta"><div><span>Apply this process to your outputs</span><h2>Up to 25 real outputs. Fixed $1,500 scope.</h2><p>Consequence ranking, deep verification of the highest-risk findings, human approval, report delivery, and a seven-day watch on agreed important findings.</p><a className="button button-primary" href="/audit/#audit-intake">Start your Fact Audit →</a></div></section>
  </ProductDetailShell>
}
