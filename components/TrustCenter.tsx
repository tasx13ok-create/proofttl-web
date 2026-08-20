'use client'

import { useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-assistant'

type Status = 'loading' | 'ready' | 'locked' | 'error'
type Section = { status: Status; rows: Array<[string, string]> }

function statusText(status: Status) {
  if (status === 'loading') return 'CHECKING…'
  if (status === 'ready') return 'READY'
  if (status === 'locked') return 'LOCKED / INCOMPLETE'
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
  const [voice, setVoice] = useState<Section>(empty)
  const [readiness, setReadiness] = useState<Section>(empty)

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
        ['Service', String(body?.service || 'ProofTTL')],
        ['Version', String(body?.version || '—')],
        ['Protocol', String(body?.protocol || '—')],
        ['Storage', body?.storage ? 'BOUND' : 'MISSING'],
        ['AI', body?.ai ? 'BOUND' : 'MISSING'],
      ],
    })).catch((error) => setHealth({ status: 'error', rows: [['Error', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/.well-known/proofttl-auth.json').then((body) => {
      const ready = Boolean(body?.configured && body?.sign_in?.google && body?.sign_in?.discord && body?.sign_in?.passkey)
      setAuth({ status: ready ? 'ready' : 'locked', rows: [
        ['Backend', body?.configured ? 'READY' : 'LOCKED'],
        ['GitHub', body?.sign_in?.github ? 'READY' : 'LOCKED'],
        ['Google', body?.sign_in?.google ? 'READY' : 'LOCKED'],
        ['Discord', body?.sign_in?.discord ? 'READY' : 'LOCKED'],
        ['Passkeys', body?.sign_in?.passkey ? 'READY' : 'LOCKED'],
        ['HttpOnly sessions', body?.security?.secure_http_only_sessions ? 'YES' : 'NO'],
        ['CSRF protection', body?.security?.csrf_protection ? 'YES' : 'NO'],
      ] })
    }).catch((error) => setAuth({ status: 'error', rows: [['Error', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/monitor/status').then((body) => {
      const last = body?.last_run || {}
      setMonitoring({ status: body?.enabled === true ? 'ready' : 'locked', rows: [
        ['Automatic monitoring', body?.enabled ? 'ACTIVE' : 'DISABLED'],
        ['Schedule', String(body?.schedule || '—')],
        ['Last run', String(last?.finished_at || last?.started_at || 'NO PERSISTED RUN YET')],
        ['Checked', String(last?.checked ?? '—')],
        ['Revoked', String(last?.revoked ?? '—')],
        ['Expired', String(last?.expired ?? '—')],
        ['Errors', String(last?.errors ?? '—')],
      ] })
    }).catch((error) => setMonitoring({ status: 'error', rows: [['Error', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/.well-known/proofttl-keys.json').then((body) => {
      const key = Array.isArray(body?.keys) ? body.keys[0] : null
      setSigning({ status: body?.signing_enabled === true ? 'ready' : 'locked', rows: [
        ['Signing', body?.signing_enabled ? 'ENABLED' : 'DISABLED'],
        ['Algorithm', String(key?.crv || '—')],
        ['Key ID', String(key?.kid || '—')],
        ['Signature schema', String(body?.signature_version || '—')],
        ['Attestation schema', String(body?.attestation_version || '—')],
        ['Published keys', String(Array.isArray(body?.keys) ? body.keys.length : 0)],
      ] })
    }).catch((error) => setSigning({ status: 'error', rows: [['Error', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/.well-known/proofttl-assistant.json').then((body) => {
      const speechEndpoint = Boolean(body?.endpoints?.speech)
      const voiceOutput = body?.output?.voice === true
      const finalTextSource = body?.output?.voice_source === 'final_response_text'
      const voiceEnabled = body?.output?.voice_capability?.voice_mode === true
      const configured = body?.configured === true
      const ready = Boolean(configured && speechEndpoint && voiceOutput && finalTextSource && voiceEnabled)
      setVoice({ status: ready ? 'ready' : 'locked', rows: [
        ['Assistant runtime', configured ? 'READY' : 'LOCKED'],
        ['STT endpoint', body?.endpoints?.voice ? 'READY' : 'LOCKED'],
        ['Final-response TTS endpoint', speechEndpoint ? 'READY' : 'LOCKED'],
        ['Voice output', voiceOutput ? 'ENABLED' : 'DISABLED'],
        ['Speech source', finalTextSource ? 'FINAL RESPONSE TEXT' : 'LEGACY / UNKNOWN'],
        ['Voice entitlement / preview', voiceEnabled ? 'ENABLED' : 'LOCKED'],
      ] })
    }).catch((error) => setVoice({ status: 'error', rows: [['Error', error instanceof Error ? error.message : 'Unavailable']] }))

    read('/readiness').then((body) => {
      const workspace = body?.workspace || {}
      const commercial = body?.commercial_services || {}
      const studio = body?.studio || {}
      setReadiness({ status: body?.production?.ready ? 'ready' : 'locked', rows: [
        ['Testnet', body?.testnet?.ready ? 'READY' : `${body?.testnet?.score ?? '—'}%`],
        ['Customer auth', body?.customer_auth?.account_product_ready ? 'READY' : 'LOCKED'],
        ['Workspace', workspace?.ready ? 'READY' : 'LOCKED'],
        ['Commercial audits', commercial?.ready ? 'READY' : 'LOCKED'],
        ['Studio cloud', studio?.cloud_projects_ready ? 'READY' : 'LOCKED'],
        ['Isolated runner', studio?.isolated_runner_ready ? 'READY' : 'LOCKED'],
        ['Production', body?.production?.ready ? 'READY' : 'LOCKED'],
        ['Blockers', Array.isArray(body?.production?.blockers) ? body.production.blockers.join(', ') || '—' : '—'],
      ] })
    }).catch((error) => setReadiness({ status: 'error', rows: [['Error', error instanceof Error ? error.message : 'Unavailable']] }))

    return () => controller.abort()
  }, [])

  return <div style={{ display: 'grid', gap: 18 }}>
    <section className="onboarding-card" style={{ padding: 26 }}>
      <p className="app-kicker">PROOFTTL / TRUST CENTER</p>
      <h1 className="app-title">Proof you can inspect.</h1>
      <p className="app-copy">Live backend health, authentication, automatic monitoring, cryptographic signing, L.O.V.E. voice readiness, Workspace readiness, commercial readiness, and execution boundaries. Nothing here marks an unfinished provider as live.</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <a className="button button-primary" href="/workspace/">OPEN WORKSPACE →</a>
        <a className="button button-secondary" href="/login/">SIGN IN</a>
        <a className="text-link" href="/verify-lease.html">VERIFY LEASE →</a>
      </div>
    </section>

    <div className="pricing-cards">
      <Card title="API HEALTH" data={health} />
      <Card title="CUSTOMER AUTHENTICATION" data={auth} />
      <Card title="AUTOMATIC MONITORING" data={monitoring} />
      <Card title="CRYPTOGRAPHIC SIGNING" data={signing} />
      <Card title="VOICE PIPELINE" data={voice} />
    </div>
    <Card title="RELEASE READINESS" data={readiness} />

    <section className="console-panel wide">
      <p className="app-kicker">TRUST BOUNDARY</p>
      <h2>Power is explicit, not implied.</h2>
      <p className="app-copy">Fact Lease claims remain source-grounded. Private account, banking, email, calendar, file, and provider data must come from an authenticated capability. Money, send, delete, and security actions require explicit confirmation before execution.</p>
      <div className="app-table" style={{ marginTop: 12 }}>
        <div className="app-table-row"><span>Fact Lease verdicts</span><span>SUPPORTED / CONTRADICTED / UNKNOWN</span></div>
        <div className="app-table-row"><span>Lease states</span><span>ACTIVE / REVOKED / EXPIRED</span></div>
        <div className="app-table-row"><span>Monitoring history</span><span>TAMPER-EVIDENT SIGNED EVENT CHAIN</span></div>
        <div className="app-table-row"><span>Protocol settlement</span><span>BASE SEPOLIA TESTNET · MAINNET DISABLED</span></div>
        <div className="app-table-row"><span>Sensitive actions</span><span>EXPLICIT CONFIRMATION REQUIRED</span></div>
      </div>
    </section>
  </div>
}
