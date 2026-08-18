'use client'

import { useEffect, useState } from 'react'
import {
  activateSpecter,
  getSpecterCapability,
  quotaPercent,
  type SpecterCapability,
} from '../lib/proofttl-specter'

export default function SpecterModeControls() {
  const [capability, setCapability] = useState<SpecterCapability | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadCapability() {
    setLoading(true)
    setError('')
    try {
      setCapability(await getSpecterCapability())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Specter capability is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  async function enableSpecter() {
    setLoading(true)
    setError('')
    try {
      const next = await activateSpecter()
      setCapability(next)
      if (next.specter) document.documentElement.classList.add('specter-mode')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Specter Mode could not be enabled.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (capability?.specter) document.documentElement.classList.add('specter-mode')
    else document.documentElement.classList.remove('specter-mode')
    return () => document.documentElement.classList.remove('specter-mode')
  }, [capability?.specter])

  if (!capability) {
    return (
      <div className="specter-card specter-card-compact">
        <div>
          <span className="specter-kicker">SPECTER MODE</span>
          <strong>A deeper ProofTTL workspace.</strong>
        </div>
        <button type="button" className="specter-button" onClick={loadCapability} disabled={loading}>
          {loading ? 'CHECKING' : 'CHECK ACCESS'}
        </button>
        {error && <p className="specter-error" role="alert">{error}</p>}
      </div>
    )
  }

  const percent = quotaPercent(capability)
  const canEnable = capability.member && capability.previewAuthorized

  return (
    <section className={`specter-card ${capability.specter ? 'is-active' : ''}`} aria-label="Specter Mode controls">
      <div className="specter-card-heading">
        <div>
          <span className="specter-kicker">SPECTER MODE</span>
          <strong>{capability.specter ? 'The quiet layer is active.' : 'A private layer for members.'}</strong>
        </div>
        <span className={`specter-access ${capability.member ? 'is-member' : ''}`}>
          {capability.member ? 'MEMBER' : 'FREE'}
        </span>
      </div>

      <div className="specter-toggle-row">
        <div>
          <span className="specter-label">SECURE PREVIEW</span>
          <p>{capability.previewAuthorized ? 'Preview authorization verified.' : 'Preview authorization required.'}</p>
        </div>
        <button
          type="button"
          className="specter-toggle"
          aria-pressed={capability.specter}
          onClick={capability.specter ? undefined : enableSpecter}
          disabled={loading || capability.specter || !canEnable}
        >
          <span className="specter-toggle-knob" />
          {capability.specter ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="specter-quota">
        <div className="specter-quota-heading">
          <span>MONTHLY VOICE QUOTA</span>
          <strong>{capability.quota.used} / {capability.quota.limit || '—'}</strong>
        </div>
        <div className="specter-quota-track" aria-label={`${percent}% of monthly voice quota used`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <small>{capability.quota.remaining} requests remaining · {capability.quota.period}</small>
      </div>

      {!capability.member && (
        <a className="specter-upgrade" href={capability.billingUrl || '/support/#billing'}>UPGRADE FOR MEMBER ACCESS ↗</a>
      )}
      {error && <p className="specter-error" role="alert">{error}</p>}
    </section>
  )
}
