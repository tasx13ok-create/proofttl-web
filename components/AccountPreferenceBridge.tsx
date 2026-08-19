'use client'

import { useEffect } from 'react'

const API_URL = (process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev').replace(/\/$/, '')

type Preferences = {
  love_voice_enabled?: boolean
  love_compact_mode?: boolean
  studio_autosave?: boolean
}

function apply(preferences: Preferences | null) {
  const body = document.body
  body.classList.toggle('pttl-pref-love-voice-off', preferences?.love_voice_enabled === false)
  body.classList.toggle('pttl-pref-love-compact', preferences?.love_compact_mode === true)
  body.dataset.proofttlStudioAutosave = preferences?.studio_autosave === false ? 'off' : 'on'
}

export default function AccountPreferenceBridge() {
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(`${API_URL}/account/preferences`, {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })
        if (response.status === 401) { apply(null); return }
        if (!response.ok) return
        const body = await response.json().catch(() => ({})) as { preferences?: Preferences }
        apply(body.preferences || null)
      } catch {
        if (!controller.signal.aborted) apply(null)
      }
    }

    const onChange = (event: Event) => {
      const custom = event as CustomEvent<Preferences>
      if (custom.detail) apply(custom.detail)
      else void load()
    }

    void load()
    window.addEventListener('proofttl-preferences-changed', onChange)
    return () => {
      controller.abort()
      window.removeEventListener('proofttl-preferences-changed', onChange)
      document.body.classList.remove('pttl-pref-love-voice-off', 'pttl-pref-love-compact')
      delete document.body.dataset.proofttlStudioAutosave
    }
  }, [])

  return null
}
