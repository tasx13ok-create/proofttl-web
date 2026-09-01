import type { Metadata } from 'next'
import { SEARCH_INTENTS } from './search-intents'
import styles from './search-page.module.css'

export const metadata: Metadata = {
  title: 'ProofTTL Solutions — $1,500 Fact Audit Use Cases',
  description: 'Explore where the ProofTTL $1,500 Fact Audit fits: consequential AI outputs, pre-launch claims, due-diligence claims, and website facts.',
  alternates: { canonical: '/solutions/' },
  robots: { index: true, follow: true },
}

export default function SolutionsPage() {
  return (
    <main className={styles.page}>
      <section className={`${styles.shell} ${styles.indexHero}`}>
        <p className={styles.eyebrow}>PROOFTTL / FACT AUDIT SOLUTIONS</p>
        <h1>One audit. Different places the expensive wrong answer can hide.</h1>
        <p>ProofTTL sells one launch engagement: the $1,500 Fact Audit for 10–25 real outputs or factual claims. We rank consequence, deeply verify the highest-risk findings, require human approval before customer-facing publication, and keep important findings under watch for seven days.</p>
      </section>

      <section className={`${styles.shell} ${styles.intentGrid}`} aria-label="ProofTTL Fact Audit use cases">
        {SEARCH_INTENTS.map((intent) => (
          <a className={styles.intentCard} href={`/solutions/${intent.slug}/`} key={intent.slug}>
            <span>{intent.eyebrow}</span>
            <h2>{intent.heading}</h2>
            <p>{intent.description}</p>
          </a>
        ))}
      </section>

      <div className={`${styles.shell} ${styles.cta}`}>
        <div>
          <h2>$1,500 Fact Audit · scope confirmed before payment.</h2>
          <p>Submit the real outputs first. No card is required for intake. Customer-facing findings are delivered only after human approval.</p>
        </div>
        <div className={styles.actions}>
          <a className={styles.primary} href="/audit/#audit-intake">Start Fact Audit</a>
          <a className={styles.secondary} href="/audit/sample/">See sample audit</a>
        </div>
      </div>

      <footer className={`${styles.shell} ${styles.footer}`}>
        ProofTTL · $1,500 Fact Audit · source-backed evidence · seven-day watch
      </footer>
    </main>
  )
}
