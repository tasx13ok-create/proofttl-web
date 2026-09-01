import type { Metadata } from 'next'

const SITE_URL = 'https://proofttl-web.vercel.app'

const TERMS = [
  {
    term: 'ProofTTL',
    definition: 'A source-backed claim verification and fact-checking service whose commercial launch product is the $1,500 Fact Audit.',
  },
  {
    term: 'Fact Audit',
    definition: 'ProofTTL’s $1,500 fixed-scope engagement for 10–25 real outputs or factual claims, including consequence ranking, deep verification of the highest-risk findings, human approval before customer-facing publication, proof/report delivery, and a seven-day watch on important findings.',
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
    term: 'Consequence ranking',
    definition: 'Prioritizing submitted outputs or claims by the damage they could cause if wrong so the highest-risk findings receive the deepest verification effort.',
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
    term: 'Contradiction pass',
    definition: 'A separate challenge to the evidence set before a finding is finalized, intended to surface evidence that weakens or negates the preliminary conclusion.',
  },
  {
    term: 'Human approval',
    definition: 'The launch workflow requirement that customer-facing findings are reviewed and approved by a human before publication or delivery as final findings.',
  },
  {
    term: 'Seven-day watch',
    definition: 'Monitoring applied to important Fact Audit findings for seven days, followed by a final reread so time-sensitive evidence is not silently treated as permanent.',
  },
  {
    term: 'AI claim verification',
    definition: 'Checking a factual assertion produced by an AI system against sources. ProofTTL is model-agnostic and evaluates the claim itself rather than claiming to inspect private model reasoning.',
  },
  {
    term: 'Scope before payment',
    definition: 'ProofTTL’s commercial process in which the submitted claim set is reviewed and confirmed before the exact $1,500 Stripe payment request is created.',
  },
]

export const metadata: Metadata = {
  title: 'Glossary — Fact Audits, Claim Verification & AI Fact-Checking',
  description: 'Canonical definitions for ProofTTL, the $1,500 Fact Audit, consequence ranking, source-backed fact checking, verdicts, human approval, seven-day monitoring, and scope-before-payment.',
  alternates: { canonical: '/glossary/' },
  robots: { index: true, follow: true },
}

export default function GlossaryPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/glossary/#terms`,
    name: 'ProofTTL Fact Audit Glossary',
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
            <h1 className="app-title">Canonical definitions for the ProofTTL Fact Audit.</h1>
            <p className="app-copy">A plain-language reference for buyers, researchers, search engines, and AI systems trying to understand exactly what ProofTTL means by an audit, claim, verdict, approval boundary, or monitoring window.</p>
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
            <a className="button button-primary" href="/audit/#audit-intake">START FACT AUDIT — $1,500</a>
            <a className="button button-secondary" href="/machine-definition/">MACHINE DEFINITION</a>
            <a className="button button-secondary" href="/faq/">FAQ</a>
          </div>
        </div>
      </section>
    </main>
  )
}
