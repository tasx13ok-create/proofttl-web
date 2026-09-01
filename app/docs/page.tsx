import type { Metadata } from 'next'
import styles from '../solutions/search-page.module.css'

export const metadata: Metadata = {
  title: 'ProofTTL Fact Audit Guide',
  description: 'Buyer-facing guide to the $1,500 ProofTTL Fact Audit: intake, scope review, payment, verification, human approval, proof/report delivery, and seven-day monitoring.',
  alternates: { canonical: '/docs/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ProofTTL Fact Audit Guide',
    description: 'How the $1,500 Fact Audit moves from submitted outputs to human-approved, monitored findings.',
    type: 'website',
  },
}

const steps = [
  ['1 · INTAKE', 'Submit 10–25 real AI outputs or consequential factual claims, why they matter, and any deadline. No card is required for intake.'],
  ['2 · SCOPE REVIEW', 'ProofTTL confirms that the material fits the fixed Fact Audit engagement before any payment request is created.'],
  ['3 · $1,500 PAYMENT', 'After scope is confirmed, the exact fixed-price Stripe payment flow is created. Raw card details are handled by Stripe rather than stored by ProofTTL.'],
  ['4 · VERIFY', 'Claims are decomposed and ranked by consequence. The highest-risk findings receive the deepest verification effort using accessible authoritative evidence, including evidence FOR and AGAINST.'],
  ['5 · CONTRADICTION PASS', 'The evidence set is challenged before a finding is finalized as SUPPORTED, CONTRADICTED, or UNKNOWN.'],
  ['6 · HUMAN APPROVAL', 'Customer-facing findings are not published automatically. Human approval is required before final proof/report delivery.'],
  ['7 · SEVEN-DAY WATCH', 'Important findings remain under watch for seven days and receive a final reread before the monitoring window closes.'],
] as const

export default function DocsPage() {
  return (
    <main className={styles.page}>
      <section className={`${styles.shell} ${styles.indexHero}`}>
        <p className={styles.eyebrow}>PROOFTTL / FACT AUDIT GUIDE</p>
        <h1>From submitted output to a defensible evidence trail.</h1>
        <p>ProofTTL sells one launch engagement: the <strong>$1,500 Fact Audit</strong>. The workflow is scope-first, consequence-ranked, source-backed, human-approved, and monitored for seven days on important findings.</p>
      </section>

      <section className={`${styles.shell} ${styles.mainGrid}`}>
        {steps.map(([title, description]) => (
          <article className={styles.panel} key={title}>
            <p className={styles.eyebrow}>{title}</p>
            <p>{description}</p>
          </article>
        ))}

        <article className={styles.panel} style={{ gridColumn: '1 / -1' }}>
          <h2>What you receive</h2>
          <p>A ranked set of findings, inspectable evidence, explicit verdicts, contradiction analysis, repair guidance where useful, and human-approved proof/report delivery. UNKNOWN remains a valid result when the examined evidence does not justify certainty.</p>
        </article>

        <article className={styles.panel} style={{ gridColumn: '1 / -1' }}>
          <h2>Evidence boundary</h2>
          <p>The standard Fact Audit is built around accessible public evidence. ProofTTL records what the examined sources support at the time of review; it does not promise permanent truth or replace legal, medical, financial, regulatory, accounting, or other professional advice.</p>
        </article>

        <div className={styles.cta}>
          <div>
            <h2>Submit the real outputs first.</h2>
            <p>Scope is confirmed before the exact $1,500 payment request is created.</p>
          </div>
          <div className={styles.actions}>
            <a className={styles.primary} href="/audit/#audit-intake">Start Fact Audit</a>
            <a className={styles.secondary} href="/audit/sample/">See sample audit</a>
          </div>
        </div>
      </section>

      <footer className={`${styles.shell} ${styles.footer}`}>ProofTTL · $1,500 Fact Audit · human-approved findings · seven-day watch</footer>
    </main>
  )
}
