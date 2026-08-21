'use client'

import { useEffect } from 'react'
import { authClient, PROOFTTL_API_URL } from '../lib/proofttl-auth'

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
    let cancelled = false
    let controller: AbortController | null = null

    async function load() {
      controller?.abort()
      controller = new AbortController()
      try {
        const session = await authClient.getSession()
        if (cancelled || controller.signal.aborted) return
        if (!session?.data?.user) {
          apply(null)
          return
        }

        const response = await fetch(`${PROOFTTL_API_URL}/account/preferences`, {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })
        if (cancelled || controller.signal.aborted) return
        if (response.status === 401) {
          apply(null)
          return
        }
        if (!response.ok) return
        const body = await response.json().catch(() => ({})) as { preferences?: Preferences }
        apply(body.preferences || null)
      } catch {
        if (!cancelled && !controller?.signal.aborted) apply(null)
      }
    }

    const onChange = (event: Event) => {
      const custom = event as CustomEvent<Preferences>
      if (custom.detail) apply(custom.detail)
      else void load()
    }

    void load()
    window.addEventListener('focus', load)
    window.addEventListener('proofttl-preferences-changed', onChange)
    return () => {
      cancelled = true
      controller?.abort()
      window.removeEventListener('focus', load)
      window.removeEventListener('proofttl-preferences-changed', onChange)
      document.body.classList.remove('pttl-pref-love-voice-off', 'pttl-pref-love-compact')
      delete document.body.dataset.proofttlStudioAutosave
    }
  }, [])

  return null
}
