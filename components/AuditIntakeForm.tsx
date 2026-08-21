'use client'

import { FormEvent, useMemo, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'
const AUDIT_STORAGE_KEY = 'proofttl:last-audit-request'

type OfferType = 'stress_test' | 'full_audit'
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

const offerCopy = {
  stress_test: {
    label: 'Claim Stress Test', price: '$129', claims: '3–5 claims', turnaround: '48 hours',
  },
  full_audit: {
    label: 'Full Verification Audit', price: '$500', claims: '10–25 claims', turnaround: '3–5 business days',
  },
} satisfies Record<OfferType, Record<string, string>>

export default function AuditIntakeForm({ initialOffer = 'stress_test' }: { initialOffer?: OfferType }) {
  const [offerType, setOfferType] = useState<OfferType>(initialOffer)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<IntakeResponse | null>(null)
  const offer = useMemo(() => offerCopy[offerType], [offerType])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setResult(null)

    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const payload = {
      offer_type: offerType,
      email: String(form.get('email') || '').trim(),
      company_or_project: String(form.get('company_or_project') || ''),
      website_url: String(form.get('website_url') || ''),
      claim_scope: String(form.get('claim_scope') || ''),
      approximate_claims: offerType === 'stress_test' ? '3-5' : String(form.get('approximate_claims') || ''),
      why_it_matters: String(form.get('why_it_matters') || ''),
      deadline: String(form.get('deadline') || ''),
      company_site: String(form.get('company_site') || ''),
    }

    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/audit/intake`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({})) as IntakeResponse
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
          } catch {}
          formElement.reset()
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
          <h2 id="audit-intake-heading">No card. No commitment. Scope first.</h2>
        </div>
        <div className="audit-offer-switch" aria-label="Choose verification offer">
          <button type="button" className={offerType === 'stress_test' ? 'active' : ''} aria-pressed={offerType === 'stress_test'} onClick={() => { setOfferType('stress_test'); setResult(null) }}>$129 · 3–5 claims</button>
          <button type="button" className={offerType === 'full_audit' ? 'active' : ''} aria-pressed={offerType === 'full_audit'} onClick={() => { setOfferType('full_audit'); setResult(null) }}>$500 · 10–25 claims</button>
        </div>
      </div>

      <p className="audit-selected-offer"><strong>{offer.label}</strong> · {offer.claims} · {offer.turnaround}. We review the scope before sending any payment link.</p>
      {offerType === 'stress_test' && <p className="audit-credit-note">Upgrade later for <strong>$371 more</strong>; the first $129 is credited in full.</p>}

      <form className="audit-clean-form" onSubmit={submit}>
        <input type="hidden" name="offer_type" value={offerType} />
        <div className="audit-form-grid two">
          <label>EMAIL<input name="email" type="email" required maxLength={254} placeholder="you@company.com" /></label>
          <label>COMPANY OR PROJECT<input name="company_or_project" required maxLength={160} placeholder="Acme AI" /></label>
        </div>
        <label>WEBSITE / DOCS URL <span>OPTIONAL</span><input name="website_url" type="url" maxLength={600} placeholder="https://example.com/docs" /></label>
        <label>CLAIMS TO VERIFY<textarea name="claim_scope" required maxLength={4000} rows={5} placeholder={offerType === 'stress_test' ? 'Paste the 3–5 claims that would hurt if they were wrong.' : 'Paste or describe the 10–25 claims that matter before launch, fundraising, sales, client delivery, or review.'} /></label>
        {offerType === 'full_audit' ? (
          <label>APPROXIMATE CLAIM COUNT<select name="approximate_claims" defaultValue="10-15" required><option value="10-15">10–15 claims</option><option value="16-25">16–25 claims</option><option value="25+">More than 25 — scope separately</option></select></label>
        ) : <input type="hidden" name="approximate_claims" value="3-5" />}
        <div className="audit-form-grid two">
          <label>WHY IT MATTERS<textarea name="why_it_matters" required maxLength={2500} rows={3} placeholder="Launch risk, investor diligence, customer-facing claims..." /></label>
          <label>DEADLINE <span>OPTIONAL</span><textarea name="deadline" maxLength={120} rows={3} placeholder="Friday / before launch / no rush" /></label>
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}><label>Company site<input name="company_site" tabIndex={-1} autoComplete="off" /></label></div>
        <button className="button button-primary audit-submit-button" type="submit" disabled={submitting}>{submitting ? 'SUBMITTING…' : `SUBMIT ${offer.label.toUpperCase()} FOR SCOPE REVIEW →`}</button>
        <p className="audit-form-footnote">SCOPE REVIEW BEFORE PAYMENT · REFERENCE NUMBER RETURNED IMMEDIATELY</p>
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
