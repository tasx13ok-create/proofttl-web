'use client'

import { useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type ActionReceipt = {
  receipt_id: string
  action_id: string
  area: string
  risk: string
  confirmation_required: number | boolean
  confirmed: number | boolean
  state: string
  provider?: string | null
  input_summary?: string | null
  result_summary?: string | null
  error_code?: string | null
  created_at?: string
  updated_at?: string
}

export default function ActionHistoryPanel() {
  const [state, setState] = useState<'loading' | 'signed-out' | 'ready' | 'error'>('loading')
  const [actions, setActions] = useState<ActionReceipt[]>([])

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${PROOFTTL_API_URL}/account/actions`, { credentials: 'include', cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) { setState('signed-out'); return }
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const body = await response.json() as { actions?: ActionReceipt[] }
        setActions(Array.isArray(body.actions) ? body.actions : [])
        setState('ready')
      })
      .catch(() => { if (!controller.signal.aborted) setState('error') })
    return () => controller.abort()
  }, [])

  if (state === 'loading') return <div className="app-empty">Loading action history…</div>
  if (state === 'signed-out') return <div className="app-empty"><div className="app-empty-meta">ACCOUNT ACTION LEDGER</div><strong>Sign in to keep a unified receipt history across ProofTTL.</strong><a className="text-link" href="/login/">SIGN IN →</a></div>
  if (state === 'error') return <div className="app-empty"><strong>Action history is not live on this deployment yet.</strong></div>
  if (!actions.length) return <div className="app-empty"><div className="app-empty-meta">NO ACCOUNT ACTIONS YET</div><strong>Future L.O.V.E. actions can leave one receipt trail here.</strong>Planned, confirmation-gated, executed, failed, and completed actions share the same account-owned ledger.</div>

  return <div className="app-table">
    <div className="app-table-head"><span>ACTION</span><span>STATE</span><span>RISK</span></div>
    {actions.slice(0, 20).map((item) => <div className="app-table-head" key={item.receipt_id} style={{ textTransform: 'none' }}>
      <span><strong>{item.action_id}</strong><small style={{ display: 'block' }}>{item.provider || item.area}</small></span>
      <span>{item.state}{item.confirmation_required ? (item.confirmed ? ' · confirmed' : ' · confirmation required') : ''}</span>
      <span>{item.risk}</span>
    </div>)}
  </div>
}
