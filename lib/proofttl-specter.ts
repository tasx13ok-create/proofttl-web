import { PROOFTTL_API_URL } from './proofttl-assistant'

export const SPECTER_CAPABILITY_ENDPOINT = `${PROOFTTL_API_URL}/assistant/capability`
export const SPECTER_ACTIVATE_ENDPOINT = `${PROOFTTL_API_URL}/assistant/activate-specter`

export type SpecterCapability = {
  member: boolean
  specter: boolean
  previewAuthorized: boolean
  quota: {
    used: number
    limit: number
    remaining: number
    period: string
  }
  billingUrl?: string | null
}

const FREE_CAPABILITY: SpecterCapability = {
  member: false,
  specter: false,
  previewAuthorized: false,
  quota: { used: 0, limit: 0, remaining: 0, period: 'member-only' },
  billingUrl: '/support/#billing',
}

function normalizeCapability(input: unknown): SpecterCapability {
  if (!input || typeof input !== 'object') return FREE_CAPABILITY
  const value = input as Partial<SpecterCapability>
  const quota = value.quota && typeof value.quota === 'object'
    ? value.quota as Partial<SpecterCapability['quota']>
    : {}
  const limit = Number(quota.limit)
  const used = Number(quota.used)
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 0
  const safeUsed = Number.isFinite(used) && used >= 0 ? used : 0
  return {
    member: value.member === true,
    specter: value.specter === true,
    previewAuthorized: value.previewAuthorized === true,
    quota: {
      used: safeUsed,
      limit: safeLimit,
      remaining: Math.max(0, Number.isFinite(Number(quota.remaining)) ? Number(quota.remaining) : safeLimit - safeUsed),
      period: typeof quota.period === 'string' ? quota.period : 'monthly',
    },
    billingUrl: typeof value.billingUrl === 'string' ? value.billingUrl : FREE_CAPABILITY.billingUrl,
  }
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => ({})) as { capability?: unknown; message?: string; error?: string }
  if (!response.ok) throw new Error(body.message || body.error || `Specter request failed with HTTP ${response.status}.`)
  return body
}

export async function getSpecterCapability(signal?: AbortSignal) {
  const response = await fetch(SPECTER_CAPABILITY_ENDPOINT, {
    method: 'GET',
    credentials: 'include',
    headers: { accept: 'application/json' },
    signal,
  })
  const body = await readJson(response)
  return normalizeCapability(body.capability ?? body)
}

export async function activateSpecter(signal?: AbortSignal) {
  const response = await fetch(SPECTER_ACTIVATE_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ mode: 'specter' }),
    signal,
  })
  const body = await readJson(response)
  return normalizeCapability(body.capability ?? body)
}

export function quotaPercent(capability: SpecterCapability) {
  if (!capability.quota.limit) return 0
  return Math.min(100, Math.round((capability.quota.used / capability.quota.limit) * 100))
}

export { FREE_CAPABILITY }
