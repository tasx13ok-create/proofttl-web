import type { Metadata } from 'next'
import SharedProductHeader from '../../../components/SharedProductHeader'
import { SEARCH_INTENTS, getSearchIntent } from '../search-intents'
import styles from '../search-page.module.css'

const SITE_URL = 'https://proofttl-web.vercel.app'
type PageProps = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export function generateStaticParams() { return SEARCH_INTENTS.map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const intent = getSearchIntent(slug)
  if (!intent) return { title: 'Solutions' }
  const pageTitle = intent.title.replace(/\s*\|\s*ProofTTL\s*$/i, '')
  return { title: pageTitle, description: intent.description, alternates: { canonical: `/solutions/${intent.slug}/` }, robots: { index: true, follow: true }, openGraph: { title: `${pageTitle} | ProofTTL`, description: intent.description, url: `/solutions/${intent.slug}/`, type: 'website' } }
}

export default async function SearchIntentPage({ params }: PageProps) {
  const { slug } = await params
  const intent = getSearchIntent(slug)
  if (!intent) return <main className={styles.page}><SharedProductHeader /><div className={styles.shell}><p>Unknown ProofTTL solution.</p></div></main>
  const currentIndex = SEARCH_INTENTS.findIndex((item) => item.slug === slug)
  const related = [1, 2, 3].map((offset) => SEARCH_INTENTS[(currentIndex + offset) % SEARCH_INTENTS.length])
  const structuredData = { '@context': 'https://schema.org', '@type': 'Service', name: 'ProofTTL Fact Audit', serviceType: intent.eyebrow, description: intent.description, provider: { '@id': `${SITE_URL}/#organization` }, areaServed: 'Worldwide', offers: { '@type': 'Offer', name: 'ProofTTL Fact Audit', price: '1500', priceCurrency: 'USD', url: `${SITE_URL}/audit/#audit-intake`, availability: 'https://schema.org/InStock' } }

  return <main className={styles.page}>
    <SharedProductHeader />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <section className={`${styles.shell} ${styles.hero}`}><div><p className={styles.eyebrow}>{intent.eyebrow}</p><h1>{intent.heading}</h1><p className={styles.lede}>{intent.lede}</p></div><aside className={styles.card} aria-label="ProofTTL Fact Audit scope"><span className={styles.cardLabel}>FACT AUDIT</span><code>{`$1,500 fixed scope\n10–25 outputs or claims\nconsequence ranking\nhighest-risk deep verification\nevidence FOR and AGAINST\nhuman approval\n7-day watch`}</code></aside></section>
    <section className={`${styles.shell} ${styles.mainGrid}`}>
      <article className={styles.panel}><h2>The problem</h2><p>{intent.problem}</p></article>
      <article className={styles.panel}><h2>What the Fact Audit adds</h2><ul>{intent.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></article>
      <article className={styles.panel} style={{ gridColumn: '1 / -1' }}><h2>Example</h2><p>{intent.example}</p></article>
      <div className={styles.cta}><div><h2>Submit the real outputs first.</h2><p>No card is required for intake. ProofTTL confirms the scope before creating the exact $1,500 payment request.</p></div><div className={styles.actions}><a className={styles.secondary} href="/audit/sample/">See sample audit</a></div></div>
      <section className={styles.related} aria-labelledby="related-solutions-heading"><div className={styles.relatedHeading}><div><p className={styles.eyebrow}>RELATED USE CASES</p><h2 id="related-solutions-heading">More places teams use the Fact Audit.</h2></div><a href="/solutions/">View all solutions →</a></div><div className={styles.relatedGrid}>{related.map((item) => <a className={styles.intentCard} href={`/solutions/${item.slug}/`} key={item.slug}><span>{item.eyebrow}</span><h3>{item.heading}</h3><p>{item.description}</p></a>)}</div></section>
    </section>
    <footer className={`${styles.shell} ${styles.footer}`}>ProofTTL · $1,500 Fact Audit · human-approved findings · seven-day watch</footer>
  </main>
}
