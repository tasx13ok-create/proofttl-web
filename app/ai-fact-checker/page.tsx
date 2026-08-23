import type { Metadata } from 'next'

const SITE_URL = 'https://proofttl-web.vercel.app'

export const metadata: Metadata = {
  title: 'AI Fact Checker — Verify Claims With Sources | ProofTTL',
  description: 'Use ProofTTL as an AI fact checker for high-stakes claims. Verify AI-generated facts against public sources and get SUPPORTED, CONTRADICTED, or UNKNOWN verdicts with evidence.',
  alternates: { canonical: '/ai-fact-checker/' },
  robots: { index: true, follow: true },
  keywords: [
    'AI fact checker',
    'fact check AI output',
    'verify AI claims with sources',
    'AI claim verification',
    'AI hallucination checker',
    'claim verification with sources',
    'source-backed fact checking',
    'ProofTTL',
  ],
  openGraph: {
    title: 'AI Fact Checker — Verify AI Claims With Sources | ProofTTL',
    description: 'Check AI-generated factual claims against public evidence before you publish, send, sell, or rely on them.',
    url: '/ai-fact-checker/',
    type: 'website',
  },
}

export default function AiFactCheckerPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/ai-fact-checker/#page`,
        url: `${SITE_URL}/ai-fact-checker/`,
        name: 'AI Fact Checker — Verify Claims With Sources',
        description: 'ProofTTL checks specific AI-generated factual claims against public sources and returns source-backed verdicts.',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/audit/#claim-verification-service` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Can ProofTTL fact-check ChatGPT, Claude, Gemini, Copilot, or Perplexity output?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. ProofTTL checks the factual claims themselves, regardless of which AI model produced the text, and compares them with accessible public evidence.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does ProofTTL give sources for each fact check?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ProofTTL is source-backed. Checked claims receive evidence links and an explicit SUPPORTED, CONTRADICTED, or UNKNOWN verdict rather than an unsupported truth score.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is ProofTTL an automatic hallucination detector?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'ProofTTL focuses on claim verification rather than generic hallucination scoring. It checks the exact factual assertion against sources and preserves UNKNOWN when the evidence is insufficient.',
            },
          },
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
            <p className="app-kicker">AI FACT CHECKER / SOURCE-BACKED VERIFICATION</p>
            <h1 className="app-title">Fact-check AI claims against sources before you rely on them.</h1>
            <p className="app-copy">ProofTTL is an AI fact checker for specific factual claims that matter. Send the claims from ChatGPT, Claude, Gemini, Copilot, Perplexity, an agent, or an AI-written document. ProofTTL checks them against accessible public evidence and returns explicit <strong>SUPPORTED</strong>, <strong>CONTRADICTED</strong>, or <strong>UNKNOWN</strong> verdicts with sources.</p>
            <div className="audit-sales-actions">
              <a className="button button-primary" href="/audit/#audit-intake">Fact-check 3–5 claims — $129 <span>→</span></a>
              <a className="button button-secondary" href="/audit/sample/">See a sample audit</a>
            </div>
          </header>

          <section className="audit-sales-proof">
            <article>
              <p className="app-kicker">VERIFY ANY HIGH-STAKES CLAIM</p>
              <h2>Check the sentence, not the vibe.</h2>
              <p className="app-copy">AI answers can sound confident even when a statistic is stale, a product feature changed, a citation does not support the sentence, or the available evidence is mixed. ProofTTL isolates the factual assertion and checks what the sources actually support.</p>
            </article>
            <article>
              <p className="app-kicker">REAL SOURCES / EXPLICIT VERDICTS</p>
              <h2>See why the claim passed or failed.</h2>
              <p className="app-copy">Each scoped fact check is tied to inspectable evidence. ProofTTL does not force a binary answer when the public record is insufficient. UNKNOWN is a valid result.</p>
            </article>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">COMMON AI FACT-CHECKING USE CASES</p>
            <div className="audit-sales-proof">
              <article><h2>AI research and reports</h2><p className="app-copy">Verify market sizes, dates, company facts, policy claims, statistics, and cited assertions before a report leaves your hands.</p></article>
              <article><h2>Sales, marketing, and product claims</h2><p className="app-copy">Check claims about competitors, pricing, features, certifications, integrations, customer counts, and performance before publication.</p></article>
              <article><h2>Decision-critical AI answers</h2><p className="app-copy">Pressure-test the few claims that could change a purchase, pitch, launch, client recommendation, or internal decision.</p></article>
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">EXAMPLE CLAIMS</p>
            <div className="audit-sales-proof">
              <article><p className="app-copy">“This vendor is SOC 2 Type II certified.”</p></article>
              <article><p className="app-copy">“This market grew 38% last year.”</p></article>
              <article><p className="app-copy">“This product supports SAML SSO on the current plan.”</p></article>
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">HOW PROOFTTL DIFFERS</p>
            <h2 className="app-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>Not another generic AI-detection score.</h2>
            <p className="app-copy">ProofTTL does not claim to detect a model's internal hallucination process. It answers the narrower, auditable question: <strong>does the available source evidence support this exact factual claim?</strong> That makes the output useful when someone else may ask you to show the evidence.</p>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">PRICING</p>
            <div className="audit-sales-proof">
              <article><h2>$129 Claim Stress Test</h2><p className="app-copy">3–5 high-stakes claims with a target 48-hour turnaround after scope confirmation and payment.</p></article>
              <article><h2>$500 Full Verification Audit</h2><p className="app-copy">10–25 claims, a verification report, signed Fact Leases, and 7 days of monitoring. The original $129 is credited if you upgrade.</p></article>
            </div>
            <div className="audit-sales-actions" style={{ marginTop: 20 }}>
              <a className="button button-primary" href="/audit/#audit-intake">Start AI fact checking <span>→</span></a>
              <a className="text-link" href="/services/ai-claim-verification/">Read AI claim verification details <span>↗</span></a>
            </div>
          </section>

          <section style={{ marginTop: 28 }}>
            <p className="app-kicker">FAQ</p>
            <div className="audit-sales-proof">
              <article><h2>Can you fact-check ChatGPT or Claude?</h2><p className="app-copy">Yes. ProofTTL checks the claim itself, so the same process works for factual output from ChatGPT, Claude, Gemini, Copilot, Perplexity, RAG systems, agents, or human-written drafts.</p></article>
              <article><h2>Do I get source links?</h2><p className="app-copy">Yes. Source-backed evidence is the point of the service. Verdicts are tied to the examined evidence instead of presented as unsupported confidence scores.</p></article>
              <article><h2>What if the sources are inconclusive?</h2><p className="app-copy">The verdict can remain UNKNOWN. ProofTTL does not manufacture certainty when the available evidence is insufficient.</p></article>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
