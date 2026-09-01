import type { Metadata } from 'next'
import ClaimStressTestClient from '../../components/ClaimStressTestClient'
import SharedProductHeader from '../../components/SharedProductHeader'

const SITE_URL = 'https://proofttl-web.vercel.app'

export const metadata: Metadata = {
  title: 'Free Claim Preflight — Find Claims Worth Verifying',
  description: 'Paste AI output, research, or a report. ProofTTL identifies concrete factual claims worth carrying into the $1,500 Fact Audit for source-backed verification.',
  alternates: { canonical: '/stress-test/' },
  robots: { index: true, follow: true },
  keywords: ['claim preflight', 'AI claim checker', 'find factual claims', 'verify AI output', 'fact check AI report', 'claim verification', 'source-backed verification', 'ProofTTL Fact Audit'],
  openGraph: { title: 'ProofTTL Claim Preflight — Find the Claims That Matter', description: 'Turn a long AI answer or report into a ranked set of factual claims worth carrying into a source-backed Fact Audit.', url: '/stress-test/', type: 'website' },
}

export default function StressTestPage() {
  const structuredData = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'ProofTTL Claim Preflight', url: `${SITE_URL}/stress-test/`, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: 'A browser-based preflight that identifies concrete factual claims in pasted text and helps users select up to 25 outputs or claims for Fact Audit scope review.', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Claim identification preflight. The source-backed Fact Audit is a separate $1,500 engagement.' } }

  return <main className="app-page audit-sales-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <SharedProductHeader />
    <section className="onboarding-wrap"><div className="audit-sales-card">
      <header className="audit-sales-hero"><p className="app-kicker">FREE PREFLIGHT / CLAIM SELECTION</p><h1 className="app-title">What are you about to trust?</h1><p className="app-copy">Paste an AI answer, research draft, vendor write-up, pitch material, or report. ProofTTL will pull out the concrete factual statements most worth putting under pressure so you can choose the outputs or claims that deserve independent verification.</p><div className="audit-sales-trustline"><span>NO ACCOUNT FOR PREFLIGHT</span><span>LOCAL CLAIM IDENTIFICATION</span><span>NO FAKE TRUTH SCORE</span></div></header>
      <section className="audit-preflight-panel"><ClaimStressTestClient /></section>
      <section className="audit-sales-proof"><article><p className="app-kicker">WHAT THIS DOES</p><h2>Find the sentences carrying risk.</h2><p className="app-copy">The preflight looks for concrete assertions with signals such as quantities, dates, company or product facts, research claims, certifications, and time-sensitive language. It helps reduce a long document to the claims most worth investigating.</p></article><article><p className="app-kicker">WHAT THIS DOES NOT DO</p><h2>It does not call a claim true.</h2><p className="app-copy">Candidate ranking is not verification. ProofTTL does not issue SUPPORTED, CONTRADICTED, or UNKNOWN until the claim has been checked against evidence within a defined scope.</p></article></section>
      <section className="audit-preflight-standard"><p className="app-kicker">THE PROOFTTL STANDARD</p><h2 className="app-title" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}>Make the claim survive evidence.</h2><p className="app-copy">The direction is deliberately narrower than generic AI confidence scoring: freeze the proposition, inspect real sources, preserve contradictions and uncertainty, and make the resulting verification record something another person can challenge.</p><div className="audit-sales-actions" style={{ marginTop: 18 }}><a className="button button-secondary" href="/audit/sample/">Inspect a sample audit</a><a className="text-link" href="/how-proofttl-works/">See how ProofTTL works →</a></div></section>
      <p className="app-note audit-limit-note">The free preflight is a claim-selection aid, not an automated verdict engine. It intentionally avoids presenting heuristic ranking as factual verification.</p>
    </div></section>
  </main>
}
