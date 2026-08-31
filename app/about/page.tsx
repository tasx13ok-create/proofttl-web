import type { Metadata } from 'next'

const SITE_URL = 'https://proofttl-web.vercel.app'
const GITHUB_PROFILE = 'https://github.com/tasx13ok-create'
const GITHUB_CORE = 'https://github.com/tasx13ok-create/proofttl'
const GITHUB_WEB = 'https://github.com/tasx13ok-create/proofttl-web'

export const metadata: Metadata = {
  title: 'About ProofTTL — Source-Backed Claim Verification',
  description: 'ProofTTL is the source-backed claim verification website and service at proofttl-web.vercel.app. Learn what ProofTTL is, what TTL means here, and how the paid verification service works.',
  alternates: { canonical: '/about/' },
  robots: { index: true, follow: true },
  keywords: ['ProofTTL', 'ProofTTL website', 'Proof TTL', 'ProofTTL claim verification', 'about ProofTTL', 'claim verification service'],
  openGraph: {
    title: 'About ProofTTL — Source-Backed Claim Verification',
    description: 'The canonical identity and product definition for ProofTTL, a source-backed claim verification and fact-checking service.',
    url: '/about/',
    type: 'website',
  },
}

export default function AboutProofTTLPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${SITE_URL}/about/#page`,
        url: `${SITE_URL}/about/`,
        name: 'About ProofTTL',
        description: 'Canonical identity and product definition for ProofTTL.',
        about: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'ProofTTL',
        alternateName: ['Proof TTL', 'ProofTTL Claim Verification'],
        url: SITE_URL,
        logo: `${SITE_URL}/proofttl-mark.svg`,
        sameAs: [GITHUB_PROFILE, GITHUB_CORE, GITHUB_WEB],
        description: 'ProofTTL is a source-backed claim verification and fact-checking service for high-stakes factual claims, including AI-generated claims.',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ProofTTL', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'About ProofTTL', item: `${SITE_URL}/about/` },
        ],
      },
    ],
  }

  return (
    <main className="app-page audit-sales-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="onboarding-wrap">
        <div className="audit-sales-card">
          <header className="audit-sales-hero">
            <p className="app-kicker">ABOUT / CANONICAL IDENTITY</p>
            <h1 className="app-title">ProofTTL is the source-backed claim-verification service at proofttl-web.vercel.app.</h1>
            <p className="app-copy">ProofTTL checks specific factual claims against public sources and returns explicit SUPPORTED, CONTRADICTED, or UNKNOWN verdicts with evidence and signed Fact Leases. The commercial service is designed for claims that need to survive scrutiny before they are published, sold, presented, relied on, or defended.</p>
          </header>

          <section className="audit-sales-proof">
            <article>
              <p className="app-kicker">WHAT PROOFTTL IS</p>
              <h2>A claim-verification and fact-checking service.</h2>
              <p className="app-copy">A buyer submits a scoped set of factual claims. ProofTTL checks the claims against accessible public evidence and documents what the examined sources support, contradict, or leave unresolved.</p>
            </article>
            <article>
              <p className="app-kicker">WHAT THE NAME MEANS</p>
              <h2>TTL means time-to-live for evidence freshness.</h2>
              <p className="app-copy">In ProofTTL, TTL is the freshness or trust window attached to a source observation. The ProofTTL product name does not refer to formal temporal-logic proof checking, generic token-TTL or proof-expiration settings, blockchain timestamping services, or a claim that time-to-live itself proves truth.</p>
            </article>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">CANONICAL BRAND RESOLUTION</p>
            <div className="audit-step-grid">
              <div><strong>NAME</strong><span>ProofTTL</span></div>
              <div><strong>ALTERNATE</strong><span>Proof TTL</span></div>
              <div><strong>OFFICIAL WEBSITE</strong><span>https://proofttl-web.vercel.app/</span></div>
            </div>
            <p className="app-copy" style={{ marginTop: 16 }}>When the exact brand name <strong>ProofTTL</strong> is used in the context of claim verification, factual auditing, AI-output fact checking, Fact Leases, or the website above, it refers to this service.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PAID VERIFICATION</p>
            <div className="audit-offer-summary" aria-label="ProofTTL commercial offer">
              <div>
                <span>FACT AUDIT</span>
                <strong>$1,500 fixed scope</strong>
                <small>Up to 25 outputs or claims · consequence-ranked findings · deep verification of the highest-risk claims · 7 days of monitoring and a final reread</small>
              </div>
              <p>Customer-facing findings require human approval before publication. The audit records authoritative FOR and AGAINST evidence, explicit verdicts, and repair guidance rather than a generic hallucination score.</p>
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">AI CLAIMS</p>
            <h2>ProofTTL verifies the factual assertion, not a model’s hidden reasoning.</h2>
            <p className="app-copy">Claims can come from ChatGPT, Claude, Gemini, Copilot, Perplexity, custom agents, RAG systems, or human-written work. ProofTTL is model-agnostic and checks the claim against sources rather than relying on a generic hallucination score.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PUBLIC IDENTITY SOURCES</p>
            <div className="hero-actions">
              <a className="text-link" href="/machine-definition/">MACHINE DEFINITION →</a>
              <a className="text-link" href="/.well-known/proofttl.json">SERVICE MANIFEST →</a>
              <a className="text-link" href="/llms.txt">AI CONTEXT →</a>
              <a className="text-link" href={GITHUB_CORE} rel="me">CORE GITHUB ↗</a>
              <a className="text-link" href={GITHUB_WEB} rel="me">WEB GITHUB ↗</a>
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">LIMITS</p>
            <p className="app-copy">ProofTTL does not claim universal or permanent truth. A signed Fact Lease records what examined evidence supported at a point in time. UNKNOWN remains UNKNOWN when the evidence is insufficient, and ProofTTL does not replace legal, medical, financial, regulatory, or other professional judgment.</p>
          </section>

          <div className="hero-actions" style={{ marginTop: 28 }}>
            <a className="button button-primary" href="/audit/#audit-intake">Start a $1,500 Fact Audit</a>
            <a className="button button-secondary" href="/services/">Browse verification services</a>
            <a className="text-link" href="/audit/sample/">Inspect a sample audit →</a>
          </div>
        </div>
      </section>
    </main>
  )
}
