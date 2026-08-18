import type { Metadata } from 'next'
import { SEARCH_INTENTS, getSearchIntent } from '../search-intents'
import styles from '../search-page.module.css'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return SEARCH_INTENTS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const intent = getSearchIntent(slug)

  if (!intent) {
    return { title: 'ProofTTL Solutions' }
  }

  return {
    title: intent.title,
    description: intent.description,
    robots: { index: true, follow: true },
    openGraph: {
      title: intent.title,
      description: intent.description,
      type: 'website',
    },
  }
}

export default async function SearchIntentPage({ params }: PageProps) {
  const { slug } = await params
  const intent = getSearchIntent(slug)

  if (!intent) {
    return <main className={styles.page}><div className={styles.shell}><p>Unknown ProofTTL solution.</p></div></main>
  }

  const exampleRequest = `POST ${API_URL}/verify\n\n{\n  "claim": "${intent.example}",\n  "source_url": "https://example.com",\n  "ttl_seconds": 300\n}`

  return (
    <main className={styles.page}>
      <nav className={`${styles.shell} ${styles.nav}`} aria-label="ProofTTL solution navigation">
        <a className={styles.brand} href="/">PROOF<span>TTL</span></a>
        <div className={styles.navLinks}>
          <a href="/solutions/">Solutions</a>
          <a href="/#api">API</a>
          <a href="/support/">Support</a>
          <a href="/console/">Console</a>
        </div>
      </nav>

      <section className={`${styles.shell} ${styles.hero}`}>
        <div>
          <p className={styles.eyebrow}>{intent.eyebrow}</p>
          <h1>{intent.heading}</h1>
          <p className={styles.lede}>{intent.lede}</p>
        </div>
        <aside className={styles.card} aria-label="ProofTTL API example">
          <span className={styles.cardLabel}>EXAMPLE REQUEST</span>
          <code>{exampleRequest}</code>
        </aside>
      </section>

      <section className={`${styles.shell} ${styles.mainGrid}`}>
        <article className={styles.panel}>
          <h2>The problem</h2>
          <p>{intent.problem}</p>
        </article>

        <article className={styles.panel}>
          <h2>What ProofTTL adds</h2>
          <ul>
            {intent.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
          </ul>
        </article>

        <div className={styles.cta}>
          <div>
            <h2>Try the real ProofTTL endpoint.</h2>
            <p>The current public path is Base Sepolia testnet and uses x402 pay-per-verification.</p>
          </div>
          <div className={styles.actions}>
            <a className={styles.primary} href="/#verify">Try verifier</a>
            <a className={styles.secondary} href={`${API_URL}/openapi.json`}>OpenAPI</a>
          </div>
        </div>
      </section>

      <footer className={`${styles.shell} ${styles.footer}`}>
        ProofTTL · source-backed facts with explicit lifetimes · testnet
      </footer>
    </main>
  )
}
