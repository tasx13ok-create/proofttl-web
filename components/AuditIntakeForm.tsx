'use client'

import { FormEvent, useMemo, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'

type OfferType = 'stress_test' | 'full_audit'
type IntakeResponse = {
  ok?: boolean
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
    label: 'CLAIM STRESS TEST',
    price: '$129',
    claims: '3–5 claims',
    turnaround: '48-hour turnaround',
    monitoring: 'No ongoing monitoring',
    description: 'Lower-friction first pass using the same source-backed methodology and signed Fact Leases.',
  },
  full_audit: {
    label: 'FULL VERIFICATION AUDIT',
    price: '$500',
    claims: '10–25 claims',
    turnaround: '3–5 business days',
    monitoring: '7-day source monitoring',
    description: 'The flagship review for a launch, raise, sales cycle, client deliverable, or other high-stakes claim set.',
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

    const form = new FormData(event.currentTarget)
    const payload = {
      offer_type: offerType,
      email: String(form.get('email') || ''),
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
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = await response.json().catch(() => ({})) as IntakeResponse
      if (!response.ok) {
        setResult({ error: body.error || `HTTP ${response.status}` })
      } else {
        setResult(body)
        if (body.audit_intake_id) event.currentTarget.reset()
      }
    } catch {
      setResult({ error: 'Could not reach ProofTTL intake. Please try again shortly.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="onboarding-card" style={{ marginTop: 24 }} id="audit-intake">
      <p className="app-kicker">START WITH THE RIGHT SCOPE</p>
      <h2 style={{ marginTop: 8 }}>Pick the size. Send the claims. No payment yet.</h2>
      <p className="app-copy">
        We review the exact scope first. You get a reference number immediately, then a scope confirmation within 24 hours before payment is requested.
      </p>

      <div className="pricing-cards" style={{ marginTop: 18 }} aria-label="Choose verification offer">
        {(Object.keys(offerCopy) as OfferType[]).map((type) => {
          const item = offerCopy[type]
          const selected = offerType === type
          return (
            <button
              key={type}
              type="button"
              className={selected ? 'featured-plan' : ''}
              aria-pressed={selected}
              onClick={() => { setOfferType(type); setResult(null) }}
              style={{ textAlign: 'left', cursor: 'pointer' }}
            >
              <span className="plan-label">{item.label}</span>
              <div className="price">{item.price}<span> one-time</span></div>
              <p>{item.claims} · {item.turnaround}</p>
              <p>{item.monitoring}</p>
              <small>{item.description}</small>
            </button>
          )
        })}
      </div>

      {offerType === 'stress_test' && (
        <p className="app-note" style={{ marginTop: 14 }}>
          If the Stress Test proves useful, upgrade to the $500 Full Audit for <strong>$371 more</strong>. Your first $129 is credited in full.
        </p>
      )}

      <form onSubmit={submit} style={{ display: 'grid', gap: 14, marginTop: 18 }}>
        <input type="hidden" name="offer_type" value={offerType} />
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          EMAIL
          <input name="email" type="email" required maxLength={254} placeholder="you@company.com" />
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          COMPANY OR PROJECT
          <input name="company_or_project" required maxLength={160} placeholder="Acme AI" />
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          WEBSITE / DOCS URL <span className="app-meta">OPTIONAL</span>
          <input name="website_url" type="url" maxLength={600} placeholder="https://example.com/docs" />
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          WHAT SHOULD WE VERIFY?
          <textarea name="claim_scope" required maxLength={4000} rows={5} placeholder={offerType === 'stress_test' ? 'Paste or describe the 3–5 claims that would hurt if they were wrong.' : 'Paste or describe the 10–25 claims that matter before launch, fundraising, sales, client delivery, or review.'} />
        </label>
        {offerType === 'full_audit' ? (
          <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
            APPROXIMATE CLAIM COUNT
            <select name="approximate_claims" defaultValue="10-15" required>
              <option value="10-15">10–15 claims</option>
              <option value="16-25">16–25 claims</option>
              <option value="25+">More than 25 — scope separately</option>
            </select>
          </label>
        ) : (
          <input type="hidden" name="approximate_claims" value="3-5" />
        )}
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          WHY DO THESE CLAIMS MATTER?
          <textarea name="why_it_matters" required maxLength={2500} rows={4} placeholder="Launch risk, investor diligence, customer-facing claims, sales material, client delivery, regulatory scrutiny..." />
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          DEADLINE <span className="app-meta">OPTIONAL</span>
          <input name="deadline" maxLength={120} placeholder="Friday / before launch / no rush" />
        </label>

        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Company site<input name="company_site" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? 'SUBMITTING…' : `SUBMIT ${offer.label} FOR SCOPE REVIEW →`}
        </button>
        <p className="app-note">
          Selected: <strong>{offer.price}</strong> · {offer.claims} · {offer.turnaround}. Scope confirmation comes before payment.
        </p>
      </form>

      {result?.audit_intake_id && (
        <div className="app-note" role="status" style={{ marginTop: 18 }}>
          <strong>REQUEST RECEIVED.</strong><br />
          Reference: <code>{result.audit_intake_id}</code><br />
          Offer: {result.offer?.name || offer.label} · ${result.offer?.price_usd || offer.price.replace('$', '')}<br />
          {result.next_step || 'Scope review comes before payment.'}
        </div>
      )}

      {result?.error && (
        <div className="app-note" role="alert" style={{ marginTop: 18 }}>
          <strong>INTAKE NOT SUBMITTED:</strong> {result.error}
        </div>
      )}
    </div>
  )
}
