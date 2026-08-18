'use client'

import { FormEvent, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'

type IntakeResponse = {
  ok?: boolean
  audit_intake_id?: string
  status?: string
  next_step?: string
  error?: string
}

export default function AuditIntakeForm() {
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<IntakeResponse | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setResult(null)

    const form = new FormData(event.currentTarget)
    const payload = {
      email: String(form.get('email') || ''),
      company_or_project: String(form.get('company_or_project') || ''),
      website_url: String(form.get('website_url') || ''),
      claim_scope: String(form.get('claim_scope') || ''),
      approximate_claims: String(form.get('approximate_claims') || ''),
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
      <p className="app-kicker">START THE AUDIT</p>
      <h2 style={{ marginTop: 8 }}>Send the scope. No payment yet.</h2>
      <p className="app-copy">
        Tell us what needs checking. ProofTTL records the request and returns a reference number. We confirm scope before asking for the $500 pilot payment.
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
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
          <textarea name="claim_scope" required maxLength={4000} rows={5} placeholder="Pricing claims, API documentation, product capabilities, AI output, research claims..." />
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          APPROXIMATE CLAIM COUNT
          <select name="approximate_claims" defaultValue="10-15" required>
            <option value="10-15">10–15 claims</option>
            <option value="16-25">16–25 claims</option>
            <option value="25+">More than 25 — scope separately</option>
          </select>
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          WHY DO THESE CLAIMS MATTER?
          <textarea name="why_it_matters" required maxLength={2500} rows={4} placeholder="Customer-facing claims, investor diligence, launch risk, client delivery, compliance review..." />
        </label>
        <label className="app-copy" style={{ display: 'grid', gap: 6 }}>
          DEADLINE <span className="app-meta">OPTIONAL</span>
          <input name="deadline" maxLength={120} placeholder="Friday / before launch / no rush" />
        </label>

        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>Company site<input name="company_site" tabIndex={-1} autoComplete="off" /></label>
        </div>

        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? 'SUBMITTING…' : 'SUBMIT FOR SCOPE REVIEW →'}
        </button>
      </form>

      {result?.audit_intake_id && (
        <div className="app-note" role="status" style={{ marginTop: 18 }}>
          <strong>REQUEST RECEIVED.</strong><br />
          Reference: <code>{result.audit_intake_id}</code><br />
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
