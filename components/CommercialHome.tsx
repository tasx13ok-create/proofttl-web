export default function CommercialHome() {
  return <main>
    <section className="hero shell" id="top">
      <div className="hero-copy">
        <div className="status-line"><span className="pulse" /> ADVERSARIAL FACT AUDIT <span className="status-rule" /> SCOPE BEFORE PAYMENT</div>
        <h1>Find the expensive wrong answer<br /><em>before your customer does.</em></h1>
        <p className="hero-lede">ProofTTL audits the real AI outputs and factual claims your users see, ranks them by damage-if-wrong, verifies the highest-risk findings against authoritative sources, and returns evidence-backed verdicts with fixes.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="/audit/#audit-intake">Start the $1,500 Fact Audit <span>→</span></a>
          <a className="button button-secondary" href="/audit/sample/">View a sample audit</a>
          <a className="text-link" href="/how-proofttl-works/">How verification works <span>↗</span></a>
        </div>
        <div className="hero-notes"><span>UP TO 25 OUTPUTS</span><span>HUMAN APPROVAL</span><span>SCOPE CONFIRMED BEFORE PAYMENT</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-header"><span>FACT AUDIT</span><span className="live-label">● ACCEPTING INTAKES</span></div>
        <div className="pipeline">
          <div className="pipeline-node active"><span className="node-index">01</span><strong>CLAIM</strong><small>Atomic factual assertion</small><code>risk-ranked before deep review</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">02</span><strong>EVIDENCE</strong><small>Authoritative source review</small><code>FOR · AGAINST · contradiction pass</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">03</span><strong>VERDICT</strong><small>Human-approved finding</small><code>SUPPORTED · CONTRADICTED · UNKNOWN</code></div>
        </div>
        <div className="visual-footer"><span>OUTPUT → CLAIM → EVIDENCE → VERDICT</span><span>UNCERTAINTY <b>STAYS VISIBLE</b></span></div>
      </div>
    </section>

    <section className="ticker"><div className="ticker-inner"><span>AI OUTPUT</span><span>◈</span><span>LEGAL + COMPLIANCE</span><span>◈</span><span>FINANCIAL RESEARCH</span><span>◈</span><span>HEALTHCARE ADMIN</span><span>◈</span><span>PUBLIC CLAIMS</span></div></section>

    <section className="section shell" id="offers">
      <div className="section-heading"><p className="eyebrow">01 / FLAGSHIP OFFER</p><h2>One audit. Fixed scope. No pricing maze.</h2><p className="section-lede">Send up to 25 real outputs or claims. ProofTTL confirms fit and scope before sending the payment request.</p></div>
      <div className="pricing-cards">
        <article className="featured-plan">
          <span className="plan-label">FACT AUDIT</span>
          <div className="price">$1,500<span> fixed price</span></div>
          <p>Up to 25 real outputs or claims, consequence ranking, deep verification of the highest-risk findings, authoritative FOR / AGAINST evidence, explicit contradiction checks, human-approved proof artifacts, and seven days of monitoring on important findings.</p>
          <a className="button button-primary" href="/audit/#audit-intake">Submit outputs for scope review</a>
        </article>
        <article>
          <span className="plan-label">DELIVERABLE</span>
          <h3>Evidence, verdicts, fixes.</h3>
          <p>Material findings become customer-ready proof pages with the exact claim, primary evidence, verdict logic, uncertainty, consequence, and recommended repair. UNKNOWN stays UNKNOWN when evidence is insufficient.</p>
          <a className="button button-secondary" href="/audit/sample/">Inspect a sample audit</a>
        </article>
      </div>
      <p className="app-copy" style={{ marginTop: 16 }}>No subscription required. No raw card number is stored by ProofTTL; payment is handled through Stripe after scope confirmation.</p>
    </section>

    <section className="section shell" id="process">
      <div className="section-heading"><p className="eyebrow">02 / PROCESS</p><h2>The audit is built around defensibility.</h2><p className="section-lede">Automation assembles the case. Human approval gates anything customer-facing.</p></div>
      <div className="steps">
        <article><span>01</span><h3>Send real outputs</h3><p>Submit up to 25 outputs or claims your users actually see, with context and citations when available.</p></article>
        <article><span>02</span><h3>Rank the damage</h3><p>Atomic claims are ranked by consequence so deep verification goes to the findings that matter most.</p></article>
        <article><span>03</span><h3>Run the evidence pass</h3><p>Authoritative sources are tested FOR and AGAINST each material claim, including an explicit contradiction pass.</p></article>
        <article><span>04</span><h3>Approve, deliver, watch</h3><p>Human-approved findings become proof artifacts, then important claims are monitored for seven days and re-read.</p></article>
      </div>
    </section>

    <section className="section shell split-section" id="deliverable">
      <div>
        <div className="section-heading"><p className="eyebrow">03 / DELIVERABLE</p><h2>A finding someone else can inspect.</h2><p className="section-lede">Every material verdict stays tied to the exact claim and evidence used to reach it.</p></div>
        <dl className="fact-list">
          <div><dt>CLAIM</dt><dd>The exact assertion being evaluated.</dd></div>
          <div><dt>RISK</dt><dd>Why the claim matters if it is wrong.</dd></div>
          <div><dt>EVIDENCE</dt><dd>Authoritative sources FOR and AGAINST the assertion.</dd></div>
          <div><dt>VERDICT</dt><dd>SUPPORTED, CONTRADICTED, or UNKNOWN.</dd></div>
          <div><dt>REPAIR</dt><dd>A concise fix for material failures.</dd></div>
          <div><dt>WATCH</dt><dd>Seven-day monitoring and a final re-read on important findings.</dd></div>
        </dl>
      </div>
      <div className="lease-card">
        <div className="lease-top"><span>EXAMPLE FINDING</span><span className="valid-pill">CONTRADICTED</span></div>
        <div className="lease-claim">The reviewed authoritative source directly conflicts with the scoped claim as written.</div>
        <div className="lease-meta"><span>CLAIM<strong>EXACT TEXT</strong></span><span>EVIDENCE<strong>PRIMARY SOURCE</strong></span><span>APPROVAL<strong className="accent-text">HUMAN</strong></span></div>
        <div className="lease-signature"><span>OUTPUT</span><code>verdict + evidence + consequence + repair</code><span className="signature-seal">✓</span></div>
      </div>
    </section>

    <section className="section shell" id="use-cases">
      <div className="section-heading"><p className="eyebrow">04 / WHO IT IS FOR</p><h2>AI answers where being confidently wrong is expensive.</h2></div>
      <div className="pricing-cards">
        <article><span className="plan-label">HIGH-CONSEQUENCE AI</span><h3>Audit answers before trust breaks.</h3><p>Legal, compliance, insurance, financial research, healthcare administration, pricing, policy, and other customer-facing AI where factual errors carry real cost.</p><a className="text-link" href="/ai-fact-checker/">AI fact checking →</a></article>
        <article><span className="plan-label">PUBLIC CLAIMS</span><h3>Pressure-test what you publish.</h3><p>Marketing numbers, product claims, research, website copy, reports, and pitch-deck assertions can be audited before somebody else checks them for you.</p><a className="text-link" href="/services/">Browse use cases →</a></article>
      </div>
    </section>

    <section className="section shell" id="trust">
      <div className="section-heading"><p className="eyebrow">05 / TRUST</p><h2>Clear limits are part of the product.</h2><p className="section-lede">ProofTTL does not claim permanent or universal truth. It records what examined evidence supports at a point in time, preserves UNKNOWN when evidence is insufficient, and does not replace legal, medical, financial, regulatory, or other professional judgment.</p></div>
      <div className="hero-actions"><a className="button button-secondary" href="/trust/">Read the Trust Center</a><a className="text-link" href="/audit/sample/">Inspect the sample audit <span>↗</span></a></div>
    </section>

    <section className="section shell final-cta">
      <p className="eyebrow">BEFORE THE OUTPUT REACHES A CUSTOMER</p>
      <h2>Find out what holds up.<br /><em>Send the real outputs.</em></h2>
      <div className="hero-actions"><a className="button button-primary" href="/audit/#audit-intake">Start the $1,500 Fact Audit <span>→</span></a><a className="button button-secondary" href="/audit/sample/">View sample</a></div>
    </section>

    <footer className="footer shell">
      <a className="footer-brand" href="#top" aria-label="ProofTTL home"><img src="/proofttl-lockup.svg" alt="ProofTTL" /></a>
      <span>ADVERSARIAL VERIFICATION FOR HIGH-CONSEQUENCE AI OUTPUTS.</span>
      <div><a href="/audit/">Fact Audit</a><a href="/services/">Services</a><a href="/audit/sample/">Sample</a><a href="/trust/">Trust</a><a href="/support/">Support</a><a href="/status/">Status</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>
    </footer>
  </main>
}
