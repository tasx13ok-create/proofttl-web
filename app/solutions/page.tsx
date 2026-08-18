import type { Metadata } from 'next'
import { SEARCH_INTENTS } from './search-intents'
import styles from './search-page.module.css'

export const metadata: Metadata = {
  title: 'ProofTTL Solutions — Verification, Monitoring, AI Agents, x402',
  description: 'Explore ProofTTL by use case: fact verification, claim verification, AI agents, source monitoring, stale-data detection, evidence verification, and x402.',
  robots: { index: true, follow: true },
}

export default function SolutionsPage() {
  return (
    <main className={styles.page}>
      <nav className={`${styles.shell} ${styles.nav}`} aria-label="ProofTTL solutions navigation">
        <a className={styles.brand} href="/">PROOF<span>TTL</span></a>
        <div className={styles.navLinks}>
          <a href="/#api">API</a>
          <a href="/support/">Support</a>
          <a href="/console/">Console</a>
        </div>
      </nav>

      <section className={`${styles.shell} ${styles.indexHero}`}>
        <p className={styles.eyebrow}>PROOFTTL / SOLUTIONS</p>
        <h1>Verification infrastructure from the angle you actually need.</h1>
        <p>ProofTTL is one protocol: verify a precise claim against a public source, bind the result to evidence and a source fingerprint, give it a finite lifetime, and monitor it while active. These pages explain where that primitive fits different technical problems.</p>
      </section>

      <section className={`${styles.shell} ${styles.intentGrid}`} aria-label="ProofTTL use cases">
        {SEARCH_INTENTS.map((intent) => (
          <a className={styles.intentCard} href={`/solutions/${intent.slug}/`} key={intent.slug}>
            <span>{intent.eyebrow}</span>
            <h2>{intent.heading}</h2>
            <p>{intent.description}</p>
          </a>
        ))}
      </section>

      <footer className={`${styles.shell} ${styles.footer}`}>
        ProofTTL · source-backed facts with explicit lifetimes · testnet
      </footer>
    </main>
  )
}
