'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { authClient, PROOFTTL_API_URL, rememberAuthReturn, signInHref } from '../lib/proofttl-auth'

const AUDIT_STORAGE_KEY = 'proofttl:last-audit-request'

type AuthState = 'checking' | 'signed_in' | 'signed_out' | 'error'
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
  received: 'RECEIVED — WAITING FOR SCOPE REVIEW', scoped: 'SCOPED — CHECKOUT NOT YET CREATED',
  payment_ready: 'SCOPE APPROVED — SECURE CHECKOUT READY', paid: 'PAID — FULFILLMENT IN PROGRESS',
  fulfilled: 'FULFILLED', cancelled: 'CANCELLED',
}

function currentReturnTo() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export default function AuditStatusLookup() {
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StatusResponse | null>(null)
  const [requestId, setRequestId] = useState('')
  const [email, setEmail] = useState('')
  const [returnMessage, setReturnMessage] = useState('')
  const autoCheckedRef = useRef(false)

  useEffect(() => {
    let queryRequest = ''
    let savedEmail = ''
    let paidReturn = false
    try {
      const params = new URLSearchParams(window.location.search)
      queryRequest = params.get('request') || ''
      const saved = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '{}') as { audit_intake_id?: string; email?: string }
      setRequestId(queryRequest || saved.audit_intake_id || '')
      savedEmail = saved.email || ''
      setEmail(savedEmail)
      paidReturn = params.get('paid') === '1'
      if (paidReturn) setReturnMessage('Payment submitted. ProofTTL is confirming the Stripe webhook now.')
      else if (params.get('cancelled') === '1') setReturnMessage('Checkout was cancelled. Your approved scope remains stored and can be paid later while checkout is valid.')
    } catch {}

    let cancelled = false
    void authClient.getSession().then(async (session) => {
      if (cancelled) return
      const user = session?.data?.user
      if (!user) {
        setAuthState('signed_out')
        const returnTo = currentReturnTo()
        rememberAuthReturn(returnTo)
        window.location.replace(signInHref(returnTo))
        return
      }

      const providerEmail = typeof user.email === 'string' ? user.email.trim() : ''
      const lookupEmail = savedEmail || providerEmail
      if (providerEmail && !savedEmail) setEmail(providerEmail)
      setAuthState('signed_in')

      if (queryRequest && !autoCheckedRef.current) {
        autoCheckedRef.current = true
        if (paidReturn) {
          await pollAfterPayment(queryRequest, lookupEmail)
        } else {
          await lookup(queryRequest, lookupEmail)
        }
      }
    }).catch(() => {
      if (!cancelled) setAuthState('error')
    })
    return () => { cancelled = true }
    // lookup functions are stable for the lifetime of this mounted page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function redirectToSignIn() {
    const returnTo = currentReturnTo()
    rememberAuthReturn(returnTo)
    window.location.assign(signInHref(returnTo))
  }

  async function lookup(id: string, mail: string, quiet = false) {
    if (!quiet) setLoading(true)
    if (!quiet) setResult(null)
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/audit/intake/status`, {
        method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ audit_intake_id: id.trim(), email: mail.trim() }),
      })
      const body = await response.json().catch(() => ({})) as StatusResponse
      if (response.status === 401) {
        setAuthState('signed_out')
        redirectToSignIn()
        return null
      }
      if (!response.ok) {
        const failed = { error: body.error || `HTTP ${response.status}` }
        if (!quiet) setResult(failed)
        return failed
      }
      setResult(body)
      return body
    } catch {
      const failed = { error: 'Could not reach ProofTTL status service. Try again shortly.' }
      if (!quiet) setResult(failed)
      return failed
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  async function pollAfterPayment(id: string, mail: string) {
    setLoading(true)
    setResult(null)
    try {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const body = await lookup(id, mail, true)
        if (!body || body.error) {
          if (attempt === 3 && body?.error) setResult(body)
          return
        }
        if (body.status === 'paid' || body.status === 'fulfilled' || body.payment?.state === 'paid') {
          setReturnMessage('Payment confirmed by Stripe. Your verification request is now in fulfillment.')
          setResult(body)
          return
        }
        setResult(body)
        if (attempt < 3) await new Promise((resolve) => window.setTimeout(resolve, 1500))
      }
      setReturnMessage('Stripe checkout returned successfully. Payment confirmation is still processing; ProofTTL will keep the approved request stored.')
    } finally {
      setLoading(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (authState !== 'signed_in') {
      redirectToSignIn()
      return
    }
    await lookup(requestId, email)
  }

  if (authState === 'checking') return <div className="onboarding-card"><p className="app-kicker">SECURE AUDIT ACCESS</p><h1 className="app-title">Checking your session…</h1><p className="app-copy">Audit requests and payment status require a signed-in ProofTTL account.</p></div>

  if (authState === 'signed_out') return <div className="onboarding-card"><p className="app-kicker">SECURE AUDIT ACCESS</p><h1 className="app-title">Sign in to continue.</h1><p className="app-copy">ProofTTL will return you to this exact request after authentication.</p><button className="button button-primary" type="button" onClick={redirectToSignIn}>SIGN IN →</button></div>

  if (authState === 'error') return <div className="onboarding-card"><p className="app-kicker">SECURE AUDIT ACCESS</p><h1 className="app-title">Session check unavailable.</h1><p className="app-copy">ProofTTL will not expose audit or payment status unless it can verify your session. Sign in again to retry securely.</p><button className="button button-primary" type="button" onClick={redirectToSignIn}>SIGN IN AGAIN →</button></div>

  return (
    <div className="onboarding-card">
      <p className="app-kicker">CHECK YOUR REQUEST</p>
      <h1 className="app-title">Audit status</h1>
      <p className="app-copy">Your signed-in ProofTTL account controls access to linked audit and payment state. Older requests can be claimed automatically when the sign-in provider email matches the original intake email.</p>
      {returnMessage && <p className="app-note" role="status">{returnMessage}</p>}

      <form className="app-form" onSubmit={submit} style={{ marginTop: 20 }}>
        <label className="app-input-label">REQUEST REFERENCE<input name="audit_intake_id" required pattern="ati_[a-f0-9]{32}" placeholder="ati_..." value={requestId} onChange={(e) => setRequestId(e.target.value)} /></label>
        <label className="app-input-label">CONTACT EMAIL <span>USED FOR OLDER UNLINKED REQUESTS</span><input name="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
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
          {result.payment?.state === 'ready' && result.payment.url && <div className="hero-actions" style={{ marginTop: 18 }}><a className="button button-primary" href={result.payment.url} rel="noreferrer">PAY ${result.payment.amount_due_usd || result.scope?.amount_due_usd || ''} SECURELY →</a></div>}
          {result.status === 'received' && <p className="app-note">Your request is stored. The next checkpoint is scope review; payment is not due yet.</p>}
          {result.status === 'scoped' && <p className="app-note">Your scope is approved. ProofTTL has not created checkout yet, so no payment is currently due.</p>}
          {result.status === 'paid' && <p className="app-note">Stripe payment is recorded. Fulfillment is now the active step.</p>}
          {result.status === 'fulfilled' && <p className="app-note">This request is marked fulfilled.</p>}
        </div>
      )}
    </div>
  )
}
