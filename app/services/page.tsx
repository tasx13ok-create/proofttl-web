import type { Metadata } from 'next'
import { SERVICE_INTENTS } from './service-intents'
import styles from '../solutions/search-page.module.css'

export const metadata: Metadata = {
  title: 'Claim Verification & Fact-Checking Services',
  description: 'ProofTTL verifies AI-generated claims, marketing claims, research claims, startup claims, website claims, and other high-stakes factual assertions against public primary sources.',
  alternates: { canonical: '/services/' },
  keywords: ['claim verification service', 'fact checking service', 'AI claim verification', 'AI fact checking', 'source-backed fact checking', 'factual claim audit', 'pre-publication fact checking'],
  openGraph: {
    title: 'ProofTTL Claim Verification & Fact-Checking Services',
    description: 'A fixed-price $1,500 Fact Audit for up to 25 real outputs or factual claims. Scope is confirmed before payment.',
    url: '/services/',
    type: 'website',
  },
}

export default function ServicesPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ProofTTL claim verification and fact-checking services',
    itemListElement: SERVICE_INTENTS.map((intent, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://proofttl-web.vercel.app/services/${intent.slug}/`,
      name: intent.title.replace(' | ProofTTL', ''),
    })),
  }

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={`${styles.shell} ${styles.indexHero}`}>
        <p className={styles.eyebrow}>PROOFTTL / VERIFICATION SERVICES</p>
        <h1>Bring the risky claim. Get the source-backed answer.</h1>
        <p>ProofTTL is a claim verification and fact-checking service for factual assertions that need to survive scrutiny. We check scoped claims against public primary sources and return explicit verdicts, evidence, and signed Fact Leases.</p>
      </section>

      <div className={`${styles.shell} ${styles.cta}`}>
        <div>
          <h2>Fact Audit · $1,500 fixed price · up to 25 outputs or claims.</h2>
          <p>No card to submit. Send the real outputs first; ProofTTL confirms fit and scope before sending the fixed-price payment request.</p>
        </div>
        <div className={styles.actions}>
          <a className={styles.primary} href="/audit/#audit-intake">Start Fact Audit</a>
          <a className={styles.secondary} href="/audit/sample/">See sample audit</a>
        </div>
      </div>

      <section className={`${styles.shell} ${styles.intentGrid}`} aria-label="ProofTTL verification use cases">
        {SERVICE_INTENTS.map((intent) => (
          <a className={styles.intentCard} href={`/services/${intent.slug}/`} key={intent.slug}>
            <span>{intent.eyebrow}</span>
            <h2>{intent.heading}</h2>
            <p>{intent.description}</p>
          </a>
        ))}
      </section>

      <section className={`${styles.shell} ${styles.mainGrid}`}>
        <article className={styles.panel}>
          <h2>What ProofTTL is</h2>
          <p>A source-backed verification service for specific factual claims. The service is useful when a claim is about to be published, sold, presented, relied on, or defended.</p>
        </article>
        <article className={styles.panel}>
          <h2>What ProofTTL is not</h2>
          <p>It is not a generic “truth score,” a legal opinion, or a promise that a fact will remain true forever. If the examined evidence is insufficient, the verdict remains UNKNOWN.</p>
        </article>
      </section>

      <footer className={`${styles.shell} ${styles.footer}`}>
        ProofTTL · claim verification · source-backed fact checking · signed Fact Leases
      </footer>
    </main>
  )
}
