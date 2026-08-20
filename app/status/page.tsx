'use client'

import { useEffect, useState } from 'react'

const API = 'https://proofttl.tasx13ok.workers.dev'

type Health = Record<string, any>

export default function StatusPage() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void fetch(`${API}/health`, { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        setHealth(body)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Status unavailable'))
  }, [])

  return (
    <main className="app-page">
      <section className="app-shell" style={{ padding: '42px 0 90px' }}>
        <p className="app-kicker">PROOFTTL / STATUS</p>
        <h1 className="app-title">System status.</h1>
        <p className="app-copy">Live health for the ProofTTL Worker and core platform dependencies.</p>
        <section className="console-panel wide">
          <div className="security-summary">
            <div><span>API</span><strong>{health?.ok ? 'OPERATIONAL' : error ? 'UNAVAILABLE' : 'CHECKING…'}</strong></div>
            <div><span>VERSION</span><strong>{health?.version || '—'}</strong></div>
            <div><span>PROTOCOL</span><strong>{health?.protocol || '—'}</strong></div>
            <div><span>STORAGE</span><strong>{health?.storage ? 'ACTIVE' : '—'}</strong></div>
            <div><span>AI</span><strong>{health?.ai ? 'ACTIVE' : '—'}</strong></div>
            <div><span>MONITORING</span><strong>{health?.automatic_monitoring ? 'ACTIVE' : '—'}</strong></div>
          </div>
          {error && <p className="app-note" style={{ color: '#fb7185' }}>{error}</p>}
          <p className="app-note">Settlement network: Base Sepolia testnet. Mainnet remains disabled.</p>
        </section>
      </section>
    </main>
  )
}
