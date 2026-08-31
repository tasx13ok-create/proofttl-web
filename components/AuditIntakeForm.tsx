'use client'

import { FormEvent, useEffect, useMemo, useState, type PointerEvent } from 'react'
import { authClient, PROOFTTL_API_URL, rememberAuthReturn, signInHref } from '../lib/proofttl-auth'

const AUDIT_STORAGE_KEY = 'proofttl:last-audit-request'
const AUDIT_DRAFT_KEY = 'proofttl:audit-draft-v1'
const SESSION_TIMEOUT_MS = 8000
const INTAKE_TIMEOUT_MS = 20000

type OfferType = 'full_audit'
type AuthState = 'checking' | 'signed_in' | 'signed_out' | 'error'
type IntakeResponse = { ok?: boolean; duplicate?: boolean; audit_intake_id?: string; status?: string; next_step?: string; error?: string; message?: string; offer?: { type?: OfferType; name?: string; price_usd?: number; turnaround?: string } }
type AuditDraft = { offer_type: OfferType; email: string; company_or_project: string; website_url: string; claim_scope: string; approximate_claims: string; why_it_matters: string; deadline: string }

const offerCopy = { full_audit: { label: 'Fact Audit', price: '$1,500', claims: 'up to 25 outputs / claims', turnaround: '3–5 business days' } } satisfies Record<OfferType, Record<string, string>>

function blankDraft(): AuditDraft { return { offer_type: 'full_audit', email: '', company_or_project: '', website_url: '', claim_scope: '', approximate_claims: '10-15', why_it_matters: '', deadline: '' } }
function auditReturnTo() { if (typeof window === 'undefined') return '/audit/#audit-intake'; return `${window.location.pathname}${window.location.search}#audit-intake` }

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label}_timeout`)), timeoutMs)
    promise.then((value) => { window.clearTimeout(timer); resolve(value) }, (error) => { window.clearTimeout(timer); reject(error) })
  })
}

export default function AuditIntakeForm() {
  const [draft, setDraft] = useState<AuditDraft>(() => blankDraft())
  const [draftReady, setDraftReady] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [accountEmail, setAccountEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<IntakeResponse | null>(null)
  const offer = useMemo(() => offerCopy.full_audit, [])

  useEffect(() => { try { const raw = localStorage.getItem(AUDIT_DRAFT_KEY); if (raw) setDraft({ ...blankDraft(), ...(JSON.parse(raw) as Partial<AuditDraft>), offer_type: 'full_audit' }) } catch {} setDraftReady(true) }, [])
  useEffect(() => { if (!draftReady) return; try { localStorage.setItem(AUDIT_DRAFT_KEY, JSON.stringify(draft)) } catch {} }, [draft, draftReady])
  useEffect(() => {
    let cancelled = false
    void withTimeout(authClient.getSession(), SESSION_TIMEOUT_MS, 'session_check').then((session) => {
      if (cancelled) return
      const user = session?.data?.user
      if (!user) { setAuthState('signed_out'); return }
      const sessionEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : ''
      if (!sessionEmail) { setAuthState('error'); return }
      setAccountEmail(sessionEmail)
      setDraft((c) => ({ ...c, email: sessionEmail }))
      setAuthState('signed_in')
    }).catch(() => { if (!cancelled) setAuthState('error') })
    return () => { cancelled = true }
  }, [])
  useEffect(() => { if (authState !== 'signed_out') return; const redirectIfAuditHash = () => { if (window.location.hash === '#audit-intake') redirectToSignIn() }; redirectIfAuditHash(); window.addEventListener('hashchange', redirectIfAuditHash); return () => window.removeEventListener('hashchange', redirectIfAuditHash) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState])

  function persistDraft(next = draft) { try { localStorage.setItem(AUDIT_DRAFT_KEY, JSON.stringify(next)) } catch {} }
  function redirectToSignIn() { persistDraft(); const returnTo = auditReturnTo(); rememberAuthReturn(returnTo); window.location.assign(signInHref(returnTo)) }
  function update<K extends keyof AuditDraft>(key: K, value: AuditDraft[K]) { if (key === 'email' && authState === 'signed_in') return; setDraft((c) => ({ ...c, [key]: value })); setResult(null) }
  async function requireSession(): Promise<string | null> {
    try {
      const session = await withTimeout(authClient.getSession(), SESSION_TIMEOUT_MS, 'session_check')
      const email = typeof session?.data?.user?.email === 'string' ? session.data.user.email.trim().toLowerCase() : ''
      if (session?.data?.user && email) {
        setAuthState('signed_in')
        setAccountEmail(email)
        setDraft((c) => ({ ...c, email }))
        return email
      }
    } catch {
      setAuthState('error')
      setResult({ error: 'Session check timed out. Please sign in again.' })
      return null
    }
    setAuthState('signed_out')
    redirectToSignIn()
    return null
  }
  function gatePointer(event: PointerEvent<HTMLFormElement>) { if (authState !== 'signed_out' && authState !== 'error') return; event.preventDefault(); redirectToSignIn() }
  function gateFocus() { if (authState === 'signed_out' || authState === 'error') redirectToSignIn() }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setResult(null)
    persistDraft()
    const verifiedEmail = await requireSession()
    if (!verifiedEmail) return

    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const payload = { offer_type: 'full_audit', email: verifiedEmail, company_or_project: draft.company_or_project, website_url: draft.website_url, claim_scope: draft.claim_scope, approximate_claims: draft.approximate_claims, why_it_matters: draft.why_it_matters, deadline: draft.deadline, company_site: String(form.get('company_site') || '') }
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), INTAKE_TIMEOUT_MS)

    try {
      const response = await fetch(`${PROOFTTL_API_URL}/audit/intake`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal })
      const body = await response.json().catch(() => ({})) as IntakeResponse
      if (response.status === 401) { setAuthState('signed_out'); redirectToSignIn(); return }
      if (!response.ok) {
        const message = body.message || (response.status === 504 ? 'The intake service timed out before confirming receipt. Your draft is saved; please try again.' : undefined)
        setResult({ error: body.error || `HTTP ${response.status}`, message })
      } else if (body.audit_intake_id) {
        try { localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify({ audit_intake_id: body.audit_intake_id, email: verifiedEmail, offer_type: 'full_audit', saved_at_ms: Date.now() })); localStorage.removeItem(AUDIT_DRAFT_KEY) } catch {}
        setResult(body)
        window.location.assign(`/audit/status/?request=${encodeURIComponent(body.audit_intake_id)}&submitted=1`)
        return
      } else {
        setResult({ error: 'ProofTTL did not return an audit reference. Your draft is saved; please retry.' })
      }
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'AbortError'
      setResult({ error: timedOut ? 'The intake service did not respond within 20 seconds. Your draft is saved; please try again.' : 'Could not reach ProofTTL intake. Your draft is saved; please try again shortly.' })
    } finally {
      window.clearTimeout(timeout)
      setSubmitting(false)
    }
  }

  return <section className="audit-intake-clean" id="audit-intake" aria-labelledby="audit-intake-heading">
    <div className="audit-intake-heading-row"><div><p className="app-kicker">SUBMIT YOUR OUTPUTS</p><h2 id="audit-intake-heading">Scope first. Human approval before publication.</h2></div><div className="audit-offer-switch"><button type="button" className="active" aria-pressed="true">$1,500 · UP TO 25</button></div></div>
    <p className="audit-selected-offer"><strong>{offer.label}</strong> · {offer.claims} · {offer.turnaround}. We deep-verify the highest-risk findings, rank them by consequence, and monitor the important ones for seven days.</p>
    {authState === 'checking' && <p className="audit-form-footnote">CHECKING PROOFTTL SESSION…</p>}
    {authState === 'signed_out' && <button className="button button-primary audit-submit-button" type="button" onClick={redirectToSignIn}>SIGN IN TO START FACT AUDIT →</button>}
    {authState === 'error' && <p className="app-note" role="alert"><strong>SESSION CHECK FAILED.</strong> <button type="button" className="text-link" onClick={redirectToSignIn}>SIGN IN AGAIN →</button></p>}
    <form className="audit-clean-form" onSubmit={submit} onPointerDownCapture={gatePointer} onFocusCapture={gateFocus}>
      <input type="hidden" name="offer_type" value="full_audit" />
      <div className="audit-form-grid two"><label>ACCOUNT EMAIL<input name="email" type="email" required maxLength={254} placeholder="Sign in to lock your account email" value={authState === 'signed_in' ? accountEmail : draft.email} onChange={(e) => update('email', e.target.value)} readOnly={authState === 'signed_in'} /></label><label>COMPANY OR PROJECT<input name="company_or_project" required maxLength={160} placeholder="Acme AI" value={draft.company_or_project} onChange={(e) => update('company_or_project', e.target.value)} /></label></div>
      <label>PRODUCT / DOCS URL <span>OPTIONAL</span><input name="website_url" type="url" maxLength={600} placeholder="https://example.com" value={draft.website_url} onChange={(e) => update('website_url', e.target.value)} /></label>
      <label>OUTPUTS / CLAIMS TO AUDIT<textarea name="claim_scope" required maxLength={12000} rows={8} value={draft.claim_scope} onChange={(e) => update('claim_scope', e.target.value)} placeholder="Paste up to 25 real outputs or claims your users see. Include context, citations, or source URLs when available." /></label>
      <label>APPROXIMATE COUNT<select name="approximate_claims" value={draft.approximate_claims} onChange={(e) => update('approximate_claims', e.target.value)} required><option value="10-15">10–15</option><option value="16-25">16–25</option><option value="25+">More than 25 — scope separately</option></select></label>
      <div className="audit-form-grid two"><label>WHY IT MATTERS<textarea name="why_it_matters" required maxLength={2500} rows={3} value={draft.why_it_matters} onChange={(e) => update('why_it_matters', e.target.value)} placeholder="What happens if these outputs are wrong?" /></label><label>DEADLINE <span>OPTIONAL</span><textarea name="deadline" maxLength={120} rows={3} value={draft.deadline} onChange={(e) => update('deadline', e.target.value)} placeholder="Friday / before launch / no rush" /></label></div>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}><label>Company site<input name="company_site" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="button button-primary audit-submit-button" type="submit" disabled={submitting || authState === 'checking'}>{submitting ? 'CREATING AUDIT…' : 'START FACT AUDIT →'}</button>
      <p className="audit-form-footnote">SIGN-IN REQUIRED · SCOPE REVIEW · SCOPE CONFIRMED BEFORE PAYMENT · HUMAN APPROVAL REQUIRED BEFORE CUSTOMER-FACING PUBLICATION</p>
    </form>
    {result?.error && <div className="app-note audit-result" role="alert"><strong>AUDIT NOT CREATED:</strong> {result.message || result.error}</div>}
  </section>
}
