function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <p className="section-lede">{children}</p>}</div>
}

export default function HomeClient() {
  return <main>
    <section className="hero shell" id="top">
      <div className="hero-copy">
        <div className="status-line"><span className="pulse" /> SOURCE-BACKED FACT AUDITS <span className="status-rule" /> HUMAN-APPROVED FINDINGS</div>
        <h1>Pressure-test consequential claims<br /><em>before they become expensive.</em></h1>
        <p className="hero-lede">ProofTTL is an adversarial fact-audit system for high-consequence AI outputs and factual claims. We test the evidence for and against important assertions, preserve uncertainty, and produce a clear record of what the available sources actually support.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="/status/">Audit Status <span>→</span></a>
          <a className="button button-secondary" href="/login/">Log In</a>
        </div>
        <div className="hero-notes"><span>AUTHORITATIVE SOURCES</span><span>FOR / AGAINST EVIDENCE</span><span>HUMAN APPROVAL</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-header"><span>PROOFTTL_FACT_AUDIT</span><span className="live-label">● EARLY PILOT</span></div>
        <div className="pipeline">
          <div className="pipeline-node active"><span className="node-index">01</span><strong>CLAIM</strong><small>identify the consequential assertion</small><code>scope · context · consequence</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">02</span><strong>EVIDENCE</strong><small>test authoritative sources for and against</small><code>support · contradiction · uncertainty</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">03</span><strong>VERDICT</strong><small>preserve what the evidence actually shows</small><code>SUPPORTED · CONTRADICTED · UNKNOWN</code></div>
        </div>
        <div className="visual-footer"><span>SOURCE-BACKED</span><span>HUMAN <b>APPROVED</b></span></div>
      </div>
    </section>

    <section className="ticker"><div className="ticker-inner"><span>CLAIM → EVIDENCE → VERDICT</span><span>◈</span><span>CHECK WHAT HOLDS UP BEFORE OTHERS DO</span><span>◈</span><span>UNCERTAINTY IS PRESERVED, NOT HIDDEN</span></div></section>

    <section className="section shell" id="what">
      <SectionTitle eyebrow="01 / WHAT PROOFTTL IS" title="An independent second pass on claims that matter.">ProofTTL is built for situations where a factual error can create legal, financial, operational, editorial, or reputational consequences.</SectionTitle>
      <div className="steps">
        <article><span>01</span><h3>AI outputs</h3><p>Review consequential factual claims produced by AI systems before they are relied on by customers, teams, or decision-makers.</p></article>
        <article><span>02</span><h3>Research and publishing</h3><p>Pressure-test important claims against authoritative evidence and clearly separate corrections, uncertainty, and source changes.</p></article>
        <article><span>03</span><h3>Governance and diligence</h3><p>Independently challenge the factual core beneath assessments, recommendations, reports, and high-stakes decisions.</p></article>
        <article><span>04</span><h3>Evidence records</h3><p>Preserve the claim, source trail, verdict, observation time, and review state so findings can be inspected later.</p></article>
      </div>
    </section>

    <section className="section shell" id="method">
      <SectionTitle eyebrow="02 / HOW IT WORKS" title="The methodology is intentionally adversarial.">The objective is not to make a claim look correct. The objective is to find the strongest available evidence both supporting and challenging it.</SectionTitle>
      <div className="steps">
        <article><span>01</span><h3>Define the exact claim</h3><p>Ambiguous wording is narrowed so the audit evaluates one testable assertion rather than a vague topic.</p></article>
        <article><span>02</span><h3>Rank consequence</h3><p>Higher-consequence claims receive deeper scrutiny and stronger source requirements.</p></article>
        <article><span>03</span><h3>Search both directions</h3><p>Evidence is gathered for and against the claim, with preference for primary and authoritative sources.</p></article>
        <article><span>04</span><h3>Issue the finding</h3><p>The result remains SUPPORTED, CONTRADICTED, or UNKNOWN. Human approval is required before customer-facing findings are finalized.</p></article>
      </div>
    </section>

    <section className="section shell split-section" id="output">
      <div><SectionTitle eyebrow="03 / WHAT AN AUDIT RECORD CONTAINS" title="A finding you can inspect.">Each checked claim stays tied to the evidence and review state that produced the verdict.</SectionTitle><dl className="fact-list"><div><dt>CLAIM</dt><dd>The exact assertion being evaluated.</dd></div><div><dt>EVIDENCE FOR</dt><dd>Authoritative evidence that supports the assertion.</dd></div><div><dt>EVIDENCE AGAINST</dt><dd>Authoritative evidence that contradicts or weakens it.</dd></div><div><dt>VERDICT</dt><dd>SUPPORTED, CONTRADICTED, or UNKNOWN.</dd></div><div><dt>REVIEW</dt><dd>Human approval and the time the evidence was observed.</dd></div></dl></div>
      <div className="lease-card"><div className="lease-top"><span>EXAMPLE FINDING</span><span className="valid-pill">SUPPORTED</span></div><div className="lease-claim">A clearly scoped factual claim is tested against evidence that can be inspected independently.</div><div className="lease-meta"><span>FOR<strong>PRIMARY SOURCES</strong></span><span>AGAINST<strong>CHALLENGE SEARCH</strong></span><span>REVIEW<strong className="accent-text">HUMAN APPROVED</strong></span></div><div className="lease-signature"><span>STATE</span><code>evidence preserved · uncertainty explicit</code><span className="signature-seal">✓</span></div></div>
    </section>

    <section className="section ttl-section"><div className="ttl-number">TTL<span>≠</span>TRUTH</div><div><SectionTitle eyebrow="04 / THE LIMIT" title="Evidence has a time boundary." /><p className="large-copy">ProofTTL records what examined sources support at a point in time. <strong>UNKNOWN stays UNKNOWN.</strong> A verdict is an evidence-backed assessment, not a guarantee of future truth or legal authority.</p></div></section>

    <section className="section shell" id="principles">
      <SectionTitle eyebrow="05 / OPERATING PRINCIPLES" title="Designed to make weak certainty harder to hide.">The system favors defensibility over persuasive wording.</SectionTitle>
      <div className="steps">
        <article><span>01</span><h3>Primary sources first</h3><p>Whenever possible, findings rely on original records, official documentation, and authoritative datasets rather than summaries.</p></article>
        <article><span>02</span><h3>Contradictions are surfaced</h3><p>Evidence that challenges a claim is not buried simply because supporting evidence also exists.</p></article>
        <article><span>03</span><h3>Unknown is valid</h3><p>If the available evidence cannot justify a confident conclusion, the result stays UNKNOWN.</p></article>
        <article><span>04</span><h3>Human checkpoint</h3><p>Customer-facing audit findings require human review before finalization.</p></article>
      </div>
    </section>

    <section className="section shell support-section" id="access">
      <SectionTitle eyebrow="06 / ACCESS" title="Public access is intentionally limited during the pilot.">For now, the public site explains ProofTTL and provides only the essential account, audit-status, legal, and support routes.</SectionTitle>
      <div className="hero-actions">
        <a className="button button-primary" href="/status/">Audit Status <span>→</span></a>
        <a className="button button-secondary" href="/login/">Log In</a>
        <a className="text-link" href="/terms/">Legal <span>→</span></a>
        <a className="text-link" href="/support/">Support <span>→</span></a>
      </div>
    </section>

    <footer className="footer shell"><span className="footer-brand" aria-label="ProofTTL"><img src="/proofttl-lockup.svg" alt="ProofTTL" /></span><span>SOURCE-BACKED ADVERSARIAL FACT AUDITS.</span><div><a href="/status/">Audit Status</a><a href="/login/">Log In</a><a href="/terms/">Legal</a><a href="/support/">Support</a></div></footer>
  </main>
}
