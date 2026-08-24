export default function CommercialHome() {
  return <main>
    <section className="hero shell" id="top">
      <div className="hero-copy">
        <div className="status-line"><span className="pulse" /> SOURCE-BACKED CLAIM VERIFICATION <span className="status-rule" /> SCOPE BEFORE PAYMENT</div>
        <h1>Find the claim that breaks<br /><em>before someone else does.</em></h1>
        <p className="hero-lede">ProofTTL checks the factual claims you are about to publish, pitch, sell, or rely on against public sources — then gives you a clear SUPPORTED, CONTRADICTED, or UNKNOWN verdict with the evidence behind it.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="/audit/#audit-intake">Stress-test 3–5 claims — $129 <span>→</span></a>
          <a className="button button-secondary" href="/audit/sample/">View a sample audit</a>
          <a className="text-link" href="/how-proofttl-works/">How verification works <span>↗</span></a>
        </div>
        <div className="hero-notes"><span>48H TARGET</span><span>NO CARD TO SUBMIT</span><span>SCOPE CONFIRMED BEFORE PAYMENT</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-header"><span>CLAIM REVIEW</span><span className="live-label">● ACCEPTING INTAKES</span></div>
        <div className="pipeline">
          <div className="pipeline-node active"><span className="node-index">01</span><strong>CLAIM</strong><small>The exact factual assertion</small><code>scoped before payment</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">02</span><strong>EVIDENCE</strong><small>Public source review</small><code>inspectable links + context</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">03</span><strong>VERDICT</strong><small>What the evidence supports</small><code>SUPPORTED · CONTRADICTED · UNKNOWN</code></div>
        </div>
        <div className="visual-footer"><span>SOURCE → VERDICT → FACT LEASE</span><span>UNCERTAINTY <b>STAYS VISIBLE</b></span></div>
      </div>
    </section>

    <section className="ticker"><div className="ticker-inner"><span>AI OUTPUT</span><span>◈</span><span>MARKETING CLAIMS</span><span>◈</span><span>PITCH DECKS</span><span>◈</span><span>RESEARCH</span><span>◈</span><span>WEBSITE CLAIMS</span></div></section>

    <section className="section shell" id="offers">
      <div className="section-heading"><p className="eyebrow">01 / PRICING</p><h2>Start small. Upgrade only if you need more.</h2><p className="section-lede">You submit the claims first. ProofTTL confirms what is in scope before sending a Stripe payment request.</p></div>
      <div className="pricing-cards">
        <article>
          <span className="plan-label">CLAIM STRESS TEST</span>
          <div className="price">$129<span> one-time</span></div>
          <p>3–5 high-stakes factual claims, source-backed verdicts, evidence links, signed Fact Leases, and a target 48-hour turnaround after payment and scope confirmation.</p>
          <a className="button button-primary" href="/audit/#audit-intake">Start the $129 Stress Test</a>
        </article>
        <article className="featured-plan">
          <span className="plan-label">FULL VERIFICATION AUDIT</span>
          <div className="price">$500<span> one-time</span></div>
          <p>10–25 claims, verification report, signed Fact Leases, contradictions prioritized, and 7 days of monitoring. If you started with the Stress Test, the $129 is credited in full.</p>
          <a className="button button-primary" href="/audit/#audit-intake">Start a Full Audit</a>
        </article>
      </div>
      <p className="app-copy" style={{ marginTop: 16 }}>No subscription is required for either service. No raw card number is stored by ProofTTL; payment is handled through Stripe after scope confirmation.</p>
    </section>

    <section className="section shell" id="process">
      <div className="section-heading"><p className="eyebrow">02 / PROCESS</p><h2>You know the scope before money changes hands.</h2><p className="section-lede">The paid workflow is deliberately boring and explicit.</p></div>
      <div className="steps">
        <article><span>01</span><h3>Submit the claims</h3><p>Send the exact factual assertions, why they matter, and your deadline. No card is required.</p></article>
        <article><span>02</span><h3>Scope is confirmed</h3><p>ProofTTL confirms the claim set, source priorities, expected output, price, and turnaround.</p></article>
        <article><span>03</span><h3>Pay through Stripe</h3><p>A payment request is created only after the scope matches what you actually need.</p></article>
        <article><span>04</span><h3>Receive the evidence</h3><p>You get explicit verdicts with the public evidence used to support, contradict, or leave each claim unresolved.</p></article>
      </div>
    </section>

    <section className="section shell split-section" id="deliverable">
      <div>
        <div className="section-heading"><p className="eyebrow">03 / DELIVERABLE</p><h2>A result you can inspect, not a confidence score.</h2><p className="section-lede">Every checked claim stays tied to the evidence used for the decision.</p></div>
        <dl className="fact-list">
          <div><dt>CLAIM</dt><dd>The exact assertion being evaluated.</dd></div>
          <div><dt>SOURCE</dt><dd>The public evidence reviewed for that assertion.</dd></div>
          <div><dt>VERDICT</dt><dd>SUPPORTED, CONTRADICTED, or UNKNOWN.</dd></div>
          <div><dt>FACT LEASE</dt><dd>A signed record of the source-backed observation.</dd></div>
          <div><dt>TIME</dt><dd>When the evidence was observed and the applicable freshness window.</dd></div>
        </dl>
      </div>
      <div className="lease-card">
        <div className="lease-top"><span>EXAMPLE RESULT</span><span className="valid-pill">SUPPORTED</span></div>
        <div className="lease-claim">The reviewed source supports the scoped claim as written.</div>
        <div className="lease-meta"><span>CLAIM<strong>EXACT TEXT</strong></span><span>SOURCE<strong>PUBLIC EVIDENCE</strong></span><span>UNCERTAINTY<strong className="accent-text">VISIBLE</strong></span></div>
        <div className="lease-signature"><span>OUTPUT</span><code>verdict + evidence + signed record</code><span className="signature-seal">✓</span></div>
      </div>
    </section>

    <section className="section shell" id="use-cases">
      <div className="section-heading"><p className="eyebrow">04 / WHEN IT PAYS FOR ITSELF</p><h2>Use it on claims that become expensive when they are wrong.</h2></div>
      <div className="pricing-cards">
        <article><span className="plan-label">AI OUTPUT</span><h3>Fact-check AI-generated work.</h3><p>Verify the factual sentences from ChatGPT, Claude, Gemini, Perplexity, Copilot, RAG systems, or custom agents before they reach a customer or decision.</p><a className="text-link" href="/ai-fact-checker/">AI fact checking →</a></article>
        <article><span className="plan-label">PUBLIC CLAIMS</span><h3>Pressure-test what you publish.</h3><p>Marketing numbers, product claims, market statistics, website copy, reports, and pitch-deck assertions can be checked before somebody else checks them for you.</p><a className="text-link" href="/services/">Browse use cases →</a></article>
      </div>
    </section>

    <section className="section shell" id="trust">
      <div className="section-heading"><p className="eyebrow">05 / TRUST</p><h2>Clear limits are part of the product.</h2><p className="section-lede">ProofTTL does not claim permanent or universal truth. It records what the examined public evidence supports at a point in time, preserves UNKNOWN when evidence is insufficient, and does not replace legal, medical, financial, regulatory, or other professional judgment.</p></div>
      <div className="hero-actions"><a className="button button-secondary" href="/trust/">Read the Trust Center</a><a className="text-link" href="/audit/sample/">Inspect the sample audit <span>↗</span></a></div>
    </section>

    <section className="section shell final-cta">
      <p className="eyebrow">BEFORE THE CLAIM LEAVES YOUR HANDS</p>
      <h2>Find out what holds up.<br /><em>Start with 3–5 claims.</em></h2>
      <div className="hero-actions"><a className="button button-primary" href="/audit/#audit-intake">Start the $129 Stress Test <span>→</span></a><a className="button button-secondary" href="/audit/sample/">View sample</a></div>
    </section>

    <footer className="footer shell">
      <a className="footer-brand" href="#top" aria-label="ProofTTL home"><img src="/proofttl-lockup.svg" alt="ProofTTL" /></a>
      <span>SOURCE-BACKED CLAIM VERIFICATION BEFORE PUBLIC EXPOSURE.</span>
      <div><a href="/audit/">Verification</a><a href="/services/">Services</a><a href="/audit/sample/">Sample</a><a href="/trust/">Trust</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>
    </footer>
  </main>
}
