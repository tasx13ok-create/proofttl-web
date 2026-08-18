'use client'

import { useEffect, useState } from 'react'
import {
  authClient,
  fetchAuthDiscovery,
  signInWithProvider,
  type ProofTTLAuthDiscovery,
  type SocialProvider,
} from '../lib/proofttl-auth'

const PROVIDERS: Array<{ id: SocialProvider; label: string }> = [
  { id: 'github', label: 'GitHub' },
  { id: 'google', label: 'Google' },
  { id: 'discord', label: 'Discord' },
]

type LoadState = 'loading' | 'ready' | 'error'

export default function AuthLoginPanel() {
  const [discovery, setDiscovery] = useState<ProofTTLAuthDiscovery | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetchAuthDiscovery(controller.signal)
      .then((data) => {
        setDiscovery(data)
        setLoadState('ready')
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setLoadState('error')
        setMessage(error instanceof Error ? error.message : 'Authentication discovery is unavailable.')
      })
    return () => controller.abort()
  }, [])

  async function social(provider: SocialProvider) {
    if (!discovery?.configured || !discovery.sign_in[provider]) return
    setBusy(provider)
    setMessage('')
    try {
      const result = await signInWithProvider(provider)
      if (result?.error) {
        setMessage(result.error.message || `Could not start ${provider} sign in.`)
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Could not start ${provider} sign in.`)
    } finally {
      setBusy(null)
    }
  }

  async function passkey() {
    if (!discovery?.configured || !discovery.sign_in.passkey) return
    setBusy('passkey')
    setMessage('')
    try {
      const result = await authClient.signIn.passkey({ autoFill: false })
      if (result?.error) {
        setMessage(result.error.message || 'Passkey sign in failed.')
        return
      }
      window.location.assign('/console/')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Passkey sign in failed.')
    } finally {
      setBusy(null)
    }
  }

  const configured = Boolean(discovery?.configured)

  return (
    <div className="auth-card">
      <p className="app-kicker">OPTIONAL CUSTOMER ACCOUNT</p>
      <h1 className="app-title">Welcome to ProofTTL.</h1>
      <p className="app-copy">Sign in to manage Fact Leases, usage, payments, security settings, and support. The public x402 API remains usable without an account.</p>

      <div className="provider-grid" aria-label="ProofTTL sign-in providers">
        {PROVIDERS.map((provider) => {
          const enabled = configured && Boolean(discovery?.sign_in[provider.id])
          return (
            <button
              key={provider.id}
              type="button"
              className="provider-button"
              disabled={!enabled || busy !== null}
              onClick={() => void social(provider.id)}
            >
              {busy === provider.id
                ? `CONNECTING TO ${provider.label.toUpperCase()}…`
                : enabled
                  ? `CONTINUE WITH ${provider.label.toUpperCase()}`
                  : `CONTINUE WITH ${provider.label.toUpperCase()} · NOT CONFIGURED`}
            </button>
          )
        })}

        <button
          type="button"
          className="provider-button"
          disabled={!configured || !discovery?.sign_in.passkey || busy !== null}
          onClick={() => void passkey()}
        >
          {busy === 'passkey'
            ? 'WAITING FOR PASSKEY…'
            : discovery?.sign_in.passkey
              ? 'CONTINUE WITH PASSKEY'
              : 'CONTINUE WITH PASSKEY · HOSTNAME PENDING'}
        </button>
      </div>

      <div className="auth-divider">AUTH STATUS</div>

      <div className="auth-capability-grid" aria-live="polite">
        <span className={configured ? 'auth-capability live' : 'auth-capability'}>
          BACKEND {configured ? 'READY' : 'LOCKED'}
        </span>
        <span className={discovery?.security.totp ? 'auth-capability live' : 'auth-capability'}>
          TOTP {discovery?.security.totp ? 'READY' : 'PENDING'}
        </span>
        <span className={discovery?.security.recovery_codes ? 'auth-capability live' : 'auth-capability'}>
          RECOVERY CODES {discovery?.security.recovery_codes ? 'READY' : 'PENDING'}
        </span>
        <span className={discovery?.security.passkeys ? 'auth-capability live' : 'auth-capability'}>
          PASSKEYS {discovery?.security.passkeys ? 'READY' : 'PENDING'}
        </span>
      </div>

      {loadState === 'loading' && <p className="app-note">Checking the live authentication capabilities…</p>}
      {loadState === 'error' && <p className="app-note"><strong>Authentication discovery is unavailable.</strong> {message}</p>}
      {loadState === 'ready' && !configured && (
        <p className="app-note"><strong>Authentication is still locked.</strong> ProofTTL will enable sign-in only after the D1 auth schema, server secret, trusted frontend origin, and at least one real provider are deployed.</p>
      )}
      {message && loadState !== 'error' && <p className="app-note"><strong>Sign-in status:</strong> {message}</p>}

      <p className="app-note"><strong>Email sign-in stays disabled.</strong> We will not show a fake magic-link/email flow until a real delivery and verification channel exists.</p>
    </div>
  )
}
