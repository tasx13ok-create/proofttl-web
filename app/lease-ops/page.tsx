'use client'

import { useEffect, useMemo, useState } from 'react'

const API = 'https://proofttl.tasx13ok.workers.dev'

type Lease = Record<string, any>

function currentStatus(lease: Lease | null) {
  if (!lease) return 'UNKNOWN'
  return lease.current_status || lease.revocation?.current_status || lease.last_check?.status || lease.issued_status || lease.status || 'UNKNOWN'
}

export default function LeaseOpsPage() {
  const [leaseId, setLeaseId] = useState('')
  const [lease, setLease] = useState<Lease | null>(null)
  const [state, setState] = useState<'idle'|'loading'|'ok'|'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    if (id) setLeaseId(id)
  }, [])

  const failures = useMemo(() => {
    const history = Array.isArray(lease?.history) ? lease!.history : []
    return history.filter((event: any) => event?.result === 'SOURCE_UNAVAILABLE' || String(event?.reason || '').includes('source_http_')).reverse()
  }, [lease])

  const renewalPayload = lease ? JSON.stringify({
    claim: lease.claim,
    source_url: lease.source_url,
    ttl_seconds: Number(lease.ttl_seconds) || 3600,
    previous_lease_id: lease.lease_id,
  }, null, 2) : ''

  async function loadLease() {
    const id = leaseId.trim()
    if (!id) { setState('error'); setMessage('Enter a Lease ID first.'); return }
    setState('loading'); setMessage('Loading Lease…')
    try {
      const response = await fetch(`${API}/lease/${encodeURIComponent(id)}`, { cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body?.message || body?.error || `HTTP ${response.status}`)
      setLease(body); setState('ok'); setMessage('Lease loaded. Lifecycle tools are ready.')
    } catch (error) {
      setLease(null); setState('error'); setMessage(error instanceof Error ? error.message : 'Lease fetch failed.')
    }
  }

  async function copyShare() {
    if (!lease?.lease_id) return
    const url = new URL('/verify-lease/', window.location.origin)
    url.searchParams.set('id', lease.lease_id)
    await navigator.clipboard.writeText(url.toString())
    setState('ok'); setMessage('Public verification link copied.')
  }

  function downloadLease() {
    if (!lease) return
    const blob = new Blob([JSON.stringify(lease, null, 2) + '\n'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${lease.lease_id || 'proofttl-lease'}.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function copyRenewal() {
    await navigator.clipboard.writeText(renewalPayload)
    setState('ok'); setMessage('Renewal payload copied. It does not authorize payment by itself.')
  }

  return (
    <main className="app-page">
      <section className="app-shell" style={{ padding: '42px 0 90px' }}>
        <p className="app-kicker">PROOFTTL / LEASE OPERATIONS</p>
        <h1 className="app-title">Operate a Fact Lease.</h1>
        <p className="app-copy" style={{ maxWidth: 760 }}>Load an existing Lease, inspect monitoring state, export the artifact, create a verification link, and prepare a clean re-issue payload.</p>

        <section className="console-panel wide" style={{ marginTop: 20 }}>
          <label className="app-input-label">FACT LEASE ID
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginTop: 8 }}>
              <input value={leaseId} onChange={(e) => setLeaseId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void loadLease()} placeholder="ftl_…" style={{ width: '100%', padding: 12 }} />
              <button className="button button-primary" type="button" onClick={() => void loadLease()} disabled={state === 'loading'}>{state === 'loading' ? 'LOADING…' : 'LOAD LEASE'}</button>
            </div>
          </label>
          {message && <p className="app-note" style={{ color: state === 'error' ? '#fb7185' : state === 'ok' ? '#4ade80' : undefined }}>{message}</p>}
        </section>

        {lease && <>
          <section className="console-panel wide" style={{ marginTop: 16 }}>
            <p className="app-kicker">CURRENT LEASE STATE</p>
            <div className="security-summary" style={{ marginTop: 12 }}>
              <div><span>LEASE ID</span><strong>{lease.lease_id || '—'}</strong></div>
              <div><span>ISSUED</span><strong>{lease.issued_status || lease.status || '—'}</strong></div>
              <div><span>CURRENT</span><strong>{currentStatus(lease)}</strong></div>
              <div><span>STATE</span><strong>{lease.lease_state || '—'}</strong></div>
              <div><span>CHECKS</span><strong>{lease.verification_count ?? lease.history?.length ?? 0}</strong></div>
              <div><span>EXPIRES</span><strong>{lease.expires_at || '—'}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              <button className="button" type="button" onClick={() => void copyShare()}>SHARE VERIFICATION LINK</button>
              <button className="button" type="button" onClick={downloadLease}>EXPORT LEASE JSON</button>
              <a className="text-link" href={`/verify-lease/?id=${encodeURIComponent(lease.lease_id || '')}`}>OPEN INDEPENDENT VERIFIER →</a>
            </div>
          </section>

          <section className="console-panel wide" style={{ marginTop: 16 }}>
            <p className="app-kicker">SOURCE MONITORING DIAGNOSTICS</p>
            {failures.length ? failures.map((event: any, index: number) => <div className="app-empty" key={index}><strong>SOURCE UNAVAILABLE</strong><div>{event.reason || 'No machine-readable reason'}</div><small>{event.checked_at || ''}</small></div>) : <div className="app-empty"><strong>No source-unavailable events.</strong><span>The Lease history does not currently contain a monitoring retrieval failure.</span></div>}
          </section>

          <section className="console-panel wide" style={{ marginTop: 16 }}>
            <p className="app-kicker">PREPARE RENEWAL / RE-ISSUE</p>
            <p className="app-note">Renewal creates a new Lease. It does not mutate the original issuance signature.</p>
            <textarea readOnly value={renewalPayload} style={{ width: '100%', minHeight: 170, marginTop: 10, padding: 12, fontFamily: 'IBM Plex Mono, monospace' }} />
            <button className="button" type="button" onClick={() => void copyRenewal()} style={{ marginTop: 10 }}>COPY RENEWAL PAYLOAD</button>
          </section>
        </>}

        <section className="console-panel wide" style={{ marginTop: 16 }}>
          <p className="app-kicker">TRUST REFERENCES</p>
          <p className="app-note"><a className="text-link" href="/methodology/">Methodology</a> · <a className="text-link" href="/verify-lease/">Independent verifier</a> · <a className="text-link" href="/status/">Service status</a></p>
        </section>
      </section>
    </main>
  )
}
