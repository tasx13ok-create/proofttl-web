'use client'

import { FormEvent, useEffect, useMemo, useState, type PointerEvent } from 'react'
import { authClient, PROOFTTL_API_URL, rememberAuthReturn, signInHref } from '../lib/proofttl-auth'

const AUDIT_STORAGE_KEY = 'proofttl:last-audit-request'
const AUDIT_DRAFT_KEY = 'proofttl:audit-draft-v1'

type OfferType = 'stress_test' | 'full_audit'
type AuthState = 'checking' | 'signed_in' | 'signed_out' | 'error'
type IntakeResponse = {
  ok?: boolean
  duplicate?: boolean
  audit_intake_id?: string
  status?: string
  next_step?: string
  error?: string
  offer?: {
    type?: OfferType
    name?: string
    price_usd?: number
    turnaround?: string
    upgrade?: { additional_usd?: number; total_usd?: number } | null
  }
}

type AuditDraft = {
  offer_type: OfferType
  email: string
  company_or_project: string
  website_url: string
  claim_scope: string
  approximate_claims: string
  why_it_matters: string
  deadline: string
}

const offerCopy = {
  stress_test: {
    label: 'Claim Stress Test', price: '$129', claims: '3–5 claims', turnaround: '48 hours',
  },
  full_audit: {
    label: 'Full Verification Audit', price: '$500', claims: '10–25 claims', turnaround: '3–5 business days',
  },
} satisfies Record<OfferType, Record<string, string>>

function blankDraft(initialOffer: OfferType): AuditDraft {
  return {
    offer_type: initialOffer,
    email: '',
    company_or_project: '',
    website_url: '',
    claim_scope: '',
    approximate_claims: initialOffer === 'stress_test' ? '3-5' : '10-15',
    why_it_matters: '',
    deadline: '',
  }
}

function auditReturnTo() {
  if (typeof window === 'undefined') return '/audit/#audit-intake'
  return `${window.location.pathname}${window.location.search}#audit-intake`
}

export default function AuditIntakeForm({ initialOffer = 'stress_test' }: { initialOffer?: OfferType }) {
  const [draft, setDraft] = useState<AuditDraft>(() => blankDraft(initialOffer))
  const [draftReady, setDraftReady] = useState(false)
  const [authState, setAuthState] = useState<AuthState>('checking')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<IntakeResponse | null>(null)
  const offerType = draft.offer_type
  const offer = useMemo(() => offerCopy[offerType], [offerType])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUDIT_DRAFT_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AuditDraft>
        const savedOffer: OfferType = saved.offer_type === 'full_audit' ? 'full_audit' : saved.offer_type === 'stress_test' ? 'stress_test' : initialOffer
        setDraft({ ...blankDraft(savedOffer), ...saved, offer_type: savedOffer })
      }
    } catch {}
    setDraftReady(true)
  }, [initialOffer])

  useEffect(() => {
    if (!draftReady) return
    try { localStorage.setItem(AUDIT_DRAFT_KEY, JSON.stringify(draft)) } catch {}
  }, [draft, draftReady])

  useEffect(() => {
    let cancelled = false
    void authClient.getSession().then((session) => {
      if (cancelled) return
      const user = session?.data?.user
      if (user) {
        setAuthState('signed_in')
        const sessionEmail = typeof user.email === 'string' ? user.email.trim() : ''
        if (sessionEmail) setDraft((current) => current.email ? current : { ...current, email: sessionEmail })
        return
      }
      setAuthState('signed_out')
      if (window.location.hash === '#audit-intake') redirectToSignIn()
    }).catch(() => {
      if (!cancelled) setAuthState('error')
    })

    const onHashChange = () => {
      if (window.location.hash === '#audit-intake' && authState === 'signed_out') redirectToSignIn()
    }
    window.addEventListener('hashchange', onHashChange)
    return () => { cancelled = true; window.removeEventListener('hashchange', onHashChange) }
    // authState is intentionally not a dependency: the initial session check owns the redirect decision.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function persistDraft(next = draft) {
    try { localStorage.setItem(AUDIT_DRAFT_KEY, JSON.stringify(next)) } catch {}
  }

  function redirectToSignIn() {
    persistDraft()
    const returnTo = auditReturnTo()
    rememberAuthReturn(returnTo)
    window.location.assign(signInHref(returnTo))
  }

  function update<K extends keyof AuditDraft>(key: K, value: AuditDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setResult(null)
  }

  function chooseOffer(next: OfferType) {
    const nextDraft: AuditDraft = {
      ...draft,
      offer_type: next,
      approximate_claims: next === 'stress_test' ? '3-5' : draft.approximate_claims === '3-5' ? '10-15' : draft.approximate_claims,
    }
    setDraft(nextDraft)
    persistDraft(nextDraft)
    setResult(null)
    if (authState === 'signed_out') redirectToSignIn()
  }

  async function requireSession() {
    try {
      const session = await authClient.getSession()
      if (session?.data?.user) {
        setAuthState('signed_in')
        return true
      }
    } catch {
      setAuthState('error')
    }
    setAuthState('signed_out')
    redirectToSignIn()
    return false
  }

  function gatePointer(event: PointerEvent<HTMLFormElement>) {
    if (authState !== 'signed_out') return
    event.preventDefault()
    redirectToSignIn()
  }

  function gateFocus() {
    if (authState === 'signed_out') redirectToSignIn()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setResult(null)
    persistDraft()

    const signedIn = await requireSession()
    if (!signedIn) return

    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    const payload = {
      offer_type: offerType,
      email: draft.email.trim(),
      company_or_project: draft.company_or_project,
      website_url: draft.website_url,
      claim_scope: draft.claim_scope,
      approximate_claims: offerType === 'stress_test' ? '3-5' : draft.approximate_claims,
      why_it_matters: draft.why_it_matters,
      deadline: draft.deadline,
      company_site: String(form.get('company_site') || ''),
    }

    try {
      const response = await fetch(`${PROOFTTL_API_URL}/audit/intake`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({})) as IntakeResponse
      if (response.status === 401) {
        setAuthState('signed_out')
        redirectToSignIn()
        return
      }
      if (!response.ok) {
        setResult({ error: body.error || `HTTP ${response.status}` })
      } else {
        setResult(body)
        if (body.audit_intake_id) {
          try {
            localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify({
              audit_intake_id: body.audit_intake_id,
              email: payload.email,
              offer_type: offerType,
              saved_at_ms: Date.now(),
            }))
            localStorage.removeItem(AUDIT_DRAFT_KEY)
          } catch {}
          setDraft(blankDraft(offerType))
        }
      }
    } catch {
      setResult({ error: 'Could not reach ProofTTL intake. Please try again shortly.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="audit-intake-clean" id="audit-intake" aria-labelledby="audit-intake-heading">
      <div className="audit-intake-heading-row">
        <div>
          <p className="app-kicker">SUBMIT YOUR CLAIMS</p>
          <h2 id="audit-intake-heading">Scope first. Sign in before submission.</h2>
        </div>
        <div className="audit-offer-switch" aria-label="Choose verification offer">
          <button type="button" className={offerType === 'stress_test' ? 'active' : ''} aria-pressed={offerType === 'stress_test'} onClick={() => chooseOffer('stress_test')}>$129 · 3–5 claims</button>
          <button type="button" className={offerType === 'full_audit' ? 'active' : ''} aria-pressed={offerType === 'full_audit'} onClick={() => chooseOffer('full_audit')}>$500 · 10–25 claims</button>
        </div>
      </div>

      <p className="audit-selected-offer"><strong>{offer.label}</strong> · {offer.claims} · {offer.turnaround}. Your draft is saved in this browser. If you are not signed in when you start the form, ProofTTL sends you to sign in and returns you here with the draft restored.</p>
      {offerType === 'stress_test' && <p className="audit-credit-note">Upgrade later for <strong>$371 more</strong>; the first $129 is credited in full.</p>}
      {authState === 'checking' && <p className="audit-form-footnote">CHECKING PROOFTTL SESSION…</p>}
      {authState === 'signed_out' && <button className="button button-primary audit-submit-button" type="button" onClick={redirectToSignIn}>SIGN IN TO START VERIFICATION →</button>}
      {authState === 'error' && <p className="app-note" role="alert"><strong>SESSION CHECK FAILED.</strong> Sign in again before submitting an audit.</p>}

      <form className="audit-clean-form" onSubmit={submit} onPointerDownCapture={gatePointer} onFocusCapture={gateFocus}>
        <input type="hidden" name="offer_type" value={offerType} />
        <div className="audit-form-grid two">
          <label>EMAIL<input name="email" type="email" required maxLength={254} placeholder="you@company.com" value={draft.email} onChange={(e) => update('email', e.target.value)} /></label>
          <label>COMPANY OR PROJECT<input name="company_or_project" required maxLength={160} placeholder="Acme AI" value={draft.company_or_project} onChange={(e) => update('company_or_project', e.target.value)} /></label>
        </div>
        <label>WEBSITE / DOCS URL <span>OPTIONAL</span><input name="website_url" type="url" maxLength={600} placeholder="https://example.com/docs" value={draft.website_url} onChange={(e) => update('website_url', e.target.value)} /></label>
        <label>CLAIMS TO VERIFY<textarea name="claim_scope" required maxLength={4000} rows={5} value={draft.claim_scope} onChange={(e) => update('claim_scope', e.target.value)} placeholder={offerType === 'stress_test' ? 'Paste the 3–5 claims that would hurt if they were wrong.' : 'Paste or describe the 10–25 claims that matter before launch, fundraising, sales, client delivery, or review.'} /></label>
        {offerType === 'full_audit' ? (
          <label>APPROXIMATE CLAIM COUNT<select name="approximate_claims" value={draft.approximate_claims} onChange={(e) => update('approximate_claims', e.target.value)} required><option value="10-15">10–15 claims</option><option value="16-25">16–25 claims</option><option value="25+">More than 25 — scope separately</option></select></label>
        ) : <input type="hidden" name="approximate_claims" value="3-5" />}
        <div className="audit-form-grid two">
          <label>WHY IT MATTERS<textarea name="why_it_matters" required maxLength={2500} rows={3} value={draft.why_it_matters} onChange={(e) => update('why_it_matters', e.target.value)} placeholder="Launch risk, investor diligence, customer-facing claims..." /></label>
          <label>DEADLINE <span>OPTIONAL</span><textarea name="deadline" maxLength={120} rows={3} value={draft.deadline} onChange={(e) => update('deadline', e.target.value)} placeholder="Friday / before launch / no rush" /></label>
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}><label>Company site<input name="company_site" tabIndex={-1} autoComplete="off" /></label></div>
        <button className="button button-primary audit-submit-button" type="submit" disabled={submitting}>{submitting ? 'SUBMITTING…' : `SUBMIT ${offer.label.toUpperCase()} FOR SCOPE REVIEW →`}</button>
        <p className="audit-form-footnote">SIGN-IN REQUIRED TO USE AUDIT INTAKE · DRAFT SAVED LOCALLY · SCOPE REVIEW BEFORE PAYMENT</p>
      </form>

      {result?.audit_intake_id && (
        <div className="app-note audit-result" role="status">
          <strong>{result.duplicate ? 'REQUEST ALREADY RECEIVED.' : 'REQUEST RECEIVED.'}</strong><br />
          Reference: <code>{result.audit_intake_id}</code><br />
          Offer: {result.offer?.name || offer.label} · ${result.offer?.price_usd || offer.price.replace('$', '')}<br />
          {result.next_step || 'Scope review comes before payment.'}<br />
          <a href={`/audit/status/?request=${encodeURIComponent(result.audit_intake_id)}`}>CHECK THIS REQUEST →</a>
        </div>
      )}

      {result?.error && <div className="app-note audit-result" role="alert"><strong>INTAKE NOT SUBMITTED:</strong> {result.error}</div>}
    </section>
  )
}
