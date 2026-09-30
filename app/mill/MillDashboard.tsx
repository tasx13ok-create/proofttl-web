'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'

type Candidate = {
  id: string
  title: string
  url: string
  score: number
  signal: string
  offer: string
  price: number
  status: string
}

type MillState = {
  generatedAt: string
  mode: string
  revenueCents: number
  spendCents: number
  candidates: Candidate[]
}

const emptyState: MillState = {
  generatedAt: '',
  mode: 'deterministic',
  revenueCents: 0,
  spendCents: 0,
  candidates: [],
}

export default function MillDashboard() {
  const [state, setState] = useState<MillState>(emptyState)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/mill-state.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('state unavailable')
        return r.json()
      })
      .then(setState)
      .catch(() => setError('The hunter has not published a state file yet.'))
  }, [])

  const profit = state.revenueCents - state.spendCents
  const allowedReinvest = useMemo(() => {
    if (profit <= 2500) return 0
    if (profit <= 10000) return Math.floor(profit * 0.2)
    if (profit <= 50000) return Math.floor(profit * 0.25)
    return Math.floor(profit * 0.3)
  }, [profit])

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.eyebrow}>INTERNAL · NOINDEX</div>
        <h1>MILL</h1>
        <p>Micro Income Launch Loop. Find demand, score it, ship tiny products, kill losers, reinvest only realized profit.</p>
      </section>

      <section className={styles.metrics}>
        <article><span>Revenue</span><strong>{'$' + (state.revenueCents / 100).toFixed(2)}</strong></article>
        <article><span>Spend</span><strong>{'$' + (state.spendCents / 100).toFixed(2)}</strong></article>
        <article><span>Profit</span><strong>{'$' + (profit / 100).toFixed(2)}</strong></article>
        <article><span>Reinvest ceiling</span><strong>{'$' + (allowedReinvest / 100).toFixed(2)}</strong></article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <span className={styles.label}>HUNTER QUEUE</span>
            <h2>Opportunity candidates</h2>
          </div>
          <div className={styles.mode}>{state.mode || 'deterministic'}</div>
        </div>
        {error ? <p className={styles.muted}>{error}</p> : null}
        <div className={styles.queue}>
          {state.candidates.length === 0 ? (
            <div className={styles.empty}>No candidates yet. The scheduled hunter populates this file.</div>
          ) : state.candidates.map((item) => (
            <article className={styles.row} key={item.id}>
              <div className={styles.score}>{item.score}</div>
              <div className={styles.rowBody}>
                <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
                <p>{item.signal}</p>
                <small>{item.offer} · suggested {'$' + item.price}</small>
              </div>
              <div className={styles.status}>{item.status}</div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.rules}>
        <h2>Governor</h2>
        <p>Revenue ≤ $25: $0 reinvestment. $25–$100: max 20% of realized profit. $100–$500: 25%. Above $500: 30%. Projected revenue never counts.</p>
        <p className={styles.timestamp}>Last hunter run: {state.generatedAt || 'not yet run'}</p>
      </section>
    </main>
  )
}
