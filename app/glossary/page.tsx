import type { Metadata } from 'next'

const SITE_URL = 'https://proofttl-web.vercel.app'

const TERMS = [
  {
    term: 'ProofTTL',
    definition: 'A source-backed claim verification and fact-checking service that checks specific factual claims against public evidence and returns explicit verdicts, evidence, and signed Fact Leases.',
  },
  {
    term: 'Claim verification',
    definition: 'The process of checking whether accessible evidence supports, contradicts, or does not establish a specific factual assertion.',
  },
  {
    term: 'Source-backed fact checking',
    definition: 'Fact checking in which the result remains attached to inspectable source evidence instead of returning only a detached score or unsupported answer.',
  },
  {
    term: 'Fact Lease',
    definition: 'A signed ProofTTL record that keeps a factual claim tied to the source observation, evidence, verdict, and time context used for verification. It records what examined evidence supported at a point in time and is not a guarantee of permanent truth.',
  },
  {
    term: 'SUPPORTED',
    definition: 'A ProofTTL verdict meaning the examined evidence supports the scoped factual claim.',
  },
  {
    term: 'CONTRADICTED',
    definition: 'A ProofTTL verdict meaning the examined evidence conflicts with the scoped factual claim.',
  },
  {
    term: 'UNKNOWN',
    definition: 'A ProofTTL verdict meaning the examined evidence is insufficient to justify SUPPORTED or CONTRADICTED. ProofTTL preserves uncertainty rather than forcing a binary result.',
  },
  {
    term: 'Claim Stress Test',
    definition: 'ProofTTL’s $129 one-time verification service for 3–5 high-stakes factual claims, targeting a 48-hour turnaround after payment and scope confirmation.',
  },
  {
    term: 'Full Verification Audit',
    definition: 'ProofTTL’s $500 one-time verification service for 10–25 claims, targeting a 3–5 business-day turnaround and including 7 days of monitoring for the scoped claims.',
  },
  {
    term: 'AI claim verification',
    definition: 'Checking a factual assertion produced by an AI system against sources. ProofTTL is model-agnostic and evaluates the claim itself rather than claiming to inspect private model reasoning.',
  },
  {
    term: 'Scope before payment',
    definition: 'ProofTTL’s commercial process in which the submitted claim set is reviewed and confirmed before a Stripe payment request is created.',
  },
]

export const metadata: Metadata = {
  title: 'Glossary — Claim Verification, Fact Leases & AI Fact-Checking',
  description: 'Canonical definitions for ProofTTL, claim verification, source-backed fact checking, Fact Leases, SUPPORTED, CONTRADICTED, UNKNOWN, AI claim verification, and paid audit services.',
  alternates: { canonical: '/glossary/' },
  robots: { index: true, follow: true },
}

export default function GlossaryPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/glossary/#terms`,
    name: 'ProofTTL Claim Verification Glossary',
    url: `${SITE_URL}/glossary/`,
    hasDefinedTerm: TERMS.map((item) => ({
      '@type': 'DefinedTerm',
      name: item.term,
      description: item.definition,
      inDefinedTermSet: `${SITE_URL}/glossary/#terms`,
    })),
  }

  return (
    <main className="app-page audit-sales-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="onboarding-wrap">
        <div className="audit-sales-card">
          <header className="audit-sales-hero">
            <p className="app-kicker">PROOFTTL / GLOSSARY</p>
            <h1 className="app-title">Canonical definitions for the ProofTTL verification system.</h1>
            <p className="app-copy">A plain-language reference for buyers, researchers, search engines, AI systems, and anyone trying to understand exactly what ProofTTL means by a claim, verdict, or Fact Lease.</p>
          </header>

          <section style={{ display: 'grid', gap: 0, marginTop: 20 }}>
            {TERMS.map((item) => (
              <article id={item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')} key={item.term} style={{ padding: '22px 0', borderTop: '1px solid rgba(148,163,184,.14)' }}>
                <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(21px,3vw,30px)' }}>{item.term}</h2>
                <p className="app-copy" style={{ margin: 0 }}>{item.definition}</p>
              </article>
            ))}
          </section>

          <div className="hero-actions" style={{ marginTop: 22 }}>
            <a className="button button-primary" href="/audit/#audit-intake">START CLAIM VERIFICATION — $129</a>
            <a className="button button-secondary" href="/machine-definition/">MACHINE DEFINITION</a>
            <a className="button button-secondary" href="/faq/">FAQ</a>
          </div>
        </div>
      </section>
    </main>
  )
}
