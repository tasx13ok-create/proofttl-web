'use client'

import { useEffect, useState } from 'react'
import { authClient } from '../lib/proofttl-auth'
import { PROOFTTL_API_URL, fetchProofTTLAssistantUsage, type AssistantQuota } from '../lib/proofttl-assistant'

type Readiness = {
  environment?: string
  testnet?: {
    score?: number
    ready?: boolean
    passing_checks?: number
    total_checks?: number
    checks?: Record<string, boolean>
  }
  production?: {
    ready?: boolean
    blockers?: string[]
  }
}

type EntitlementResponse = {
  account?: {
    plan?: string
    membership_status?: string
    assistant_daily_limit?: number
    period_end_ms?: number | null
  }
  billing?: {
    enabled?: boolean
    self_service_upgrade?: boolean
  }
}

export function AssistantUsageTelemetry() {
  const [quota, setQuota] = useState<AssistantQuota | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetchProofTTLAssistantUsage(controller.signal)
      .then((value) => {
        setQuota(value)
        setError('')
      })
      .catch(() => setError('Live assistant usage is unavailable until the current backend is deployed.'))
    return () => controller.abort()
  }, [])

  if (error) {
    return <div className="app-empty"><div className="app-empty-meta">LIVE USAGE UNAVAILABLE</div><strong>{error}</strong></div>
  }

  if (!quota) {
    return <div className="app-empty"><strong>Loading live assistant usage…</strong></div>
  }

  return (
    <div className="security-summary console-telemetry-grid">
      <div><span>PLAN</span><strong>{String(quota.plan || 'free').toUpperCase()}</strong></div>
      <div><span>USED TODAY</span><strong>{quota.used ?? '—'}</strong></div>
      <div><span>REMAINING</span><strong>{quota.remaining ?? '—'} / {quota.limit ?? '—'}</strong></div>
      <div><span>ACCOUNTING</span><strong>{String(quota.accounting_backend || 'unknown').toUpperCase()}</strong></div>
    </div>
  )
}

export function ReadinessTelemetry() {
  const [readiness, setReadiness] = useState<Readiness | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${PROOFTTL_API_URL}/readiness`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return await response.json() as Readiness
      })
      .then((value) => {
        setReadiness(value)
        setError('')
      })
      .catch(() => setError('Live readiness is unavailable until the current backend is deployed.'))
    return () => controller.abort()
  }, [])

  if (error) {
    return <div className="app-empty"><div className="app-empty-meta">READINESS PENDING DEPLOY</div><strong>{error}</strong></div>
  }

  if (!readiness?.testnet) {
    return <div className="app-empty"><strong>Loading deployment readiness…</strong></div>
  }

  const failed = Object.entries(readiness.testnet.checks || {})
    .filter(([, passing]) => !passing)
    .map(([name]) => name.replaceAll('_', ' '))

  return (
    <div>
      <div className="security-summary console-telemetry-grid">
        <div><span>TESTNET SCORE</span><strong>{readiness.testnet.score ?? '—'}%</strong></div>
        <div><span>STATE</span><strong>{readiness.testnet.ready ? 'READY' : 'INCOMPLETE'}</strong></div>
        <div><span>CHECKS</span><strong>{readiness.testnet.passing_checks ?? '—'} / {readiness.testnet.total_checks ?? '—'}</strong></div>
        <div><span>PRODUCTION</span><strong>{readiness.production?.ready ? 'READY' : 'LOCKED'}</strong></div>
      </div>
      {failed.length > 0 && <p className="app-note">Pending testnet checks: {failed.join(', ')}.</p>}
    </div>
  )
}

export function AccountEntitlementTelemetry() {
  const { data: session, isPending } = authClient.useSession()
  const [data, setData] = useState<EntitlementResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user) {
      setData(null)
      return
    }

    const controller = new AbortController()
    fetch(`${PROOFTTL_API_URL}/account/entitlement`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return await response.json() as EntitlementResponse
      })
      .then((value) => {
        setData(value)
        setError('')
      })
      .catch(() => setError('Account entitlement is unavailable until the current backend and sign-in provider are deployed.'))

    return () => controller.abort()
  }, [session?.user])

  if (isPending) {
    return <div className="app-empty"><strong>Checking account session…</strong></div>
  }

  if (!session?.user) {
    return (
      <div className="app-empty">
        <div className="app-empty-meta">SIGN IN REQUIRED</div>
        <strong>Plan status is account-scoped.</strong>
        <a className="text-link" href="/login/">SIGN IN TO VIEW ACCOUNT →</a>
      </div>
    )
  }

  if (error) {
    return <div className="app-empty"><div className="app-empty-meta">ACCOUNT PLAN UNAVAILABLE</div><strong>{error}</strong></div>
  }

  if (!data?.account) {
    return <div className="app-empty"><strong>Loading account plan…</strong></div>
  }

  return (
    <div>
      <div className="security-summary console-telemetry-grid">
        <div><span>ACCOUNT</span><strong>{session.user.email || session.user.name || 'ProofTTL user'}</strong></div>
        <div><span>PLAN</span><strong>{String(data.account.plan || 'free').toUpperCase()}</strong></div>
        <div><span>STATUS</span><strong>{String(data.account.membership_status || 'inactive').toUpperCase()}</strong></div>
        <div><span>AI DAILY LIMIT</span><strong>{data.account.assistant_daily_limit ?? '—'}</strong></div>
      </div>
      <p className="app-note">Billing: {data.billing?.enabled ? 'enabled' : 'not enabled yet'}. Self-service upgrades: {data.billing?.self_service_upgrade ? 'available' : 'locked'}.</p>
    </div>
  )
}
