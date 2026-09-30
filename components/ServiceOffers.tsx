import styles from '../app/solutions/search-page.module.css'

export const RAPID_CHECKOUT_URL = 'https://buy.stripe.com/6oUcMY7DgbQD2es0C99EI01'

export default function ServiceOffers({ className = '' }: { className?: string }) {
  return <section className={`${styles.cta} ${className}`} aria-label="Choose a claim verification service">
    <div>
      <h2>Start with six claims. $299 one-time.</h2>
      <p>The Rapid Claim Check covers up to six public, redacted, or de-identified claims. Evidence for and against, explicit verdicts, human-reviewed results, and a 24-hour turnaround. No subscription or ProofTTL account required.</p>
      <p>After Stripe checkout, reply to the ProofTTL intake email with your claims and source context. <a href="/support/#rapid-help">Already paid or missing the intake email?</a></p>
      <p>Need deeper review? The <a href="/audit/">$1,500 Fact Audit</a> covers up to 25 outputs or claims and includes a seven-day evidence watch. Its scope is confirmed before payment.</p>
    </div>
    <div className={styles.actions}>
      <a className={styles.primary} href={RAPID_CHECKOUT_URL}>Check 6 claims · $299</a>
      <a className={styles.secondary} href="/audit/sample/">See sample audit</a>
    </div>
  </section>
}
