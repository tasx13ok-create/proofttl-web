import type { Metadata } from 'next'
import { SERVICE_INTENTS, getServiceIntent } from '../service-intents'
import styles from '../../solutions/search-page.module.css'

const SITE_URL = 'https://proofttl-web.vercel.app'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return SERVICE_INTENTS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const intent = getServiceIntent(slug)
  if (!intent) return { title: 'ProofTTL Verification Services' }

  return {
    title: intent.title,
    description: intent.description,
    alternates: { canonical: `/services/${intent.slug}/` },
    keywords: [intent.eyebrow.toLowerCase(), 'claim verification service', 'fact checking service', 'source-backed verification', 'ProofTTL', 'factual claim audit'],
    robots: { index: true, follow: true },
    openGraph: {
      title: intent.title,
      description: intent.description,
      url: `/services/${intent.slug}/`,
      type: 'website',
    },
  }
}

export default async function ServiceIntentPage({ params }: PageProps) {
  const { slug } = await params
  const intent = getServiceIntent(slug)
  if (!intent) return <main className={styles.page}><div className={styles.shell}><p>Unknown ProofTTL service.</p></div></main>

  const currentIndex = SERVICE_INTENTS.findIndex((item) => item.slug === slug)
  const related = [1, 2, 3].map((offset) => SERVICE_INTENTS[(currentIndex + offset) % SERVICE_INTENTS.length])
  const pageUrl = `${SITE_URL}/services/${intent.slug}/`

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: intent.title.replace(' | ProofTTL', ''),
        serviceType: intent.eyebrow.replaceAll('_', ' '),
        description: intent.description,
        url: pageUrl,
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: 'Worldwide',
        offers: [
          { '@type': 'Offer', name: 'ProofTTL Claim Stress Test', price: '129', priceCurrency: 'USD', url: `${SITE_URL}/audit/#audit-intake`, availability: 'https://schema.org/InStock' },
          { '@type': 'Offer', name: 'ProofTTL Full Verification Audit', price: '500', priceCurrency: 'USD', url: `${SITE_URL}/audit/#audit-intake`, availability: 'https://schema.org/InStock' },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: intent.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ProofTTL', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Verification Services', item: `${SITE_URL}/services/` },
          { '@type': 'ListItem', position: 3, name: intent.eyebrow, item: pageUrl },
        ],
      },
    ],
  }

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={`${styles.shell} ${styles.hero}`}>
        <div>
          <p className={styles.eyebrow}>{intent.eyebrow}</p>
          <h1>{intent.heading}</h1>
          <p className={styles.lede}>{intent.lede}</p>
        </div>
        <aside className={styles.card} aria-label="ProofTTL verification service pricing">
          <span className={styles.cardLabel}>START SMALL / UPGRADE LATER</span>
          <code>{`$129 CLAIM STRESS TEST\n3–5 high-stakes claims\n48-hour turnaround\n\n$500 FULL VERIFICATION AUDIT\n10–25 claims\n3–5 business days\n7-day monitoring\n\n$129 is credited if you upgrade.`}</code>
        </aside>
      </section>

      <section className={`${styles.shell} ${styles.mainGrid}`}>
        <article className={styles.panel}>
          <h2>The problem</h2>
          <p>{intent.problem}</p>
        </article>
        <article className={styles.panel}>
          <h2>Who this is for</h2>
          <p>{intent.whoFor}</p>
        </article>
        <article className={styles.panel}>
          <h2>What ProofTTL checks</h2>
          <ul>{intent.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        </article>
        <article className={styles.panel}>
          <h2>Example claims</h2>
          <ul>{intent.examples.map((example) => <li key={example}>{example}</li>)}</ul>
        </article>

        <div className={styles.cta}>
          <div>
            <h2>Submit the claims before you submit your card.</h2>
            <p>ProofTTL reviews the exact scope first. Payment is requested only after the claim set, price, and turnaround are confirmed.</p>
          </div>
          <div className={styles.actions}>
            <a className={styles.primary} href="/audit/#audit-intake">Start for $129</a>
            <a className={styles.secondary} href="/audit/sample/">See sample audit</a>
          </div>
        </div>

        <section className={styles.panel} style={{ gridColumn: '1 / -1' }} aria-labelledby="service-faq-heading">
          <p className={styles.eyebrow}>COMMON QUESTIONS</p>
          <h2 id="service-faq-heading">What people usually ask before sending claims.</h2>
          {intent.faq.map((item) => (
            <div key={item.question} style={{ padding: '18px 0', borderTop: '1px solid rgba(148,163,184,.14)' }}>
              <h3 style={{ margin: '0 0 8px' }}>{item.question}</h3>
              <p style={{ margin: 0 }}>{item.answer}</p>
            </div>
          ))}
        </section>

        <section className={styles.related} style={{ gridColumn: '1 / -1' }} aria-labelledby="related-services-heading">
          <div className={styles.relatedHeading}>
            <div>
              <p className={styles.eyebrow}>RELATED VERIFICATION NEEDS</p>
              <h2 id="related-services-heading">More ways teams use ProofTTL.</h2>
            </div>
            <a href="/services/">View all services →</a>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <a className={styles.intentCard} href={`/services/${item.slug}/`} key={item.slug}>
                <span>{item.eyebrow}</span>
                <h3>{item.heading}</h3>
                <p>{item.description}</p>
              </a>
            ))}
          </div>
        </section>
      </section>

      <footer className={`${styles.shell} ${styles.footer}`}>
        ProofTTL · source-backed claim verification · explicit evidence · scope before payment
      </footer>
    </main>
  )
}
