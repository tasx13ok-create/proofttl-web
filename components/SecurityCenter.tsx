'use client'

import { useEffect, useMemo, useState } from 'react'
import { authClient, fetchAuthDiscovery, type ProofTTLAuthDiscovery } from '../lib/proofttl-auth'

type SessionRow = {
  token: string
  userAgent?: string | null
  ipAddress?: string | null
  expiresAt?: string | Date
}

type PasskeyRow = {
  id: string
  name?: string | null
  deviceType?: string | null
  backedUp?: boolean | null
  createdAt?: string | Date | null
}

type SessionUser = NonNullable<NonNullable<ReturnType<typeof authClient.useSession>['data']>['user']> & {
  twoFactorEnabled?: boolean
}

function safeDate(value: unknown) {
  if (!value) return 'Unknown'
  const date = new Date(value as string | number | Date)
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString()
}

function shortAgent(value?: string | null) {
  if (!value) return 'Unknown device'
  return value.length > 84 ? `${value.slice(0, 81)}…` : value
}

export default function SecurityCenter() {
  const { data: sessionData, isPending: sessionPending, refetch } = authClient.useSession()
  const [discovery, setDiscovery] = useState<ProofTTLAuthDiscovery | null>(null)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [passkeys, setPasskeys] = useState<PasskeyRow[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [totpURI, setTotpURI] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])

  const user = sessionData?.user as SessionUser | undefined
  const signedIn = Boolean(sessionData?.session && user)
  const currentSessionToken = sessionData?.session?.token
  const twoFactorEnabled = Boolean(user?.twoFactorEnabled)

  const totpSecret = useMemo(() => {
    if (!totpURI) return ''
    try {
      return new URL(totpURI).searchParams.get('secret') || ''
    } catch {
      return ''
    }
  }, [totpURI])

  useEffect(() => {
    const controller = new AbortController()
    fetchAuthDiscovery(controller.signal)
      .then(setDiscovery)
      .catch(() => setDiscovery(null))
    return () => controller.abort()
  }, [])

  async function refreshSecurityData() {
    if (!signedIn) {
      setSessions([])
      setPasskeys([])
      return
    }

    const [sessionResult, passkeyResult] = await Promise.all([
      authClient.listSessions(),
      discovery?.security.passkeys
        ? authClient.passkey.listUserPasskeys()
        : Promise.resolve({ data: [] as PasskeyRow[], error: null }),
    ])

    if (!sessionResult.error && Array.isArray(sessionResult.data)) {
      setSessions(sessionResult.data as SessionRow[])
    }
    if (!passkeyResult.error && Array.isArray(passkeyResult.data)) {
      setPasskeys(passkeyResult.data as PasskeyRow[])
    }
  }

  useEffect(() => {
    void refreshSecurityData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, discovery?.security.passkeys])

  async function run(name: string, action: () => Promise<void>) {
    setBusy(name)
    setStatus('')
    try {
      await action()
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Security action failed.')
    } finally {
      setBusy(null)
    }
  }

  async function startTotpEnrollment() {
    await run('totp-enable', async () => {
      const result = await authClient.twoFactor.enable({ issuer: 'ProofTTL' })
      if (result.error) throw new Error(result.error.message || 'Could not start TOTP enrollment.')
      const data = result.data as { totpURI?: string; backupCodes?: string[] } | null
      if (!data?.totpURI) throw new Error('ProofTTL did not receive a TOTP enrollment URI.')
      setTotpURI(data.totpURI)
      setRecoveryCodes(Array.isArray(data.backupCodes) ? data.backupCodes : [])
      setStatus('Authenticator enrollment started. Verify one code to activate MFA.')
    })
  }

  async function verifyTotpEnrollment() {
    const code = totpCode.trim()
    if (!code) return
    await run('totp-verify', async () => {
      const result = await authClient.twoFactor.verifyTotp({ code, trustDevice: false })
      if (result.error) throw new Error(result.error.message || 'Authenticator code was rejected.')
      setTotpCode('')
      setTotpURI('')
      await refetch()
      setStatus('Two-factor authentication is active.')
    })
  }

  async function regenerateRecoveryCodes() {
    if (!window.confirm('Generate a new recovery-code set? All previous recovery codes will stop working.')) return
    await run('recovery', async () => {
      const result = await authClient.twoFactor.generateBackupCodes({})
      if (result.error) throw new Error(result.error.message || 'Could not regenerate recovery codes.')
      const data = result.data as { backupCodes?: string[] } | null
      setRecoveryCodes(Array.isArray(data?.backupCodes) ? data!.backupCodes! : [])
      setStatus('New recovery codes generated. Store them somewhere safe now; the previous set is invalid.')
    })
  }

  async function addPasskey() {
    await run('passkey-add', async () => {
      const result = await authClient.passkey.addPasskey({ name: 'ProofTTL passkey' })
      if (result.error) throw new Error(result.error.message || 'Passkey enrollment failed.')
      await refreshSecurityData()
      setStatus('Passkey added.')
    })
  }

  async function deletePasskey(id: string) {
    if (!window.confirm('Remove this passkey from your ProofTTL account?')) return
    await run(`passkey-${id}`, async () => {
      const result = await authClient.passkey.deletePasskey({ id })
      if (result.error) throw new Error(result.error.message || 'Could not remove passkey.')
      await refreshSecurityData()
      setStatus('Passkey removed.')
    })
  }

  async function revokeOtherSessions() {
    if (!window.confirm('Sign out every other ProofTTL session and keep this device signed in?')) return
    await run('sessions-other', async () => {
      const result = await authClient.revokeOtherSessions()
      if (result.error) throw new Error(result.error.message || 'Could not revoke other sessions.')
      await refreshSecurityData()
      setStatus('Other sessions revoked.')
    })
  }

  async function revokeSession(token: string) {
    if (token === currentSessionToken) return
    await run(`session-${token.slice(0, 8)}`, async () => {
      const result = await authClient.revokeSession({ token })
      if (result.error) throw new Error(result.error.message || 'Could not revoke session.')
      await refreshSecurityData()
      setStatus('Session revoked.')
    })
  }

  async function logoutEverywhere() {
    if (!window.confirm('Sign out every ProofTTL session, including this device?')) return
    await run('sessions-all', async () => {
      const result = await authClient.revokeSessions()
      if (result.error) throw new Error(result.error.message || 'Could not revoke all sessions.')
      window.location.assign('/login/')
    })
  }

  async function signOutCurrent() {
    await run('signout', async () => {
      const result = await authClient.signOut()
      if (result.error) throw new Error(result.error.message || 'Could not sign out.')
      window.location.assign('/login/')
    })
  }

  if (!discovery?.configured) {
    return (
      <div className="security-stack">
        <div className="app-empty">
          <div className="app-empty-meta">SECURITY BACKEND LOCKED</div>
          <strong>MFA, passkeys, and sessions are coded but not enabled on this deployment.</strong>
          ProofTTL will unlock them only after D1, the auth secret, trusted origin, and a real sign-in provider are deployed.
        </div>
      </div>
    )
  }

  if (sessionPending) {
    return <div className="app-empty"><strong>Checking your secure session…</strong></div>
  }

  if (!signedIn) {
    return (
      <div className="app-empty">
        <div className="app-empty-meta">SIGN IN REQUIRED</div>
        <strong>Security settings are account-scoped.</strong>
        <a className="text-link" href="/login/">SIGN IN TO MANAGE SECURITY →</a>
      </div>
    )
  }

  return (
    <div className="security-stack">
      <div className="security-summary">
        <div><span>ACCOUNT</span><strong>{user?.email || user?.name || 'ProofTTL user'}</strong></div>
        <div><span>TOTP MFA</span><strong>{twoFactorEnabled ? 'ENABLED' : 'NOT ENABLED'}</strong></div>
        <div><span>PASSKEYS</span><strong>{discovery.security.passkeys ? passkeys.length : 'HOSTNAME PENDING'}</strong></div>
        <div><span>ACTIVE SESSIONS</span><strong>{sessions.length}</strong></div>
      </div>

      <section className="security-card">
        <div className="security-card-heading">
          <div><span className="app-empty-meta">AUTHENTICATOR APP</span><h3>Time-based one-time password</h3></div>
          <span className={twoFactorEnabled ? 'security-pill live' : 'security-pill'}>{twoFactorEnabled ? 'ACTIVE' : 'OFF'}</span>
        </div>

        {!twoFactorEnabled && !totpURI && (
          <button className="button button-secondary" type="button" onClick={() => void startTotpEnrollment()} disabled={busy !== null || !discovery.security.totp}>
            {busy === 'totp-enable' ? 'STARTING…' : 'SET UP AUTHENTICATOR'}
          </button>
        )}

        {totpURI && (
          <div className="security-enrollment">
            <p>Open this enrollment link in an authenticator app, or enter the secret manually.</p>
            <a className="text-link break-all" href={totpURI}>OPEN AUTHENTICATOR ENROLLMENT →</a>
            {totpSecret && <code className="security-secret">{totpSecret}</code>}
            <label className="app-input-label">VERIFY CURRENT CODE
              <input value={totpCode} onChange={(event) => setTotpCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="000000" />
            </label>
            <button className="button button-primary" type="button" onClick={() => void verifyTotpEnrollment()} disabled={busy !== null || !totpCode.trim()}>
              {busy === 'totp-verify' ? 'VERIFYING…' : 'VERIFY + ENABLE MFA'}
            </button>
          </div>
        )}

        {twoFactorEnabled && (
          <p className="app-note">Authenticator MFA is active. Disabling MFA is intentionally withheld until ProofTTL has a dedicated recent-authentication/step-up confirmation flow.</p>
        )}
      </section>

      <section className="security-card">
        <div className="security-card-heading">
          <div><span className="app-empty-meta">RECOVERY</span><h3>One-time recovery codes</h3></div>
          <span className="security-pill">SINGLE USE</span>
        </div>
        {recoveryCodes.length > 0 ? (
          <div className="recovery-code-grid" aria-label="New ProofTTL recovery codes">
            {recoveryCodes.map((code) => <code key={code}>{code}</code>)}
          </div>
        ) : (
          <p className="app-note">Recovery codes are never displayed continuously. They appear only when the set is first generated or intentionally regenerated.</p>
        )}
        <button className="button button-secondary" type="button" onClick={() => void regenerateRecoveryCodes()} disabled={busy !== null || !twoFactorEnabled}>
          {busy === 'recovery' ? 'GENERATING…' : 'REGENERATE RECOVERY CODES'}
        </button>
      </section>

      <section className="security-card">
        <div className="security-card-heading">
          <div><span className="app-empty-meta">PASSKEYS</span><h3>Phishing-resistant sign in</h3></div>
          <span className={discovery.security.passkeys ? 'security-pill live' : 'security-pill'}>{discovery.security.passkeys ? 'AVAILABLE' : 'RP HOST PENDING'}</span>
        </div>
        {passkeys.length > 0 && (
          <div className="security-list">
            {passkeys.map((item) => (
              <div className="security-list-row" key={item.id}>
                <div><strong>{item.name || 'Passkey'}</strong><span>{item.deviceType || 'WebAuthn credential'} · {item.backedUp ? 'synced/backed up' : 'device credential'} · added {safeDate(item.createdAt)}</span></div>
                <button type="button" onClick={() => void deletePasskey(item.id)} disabled={busy !== null}>REMOVE</button>
              </div>
            ))}
          </div>
        )}
        <button className="button button-secondary" type="button" onClick={() => void addPasskey()} disabled={busy !== null || !discovery.security.passkeys}>
          {busy === 'passkey-add' ? 'WAITING FOR DEVICE…' : 'ADD PASSKEY'}
        </button>
      </section>

      <section className="security-card">
        <div className="security-card-heading">
          <div><span className="app-empty-meta">SESSIONS</span><h3>Signed-in devices</h3></div>
          <span className="security-pill live">SERVER MANAGED</span>
        </div>
        <div className="security-list">
          {sessions.map((item) => {
            const current = item.token === currentSessionToken
            return (
              <div className="security-list-row" key={item.token}>
                <div><strong>{current ? 'This device' : shortAgent(item.userAgent)}</strong><span>{item.ipAddress || 'IP unavailable'} · expires {safeDate(item.expiresAt)}</span></div>
                {current ? <span className="security-current">CURRENT</span> : <button type="button" onClick={() => void revokeSession(item.token)} disabled={busy !== null}>REVOKE</button>}
              </div>
            )
          })}
        </div>
        <div className="security-actions">
          <button className="button button-secondary" type="button" onClick={() => void revokeOtherSessions()} disabled={busy !== null}>LOG OUT OTHER DEVICES</button>
          <button className="button button-secondary" type="button" onClick={() => void signOutCurrent()} disabled={busy !== null}>LOG OUT THIS DEVICE</button>
          <button className="button button-secondary danger-button" type="button" onClick={() => void logoutEverywhere()} disabled={busy !== null}>LOG OUT EVERYWHERE</button>
        </div>
      </section>

      {status && <p className="security-status" role="status">{status}</p>}
    </div>
  )
}
