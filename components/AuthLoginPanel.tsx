'use client'

import { useEffect, useState } from 'react'
import {
  authClient,
  fetchAuthDiscovery,
  signInWithProvider,
  type ProofTTLAuthDiscovery,
  type SocialProvider,
} from '../lib/proofttl-auth'

const PRIMARY_PROVIDERS: Array<{ id: SocialProvider; label: string }> = [
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
      if (result?.error) setMessage(result.error.message || `Could not start ${provider} sign in.`)
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
  const googleReady = configured && Boolean(discovery?.sign_in.google)
  const discordReady = configured && Boolean(discovery?.sign_in.discord)
  const passkeyReady = configured && Boolean(discovery?.sign_in.passkey)
  const trustedCustomerAuthReady = googleReady && discordReady && passkeyReady

  return (
    <div className="auth-card">
      <p className="app-kicker">SECURE CUSTOMER ACCESS</p>
      <h1 className="app-title">Sign in without handing ProofTTL a password.</h1>
      <p className="app-copy">
        Customer access is built around Google, Discord, and passkeys. ProofTTL keeps password/email sign-in disabled so we do not create another reusable password database or pretend an email-delivery channel exists before it does.
      </p>

      <div className="provider-grid" aria-label="ProofTTL sign-in providers">
        {PRIMARY_PROVIDERS.map((provider) => {
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
          disabled={!passkeyReady || busy !== null}
          onClick={() => void passkey()}
        >
          {busy === 'passkey'
            ? 'WAITING FOR PASSKEY…'
            : passkeyReady
              ? 'CONTINUE WITH PASSKEY'
              : 'CONTINUE WITH PASSKEY · HOSTNAME PENDING'}
        </button>
      </div>

      <div className="auth-divider">TRUST STATUS</div>

      <div className="auth-capability-grid" aria-live="polite">
        <span className={googleReady ? 'auth-capability live' : 'auth-capability'}>GOOGLE {googleReady ? 'READY' : 'LOCKED'}</span>
        <span className={discordReady ? 'auth-capability live' : 'auth-capability'}>DISCORD {discordReady ? 'READY' : 'LOCKED'}</span>
        <span className={passkeyReady ? 'auth-capability live' : 'auth-capability'}>PASSKEYS {passkeyReady ? 'READY' : 'LOCKED'}</span>
        <span className={discovery?.security.secure_http_only_sessions ? 'auth-capability live' : 'auth-capability'}>HTTPONLY SESSIONS</span>
        <span className={discovery?.security.csrf_protection ? 'auth-capability live' : 'auth-capability'}>CSRF PROTECTION</span>
        <span className={discovery?.security.origin_allowlist ? 'auth-capability live' : 'auth-capability'}>ORIGIN ALLOWLIST</span>
        <span className={discovery?.security.totp ? 'auth-capability live' : 'auth-capability'}>TOTP {discovery?.security.totp ? 'READY' : 'PENDING'}</span>
        <span className={discovery?.security.recovery_codes ? 'auth-capability live' : 'auth-capability'}>RECOVERY CODES {discovery?.security.recovery_codes ? 'READY' : 'PENDING'}</span>
      </div>

      <div className="onboarding-card" style={{ marginTop: 20 }}>
        <p className="app-kicker">WHAT PROOFTTL TRUSTS</p>
        <p className="app-copy">
          Google and Discord authenticate through their provider flows. Passkeys use device-bound WebAuthn credentials. ProofTTL sessions are server-managed with secure HttpOnly cookies, a trusted-origin allowlist, CSRF protection, and optional TOTP/recovery-code hardening.
        </p>
        <a className="text-link" href="/trust.html">Inspect the live Trust Center →</a>
      </div>

      {loadState === 'loading' && <p className="app-note">Checking the live authentication capabilities…</p>}
      {loadState === 'error' && <p className="app-note"><strong>Authentication discovery is unavailable.</strong> {message}</p>}
      {loadState === 'ready' && !trustedCustomerAuthReady && (
        <p className="app-note"><strong>Customer authentication is intentionally locked until all three trusted paths are ready:</strong> Google, Discord, and passkeys.</p>
      )}
      {message && loadState !== 'error' && <p className="app-note"><strong>Sign-in status:</strong> {message}</p>}

      <p className="app-note"><strong>No ProofTTL password database.</strong> Email/password and magic-link sign-in remain disabled.</p>
    </div>
  )
}
