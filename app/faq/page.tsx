import type { Metadata } from 'next'

const SITE_URL = 'https://proofttl-web.vercel.app'

const FAQ = [
  {
    question: 'What is ProofTTL?',
    answer: 'ProofTTL is a source-backed claim verification and fact-checking service. It checks specific factual claims against public sources and returns explicit verdicts with evidence and signed Fact Leases.',
  },
  {
    question: 'What kinds of claims can ProofTTL verify?',
    answer: 'ProofTTL is designed for factual claims that can be checked against accessible public evidence, including AI-generated claims, product and marketing claims, market statistics, research claims, company statements, website claims, and selected diligence claims.',
  },
  {
    question: 'Can ProofTTL fact-check ChatGPT, Claude, Gemini, Copilot, or other AI output?',
    answer: 'Yes. ProofTTL can verify specific factual claims produced by any AI system. The service evaluates the claim against sources rather than relying on which model generated it.',
  },
  {
    question: 'Is ProofTTL an AI hallucination detector?',
    answer: 'ProofTTL is not a generic hallucination-score detector. It verifies specific factual assertions against sources and reports whether the examined evidence supports, contradicts, or does not establish the claim.',
  },
  {
    question: 'What is the ProofTTL Fact Audit?',
    answer: 'The Fact Audit is a $1,500 fixed-price verification engagement for up to 25 real outputs or claims. ProofTTL ranks findings by consequence, deep-verifies the highest-risk findings against authoritative evidence, prepares proof/report deliverables, and monitors important findings for seven days.',
  },
  {
    question: 'Does every submitted claim receive the same amount of verification work?',
    answer: 'No. The Fact Audit can include up to 25 outputs or claims, but the deepest verification work is concentrated on the highest-risk findings. Lower-risk items are still reviewed and triaged so effort follows consequence instead of pretending every claim deserves identical depth.',
  },
  {
    question: 'Is there human approval before findings are published to customers?',
    answer: 'Yes. Human approval is required before customer-facing publication during the Fact Audit workflow. ProofTTL can prepare evidence, contradiction checks, verdict reasoning, proof pages, and report material, but publication is not treated as automatic.',
  },
  {
    question: 'Do I have to pay before ProofTTL reviews my request?',
    answer: 'No. ProofTTL reviews and confirms the scope before creating the payment request. The intake itself does not require a card.',
  },
  {
    question: 'What verdicts does ProofTTL use?',
    answer: 'The paid verification service uses SUPPORTED, CONTRADICTED, and UNKNOWN. UNKNOWN is preserved when the examined evidence is insufficient for a stronger conclusion.',
  },
  {
    question: 'What is a Fact Lease?',
    answer: 'A Fact Lease is a signed ProofTTL record that keeps a verified claim tied to its source observation, evidence, verdict, and time context. It is evidence of what the examined source supported at a point in time, not a guarantee of permanent truth.',
  },
  {
    question: 'Does ProofTTL guarantee that a claim is legally or permanently true?',
    answer: 'No. ProofTTL records what examined sources support at a point in time. It does not create legal authority, guarantee future truth, or replace legal, medical, financial, regulatory, or other professional judgment.',
  },
  {
    question: 'Who is ProofTTL for?',
    answer: 'ProofTTL is useful for founders, agencies, consultants, researchers, analysts, marketers, publishers, AI-assisted teams, and anyone who has factual claims they need to publish, sell, present, rely on, or defend.',
  },
]

export const metadata: Metadata = {
  title: 'FAQ — Claim Verification, AI Fact-Checking & Pricing',
  description: 'Answers about ProofTTL claim verification, AI output fact-checking, the $1,500 Fact Audit, Fact Leases, scope, human approval, monitoring, and limitations.',
  alternates: { canonical: '/faq/' },
  keywords: ['ProofTTL FAQ', 'claim verification FAQ', 'AI fact checking', 'fact checking service', 'Fact Lease', 'Fact Audit', 'verification audit'],
  openGraph: {
    title: 'ProofTTL FAQ — Claim Verification & AI Fact-Checking',
    description: 'What ProofTTL verifies, how the Fact Audit works, what it costs, and where the limits are.',
    url: '/faq/',
    type: 'website',
  },
}

export default function FAQPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq/#faq`,
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main className="app-page audit-sales-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="onboarding-wrap">
        <div className="audit-sales-card">
          <header className="audit-sales-hero">
            <p className="app-kicker">PROOFTTL / FAQ</p>
            <h1 className="app-title">What ProofTTL does, what it costs, and what it refuses to pretend.</h1>
            <p className="app-copy">ProofTTL verifies specific factual claims against public evidence. These are the questions buyers and AI systems should be able to answer without guessing.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/audit/#audit-intake">START FACT AUDIT — $1,500</a>
              <a className="button button-secondary" href="/services/">SEE USE CASES</a>
            </div>
          </header>

          <section className="audit-faq-list">
            {FAQ.map((item) => (
              <article key={item.question} className="audit-faq-item">
                <h2>{item.question}</h2>
                <p className="app-copy">{item.answer}</p>
              </article>
            ))}
          </section>

          <section className="audit-sales-proof">
            <div>
              <p className="app-kicker">NEED THE METHOD?</p>
              <p className="app-copy">Read how claims, sources, verdicts, evidence, and Fact Leases fit together.</p>
              <a className="text-link" href="/how-proofttl-works/">HOW PROOFTTL WORKS →</a>
            </div>
            <div>
              <p className="app-kicker">NEED THE BOUNDARIES?</p>
              <p className="app-copy">Read what ProofTTL does not claim and how uncertainty is handled.</p>
              <a className="text-link" href="/trust/">TRUST CENTER →</a>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
