'use client'

import { useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-assistant'

type Status = 'loading' | 'ready' | 'locked' | 'error'
type Section = { status: Status; rows: Array<[string, string]> }

function label(status: Status) {
  if (status === 'loading') return 'Checking'
  if (status === 'ready') return 'Operational'
  if (status === 'locked') return 'Limited'
  return 'Unavailable'
}

function LiveCard({ title, subtitle, data }: { title: string; subtitle: string; data: Section }) {
  return <article className={`ptl-trust-live-card ${data.status}`}>
    <div className="ptl-trust-live-head"><div><span>{title}</span><p>{subtitle}</p></div><strong><i/>{label(data.status)}</strong></div>
    <div className="ptl-trust-live-rows">{data.rows.map(([name,value]) => <div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div>
  </article>
}

export default function TrustCenter() {
  const empty: Section = { status: 'loading', rows: [['Status','Checking live service…']] }
  const [health, setHealth] = useState<Section>(empty)
  const [auth, setAuth] = useState<Section>(empty)
  const [monitoring, setMonitoring] = useState<Section>(empty)

  useEffect(() => {
    const controller = new AbortController()
    async function read(path: string) {
      const response = await fetch(`${PROOFTTL_API_URL}${path}`, { cache: 'no-store', signal: controller.signal })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body?.message || body?.error || `HTTP ${response.status}`)
      return body
    }

    read('/health').then((body) => setHealth({ status: body?.ok === true ? 'ready' : 'locked', rows: [
      ['Verification service', body?.ok === true ? 'Available' : 'Limited'],
      ['Evidence storage', body?.storage ? 'Bound' : 'Unavailable'],
      ['Verification AI', body?.ai ? 'Bound' : 'Unavailable'],
      ['Version', String(body?.version || '—')],
    ] })).catch((error) => setHealth({ status:'error', rows:[['Status', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/.well-known/proofttl-auth.json').then((body) => {
      const ready = Boolean(body?.configured && body?.security?.secure_http_only_sessions && body?.security?.csrf_protection)
      setAuth({ status: ready ? 'ready' : 'locked', rows: [
        ['Customer accounts', body?.configured ? 'Available' : 'Limited'],
        ['Google sign-in', body?.sign_in?.google ? 'Available' : 'Unavailable'],
        ['GitHub sign-in', body?.sign_in?.github ? 'Available' : 'Unavailable'],
        ['Passkeys', body?.sign_in?.passkey ? 'Available' : 'Unavailable'],
        ['HttpOnly sessions', body?.security?.secure_http_only_sessions ? 'Yes' : 'No'],
        ['CSRF protection', body?.security?.csrf_protection ? 'Yes' : 'No'],
      ] })
    }).catch((error) => setAuth({ status:'error', rows:[['Status', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/monitor/status').then((body) => {
      const last = body?.last_run || {}
      setMonitoring({ status: body?.enabled === true ? 'ready' : 'locked', rows: [
        ['Audit monitoring', body?.enabled ? 'Active' : 'Limited'],
        ['Schedule', String(body?.schedule || '—')],
        ['Last completed run', String(last?.finished_at || last?.started_at || 'No persisted run yet')],
        ['Findings checked', String(last?.checked ?? '—')],
        ['Changes detected', String(last?.revoked ?? '—')],
      ] })
    }).catch((error) => setMonitoring({ status:'error', rows:[['Status', error instanceof Error ? error.message : 'Unavailable']] }))

    return () => controller.abort()
  }, [])

  return <>
    <section className="ptl-trust-live-grid">
      <LiveCard title="VERIFICATION SERVICE" subtitle="Core evidence and model bindings" data={health}/>
      <LiveCard title="CUSTOMER ACCOUNT SECURITY" subtitle="Authentication and session controls" data={auth}/>
      <LiveCard title="SEVEN-DAY WATCH" subtitle="Monitoring status for important findings" data={monitoring}/>
    </section>

    <section className="ptl-detail-section"><header><span>PAYMENT + DELIVERY BOUNDARY</span><h2>Know what you are paying for before you pay.</h2><p>The commercial flow is intentionally boring where money is involved.</p></header><div className="ptl-boundary-list"><article><strong>Intake</strong><p>NO CARD REQUIRED. Send the real outputs first.</p></article><article><strong>Scope</strong><p>CONFIRMED BEFORE PAYMENT REQUEST. ProofTTL verifies fit before creating checkout.</p></article><article><strong>Payment</strong><p>$1,500 fixed scope. Card details are handled by Stripe rather than stored by ProofTTL.</p></article><article><strong>Publication</strong><p>Customer-facing findings require explicit human approval.</p></article></div></section>

    <section className="ptl-detail-section"><header><span>WHAT THE BUYER RECEIVES</span><h2>A readable evidence trail, not a black box.</h2><p>Each important finding keeps the exact claim, supporting and contradicting evidence, uncertainty, verdict, human decision, and monitored follow-up together.</p></header></section>

    <section className="ptl-trust-principles">
      <article><span>01</span><h3>No invented certainty.</h3><p>SUPPORTED, CONTRADICTED, and UNKNOWN stay distinct. Incomplete evidence is allowed to remain incomplete.</p></article>
      <article><span>02</span><h3>No invisible publication.</h3><p>Automation may assemble evidence. A human controls the customer-facing finding.</p></article>
      <article><span>03</span><h3>No timeless claims.</h3><p>Important findings are monitored for seven days because evidence can change after the initial review.</p></article>
    </section>

    <section className="ptl-detail-cta"><div><span>Buyer boundary</span><h2>Know exactly what you are paying for.</h2><p>Up to 25 outputs or claims, highest-risk findings deep-verified, human approval, proof/report delivery, and a seven-day watch.</p></div><div className="ptl-detail-actions"><a className="primary" href="/audit/#audit-intake">START FACT AUDIT <span>↗</span></a><a href="/audit/sample/">VIEW SAMPLE</a></div></section>

    <p className="ptl-detail-note">ProofTTL does not replace legal, medical, financial, regulatory, accounting, or other professional judgment.</p>
  </>
}
