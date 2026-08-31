export const metadata = {
  title: 'Sample Verification Audit',
  description: 'Inspect a public ProofTTL verification sample showing source-backed verdicts, documentation drift, uncertainty handling, and the evidence behind each claim.',
  alternates: { canonical: '/audit/sample/' },
  openGraph: {
    title: 'ProofTTL Sample Verification Audit',
    description: 'See how ProofTTL pressure-tests time-sensitive claims against public primary sources before you buy.',
    url: '/audit/sample/',
    type: 'article',
  },
}

const claims = [
  ['PX-001', 'Perplexity Max costs $200/month or $2,000/year on the web app.', 'SUPPORTED', 'MEDIUM', 'Current Max help-center pricing directly supports the claim.'],
  ['PX-002', 'Perplexity Enterprise Pro costs $40 per active seat per month or $400 per year.', 'SUPPORTED', 'HIGH', 'Two current Perplexity help-center pages independently state the same Enterprise Pro pricing.'],
  ['PX-003', 'Perplexity Enterprise Max costs $325 per active seat per month or $3,250 per year.', 'SUPPORTED', 'HIGH', 'Two current Perplexity help-center pages independently state the same Enterprise Max pricing.'],
  ['PX-004', "Perplexity's current Max Search-model roster includes GPT-5.6 Sol and Claude Opus 5.", 'SUPPORTED', 'HIGH', 'The current advanced-model table lists both as Max-only Search options.'],
  ['PX-005', "Perplexity's current Pro and Max Search-model roster includes Gemini 3.1 Pro.", 'SUPPORTED', 'HIGH', 'The current advanced-model table lists Gemini 3.1 Pro on both Pro and Max.'],
  ['PX-006', "Perplexity's documentation is fully synchronized on which advanced models Max users can access.", 'CONTRADICTED', 'HIGH', 'Two current first-party help pages give different Max model examples, so the universal synchronization claim does not survive.'],
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
    <main className="app-page audit-sample-page">
      <section className="onboarding-wrap">
        <div className="onboarding-card">
          <p className="app-kicker">SAMPLE VERIFICATION AUDIT · PTTL-DEMO-PX-20260818-001</p>
          <h1 className="app-title">Watch a believable claim break.</h1>
          <p className="app-copy">This public sample reviews six time-sensitive statements in Perplexity AI&apos;s public documentation. Five survive the evidence examined. One sounds reasonable, but fails once two current first-party pages are compared.</p>

          <div className="price-preview">
            <div><p className="app-kicker">RESULTS</p><strong>5 / 1</strong><span>5 supported · 1 contradicted · 5 high-drift claims</span></div>
            <div className="app-meta">SOURCE ACCESS · AUG 18 2026</div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">CLAIM LOCKED · PX-006</p>
            <h2 className="app-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>“Perplexity&apos;s documentation is fully synchronized on which advanced models Max users can access.”</h2>
            <p className="app-copy">The important word is <strong>fully</strong>. A verifier cannot quietly weaken that into “some documentation is current.” The exact proposition has to survive.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))', gap: 12, marginTop: 16 }}>
            <article style={{ padding: 18, border: '1px solid rgba(34,197,94,.22)', borderRadius: 14, background: 'rgba(34,197,94,.035)' }}>
              <p className="app-kicker">EVIDENCE FOR / CURRENT ROSTER</p>
              <h3 style={{ margin: '8px 0' }}>S3 looks authoritative.</h3>
              <p className="app-copy" style={{ margin: 0 }}>The current advanced-model page explicitly lists current model availability and says availability can change over time. If this were the only page examined, the documentation could appear internally clean.</p>
            </article>
            <article style={{ padding: 18, border: '1px solid rgba(248,113,113,.28)', borderRadius: 14, background: 'rgba(248,113,113,.04)' }}>
              <p className="app-kicker">EVIDENCE AGAINST / CONTRADICTION PASS</p>
              <h3 style={{ margin: '8px 0' }}>S4 breaks the universal claim.</h3>
              <p className="app-copy" style={{ margin: 0 }}>Another current first-party Pro help article references different Max model examples. Both pages can exist while the broad “fully synchronized” proposition is false.</p>
            </article>
          </div>

          <div className="onboarding-card" style={{ marginTop: 16, borderColor: 'rgba(248,113,113,.28)' }}>
            <p className="app-kicker">VERDICT BROKEN</p>
            <h2 className="app-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)' }}>CONTRADICTED</h2>
            <p className="app-copy">The contradiction is narrow: the inspected documentation is not fully synchronized. This does not imply that Perplexity&apos;s product is defective, that every help page is stale, or that either page was false when originally written. ProofTTL keeps the verdict attached to the exact claim.</p>
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
            <p className="app-kicker">WHY TTL MATTERS</p>
            <h2 style={{ margin: '8px 0' }}>Supported is not the same as permanently true.</h2>
            <p className="app-copy">Pricing, model rosters, connector counts, policies, limits, certifications, and product capabilities can change after a check is completed. This sample therefore records the source-access date instead of silently presenting a time-sensitive conclusion as timeless.</p>
            <div className="app-table" style={{ marginTop: 14 }}>
              <div className="app-table-row"><span>OBSERVED</span><span>AUG 18 2026</span><span>POINT-IN-TIME</span></div>
              <div className="app-table-row"><span>VOLATILITY</span><span>Pricing + model availability can change quickly.</span><span>HIGH</span></div>
              <div className="app-table-row"><span>INVALIDATE WHEN</span><span>A cited page changes, disappears, or a newer authoritative page supersedes the observed evidence.</span><span>RECHECK</span></div>
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">METHODOLOGY</p>
            <p className="app-copy">Claims are written precisely before review. Suitable primary sources are preferred. A company page supporting its own statement is recorded as first-party source support, not independent proof of broad real-world performance. Evidence that weakens the preliminary conclusion is preserved rather than hidden. CONTRADICTED is reserved for evidence that negates the precise claim, and UNKNOWN remains available when the examined record cannot justify a stronger verdict.</p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">SOURCE INDEX</p>
            <div className="app-table">
              {sources.map(([id, title, href]) => (
                <div className="app-table-row" key={id}>
                  <span>{id}</span><span>{title}</span><span><a href={href} target="_blank" rel="noreferrer">SOURCE ↗</a></span>
                </div>
              ))}
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">PUT YOUR OWN OUTPUTS UNDER PRESSURE</p>
            <p className="app-copy">The $1,500 Fact Audit accepts 10–25 outputs or claims. ProofTTL decomposes the material into atomic claims, ranks consequence, deeply verifies the highest-risk findings with authoritative FOR/AGAINST evidence and a contradiction pass, requires human approval before customer-facing publication, produces proof/report deliverables, and monitors important findings for seven days before the final reread.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/audit/">START THE $1,500 FACT AUDIT →</a>
              <a className="button button-secondary" href="/faq/">READ THE FACT AUDIT FAQ</a>
            </div>
          </div>

          <p className="app-note">Public demonstration only. This is not a commissioned audit of Perplexity, an endorsement, an accusation, or legal, financial, medical, regulatory, certification, or compliance advice. No Fact Lease IDs or cryptographic signatures are displayed until those records are actually issued by the live verifier.</p>
        </div>
      </section>
    </main>
  )
}