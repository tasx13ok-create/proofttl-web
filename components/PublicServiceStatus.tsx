'use client'

import { useEffect, useState } from 'react'

const API = 'https://proofttl.tasx13ok.workers.dev'

type Health = {
  ok?: boolean
  version?: string
  storage?: boolean
  automatic_monitoring?: boolean
}

type AuthDiscovery = {
  configured?: boolean
  security?: {
    secure_http_only_sessions?: boolean
    csrf_protection?: boolean
  }
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return <div className="app-table-row"><span>{label}</span><span>{value}</span></div>
}

export default function PublicServiceStatus() {
  const [health, setHealth] = useState<Health | null>(null)
  const [auth, setAuth] = useState<AuthDiscovery | null>(null)
  const [healthError, setHealthError] = useState(false)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    void fetch(`${API}/health`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        setHealth(body)
      })
      .catch(() => setHealthError(true))

    void fetch(`${API}/.well-known/proofttl-auth.json`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        setAuth(body)
      })
      .catch(() => setAuthError(true))

    return () => controller.abort()
  }, [])

  const serviceState = healthError ? 'STATUS CHECK UNAVAILABLE' : health?.ok ? 'OPERATIONAL' : health ? 'DEGRADED' : 'CHECKING…'
  const accountState = authError ? 'STATUS CHECK UNAVAILABLE' : auth?.configured && auth?.security?.secure_http_only_sessions && auth?.security?.csrf_protection ? 'OPERATIONAL' : auth ? 'DEGRADED' : 'CHECKING…'
  const monitoringState = healthError ? 'STATUS CHECK UNAVAILABLE' : health?.automatic_monitoring ? 'OPERATIONAL' : health ? 'LIMITED' : 'CHECKING…'

  return <div style={{ display: 'grid', gap: 18 }}>
    <section className="onboarding-card" style={{ padding: 30 }}>
      <p className="app-kicker">PROOFTTL / SERVICE STATUS</p>
      <h1 className="app-title">Fact Audit service status.</h1>
      <p className="app-copy">Live checks for the customer-facing verification service, account security, and the monitoring capability used during the seven-day watch on important Fact Audit findings.</p>
      <div className="hero-actions"><a className="button button-primary" href="/audit/#audit-intake">START FACT AUDIT →</a><a className="button button-secondary" href="/support/">GET SUPPORT</a></div>
    </section>

    <section className="console-panel wide">
      <p className="app-kicker">CUSTOMER-FACING SYSTEMS</p>
      <div className="app-table" style={{ marginTop: 12 }}>
        <StatusItem label="Fact Audit verification service" value={serviceState} />
        <StatusItem label="Customer account security" value={accountState} />
        <StatusItem label="Seven-day monitoring capability" value={monitoringState} />
        <StatusItem label="Current service release" value={health?.version || (healthError ? 'UNAVAILABLE' : 'CHECKING…')} />
      </div>
    </section>

    <section className="console-panel wide">
      <p className="app-kicker">PAYMENT STATUS</p>
      <h2>Payments are requested only after scope confirmation.</h2>
      <p className="app-copy">The public status page does not expose private payment or customer records. If you already have a Fact Audit request and need to check its payment or delivery state, sign in and use the private audit-status lookup.</p>
      <div className="hero-actions"><a className="button button-secondary" href="/audit/status/">CHECK MY AUDIT STATUS</a><a className="text-link" href="/trust/">Payment + trust boundary →</a></div>
    </section>
  </div>
}
