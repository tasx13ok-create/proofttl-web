export default function CommercialHome() {
  return <main className="ptl-home">
    <section className="ptl-hero shell" id="top">
      <div className="ptl-hero-copy">
        <div className="ptl-orbit-badge"><span className="ptl-live-dot" /> ProofTTL Fact Audit <span>•</span> accepting intakes</div>
        <h1>Ship AI answers you can <em>defend.</em></h1>
        <p className="ptl-hero-lede">ProofTTL pressure-tests the real outputs your users see, isolates the highest-consequence claims, verifies them against authoritative evidence, and returns a human-approved audit trail.</p>
        <div className="ptl-hero-actions">
          <a className="ptl-primary-cta" href="/audit/#audit-intake"><span>Start the $1,500 Fact Audit</span><b>↗</b></a>
          <a className="ptl-secondary-cta" href="/audit/sample/"><span>View sample audit</span><b>→</b></a>
        </div>
        <div className="ptl-hero-trust">
          <span>Up to 25 outputs</span>
          <span>Scope before payment</span>
          <span>Human approval</span>
          <span>7-day watch</span>
        </div>
      </div>

      <div className="ptl-command-card" aria-label="ProofTTL verification workflow preview">
        <div className="ptl-card-topbar"><div><span className="ptl-window-dot" /><span className="ptl-window-dot" /><span className="ptl-window-dot" /></div><strong>Verification workspace</strong><span className="ptl-secure-chip">Live</span></div>
        <div className="ptl-command-body">
          <div className="ptl-command-title"><span>Current audit</span><strong>Customer-facing AI answer</strong><small>Consequence ranked · authoritative evidence</small></div>
          <div className="ptl-signal-grid">
            <article><span>01</span><small>Claim</small><strong>Atomic assertion isolated</strong><em>ready</em></article>
            <article><span>02</span><small>Evidence</small><strong>FOR / AGAINST reviewed</strong><em>running</em></article>
            <article><span>03</span><small>Verdict</small><strong>Human approval required</strong><em>gated</em></article>
          </div>
          <div className="ptl-verdict-preview">
            <div className="ptl-verdict-head"><span>Finding preview</span><b>CONTRADICTED</b></div>
            <p>The reviewed primary source conflicts with the scoped claim as written.</p>
            <div className="ptl-verdict-meta"><span><small>Evidence</small><strong>Primary source</strong></span><span><small>Confidence</small><strong>Explicit</strong></span><span><small>Publication</small><strong>Human gated</strong></span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="ptl-proof-strip"><div className="shell"><span>AI outputs</span><i>•</i><span>Legal + compliance</span><i>•</i><span>Financial research</span><i>•</i><span>Healthcare admin</span><i>•</i><span>Public claims</span></div></section>

    <section className="ptl-section shell" id="offers">
      <div className="ptl-section-heading"><span className="ptl-section-number">01</span><div><p>Flagship offer</p><h2>One audit. One price. No maze.</h2><span>Send the outputs. ProofTTL confirms fit and scope before payment.</span></div></div>
      <div className="ptl-bento ptl-offer-bento">
        <article className="ptl-feature-card ptl-feature-card-primary">
          <div className="ptl-card-label">Fact Audit</div>
          <div className="ptl-price-row"><strong>$1,500</strong><span>fixed price</span></div>
          <p>Up to 25 real outputs or claims, consequence ranking, deep verification of the highest-risk findings, authoritative FOR / AGAINST evidence, contradiction checks, human-approved proof artifacts, and seven days of monitoring.</p>
          <a href="/audit/#audit-intake">Submit outputs <span>↗</span></a>
        </article>
        <article className="ptl-feature-card">
          <div className="ptl-card-icon">⌁</div><div className="ptl-card-label">Evidence chain</div><h3>Every verdict stays inspectable.</h3><p>Exact claim, primary evidence, verdict logic, uncertainty, consequence, and recommended repair.</p><a href="/audit/sample/">Inspect sample <span>→</span></a>
        </article>
        <article className="ptl-feature-card">
          <div className="ptl-card-icon">◎</div><div className="ptl-card-label">Conservative by design</div><h3>UNKNOWN stays UNKNOWN.</h3><p>ProofTTL does not force incomplete evidence into a confident answer just to make the report look cleaner.</p><a href="/how-proofttl-works/">Read the method <span>→</span></a>
        </article>
      </div>
    </section>

    <section className="ptl-section shell" id="process">
      <div className="ptl-section-heading"><span className="ptl-section-number">02</span><div><p>Verification flow</p><h2>Built like an operating system for factual risk.</h2><span>Automation does the heavy lifting. Human approval controls publication.</span></div></div>
      <div className="ptl-process-rail">
        <article><span>01</span><div><small>Input</small><h3>Send real outputs</h3><p>Up to 25 outputs or claims your users actually see.</p></div></article>
        <article><span>02</span><div><small>Risk</small><h3>Rank the damage</h3><p>Deep verification goes to the failures that matter most.</p></div></article>
        <article><span>03</span><div><small>Evidence</small><h3>Run both sides</h3><p>Authoritative evidence FOR, AGAINST, and contradiction checks.</p></div></article>
        <article><span>04</span><div><small>Output</small><h3>Approve + watch</h3><p>Deliver the proof artifact, then monitor important findings for seven days.</p></div></article>
      </div>
    </section>

    <section className="ptl-section shell ptl-deliverable" id="deliverable">
      <div className="ptl-section-heading"><span className="ptl-section-number">03</span><div><p>Deliverable</p><h2>A finding that survives inspection.</h2><span>Not a confidence score floating in space — a complete evidence-backed record.</span></div></div>
      <div className="ptl-audit-preview">
        <div className="ptl-audit-preview-sidebar">
          <span className="active">Overview</span><span>Claim</span><span>Evidence</span><span>Contradiction</span><span>Repair</span><span>Watch</span>
        </div>
        <div className="ptl-audit-preview-main">
          <div className="ptl-preview-header"><div><small>Finding 03 / 12</small><h3>Claim conflicts with current authoritative guidance.</h3></div><b>CONTRADICTED</b></div>
          <div className="ptl-evidence-stack">
            <article><span>Claim</span><p>The exact assertion being evaluated, preserved word-for-word.</p></article>
            <article><span>Evidence</span><p>Authoritative sources tested both for support and against the claim.</p></article>
            <article><span>Repair</span><p>A concise customer-ready correction for the material failure.</p></article>
          </div>
          <div className="ptl-preview-footer"><span>Human approved</span><span>7-day monitoring enabled</span><span>Evidence timestamped</span></div>
        </div>
      </div>
    </section>

    <section className="ptl-section shell" id="use-cases">
      <div className="ptl-section-heading"><span className="ptl-section-number">04</span><div><p>Best fit</p><h2>For answers where “probably right” is expensive.</h2></div></div>
      <div className="ptl-use-grid">
        <article><span>01</span><h3>High-consequence AI</h3><p>Legal, compliance, insurance, financial research, healthcare administration, pricing, and policy systems.</p></article>
        <article><span>02</span><h3>Public claims</h3><p>Marketing numbers, reports, research, website copy, and pitch-deck assertions before somebody else checks them.</p></article>
        <article><span>03</span><h3>Client-facing agencies</h3><p>Teams shipping AI-generated work where one wrong output can become a client problem immediately.</p></article>
      </div>
    </section>

    <section className="ptl-section shell ptl-trust-panel" id="trust">
      <div><span className="ptl-card-label">Trust by constraint</span><h2>Clear limits are part of the product.</h2><p>ProofTTL records what examined evidence supports at a point in time. It preserves UNKNOWN when evidence is insufficient and does not replace legal, medical, financial, regulatory, or other professional judgment.</p></div>
      <div className="ptl-trust-actions"><a href="/trust/">Trust Center <span>↗</span></a><a href="/audit/sample/">Sample audit <span>→</span></a></div>
    </section>

    <section className="ptl-final shell">
      <div><span>Ready when your outputs are.</span><h2>Find the expensive wrong answer first.</h2><p>Fixed-scope $1,500 Fact Audit · up to 25 outputs · scope before payment.</p></div>
      <a href="/audit/#audit-intake">Start Fact Audit <span>↗</span></a>
    </section>

    <footer className="ptl-footer shell">
      <a href="#top" aria-label="ProofTTL home"><img src="/proofttl-lockup.svg" alt="ProofTTL" /></a>
      <p>Adversarial verification for high-consequence AI outputs.</p>
      <div><a href="/audit/">Fact Audit</a><a href="/services/">Services</a><a href="/audit/sample/">Sample</a><a href="/trust/">Trust</a><a href="/support/">Support</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>
    </footer>
  </main>
}
