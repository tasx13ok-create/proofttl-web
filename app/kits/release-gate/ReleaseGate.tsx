'use client'

import { useState } from 'react'
import styles from './page.module.css'

const CHECKOUT_URL = 'https://buy.stripe.com/7sYfZa6zc6wjbP270x9EI03'
const RAPID_CHECK = 'https://buy.stripe.com/6oUcMY7DgbQD2es0C99EI01'

const sample = `ROLE: Contradiction Hunter

Input: an AI-generated answer plus its cited sources.

Your job:
1. Extract the 3 claims whose being wrong would cost the most.
2. For each claim, identify what evidence would falsify it.
3. Check whether the supplied citation actually supports the exact claim.
4. Return only: SUPPORTED / CONTRADICTED / NOT ESTABLISHED.
5. Do not reward confident wording. Evidence > confidence.`

export default function ReleaseGate() {
  const [copied, setCopied] = useState(false)
  const live = CHECKOUT_URL.startsWith('https://')

  async function copySample() {
    await navigator.clipboard.writeText(sample)
    setCopied(true)
    setTimeout(() => setCopied(false), 1300)
  }

  return (
    <main className={styles.shell}>
      <nav className={styles.nav}>
        <a href="/"><img src="/proofttl-lockup.svg" alt="ProofTTL" /></a>
        <span>SELF-SERVE KIT</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.kicker}>LOW-COST RELEASE GATE</div>
        <h1>Make your AI argue against itself before your customer can.</h1>
        <p className={styles.lede}>Seven copy-paste agent roles, a consequence-ranking rubric, a citation check, and a final ship/no-ship gate. Built for people who cannot justify a full audit on every output.</p>
        <div className={styles.actions}>
          {live ? <a className={styles.primary} href={CHECKOUT_URL}>Get the kit · $5</a> : <button className={styles.primary} disabled>Checkout connecting · $5</button>}
          <a className={styles.secondary} href="#sample">Use the free sample</a>
        </div>
        <p className={styles.micro}>One-time purchase. Instant self-serve material. No subscription.</p>
      </section>

      <section className={styles.grid}>
        <article><span>01</span><h2>Consequence Ranker</h2><p>Finds the claims that matter instead of wasting verification effort on trivia.</p></article>
        <article><span>02</span><h2>Contradiction Hunter</h2><p>Actively searches for evidence that would make the answer fail.</p></article>
        <article><span>03</span><h2>Citation Prosecutor</h2><p>Checks whether a source supports the exact wording rather than the general topic.</p></article>
        <article><span>04</span><h2>Freshness Check</h2><p>Separates stable background facts from claims that can go stale quickly.</p></article>
        <article><span>05</span><h2>Assumption Extractor</h2><p>Surfaces hidden premises the original model treated as facts.</p></article>
        <article><span>06</span><h2>Failure Synthesizer</h2><p>Combines disagreements into a concise list of unresolved risks.</p></article>
        <article><span>07</span><h2>Release Judge</h2><p>Returns ship, revise, or escalate using an explicit evidence threshold.</p></article>
        <article><span>+</span><h2>Scorecard</h2><p>A repeatable rubric for evidence strength, consequence, freshness, and uncertainty.</p></article>
      </section>

      <section className={styles.sample} id="sample">
        <div>
          <div className={styles.kicker}>FREE AGENT · COPY IT NOW</div>
          <h2>Contradiction Hunter</h2>
          <p>This is one complete role from the kit. No email wall.</p>
        </div>
        <pre>{sample}</pre>
        <button onClick={copySample}>{copied ? 'Copied' : 'Copy agent prompt'}</button>
      </section>

      <section className={styles.split}>
        <div>
          <div className={styles.kicker}>WHAT $5 BUYS</div>
          <h2>A reusable gate, not another “mega prompt.”</h2>
        </div>
        <ul>
          <li>7 independent agent roles</li>
          <li>1 orchestration prompt that runs them in sequence</li>
          <li>Consequence × confidence × freshness scorecard</li>
          <li>Compact output schema for repeatable reviews</li>
          <li>Escalation rules for when AI should stop and a human should verify</li>
        </ul>
      </section>

      <section className={styles.audit}>
        <div>
          <div className={styles.kicker}>WHEN $5 ISN'T ENOUGH</div>
          <h2>Have ProofTTL check the real claims.</h2>
          <p>The kit is a self-serve workflow. It is not a claim that the model verified itself correctly. High-consequence cases can be escalated to the human-reviewed Rapid Claim Check.</p>
        </div>
        <a href={RAPID_CHECK}>Rapid Claim Check · $299</a>
      </section>

      <footer>Evidence &gt; confidence.</footer>
    </main>
  )
}
