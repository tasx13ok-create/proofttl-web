'use client'

import { FormEvent, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'

type StatusResponse = {
  ok?: boolean
  audit_intake_id?: string
  status?: string
  offer_type?: string
  scope?: { summary?: string; price_usd?: number; prior_credit_usd?: number; amount_due_usd?: number; turnaround?: string; scoped_at_ms?: number } | null
  payment?: { provider?: string | null; state?: string; amount_due_usd?: number | null; url?: string | null; paid_at_ms?: number | null }
  fulfilled_at_ms?: number | null
  error?: string
}

const labels: Record<string, string> = {
  received: 'RECEIVED — WAITING FOR SCOPE REVIEW',
  scoped: 'SCOPED — CHECKOUT NOT YET CREATED',
  payment_ready: 'SCOPE APPROVED — SECURE CHECKOUT READY',
  paid: 'PAID — FULFILLMENT IN PROGRESS',
  fulfilled: 'FULFILLED',
  cancelled: 'CANCELLED',
}

export default function AuditStatusLookup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StatusResponse | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setResult(null)
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/audit/intake/status`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          audit_intake_id: String(form.get('audit_intake_id') || '').trim(),
          email: String(form.get('email') || '').trim(),
        }),
      })
      const body = await response.json().catch(() => ({})) as StatusResponse
      setResult(response.ok ? body : { error: body.error || `HTTP ${response.status}` })
    } catch {
      setResult({ error: 'Could not reach ProofTTL status service. Try again shortly.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-card">
      <p className="app-kicker">CHECK YOUR REQUEST</p>
      <h1 className="app-title">Audit status</h1>
      <p className="app-copy">Use the reference returned when you submitted your scope plus the same email address. ProofTTL does not expose the request from the reference alone.</p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 14, marginTop: 20 }}>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          REQUEST REFERENCE
          <input name="audit_intake_id" required pattern="ati_[a-f0-9]{32}" placeholder="ati_..." />
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          EMAIL
          <input name="email" type="email" required placeholder="you@company.com" />
        </label>
        <button className="button button-primary" disabled={loading}>{loading ? 'CHECKING…' : 'CHECK STATUS →'}</button>
      </form>

      {result?.error && <p className="app-note" role="alert" style={{ marginTop: 18 }}><strong>STATUS UNAVAILABLE:</strong> {result.error}</p>}

      {result?.ok && (
        <div style={{ marginTop: 22 }}>
          <p className="app-kicker">{labels[result.status || ''] || String(result.status || '').toUpperCase()}</p>
          <div className="app-table">
            <div className="app-table-row"><span>Reference</span><span><code>{result.audit_intake_id}</code></span><span>✓</span></div>
            <div className="app-table-row"><span>Offer</span><span>{result.offer_type === 'stress_test' ? 'Claim Stress Test' : 'Full Verification Audit'}</span><span>{result.scope?.price_usd ? `$${result.scope.price_usd}` : 'PENDING'}</span></div>
            {result.scope?.prior_credit_usd ? <div className="app-table-row"><span>Upgrade credit</span><span>Stress Test payment credited in full</span><span>−${result.scope.prior_credit_usd}</span></div> : null}
            {result.scope?.summary && <div className="app-table-row"><span>Scope</span><span>{result.scope.summary}</span><span>CONFIRMED</span></div>}
            {result.scope?.turnaround && <div className="app-table-row"><span>Turnaround</span><span>{result.scope.turnaround}</span><span>SET</span></div>}
            <div className="app-table-row"><span>Payment</span><span>{result.payment?.provider === 'stripe' ? 'Secure Stripe Checkout' : String(result.payment?.state || 'not_requested').replaceAll('_', ' ')}</span><span>{result.payment?.state === 'paid' ? '✓' : result.payment?.amount_due_usd ? `$${result.payment.amount_due_usd}` : '—'}</span></div>
          </div>
          {result.payment?.state === 'ready' && result.payment.url && (
            <div className="hero-actions" style={{ marginTop: 18 }}>
              <a className="button button-primary" href={result.payment.url} rel="noreferrer">PAY ${result.payment.amount_due_usd || result.scope?.amount_due_usd || ''} SECURELY →</a>
            </div>
          )}
          {result.status === 'received' && <p className="app-note">Your request is stored. The next checkpoint is scope review; payment is not due yet.</p>}
          {result.status === 'scoped' && <p className="app-note">Your scope is approved. ProofTTL has not created checkout yet, so no payment is currently due.</p>}
          {result.status === 'paid' && <p className="app-note">Stripe payment is recorded. Fulfillment is now the active step.</p>}
          {result.status === 'fulfilled' && <p className="app-note">This request is marked fulfilled.</p>}
        </div>
      )}
    </div>
  )
}
