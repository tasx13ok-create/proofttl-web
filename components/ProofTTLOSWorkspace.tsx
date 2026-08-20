'use client'

import { FormEvent, useMemo, useState } from 'react'
import { askProofTTLByText, assistantNavigationHref } from '../lib/proofttl-assistant'
import { AREA_META, PROOFTTL_CAPABILITIES, RISK_POLICY, type CapabilityRisk } from '../lib/proofttl-capabilities'

const AREA_ORDER = ['love', 'truth', 'studio', 'money', 'work', 'files', 'automations', 'connections', 'security'] as const

function stateLabel(state: 'live' | 'built_locked' | 'planned') {
  if (state === 'live') return 'LIVE'
  if (state === 'built_locked') return 'BUILT · CONNECTION REQUIRED'
  return 'PLANNED'
}

function localAreaRoute(value: string) {
  const text = value.toLowerCase().replace(/\s+/g, ' ').trim()
  const navigation = /\b(?:open|show|go(?:\s+to)?|take\s+me(?:\s+to)?|view|visit|launch)\b/
  if (!navigation.test(text)) return null
  const routes: Array<[RegExp, string, string]> = [
    [/\b(?:workspace|command center|control center|ai os)\b/, '/workspace/', 'Workspace'],
    [/\b(?:money|financial|banking)\b/, '/money/', 'Money'],
    [/\b(?:work|email|calendar)\b/, '/work/', 'Work'],
    [/\b(?:files?|library)\b/, '/files/', 'Files'],
    [/\bautomations?\b/, '/automations/', 'Automations'],
    [/\b(?:connections?|integrations?|providers?)\b/, '/connections/', 'Connections'],
  ]
  for (const [pattern, route, label] of routes) if (pattern.test(text)) return { route, label }
  return null
}

export default function ProofTTLOSWorkspace() {
  const [command, setCommand] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'live' | 'built_locked' | 'planned'>('all')

  const visible = useMemo(() => filter === 'all' ? PROOFTTL_CAPABILITIES : PROOFTTL_CAPABILITIES.filter((item) => item.state === filter), [filter])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const value = command.trim()
    if (!value || loading) return

    const local = localAreaRoute(value)
    if (local) {
      setAnswer(`Opening ${local.label}.`)
      setCommand('')
      window.setTimeout(() => window.location.assign(local.route), 350)
      return
    }

    setLoading(true)
    setAnswer('')
    try {
      const result = await askProofTTLByText(value, [])
      setAnswer(result.response || 'L.O.V.E. did not return a response.')
      if (result.action) {
        const href = assistantNavigationHref(result.action)
        if (href) window.setTimeout(() => window.location.assign(href), 450)
      }
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'L.O.V.E. is unavailable right now.')
    } finally {
      setLoading(false)
      setCommand('')
    }
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className="onboarding-card" style={{ padding: 26 }}>
        <p className="app-kicker">PROOFTTL AI WORKSPACE</p>
        <h1 className="app-title">Don’t choose an app. Say what you want done.</h1>
        <p className="app-copy" style={{ maxWidth: 960 }}>
          L.O.V.E. is becoming the control layer across ProofTTL: verification, coding, account security, future work integrations, files, automations, and financial intelligence. Connected systems stay separate underneath; the user gets one command surface above them.
        </p>

        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginTop: 20 }}>
          <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Ask L.O.V.E. or enter a command…" aria-label="Universal ProofTTL command" style={{ minHeight: 48 }} />
          <button className="button button-primary" disabled={!command.trim() || loading}>{loading ? 'RUNNING…' : 'RUN WITH L.O.V.E. →'}</button>
        </form>

        {answer && <div className="app-empty" style={{ marginTop: 12 }}><div className="app-empty-meta">L.O.V.E.</div><strong>{answer}</strong></div>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {['Open Studio', 'Open Money', 'Open Connections', 'Show my audits', 'Verify a claim', 'Go to security'].map((sample) => (
            <button key={sample} type="button" className="text-link" onClick={() => setCommand(sample)}>{sample}</button>
          ))}
        </div>
      </section>

      <section className="console-panel wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <p className="app-kicker">PERMISSION MODEL</p>
            <h2>Power scales with risk.</h2>
            <p className="app-copy">Reading and navigation can be fast. Money movement, sending, destructive actions, and security changes require explicit confirmation before execution.</p>
          </div>
        </div>
        <div className="auth-capability-grid" style={{ marginTop: 14 }}>
          {(Object.entries(RISK_POLICY) as Array<[CapabilityRisk, { label: string; confirmation: string }]>).map(([risk, policy]) => (
            <div className="auth-capability" key={risk} style={{ textAlign: 'left' }}><strong>{policy.label}</strong><small style={{ display: 'block', marginTop: 5 }}>{policy.confirmation}</small></div>
          ))}
        </div>
      </section>

      <section className="console-panel wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><p className="app-kicker">CAPABILITY MAP</p><h2>One interface, many systems.</h2></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['all', 'live', 'built_locked', 'planned'] as const).map((value) => <button key={value} type="button" className={filter === value ? 'button button-primary' : 'button button-secondary'} onClick={() => setFilter(value)}>{value.replace('_', ' ').toUpperCase()}</button>)}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 18, marginTop: 18 }}>
          {AREA_ORDER.map((area) => {
            const items = visible.filter((item) => item.area === area)
            if (!items.length) return null
            const meta = AREA_META[area]
            return <section key={area}>
              <div style={{ marginBottom: 8 }}><strong>{meta.label}</strong><small style={{ display: 'block' }}>{meta.description}</small></div>
              <div className="pricing-cards">
                {items.map((item) => <article key={item.id}>
                  <span className="plan-label">{stateLabel(item.state)}</span>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
                    <span className="app-status">{RISK_POLICY[item.risk].label}</span>
                    {item.route && <a className="text-link" href={item.route}>OPEN →</a>}
                  </div>
                  <small style={{ display: 'block', marginTop: 10 }}>Try: {item.examples.join(' · ')}</small>
                </article>)}
              </div>
            </section>
          })}
        </div>
      </section>

      <section className="console-panel wide">
        <p className="app-kicker">THE RULE</p>
        <h2>Integration beats rebuilding everything.</h2>
        <p className="app-copy">ProofTTL does not need to become Gmail, a bank, GitHub, a calendar provider, and every AI company internally. The platform owns identity, permissions, orchestration, verification, user experience, and auditability while approved providers supply specialized rails underneath.</p>
        <div className="app-table" style={{ marginTop: 14 }}>
          <div className="app-table-row"><span>INTENT</span><span>“What do I want done?”</span><span>L.O.V.E.</span></div>
          <div className="app-table-row"><span>PERMISSION</span><span>What may happen without confirmation?</span><span>POLICY</span></div>
          <div className="app-table-row"><span>CAPABILITY</span><span>Which connected system can do it?</span><span>REGISTRY</span></div>
          <div className="app-table-row"><span>EXECUTION</span><span>Perform the allowed action.</span><span>PROVIDER / PROOFTTL</span></div>
          <div className="app-table-row"><span>EVIDENCE</span><span>What happened and why?</span><span>RECEIPT / FACT LEASE</span></div>
        </div>
      </section>
    </div>
  )
}
