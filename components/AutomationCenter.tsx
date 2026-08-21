'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type Capability = { id: string; area: string; label: string; risk: string; ready?: boolean }
type Automation = {
  automation_id: string
  name: string
  trigger_type: string
  schedule_expr?: string | null
  condition_summary?: string | null
  action_id: string
  risk: string
  confirmation_mode: string
  enabled: number | boolean
  updated_at?: string
}

export default function AutomationCenter() {
  const [state, setState] = useState<'loading' | 'signed-out' | 'ready' | 'error'>('loading')
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState<'schedule' | 'condition' | 'manual'>('schedule')
  const [schedule, setSchedule] = useState('Every day at 9:00 AM')
  const [condition, setCondition] = useState('')
  const [actionId, setActionId] = useState('truth.verify')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const selected = useMemo(() => capabilities.find((item) => item.id === actionId), [capabilities, actionId])

  async function load() {
    try {
      const [automationResponse, capabilityResponse] = await Promise.all([
        fetch(`${PROOFTTL_API_URL}/account/automations`, { credentials: 'include', cache: 'no-store' }),
        fetch(`${PROOFTTL_API_URL}/capabilities`, { cache: 'no-store' }),
      ])
      if (automationResponse.status === 401) { setState('signed-out'); return }
      if (!automationResponse.ok || !capabilityResponse.ok) throw new Error('automation backend unavailable')
      const automationBody = await automationResponse.json() as { automations?: Automation[] }
      const capabilityBody = await capabilityResponse.json() as { capabilities?: Capability[] }
      const catalog = Array.isArray(capabilityBody.capabilities) ? capabilityBody.capabilities : []
      setAutomations(Array.isArray(automationBody.automations) ? automationBody.automations : [])
      setCapabilities(catalog)
      if (!catalog.some((item) => item.id === actionId) && catalog[0]) setActionId(catalog[0].id)
      setState('ready')
    } catch {
      setState('error')
    }
  }

  useEffect(() => { void load() }, [])

  async function create(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !actionId || busy) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/automations`, {
        method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, trigger_type: trigger, schedule_expr: trigger === 'schedule' ? schedule : undefined, condition_summary: trigger === 'condition' ? condition : undefined, action_id: actionId, enabled: false }),
      })
      const body = await response.json().catch(() => ({})) as { error?: string; warning?: string }
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
      setName(''); setCondition(''); setMessage(body.warning || 'Automation definition saved. Execution remains disconnected.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save automation.') }
    finally { setBusy(false) }
  }

  async function toggle(item: Automation) {
    if (busy) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/automations/${item.automation_id}`, {
        method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ enabled: !Boolean(item.enabled) }),
      })
      const body = await response.json().catch(() => ({})) as { error?: string }
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
      setMessage('Definition state updated. No scheduler/executor is connected yet.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update automation.') }
    finally { setBusy(false) }
  }

  async function remove(item: Automation) {
    if (!window.confirm(`Delete automation definition “${item.name}”?`) || busy) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/automations/${item.automation_id}`, { method: 'DELETE', credentials: 'include' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setMessage('Automation definition deleted.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete automation.') }
    finally { setBusy(false) }
  }

  if (state === 'loading') return <div className="app-empty">Loading account automations…</div>
  if (state === 'signed-out') return <div className="app-empty"><strong>Sign in to create account-owned automation definitions.</strong><a className="text-link" href="/login/">SIGN IN →</a></div>
  if (state === 'error') return <div className="app-empty"><strong>Automation storage is not live on this deployment yet.</strong></div>

  return <div style={{ display: 'grid', gap: 18 }}>
    <div className="security-summary">
      <div><span>DEFINITIONS</span><strong>{automations.length}</strong></div>
      <div><span>EXECUTION ENGINE</span><strong>NOT CONNECTED</strong></div>
      <div><span>SENSITIVE PRE-AUTH</span><strong>BLOCKED</strong></div>
    </div>

    <form onSubmit={create} className="onboarding-card app-form native-control-form">
      <p className="app-kicker">NEW AUTOMATION DEFINITION</p>
      <label className="app-input-label">NAME<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Daily truth check" maxLength={120} /></label>
      <label className="app-input-label">ACTION<select value={actionId} onChange={(e) => setActionId(e.target.value)}>
        {capabilities.map((item) => <option key={item.id} value={item.id}>{item.area} · {item.label} · {item.risk}</option>)}
      </select></label>
      <label className="app-input-label">TRIGGER<select value={trigger} onChange={(e) => setTrigger(e.target.value as typeof trigger)}>
        <option value="schedule">Schedule</option><option value="condition">Condition</option><option value="manual">Manual</option>
      </select></label>
      {trigger === 'schedule' && <label className="app-input-label">SCHEDULE<input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Every weekday at 8 AM" /></label>}
      {trigger === 'condition' && <label className="app-input-label">CONDITION<textarea value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="When a connected capability reports…" rows={3} /></label>}
      {selected && <p className="app-note native-policy-note"><strong>{selected.risk.toUpperCase()} POLICY.</strong> {selected.risk === 'sensitive' ? 'This capability cannot be enabled for unattended execution.' : 'This definition may be enabled later, but no executor is connected today.'}</p>}
      <button className="button button-primary native-control-submit" disabled={!name.trim() || busy}>{busy ? 'SAVING…' : 'SAVE DEFINITION →'}</button>
    </form>

    <div className="app-table">
      <div className="app-table-head"><span>AUTOMATION</span><span>POLICY / STATE</span><span>ACTIONS</span></div>
      {automations.map((item) => <div className="app-table-head" key={item.automation_id} style={{ textTransform: 'none' }}>
        <span><strong>{item.name}</strong><small style={{ display: 'block' }}>{item.trigger_type} · {item.action_id}</small></span>
        <span>{item.risk} · {item.enabled ? 'definition enabled' : 'paused'}<small style={{ display: 'block' }}>{item.confirmation_mode}</small></span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button type="button" className="text-link" onClick={() => void toggle(item)} disabled={busy}>{item.enabled ? 'PAUSE' : 'ENABLE'}</button><button type="button" className="text-link" onClick={() => void remove(item)} disabled={busy}>DELETE</button></span>
      </div>)}
    </div>
    {message && <p className="app-note">{message}</p>}
  </div>
}
