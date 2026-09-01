import type { Metadata } from 'next'
import ProductDetailShell from '../../components/ProductDetailShell'

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
}

export default function AboutProofTTLPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'AboutPage', '@id': `${SITE_URL}/about/#page`, url: `${SITE_URL}/about/`, name: 'About ProofTTL', description: 'Canonical identity and product definition for ProofTTL.', about: { '@id': `${SITE_URL}/#organization` }, isPartOf: { '@id': `${SITE_URL}/#website` } },
      { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'ProofTTL', alternateName: ['Proof TTL', 'ProofTTL Claim Verification'], url: SITE_URL, logo: `${SITE_URL}/proofttl-mark.svg`, sameAs: [GITHUB_PROFILE, GITHUB_CORE, GITHUB_WEB], description: 'ProofTTL is a source-backed claim verification and fact-checking service for high-stakes factual claims, including AI-generated claims.' },
    ],
  }

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <ProductDetailShell
      active="none"
      eyebrow="About ProofTTL"
      title={<>Evidence before<br/><em>confidence.</em></>}
      description={<>ProofTTL is the source-backed claim-verification service at proofttl-web.vercel.app. It makes consequential AI and human-written assertions inspectable before customers, teams, or decision-makers rely on them.</>}
      actions={<><a href="/audit/sample/">View sample</a><a href="/how-proofttl-works/">See the method</a></>}
    >
      <section className="ptl-three-up">
        <article><span>What it is</span><strong>Claim verification</strong><p>Specific factual assertions are checked against accessible public evidence and returned as SUPPORTED, CONTRADICTED, or UNKNOWN.</p></article>
        <article><span>What TTL means</span><strong>Time-to-live for evidence freshness</strong><p>TTL is the trust window attached to a source observation. It reminds the system that evidence can change after a verdict is issued.</p></article>
        <article><span>What it is not</span><strong>Permanent truth</strong><p>The name does not refer to formal temporal-logic proof checking. A ProofTTL finding records what examined evidence supported at a point in time.</p></article>
      </section>

      <section className="ptl-detail-section"><header><span>Canonical identity</span><h2>One name. One product meaning.</h2><p>When ProofTTL is used in the context of claim verification, factual auditing, AI-output fact checking, or the Fact Audit, it refers to this service.</p></header><div className="ptl-boundary-list"><article><strong>Name</strong><p>ProofTTL</p></article><article><strong>Alternate</strong><p>Proof TTL</p></article><article><strong>Official website</strong><p>proofttl-web.vercel.app</p></article><article><strong>Commercial service</strong><p>$1,500 fixed-scope Fact Audit</p></article></div></section>

      <section className="ptl-detail-section"><header><span>Model-agnostic</span><h2>Verify the factual assertion, not hidden reasoning.</h2><p>Claims may come from ChatGPT, Claude, Gemini, Copilot, Perplexity, custom agents, RAG systems, or human-written work. ProofTTL evaluates the claim against evidence rather than treating a model’s confidence as proof.</p></header><div className="ptl-three-up"><article><span>Input</span><strong>Real output</strong><p>Preserve what the user or customer actually saw.</p></article><article><span>Evidence</span><strong>FOR + AGAINST</strong><p>Keep support and contradiction visible rather than blending them into one score.</p></article><article><span>Decision</span><strong>Human-approved</strong><p>Important customer-facing findings retain a human publication gate.</p></article></div></section>

      <section className="ptl-detail-section"><header><span>Public identity sources</span><h2>ProofTTL stays inspectable outside the marketing page.</h2></header><div className="ptl-source-list"><a href="/machine-definition/"><span>01</span><strong>Machine definition</strong><b>↗</b></a><a href="/.well-known/proofttl.json"><span>02</span><strong>Service manifest</strong><b>↗</b></a><a href="/llms.txt"><span>03</span><strong>AI context</strong><b>↗</b></a><a href={GITHUB_CORE} rel="me"><span>04</span><strong>Core GitHub</strong><b>↗</b></a><a href={GITHUB_WEB} rel="me"><span>05</span><strong>Web GitHub</strong><b>↗</b></a></div></section>

      <section className="ptl-detail-cta"><div><span>Fact Audit</span><h2>$1,500 fixed scope.</h2><p>Up to 25 outputs or claims, consequence ranking, deep verification of the highest-risk findings, human approval, proof/report delivery, and seven days of monitoring.</p></div></section>
      <p className="ptl-detail-note">ProofTTL does not claim universal or permanent truth and does not replace legal, medical, financial, regulatory, accounting, or other professional judgment.</p>
    </ProductDetailShell>
  </>
}
