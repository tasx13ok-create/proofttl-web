'use client'

import { useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type State = 'loading' | 'ready' | 'error'
type Item = { label: string; ready: boolean; note: string }

export default function ConnectionsCenter() {
  const [state, setState] = useState<State>('loading')
  const [items, setItems] = useState<Item[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetch(`${PROOFTTL_API_URL}/.well-known/proofttl-auth.json`, { cache: 'no-store', signal: controller.signal }).then((r) => r.json()),
      fetch(`${PROOFTTL_API_URL}/readiness`, { cache: 'no-store', signal: controller.signal }).then((r) => r.json()),
      fetch(`${PROOFTTL_API_URL}/assistant/models`, { cache: 'no-store', signal: controller.signal }).then((r) => r.json()),
      fetch(`${PROOFTTL_API_URL}/studio/runner`, { cache: 'no-store', signal: controller.signal }).then((r) => r.json()),
      fetch(`${PROOFTTL_API_URL}/capabilities`, { cache: 'no-store', signal: controller.signal }).then((r) => r.json()),
    ]).then(([auth, readiness, models, runner, capabilities]) => {
      const catalogCount = [
        ...(models?.catalog?.cloudflare || []),
        ...(models?.catalog?.openai_compatible || []),
      ].length
      const commercial = readiness?.commercial || readiness?.commerce || {}
      const runtime = capabilities?.runtime || {}
      setItems([
        { label: 'AUTH RUNTIME', ready: Boolean(auth?.configured), note: auth?.configured ? 'Better Auth runtime configured' : 'Needs D1 + Better Auth production configuration' },
        { label: 'GOOGLE', ready: Boolean(auth?.sign_in?.google), note: auth?.sign_in?.google ? 'OAuth provider available' : 'OAuth credentials not deployed' },
        { label: 'DISCORD', ready: Boolean(auth?.sign_in?.discord), note: auth?.sign_in?.discord ? 'OAuth provider available' : 'OAuth credentials not deployed' },
        { label: 'PASSKEYS', ready: Boolean(auth?.sign_in?.passkey), note: auth?.sign_in?.passkey ? 'WebAuthn RP configured' : 'RP ID/origin not deployed' },
        { label: 'AI MODELS', ready: catalogCount > 0 || Boolean(runtime.ai), note: catalogCount > 0 ? `${catalogCount} server-approved model route${catalogCount === 1 ? '' : 's'}` : 'No model catalog is currently available' },
        { label: 'ACCOUNT STORAGE', ready: Boolean(readiness?.testnet?.checks?.monitor_database), note: readiness?.testnet?.checks?.monitor_database ? 'D1 account/product storage bound' : 'D1 binding not reported ready' },
        { label: 'STRIPE', ready: Boolean(runtime.stripe || commercial?.stripe_ready || commercial?.ready), note: runtime.stripe || commercial?.stripe_ready || commercial?.ready ? 'Commercial payment configuration detected' : 'Stripe secrets/webhook readiness incomplete' },
        { label: 'ISOLATED RUNNER', ready: Boolean(runner?.configured), note: runner?.configured ? 'Vercel Sandbox runner configured' : 'Sandbox token/project configuration missing' },
      ])
      setState('ready')
    }).catch((error) => {
      if (controller.signal.aborted) return
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Connection discovery failed.')
    })
    return () => controller.abort()
  }, [])

  if (state === 'loading') return <div className="app-empty"><strong>Inspecting live provider status…</strong></div>
  if (state === 'error') return <div className="app-empty"><strong>Connection discovery unavailable.</strong>{message}</div>

  const readyCount = items.filter((item) => item.ready).length
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="security-summary">
        <div><span>CONNECTED / READY</span><strong>{readyCount}/{items.length}</strong></div>
        <div><span>SECRETS</span><strong>SERVER SIDE ONLY</strong></div>
        <div><span>DEFAULT POLICY</span><strong>FAIL CLOSED</strong></div>
      </div>
      <div className="pricing-cards">
        {items.map((item) => <article key={item.label}>
          <span className="plan-label">{item.ready ? 'READY' : 'LOCKED'}</span>
          <h3>{item.label}</h3>
          <p>{item.note}</p>
          <span className={item.ready ? 'app-status' : 'app-status'}>{item.ready ? 'LIVE CONFIG DETECTED' : 'CONFIGURATION REQUIRED'}</span>
        </article>)}
      </div>
      <p className="app-note">This page reports capability/configuration state only. It never returns OAuth client secrets, Stripe secrets, AI API keys, or sandbox tokens to the browser.</p>
    </div>
  )
}
