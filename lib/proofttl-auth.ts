import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'

export const PROOFTTL_UPSTREAM_API_URL = (
  process.env.NEXT_PUBLIC_PROOFTTL_API_URL ||
  'https://proofttl.tasx13ok.workers.dev'
).replace(/\/$/, '')

const PROOFTTL_WEB_ORIGIN = (
  process.env.NEXT_PUBLIC_PROOFTTL_WEB_ORIGIN ||
  'https://proofttl-web.vercel.app'
).replace(/\/$/, '')

const AUTH_RETURN_KEY = 'proofttl:auth-return-v1'

export const PROOFTTL_API_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/runtime`
  : PROOFTTL_UPSTREAM_API_URL

export const PROOFTTL_AUTH_URL = typeof window !== 'undefined'
  ? window.location.origin
  : PROOFTTL_WEB_ORIGIN

export type ProofTTLAuthDiscovery = {
  service: string
  backend: string
  endpoint: string
  configured: boolean
  database: boolean
  sign_in: {
    github: boolean
    google: boolean
    discord: boolean
    email: boolean
    passkey: boolean
  }
  security: {
    totp: boolean
    recovery_codes: boolean
    passkeys: boolean
    secure_http_only_sessions: boolean
    origin_allowlist: boolean
    csrf_protection: boolean
  }
}

export const authClient = createAuthClient({
  baseURL: PROOFTTL_AUTH_URL,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== 'undefined') {
          const returnTo = currentReturnTo('/workspace/')
          rememberAuthReturn(returnTo)
          window.location.assign(`/two-factor/?returnTo=${encodeURIComponent(returnTo)}`)
        }
      },
    }),
    passkeyClient(),
  ],
})

export async function fetchAuthDiscovery(signal?: AbortSignal): Promise<ProofTTLAuthDiscovery> {
  const response = await fetch(`${PROOFTTL_API_URL}/.well-known/proofttl-auth.json`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  if (!response.ok) {
    throw new Error(`Auth discovery failed with HTTP ${response.status}.`)
  }

  const data = await response.json() as Partial<ProofTTLAuthDiscovery>
  if (!data || typeof data.configured !== 'boolean' || !data.sign_in || !data.security) {
    throw new Error('ProofTTL auth discovery returned an invalid response.')
  }

  return data as ProofTTLAuthDiscovery
}

export type SocialProvider = 'github' | 'google' | 'discord'

function safeLocalReturn(value: string | null | undefined, fallback = '/workspace/') {
  const raw = String(value || '').trim()
  if (!raw) return fallback
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : PROOFTTL_WEB_ORIGIN
    const url = new URL(raw, base)
    if (url.origin !== base) return fallback
    const result = `${url.pathname}${url.search}${url.hash}`
    if (!result.startsWith('/') || result.startsWith('//') || result.startsWith('/login')) return fallback
    return result
  } catch {
    return fallback
  }
}

export function currentReturnTo(fallback = '/workspace/') {
  if (typeof window === 'undefined') return fallback
  return safeLocalReturn(`${window.location.pathname}${window.location.search}${window.location.hash}`, fallback)
}

export function rememberAuthReturn(returnTo?: string) {
  const target = safeLocalReturn(returnTo || currentReturnTo('/workspace/'), '/workspace/')
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(AUTH_RETURN_KEY, target) } catch {}
  }
  return target
}

export function resolveAuthReturn(fallback = '/workspace/') {
  if (typeof window === 'undefined') return fallback
  let candidate = ''
  try {
    candidate = new URLSearchParams(window.location.search).get('returnTo') || ''
    if (!candidate) candidate = window.localStorage.getItem(AUTH_RETURN_KEY) || ''
  } catch {}
  return safeLocalReturn(candidate, fallback)
}

export function clearAuthReturn() {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(AUTH_RETURN_KEY) } catch {}
}

export function signInHref(returnTo?: string) {
  const target = safeLocalReturn(returnTo || currentReturnTo('/workspace/'), '/workspace/')
  return `/login/?returnTo=${encodeURIComponent(target)}`
}

export async function signInWithProvider(provider: SocialProvider, returnTo?: string) {
  const target = rememberAuthReturn(returnTo || resolveAuthReturn('/workspace/'))
  const callbackURL = typeof window !== 'undefined'
    ? `${window.location.origin}${target}`
    : `${PROOFTTL_WEB_ORIGIN}${target}`

  return authClient.signIn.social({ provider, callbackURL })
}
