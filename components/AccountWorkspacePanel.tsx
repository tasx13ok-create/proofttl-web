'use client'

import { FormEvent, useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type Preferences = {
  preferred_ai_provider: string | null
  preferred_ai_model: string | null
  love_voice_enabled: boolean
  love_compact_mode: boolean
  studio_autosave: boolean
}

type ModelOption = { provider: string; model: string }
type Audit = {
  intake_id: string
  offer_type?: string
  company_or_project?: string
  status?: string
  payment_state?: string
  amount_due_usd?: number
  amount_paid_usd?: number
  payment_provider?: string
  created_at_ms?: number
  paid_at_ms?: number
  fulfilled_at_ms?: number
}

const defaults: Preferences = {
  preferred_ai_provider: null,
  preferred_ai_model: null,
  love_voice_enabled: true,
  love_compact_mode: false,
  studio_autosave: true,
}

function broadcastPreferences(preferences: Preferences) {
  window.dispatchEvent(new CustomEvent('proofttl-preferences-changed', { detail: preferences }))
}

export default function AccountWorkspacePanel() {
  const [preferences, setPreferences] = useState<Preferences>(defaults)
  const [models, setModels] = useState<ModelOption[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [state, setState] = useState<'loading' | 'signed-out' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [intakeId, setIntakeId] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setState('loading')
    setMessage('')
    try {
      const [prefsResponse, auditsResponse, modelsResponse] = await Promise.all([
        fetch(`${PROOFTTL_API_URL}/account/preferences`, { credentials: 'include', cache: 'no-store' }),
        fetch(`${PROOFTTL_API_URL}/account/audits`, { credentials: 'include', cache: 'no-store' }),
        fetch(`${PROOFTTL_API_URL}/assistant/models`, { credentials: 'include', cache: 'no-store' }),
      ])
      if (prefsResponse.status === 401 || auditsResponse.status === 401) { setState('signed-out'); return }
      if (!prefsResponse.ok || !auditsResponse.ok) throw new Error('Account workspace is not available on this deployment yet.')
      const prefs = await prefsResponse.json() as { preferences?: Preferences }
      const auditData = await auditsResponse.json() as { audits?: Audit[] }
      const modelData = modelsResponse.ok ? await modelsResponse.json() as { catalog?: { cloudflare?: ModelOption[]; openai_compatible?: ModelOption[] } } : {}
      const applied = prefs.preferences || defaults
      setPreferences(applied)
      broadcastPreferences(applied)
      setAudits(Array.isArray(auditData.audits) ? auditData.audits : [])
      setModels([...(modelData.catalog?.cloudflare || []), ...(modelData.catalog?.openai_compatible || [])])
      setState('ready')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Account workspace unavailable.')
    }
  }

  useEffect(() => { void load() }, [])

  async function patchPreference(patch: Partial<Preferences>) {
    if (state !== 'ready' || saving) return
    const previous = preferences
    const optimistic = { ...preferences, ...patch }
    setPreferences(optimistic)
    broadcastPreferences(optimistic)
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/preferences`, { method: 'PATCH', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) })
      const body = await response.json().catch(() => ({})) as { preferences?: Preferences; message?: string; error?: string }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      const applied = body.preferences || optimistic
      setPreferences(applied)
      broadcastPreferences(applied)
      setMessage('Preferences saved to your ProofTTL account.')
    } catch (error) {
      setPreferences(previous)
      broadcastPreferences(previous)
      setMessage(error instanceof Error ? error.message : 'Could not save preferences.')
    } finally { setSaving(false) }
  }

  function chooseModel(value: string) {
    if (!value) { void patchPreference({ preferred_ai_provider: null, preferred_ai_model: null }); return }
    const [provider, model] = value.split('::')
    const allowed = models.some((item) => item.provider === provider && item.model === model)
    if (allowed) void patchPreference({ preferred_ai_provider: provider, preferred_ai_model: model })
  }

  async function claimAudit(event: FormEvent) {
    event.preventDefault()
    const id = intakeId.trim().toLowerCase()
    if (!/^ati_[a-f0-9]{32}$/.test(id) || saving) { setMessage('Enter a valid ati_ audit reference.'); return }
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/audits`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intake_id: id }) })
      const body = await response.json().catch(() => ({})) as { message?: string; error?: string }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      setIntakeId('')
      await load()
      setMessage('Audit linked to your account.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not link audit.')
    } finally { setSaving(false) }
  }

  if (state === 'loading') return <div className="app-empty">Loading account-owned data…</div>
  if (state === 'signed-out') return <div className="app-empty"><div className="app-empty-meta">SIGN IN REQUIRED</div><strong>Your preferences, Studio projects, and audit ownership are designed to follow your ProofTTL account.</strong><a className="text-link" href="/login/">SIGN IN →</a></div>
  if (state === 'error') return <div className="app-empty"><strong>Account workspace is not available right now.</strong>{message}</div>

  const selectedModel = preferences.preferred_ai_provider && preferences.preferred_ai_model ? `${preferences.preferred_ai_provider}::${preferences.preferred_ai_model}` : ''

  return <div style={{ display: 'grid', gap: 18 }}>
    <div>
      <div className="app-empty-meta">ACCOUNT PREFERENCES</div>
      <div className="auth-capability-grid" style={{ marginTop: 8 }}>
        <button type="button" className={preferences.love_voice_enabled ? 'auth-capability live' : 'auth-capability'} onClick={() => void patchPreference({ love_voice_enabled: !preferences.love_voice_enabled })}>L.O.V.E. VOICE {preferences.love_voice_enabled ? 'ON' : 'OFF'}</button>
        <button type="button" className={preferences.love_compact_mode ? 'auth-capability live' : 'auth-capability'} onClick={() => void patchPreference({ love_compact_mode: !preferences.love_compact_mode })}>COMPACT MODE {preferences.love_compact_mode ? 'ON' : 'OFF'}</button>
      </div>
      <label className="app-input-label" style={{ display: 'grid', gap: 6, marginTop: 12 }}>PREFERRED STUDIO AI MODEL
        <select value={selectedModel} onChange={(event) => chooseModel(event.target.value)} disabled={saving}>
          <option value="">Deployment default</option>
          {models.map((item) => <option key={`${item.provider}:${item.model}`} value={`${item.provider}::${item.model}`}>{item.provider} · {item.model}</option>)}
        </select>
      </label>
      <p className="app-note">Only server-approved models appear here. Provider URLs and API keys cannot be supplied through this setting. Studio local autosave remains always-on as a safety fallback; cloud saves are explicit.</p>
    </div>

    <div>
      <div className="app-empty-meta">OWNED AUDITS</div>
      {audits.length === 0 ? <div className="app-empty"><strong>No audits linked to this account yet.</strong>When an audit was submitted with the same email as your sign-in provider, you can claim it below.</div> : <div className="app-table">
        <div className="app-table-head"><span>REFERENCE</span><span>STATUS</span><span>PAYMENT</span></div>
        {audits.map((audit) => <div className="app-table-head" key={audit.intake_id} style={{ textTransform: 'none' }}><span>{audit.intake_id}</span><span>{audit.status || 'received'}</span><span>{audit.payment_state === 'paid' ? `$${Number(audit.amount_paid_usd || audit.amount_due_usd || 0).toFixed(2)} paid` : audit.amount_due_usd ? `$${Number(audit.amount_due_usd).toFixed(2)} · ${audit.payment_state || 'pending'}` : audit.payment_state || 'not requested'}</span></div>)}
      </div>}
      <form onSubmit={claimAudit} style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <input value={intakeId} onChange={(event) => setIntakeId(event.target.value)} placeholder="ati_…" aria-label="Audit intake reference" style={{ flex: '1 1 280px' }} />
        <button className="button" disabled={saving}>LINK EXISTING AUDIT</button>
      </form>
      <p className="app-note">ProofTTL only links an audit when the signed-in account email exactly matches the email used on the intake. A reference ID alone is not proof of ownership.</p>
    </div>

    {message && <p className="app-note">{message}</p>}
  </div>
}
