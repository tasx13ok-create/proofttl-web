'use client'

import { FormEvent, useState } from 'react'
import { authClient } from '../lib/proofttl-auth'

type Mode = 'totp' | 'backup'

export default function TwoFactorChallenge() {
  const [mode, setMode] = useState<Mode>('totp')
  const [code, setCode] = useState('')
  const [trustDevice, setTrustDevice] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    const normalized = code.trim()
    if (!normalized) return

    setBusy(true)
    setError('')
    try {
      const result = mode === 'totp'
        ? await authClient.twoFactor.verifyTotp({ code: normalized, trustDevice })
        : await authClient.twoFactor.verifyBackupCode({ code: normalized, trustDevice, disableSession: false })

      if (result?.error) {
        setError(result.error.message || 'Verification failed.')
        return
      }
      window.location.assign('/console/#security')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Verification failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-card">
      <p className="app-kicker">SECURITY CHECK</p>
      <h1 className="app-title">Verify it’s you.</h1>
      <p className="app-copy">
        {mode === 'totp'
          ? 'Enter the current code from your authenticator app.'
          : 'Use one unused ProofTTL recovery code.'}
      </p>

      <div className="auth-mode-switch" role="tablist" aria-label="Second factor method">
        <button type="button" className={mode === 'totp' ? 'active' : ''} onClick={() => { setMode('totp'); setCode(''); setError('') }}>AUTHENTICATOR</button>
        <button type="button" className={mode === 'backup' ? 'active' : ''} onClick={() => { setMode('backup'); setCode(''); setError('') }}>RECOVERY CODE</button>
      </div>

      <form className="app-form" onSubmit={(event) => void submit(event)}>
        <label className="app-input-label">
          {mode === 'totp' ? '6-DIGIT CODE' : 'RECOVERY CODE'}
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            inputMode={mode === 'totp' ? 'numeric' : 'text'}
            autoComplete="one-time-code"
            maxLength={mode === 'totp' ? 8 : 64}
            placeholder={mode === 'totp' ? '000000' : 'XXXX-XXXX'}
            disabled={busy}
            required
          />
        </label>

        <label className="auth-checkbox">
          <input type="checkbox" checked={trustDevice} onChange={(event) => setTrustDevice(event.target.checked)} disabled={busy} />
          Trust this device for future MFA prompts
        </label>

        <button type="submit" className="button button-primary full-button" disabled={busy || !code.trim()}>
          {busy ? 'VERIFYING…' : 'VERIFY →'}
        </button>
      </form>

      {error && <p className="app-note"><strong>Verification failed.</strong> {error}</p>}
      <p className="app-note">Recovery codes are single-use. ProofTTL never asks you to paste a TOTP seed or recovery-code list into support.</p>
    </div>
  )
}
