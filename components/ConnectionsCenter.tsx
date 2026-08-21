'use client'

import { useEffect, useMemo, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type State = 'loading' | 'ready' | 'error'
type Group = 'IDENTITY' | 'AI + CREATIVE' | 'DEVELOPER' | 'COMMERCE' | 'DATA'
type Item = { label: string; group: Group; ready: boolean; note: string }
type JsonObject = Record<string, any>

const GROUPS: Group[] = ['IDENTITY', 'AI + CREATIVE', 'DEVELOPER', 'COMMERCE', 'DATA']

async function fetchOptionalJson(path: string, signal: AbortSignal): Promise<JsonObject | null> {
  try {
    const response = await fetch(`${PROOFTTL_API_URL}${path}`, { cache: 'no-store', signal })
    if (!response.ok) return null
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.toLowerCase().includes('application/json')) return null
    const body = await response.json().catch(() => null)
    return body && typeof body === 'object' ? body as JsonObject : null
  } catch {
    return null
  }
}

export default function ConnectionsCenter() {
  const [state, setState] = useState<State>('loading')
  const [items, setItems] = useState<Item[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      fetchOptionalJson('/.well-known/proofttl-auth.json', controller.signal),
      fetchOptionalJson('/readiness', controller.signal),
      fetchOptionalJson('/assistant/models', controller.signal),
      fetchOptionalJson('/studio/runner', controller.signal),
      fetchOptionalJson('/capabilities', controller.signal),
    ]).then(([auth, readiness, models, runner, capabilities]) => {
      if (controller.signal.aborted) return
      if (!auth && !readiness && !models && !runner && !capabilities) {
        setState('error')
        setMessage('The ProofTTL API did not return connection-discovery data. Try again after the current deployment finishes.')
        return
      }

      const catalogCount = [
        ...(models?.catalog?.cloudflare || []),
        ...(models?.catalog?.openai_compatible || []),
      ].length
      const commercial = readiness?.commercial_services || {}
      const runtime = capabilities?.runtime || {}
      const accountStorage = Boolean(readiness?.testnet?.checks?.monitor_database)
      const capabilitiesAvailable = Boolean(capabilities)
      const modelsAvailable = Boolean(models)
      const runnerAvailable = Boolean(runner)

      setItems([
        { group: 'IDENTITY', label: 'AUTH RUNTIME', ready: Boolean(auth?.configured), note: auth ? (auth?.configured ? 'Better Auth + account session runtime configured' : 'Needs D1, Better Auth secret and canonical base URL') : 'Auth discovery endpoint unavailable on this Worker version' },
        { group: 'IDENTITY', label: 'GITHUB SIGN-IN', ready: Boolean(auth?.sign_in?.github), note: auth ? (auth?.sign_in?.github ? 'GitHub OAuth sign-in available' : 'GitHub OAuth credentials not detected') : 'Auth discovery endpoint unavailable' },
        { group: 'IDENTITY', label: 'GOOGLE', ready: Boolean(auth?.sign_in?.google), note: auth ? (auth?.sign_in?.google ? 'Google OAuth sign-in available' : 'Google OAuth credentials not deployed') : 'Auth discovery endpoint unavailable' },
        { group: 'IDENTITY', label: 'DISCORD', ready: Boolean(auth?.sign_in?.discord), note: auth ? (auth?.sign_in?.discord ? 'Discord OAuth sign-in available' : 'Discord OAuth credentials not deployed') : 'Auth discovery endpoint unavailable' },
        { group: 'IDENTITY', label: 'PASSKEYS', ready: Boolean(auth?.sign_in?.passkey), note: auth ? (auth?.sign_in?.passkey ? 'WebAuthn RP/origin configured' : 'Passkey RP ID/origin not deployed') : 'Auth discovery endpoint unavailable' },

        { group: 'AI + CREATIVE', label: 'AI MODELS', ready: catalogCount > 0 || Boolean(runtime.ai), note: modelsAvailable ? (catalogCount > 0 ? `${catalogCount} server-approved model route${catalogCount === 1 ? '' : 's'}` : 'No model route is currently available') : 'Model catalog endpoint unavailable on this Worker version' },
        { group: 'AI + CREATIVE', label: 'BROWSER WORLDS', ready: true, note: 'Local structured WebGL composition is native and does not require a cloud 3D provider' },
        { group: 'AI + CREATIVE', label: 'CLOUD 3D GENERATION', ready: Boolean(runtime.world_generation), note: capabilitiesAvailable ? (runtime.world_generation ? 'External world-generation provider detected' : 'Meshes/textures/provider scenes remain locked') : 'Capability registry endpoint unavailable' },
        { group: 'AI + CREATIVE', label: 'IMAGE GENERATION', ready: Boolean(runtime.image_generation), note: capabilitiesAvailable ? (runtime.image_generation ? 'External image-generation provider detected' : 'Generated project image assets remain locked') : 'Capability registry endpoint unavailable' },

        { group: 'DEVELOPER', label: 'GITHUB PROJECT TOOLS', ready: Boolean(runtime.github), note: capabilitiesAvailable ? (runtime.github ? 'Scoped GitHub project provider detected' : 'Repository read/write adapter credentials not deployed') : 'Capability registry endpoint unavailable' },
        { group: 'DEVELOPER', label: 'VERCEL', ready: Boolean(runtime.vercel), note: capabilitiesAvailable ? (runtime.vercel ? 'Vercel project/deployment provider detected' : 'Vercel API project/team configuration missing') : 'Capability registry endpoint unavailable' },
        { group: 'DEVELOPER', label: 'ISOLATED RUNNER', ready: Boolean(runner?.configured), note: runnerAvailable ? (runner?.configured ? 'Vercel Sandbox runner configured' : 'Sandbox token/project configuration missing') : 'Runner-status endpoint unavailable on this Worker version' },

        { group: 'COMMERCE', label: 'STRIPE', ready: Boolean(runtime.stripe || commercial?.ready), note: runtime.stripe || commercial?.ready ? 'Commercial payment configuration detected' : readiness ? 'Stripe secrets/webhook readiness incomplete' : 'Commercial readiness endpoint unavailable' },
        { group: 'COMMERCE', label: 'X402 PROTOCOL', ready: Boolean(readiness?.testnet?.ready), note: readiness ? (readiness?.testnet?.ready ? 'Protocol testnet readiness checks pass' : 'Testnet protocol has unresolved readiness checks') : 'Readiness endpoint unavailable' },

        { group: 'DATA', label: 'ACCOUNT STORAGE', ready: accountStorage, note: readiness ? (accountStorage ? 'D1 account/product storage bound' : 'D1 binding not reported ready') : 'Readiness endpoint unavailable' },
        { group: 'DATA', label: 'FACT LEASE STORAGE', ready: Boolean(readiness?.testnet?.checks?.kv_storage), note: readiness ? (readiness?.testnet?.checks?.kv_storage ? 'Lease KV storage reported ready' : 'Lease storage not reported ready') : 'Readiness endpoint unavailable' },
      ])
      setState('ready')
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
