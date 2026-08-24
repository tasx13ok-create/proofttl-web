'use client'

import { useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-assistant'

type Status = 'loading' | 'ready' | 'locked' | 'error'
type Section = { status: Status; rows: Array<[string, string]> }

function statusText(status: Status) {
  if (status === 'loading') return 'CHECKING…'
  if (status === 'ready') return 'READY'
  if (status === 'locked') return 'LIMITED'
  return 'UNAVAILABLE'
}

function Card({ title, data }: { title: string; data: Section }) {
  return <section className="console-panel">
    <p className="app-kicker">{title}</p>
    <h2>{statusText(data.status)}</h2>
    <div className="app-table" style={{ marginTop: 12 }}>
      {data.rows.map(([label, value]) => <div className="app-table-row" key={label}><span>{label}</span><span>{value}</span></div>)}
    </div>
  </section>
}

export default function TrustCenter() {
  const empty: Section = { status: 'loading', rows: [] }
  const [health, setHealth] = useState<Section>(empty)
  const [auth, setAuth] = useState<Section>(empty)
  const [monitoring, setMonitoring] = useState<Section>(empty)
  const [signing, setSigning] = useState<Section>(empty)

  useEffect(() => {
    const controller = new AbortController()
    async function read(path: string) {
      const response = await fetch(`${PROOFTTL_API_URL}${path}`, { cache: 'no-store', signal: controller.signal })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body?.message || body?.error || `HTTP ${response.status}`)
      return body
    }

    read('/health').then((body) => setHealth({
      status: body?.ok === true ? 'ready' : 'locked',
      rows: [
        ['Verification service', body?.ok === true ? 'AVAILABLE' : 'LIMITED'],
        ['Service', String(body?.service || 'ProofTTL')],
        ['Version', String(body?.version || '—')],
        ['Evidence storage', body?.storage ? 'BOUND' : 'UNAVAILABLE'],
        ['Verification AI', body?.ai ? 'BOUND' : 'UNAVAILABLE'],
      ],
    })).catch((error) => setHealth({ status: 'error', rows: [['Status', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/.well-known/proofttl-auth.json').then((body) => {
      const ready = Boolean(body?.configured && body?.security?.secure_http_only_sessions && body?.security?.csrf_protection)
      setAuth({ status: ready ? 'ready' : 'locked', rows: [
        ['Customer accounts', body?.configured ? 'AVAILABLE' : 'LIMITED'],
        ['Google sign-in', body?.sign_in?.google ? 'AVAILABLE' : 'UNAVAILABLE'],
        ['GitHub sign-in', body?.sign_in?.github ? 'AVAILABLE' : 'UNAVAILABLE'],
        ['Passkeys', body?.sign_in?.passkey ? 'AVAILABLE' : 'UNAVAILABLE'],
        ['HttpOnly sessions', body?.security?.secure_http_only_sessions ? 'YES' : 'NO'],
        ['CSRF protection', body?.security?.csrf_protection ? 'YES' : 'NO'],
      ] })
    }).catch((error) => setAuth({ status: 'error', rows: [['Status', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/monitor/status').then((body) => {
      const last = body?.last_run || {}
      setMonitoring({ status: body?.enabled === true ? 'ready' : 'locked', rows: [
        ['Automatic monitoring', body?.enabled ? 'ACTIVE' : 'LIMITED'],
        ['Schedule', String(body?.schedule || '—')],
        ['Last completed run', String(last?.finished_at || last?.started_at || 'NO PERSISTED RUN YET')],
        ['Claims checked', String(last?.checked ?? '—')],
        ['Revoked', String(last?.revoked ?? '—')],
        ['Errors', String(last?.errors ?? '—')],
      ] })
    }).catch((error) => setMonitoring({ status: 'error', rows: [['Status', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/.well-known/proofttl-keys.json').then((body) => {
      const key = Array.isArray(body?.keys) ? body.keys[0] : null
      setSigning({ status: body?.signing_enabled === true ? 'ready' : 'locked', rows: [
        ['Signed Fact Leases', body?.signing_enabled ? 'ENABLED' : 'LIMITED'],
        ['Algorithm', String(key?.crv || '—')],
        ['Key ID', String(key?.kid || '—')],
        ['Published verification keys', String(Array.isArray(body?.keys) ? body.keys.length : 0)],
      ] })
    }).catch((error) => setSigning({ status: 'error', rows: [['Status', error instanceof Error ? error.message : 'Unavailable']] }))

    return () => controller.abort()
  }, [])

  return <div style={{ display: 'grid', gap: 18 }}>
    <section className="onboarding-card" style={{ padding: 26 }}>
      <p className="app-kicker">PROOFTTL / TRUST CENTER</p>
      <h1 className="app-title">Know what you are paying for before you pay.</h1>
      <p className="app-copy">ProofTTL sells scoped source-backed claim verification. The $129 Claim Stress Test covers 3–5 high-stakes claims and the $500 Full Verification Audit covers 10–25 claims. Scope is confirmed before a Stripe payment request is created. Card details are handled by Stripe rather than stored by ProofTTL.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <a className="button button-primary" href="/audit/#audit-intake">START VERIFICATION →</a>
        <a className="button button-secondary" href="/audit/sample/">VIEW SAMPLE</a>
        <a className="text-link" href="/verify-lease.html">VERIFY A FACT LEASE →</a>
      </div>
    </section>

    <div className="pricing-cards">
      <Card title="VERIFICATION SERVICE" data={health} />
      <Card title="CUSTOMER ACCOUNT SECURITY" data={auth} />
      <Card title="FACT LEASE MONITORING" data={monitoring} />
      <Card title="CRYPTOGRAPHIC SIGNING" data={signing} />
    </div>

    <section className="console-panel wide">
      <p className="app-kicker">PAYMENT + DELIVERY BOUNDARY</p>
      <h2>No surprise charge and no invented certainty.</h2>
      <div className="app-table" style={{ marginTop: 12 }}>
        <div className="app-table-row"><span>Intake</span><span>NO CARD REQUIRED</span></div>
        <div className="app-table-row"><span>Scope</span><span>CONFIRMED BEFORE PAYMENT REQUEST</span></div>
        <div className="app-table-row"><span>Payment processing</span><span>STRIPE-HOSTED / TOKENIZED</span></div>
        <div className="app-table-row"><span>Claim verdicts</span><span>SUPPORTED / CONTRADICTED / UNKNOWN</span></div>
        <div className="app-table-row"><span>Full-audit monitoring</span><span>7 DAYS FOR THE AGREED CLAIM SET</span></div>
        <div className="app-table-row"><span>Professional advice</span><span>NOT LEGAL, MEDICAL, FINANCIAL, OR REGULATORY ADVICE</span></div>
      </div>
    </section>

    <section className="console-panel wide">
      <p className="app-kicker">TECHNICAL PROTOCOL BOUNDARY</p>
      <h2>The developer payment rail is separate from the human service.</h2>
      <p className="app-copy">ProofTTL also has a technical Fact Lease API whose x402 settlement rail remains on Base Sepolia testnet. That testnet protocol does not process the human verification-service payment. Human audit payments use the live Stripe-backed scope-first flow described above.</p>
    </section>
  </div>
}
