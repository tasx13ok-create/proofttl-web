'use client'

import { FormEvent, useMemo, useState } from 'react'
import { askProofTTLByText, assistantNavigationHref } from '../lib/proofttl-assistant'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'
import { AREA_META, PROOFTTL_CAPABILITIES, RISK_POLICY, type CapabilityRisk } from '../lib/proofttl-capabilities'

const AREA_ORDER = ['love', 'truth', 'studio', 'money', 'work', 'files', 'automations', 'connections', 'security'] as const

type CommandPlan = {
  resolved?: boolean
  type?: 'navigate' | 'capability_action' | 'model_fallback'
  route?: string
  label?: string
  action_id?: string
  area?: string
  risk?: string
  risk_label?: string
  confirmation_required?: boolean
  executable_now?: boolean
}

type PendingAction = {
  command: string
  action_id: string
  risk: string
  receipt_id?: string
  persisted?: boolean
}

function stateLabel(state: 'live' | 'built_locked' | 'planned') {
  if (state === 'live') return 'LIVE'
  if (state === 'built_locked') return 'BUILT · CONNECTION REQUIRED'
  return 'PLANNED'
}

async function fetchCommandPlan(command: string): Promise<CommandPlan | null> {
  try {
    const response = await fetch(`${PROOFTTL_API_URL}/commands/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ command }),
    })
    if (!response.ok) return null
    return await response.json() as CommandPlan
  } catch { return null }
}

async function createActionPlan(actionId: string, command: string) {
  const response = await fetch(`${PROOFTTL_API_URL}/actions/plan`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action_id: actionId, input_summary: command }),
  })
  return response.json().catch(() => ({})) as Promise<{ confirmation_required?: boolean; executable?: boolean; receipt?: { receipt_id?: string; persisted?: boolean; state?: string }; message?: string; error?: string }>
}

export default function ProofTTLOSWorkspace() {
  const [command, setCommand] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [filter, setFilter] = useState<'all' | 'live' | 'built_locked' | 'planned'>('all')

  const visible = useMemo(() => filter === 'all' ? PROOFTTL_CAPABILITIES : PROOFTTL_CAPABILITIES.filter((item) => item.state === filter), [filter])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const value = command.trim()
    if (!value || loading) return
    setLoading(true)
    setAnswer('')
    setPendingAction(null)

    try {
      const plan = await fetchCommandPlan(value)
      if (plan?.resolved && plan.type === 'navigate' && plan.route) {
        setAnswer(`Opening ${plan.label || 'that area'}.`)
        setCommand('')
        window.setTimeout(() => window.location.assign(plan.route!), 350)
        return
      }

      if (plan?.resolved && plan.type === 'capability_action' && plan.action_id) {
        const action = await createActionPlan(plan.action_id, value)
        const receipt = action.receipt
        const pending: PendingAction = {
          command: value,
          action_id: plan.action_id,
          risk: plan.risk || 'unknown',
          receipt_id: receipt?.receipt_id,
          persisted: receipt?.persisted,
        }
        setPendingAction(pending)
        setAnswer(plan.confirmation_required
          ? `I understand this as ${plan.action_id}. It is ${String(plan.risk_label || plan.risk || 'sensitive').toUpperCase()} and requires explicit confirmation. Nothing has been executed.`
          : `I understand this as ${plan.action_id}. The plan is authorized by policy, but no provider execution has happened yet.`)
        setCommand('')
        return
      }

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

  async function confirmPending() {
    if (!pendingAction?.receipt_id || !pendingAction.persisted || loading) {
      setAnswer('Sign in before confirming a sensitive action so the authorization can be attached to your account. Nothing has been executed.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/actions/${pendingAction.receipt_id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirmed: true, state: 'authorized' }),
      })
      const body = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
      setAnswer(`Confirmed ${pendingAction.action_id}. The account receipt is authorized, but execution is still blocked until its provider-specific executor is connected.`)
      setPendingAction(null)
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'Could not confirm that action.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <section className="onboarding-card" style={{ padding: 26 }}>
        <p className="app-kicker">PROOFTTL AI WORKSPACE</p>
        <h1 className="app-title">Don’t choose an app. Say what you want done.</h1>
        <p className="app-copy" style={{ maxWidth: 960 }}>L.O.V.E. sits above verification, coding, account security, integrations, and the future Work, Files, Automations, and Money layers. Commands are planned and permission-checked before a capability can execute.</p>

        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginTop: 20 }}>
          <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Ask L.O.V.E. or enter a command…" aria-label="Universal ProofTTL command" style={{ minHeight: 48 }} />
          <button className="button button-primary" disabled={!command.trim() || loading}>{loading ? 'PLANNING…' : 'RUN WITH L.O.V.E. →'}</button>
        </form>

        {answer && <div className="app-empty" style={{ marginTop: 12 }}><div className="app-empty-meta">L.O.V.E.</div><strong>{answer}</strong>{pendingAction && <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}><span className="app-status">{pendingAction.risk.toUpperCase()}</span><button type="button" className="button button-primary" onClick={() => void confirmPending()} disabled={loading}>CONFIRM ACTION</button><button type="button" className="button button-secondary" onClick={() => setPendingAction(null)} disabled={loading}>CANCEL</button></div>}</div>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {['Open Studio', 'Open Money', 'Open Connections', 'Run this Python script', 'Send an email', 'Move $50 to savings'].map((sample) => <button key={sample} type="button" className="text-link" onClick={() => setCommand(sample)}>{sample}</button>)}
        </div>
      </section>

      <section className="console-panel wide">
        <p className="app-kicker">PERMISSION MODEL</p><h2>Power scales with risk.</h2>
        <p className="app-copy">Reading and navigation can be fast. Money movement, sending, deletion, destructive changes, and security changes require explicit confirmation before execution.</p>
        <div className="auth-capability-grid" style={{ marginTop: 14 }}>{(Object.entries(RISK_POLICY) as Array<[CapabilityRisk, { label: string; confirmation: string }]>).map(([risk, policy]) => <div className="auth-capability" key={risk} style={{ textAlign: 'left' }}><strong>{policy.label}</strong><small style={{ display: 'block', marginTop: 5 }}>{policy.confirmation}</small></div>)}</div>
      </section>

      <section className="console-panel wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><div><p className="app-kicker">CAPABILITY MAP</p><h2>One interface, many systems.</h2></div><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{(['all', 'live', 'built_locked', 'planned'] as const).map((value) => <button key={value} type="button" className={filter === value ? 'button button-primary' : 'button button-secondary'} onClick={() => setFilter(value)}>{value.replace('_', ' ').toUpperCase()}</button>)}</div></div>
        <div style={{ display: 'grid', gap: 18, marginTop: 18 }}>{AREA_ORDER.map((area) => { const items = visible.filter((item) => item.area === area); if (!items.length) return null; const meta = AREA_META[area]; return <section key={area}><div style={{ marginBottom: 8 }}><strong>{meta.label}</strong><small style={{ display: 'block' }}>{meta.description}</small></div><div className="pricing-cards">{items.map((item) => <article key={item.id}><span className="plan-label">{stateLabel(item.state)}</span><h3>{item.label}</h3><p>{item.description}</p><div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}><span className="app-status">{RISK_POLICY[item.risk].label}</span>{item.route && <a className="text-link" href={item.route}>OPEN →</a>}</div><small style={{ display: 'block', marginTop: 10 }}>Try: {item.examples.join(' · ')}</small></article>)}</div></section> })}</div>
      </section>

      <section className="console-panel wide">
        <p className="app-kicker">THE RULE</p><h2>Integration beats rebuilding everything.</h2>
        <p className="app-copy">ProofTTL owns identity, permissions, orchestration, verification, user experience, and auditability. Specialized providers supply rails underneath. Unknown intent falls back to L.O.V.E.; it never becomes guessed execution.</p>
        <div className="app-table" style={{ marginTop: 14 }}><div className="app-table-row"><span>INTENT</span><span>What do I want done?</span><span>COMMAND PLANNER</span></div><div className="app-table-row"><span>PERMISSION</span><span>May this proceed?</span><span>ACTION POLICY</span></div><div className="app-table-row"><span>CAPABILITY</span><span>Which connected system can do it?</span><span>REGISTRY</span></div><div className="app-table-row"><span>EXECUTION</span><span>Perform the allowed action.</span><span>PROVIDER / PROOFTTL</span></div><div className="app-table-row"><span>EVIDENCE</span><span>What happened and why?</span><span>ACTION RECEIPT / FACT LEASE</span></div></div>
      </section>
    </div>
  )
}
