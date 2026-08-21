import { createAuthClient } from 'better-auth/react'
import { twoFactorClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'

export const PROOFTTL_API_URL = (
  process.env.NEXT_PUBLIC_PROOFTTL_API_URL ||
  'https://proofttl.tasx13ok.workers.dev'
).replace(/\/$/, '')

const PROOFTTL_WEB_ORIGIN = (
  process.env.NEXT_PUBLIC_PROOFTTL_WEB_ORIGIN ||
  'https://proofttl-web.vercel.app'
).replace(/\/$/, '')

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
        if (typeof window !== 'undefined') window.location.assign('/two-factor/')
      },
    }),
    passkeyClient(),
  ],
})

export async function fetchAuthDiscovery(signal?: AbortSignal): Promise<ProofTTLAuthDiscovery> {
  const response = await fetch(`${PROOFTTL_API_URL}/.well-known/proofttl-auth.json`, {
    method: 'GET',
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

export async function signInWithProvider(provider: SocialProvider) {
  const callbackURL = typeof window !== 'undefined'
    ? `${window.location.origin}/console/`
    : '/console/'

  return authClient.signIn.social({ provider, callbackURL })
}