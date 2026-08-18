export const metadata = {
  title: 'Sample Verification Audit - ProofTTL',
  description: 'A public ProofTTL demonstration showing source-backed verification and documentation drift using Perplexity AI public product documentation.',
}

const claims = [
  ['PX-001', 'Perplexity Max costs $200/month or $2,000/year on the web app.', 'SUPPORTED', 'MEDIUM', 'Current Max help-center pricing directly supports the claim.'],
  ['PX-002', 'Perplexity Enterprise Pro costs $40 per active seat per month or $400 per year.', 'SUPPORTED', 'HIGH', 'Two current Perplexity help-center pages independently state the same Enterprise Pro pricing.'],
  ['PX-003', 'Perplexity Enterprise Max costs $325 per active seat per month or $3,250 per year.', 'SUPPORTED', 'HIGH', 'Two current Perplexity help-center pages independently state the same Enterprise Max pricing.'],
  ['PX-004', "Perplexity's current Max Search-model roster includes GPT-5.6 Sol and Claude Opus 5.", 'SUPPORTED', 'HIGH', 'The current advanced-model table lists both as Max-only Search options.'],
  ['PX-005', "Perplexity's current Pro and Max Search-model roster includes Gemini 3.1 Pro.", 'SUPPORTED', 'HIGH', 'The current advanced-model table lists Gemini 3.1 Pro on both Pro and Max.'],
  ['PX-006', "Perplexity's documentation is fully synchronized on which advanced models Max users can access.", 'CONTRADICTED', 'HIGH', 'The current advanced-model page and another current Pro help article reference different Max model examples.'],
]

const sources = [
  ['S1', 'Perplexity Max - Help Center', 'https://www.perplexity.ai/help-center/en/articles/11680686-perplexity-max'],
  ['S2', 'Enterprise Pricing and Billing FAQ', 'https://www.perplexity.ai/help-center/en/articles/10352986-enterprise-pricing-and-billing-frequently-asked-questions'],
  ['S3', 'Advanced AI models included in subscription', 'https://www.perplexity.ai/help-center/en/articles/10354919-what-advanced-ai-models-are-included-in-my-subscription'],
  ['S4', 'What is Perplexity Pro?', 'https://www.perplexity.ai/help-center/en/articles/9385876-what-is-perplexity-pro'],
  ['S5', 'Perplexity Enterprise Onboarding Guide', 'https://www.perplexity.ai/help-center/en/articles/12742827-perplexity-enterprise-onboarding-guide'],
]

export default function SampleAuditPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <span className="app-meta">PUBLIC DEMONSTRATION · REPORT PTTL-DEMO-PX-20260818-001</span>
      </div>

      <section className="onboarding-wrap">
        <div className="onboarding-card">
          <p className="app-kicker">SAMPLE VERIFICATION AUDIT</p>
          <h1 className="app-title">Verification that doesn&apos;t go stale.</h1>
          <p className="app-copy">
            This public sample reviews six time-sensitive statements in Perplexity AI&apos;s public documentation. It demonstrates how ProofTTL separates current source support from documentation drift instead of treating a fact as permanently valid.
          </p>

          <div className="price-preview">
            <div><p className="app-kicker">RESULTS</p><strong>5 / 1</strong><span>5 supported · 1 contradicted · 5 high-drift claims</span></div>
            <div className="app-meta">SOURCE ACCESS · AUG 18 2026</div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">HEADLINE FINDING</p>
            <h2 className="app-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>A once-correct product fact can become unsafe to reuse.</h2>
            <p className="app-copy">
              Perplexity&apos;s current advanced-model page says model availability changes over time and lists GPT-5.6 Sol and Claude Opus 5 for Max. Another current Pro help article still references o3-Pro and Claude 4.5 Opus for Max users. The problem is not that a historical statement had to be false when written. The problem is that rapidly changing product facts need an explicit validity window.
            </p>
          </div>

          <div className="app-table" aria-label="Sample audit claim results" style={{ marginTop: 24 }}>
            {claims.map(([id, claim, verdict, risk, evidence]) => (
              <div className="app-table-row" key={id}>
                <span>{id}<br /><strong>{verdict}</strong> · {risk}</span>
                <span><strong>{claim}</strong><br />{evidence}</span>
                <span>{verdict === 'SUPPORTED' ? '✓' : '!'}</span>
              </div>
            ))}
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">WHY THIS MATTERS</p>
            <p className="app-copy">
              Pricing, model availability, connector counts, policies, limits, and product capabilities are copied into RAG systems, support answers, sales material, internal research, and automated workflows. ProofTTL is designed to bind those claims to their evidence and a defined lifetime so stale information can be rechecked before it quietly becomes operational truth.
            </p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">METHODOLOGY</p>
            <p className="app-copy">
              Claims are written precisely before review. Primary sources are preferred. A company page supporting its own statement is recorded as source support, not independent proof of broad real-world performance. CONTRADICTED is reserved for evidence that directly negates the precise claim. This sample is intentionally narrow and does not claim exhaustive product accuracy.
            </p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">SOURCE INDEX</p>
            <div className="app-table">
              {sources.map(([id, title, href]) => (
                <div className="app-table-row" key={id}>
                  <span>{id}</span>
                  <span>{title}</span>
                  <span><a href={href} target="_blank" rel="noreferrer">SOURCE ↗</a></span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-actions">
            <a className="button button-primary" href="/audit/">START A $500 AUDIT →</a>
            <a className="button button-secondary" href="/docs/">HOW PROOFTTL WORKS</a>
          </div>

          <p className="app-note">
            Public demonstration only. This is not a commissioned audit of Perplexity, an endorsement, an accusation, or legal, financial, medical, regulatory, certification, or compliance advice. No Fact Lease IDs or cryptographic signatures are displayed until those records are actually issued by the live verifier.
          </p>
        </div>
      </section>
    </main>
  )
}
