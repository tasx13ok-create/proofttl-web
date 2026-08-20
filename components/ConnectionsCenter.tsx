'use client'

import { useEffect, useMemo, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type State = 'loading' | 'ready' | 'error'
type Group = 'IDENTITY' | 'AI + CREATIVE' | 'DEVELOPER' | 'COMMERCE' | 'DATA'
type Item = { label: string; group: Group; ready: boolean; note: string }

const GROUPS: Group[] = ['IDENTITY', 'AI + CREATIVE', 'DEVELOPER', 'COMMERCE', 'DATA']

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
      const commercial = readiness?.commercial_services || {}
      const runtime = capabilities?.runtime || {}
      const accountStorage = Boolean(readiness?.testnet?.checks?.monitor_database)
      setItems([
        { group: 'IDENTITY', label: 'AUTH RUNTIME', ready: Boolean(auth?.configured), note: auth?.configured ? 'Better Auth + account session runtime configured' : 'Needs D1, Better Auth secret and canonical base URL' },
        { group: 'IDENTITY', label: 'GITHUB SIGN-IN', ready: Boolean(auth?.sign_in?.github), note: auth?.sign_in?.github ? 'GitHub OAuth sign-in available' : 'GitHub OAuth credentials not detected' },
        { group: 'IDENTITY', label: 'GOOGLE', ready: Boolean(auth?.sign_in?.google), note: auth?.sign_in?.google ? 'Google OAuth sign-in available' : 'Google OAuth credentials not deployed' },
        { group: 'IDENTITY', label: 'DISCORD', ready: Boolean(auth?.sign_in?.discord), note: auth?.sign_in?.discord ? 'Discord OAuth sign-in available' : 'Discord OAuth credentials not deployed' },
        { group: 'IDENTITY', label: 'PASSKEYS', ready: Boolean(auth?.sign_in?.passkey), note: auth?.sign_in?.passkey ? 'WebAuthn RP/origin configured' : 'Passkey RP ID/origin not deployed' },

        { group: 'AI + CREATIVE', label: 'AI MODELS', ready: catalogCount > 0 || Boolean(runtime.ai), note: catalogCount > 0 ? `${catalogCount} server-approved model route${catalogCount === 1 ? '' : 's'}` : 'No model route is currently available' },
        { group: 'AI + CREATIVE', label: 'BROWSER WORLDS', ready: true, note: 'Local structured WebGL composition is native and does not require a cloud 3D provider' },
        { group: 'AI + CREATIVE', label: 'CLOUD 3D GENERATION', ready: Boolean(runtime.world_generation), note: runtime.world_generation ? 'External world-generation provider detected' : 'Meshes/textures/provider scenes remain locked' },
        { group: 'AI + CREATIVE', label: 'IMAGE GENERATION', ready: Boolean(runtime.image_generation), note: runtime.image_generation ? 'External image-generation provider detected' : 'Generated project image assets remain locked' },

        { group: 'DEVELOPER', label: 'GITHUB PROJECT TOOLS', ready: Boolean(runtime.github), note: runtime.github ? 'Scoped GitHub project provider detected' : 'Repository read/write adapter credentials not deployed' },
        { group: 'DEVELOPER', label: 'VERCEL', ready: Boolean(runtime.vercel), note: runtime.vercel ? 'Vercel project/deployment provider detected' : 'Vercel API project/team configuration missing' },
        { group: 'DEVELOPER', label: 'ISOLATED RUNNER', ready: Boolean(runner?.configured), note: runner?.configured ? 'Vercel Sandbox runner configured' : 'Sandbox token/project configuration missing' },

        { group: 'COMMERCE', label: 'STRIPE', ready: Boolean(runtime.stripe || commercial?.ready), note: runtime.stripe || commercial?.ready ? 'Commercial payment configuration detected' : 'Stripe secrets/webhook readiness incomplete' },
        { group: 'COMMERCE', label: 'X402 PROTOCOL', ready: Boolean(readiness?.testnet?.ready), note: readiness?.testnet?.ready ? 'Protocol testnet readiness checks pass' : 'Testnet protocol has unresolved readiness checks' },

        { group: 'DATA', label: 'ACCOUNT STORAGE', ready: accountStorage, note: accountStorage ? 'D1 account/product storage bound' : 'D1 binding not reported ready' },
        { group: 'DATA', label: 'FACT LEASE STORAGE', ready: Boolean(readiness?.testnet?.checks?.kv_storage), note: readiness?.testnet?.checks?.kv_storage ? 'Lease KV storage reported ready' : 'Lease storage not reported ready' },
      ])
      setState('ready')
    }).catch((error) => {
      if (controller.signal.aborted) return
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Connection discovery failed.')
    })
    return () => controller.abort()
  }, [])

  const readyCount = useMemo(() => items.filter((item) => item.ready).length, [items])

  if (state === 'loading') return <div className="app-empty"><strong>Inspecting live provider status…</strong><span>Checking identity, models, developer tools, commerce, storage and creative rails.</span></div>
  if (state === 'error') return <div className="app-empty"><strong>Connection discovery unavailable.</strong><span>{message}</span></div>

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="security-summary">
        <div><span>READY NOW</span><strong>{readyCount}/{items.length}</strong></div>
        <div><span>SECRETS</span><strong>SERVER SIDE ONLY</strong></div>
        <div><span>DEFAULT POLICY</span><strong>FAIL CLOSED</strong></div>
      </div>

      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group)
        return <section className="console-panel wide" key={group}>
          <p className="app-kicker">{group}</p>
          <div className="pricing-cards">
            {groupItems.map((item) => <article key={item.label}>
              <span className="plan-label">{item.ready ? 'READY' : 'LOCKED'}</span>
              <h3>{item.label}</h3>
              <p>{item.note}</p>
              <span className="app-status">{item.ready ? 'LIVE CONFIG DETECTED' : 'CONFIGURATION REQUIRED'}</span>
            </article>)}
          </div>
        </section>
      })}

      <div className="console-panel wide">
        <p className="app-kicker">CONNECTION CONTRACT</p>
        <h2>A button is not a connection.</h2>
        <p className="app-copy">This surface reports server-observed capability/configuration state. It never returns OAuth client secrets, payment secrets, AI keys, GitHub/Vercel tokens or sandbox credentials to the browser. A provider can only become READY after its backend adapter and required configuration exist.</p>
      </div>
    </div>
  )
}
