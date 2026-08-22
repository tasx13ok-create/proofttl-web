'use client'

import { useEffect, useState } from 'react'
import { PROOFTTL_API_URL, signInHref } from '../lib/proofttl-auth'
import FoundryWorkbench from './FoundryWorkbench'

type AccessState = 'checking' | 'allowed'

export default function FoundryAccessGate() {
  const [access, setAccess] = useState<AccessState>('checking')

  useEffect(() => {
    let cancelled = false

    async function verifyOwner() {
      try {
        const response = await fetch(`${PROOFTTL_API_URL}/foundry/runs`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })
        if (cancelled) return
        if (response.ok) {
          setAccess('allowed')
          return
        }
        window.location.replace(response.status === 401 ? signInHref('/workspace/') : '/workspace/')
      } catch {
        if (!cancelled) window.location.replace('/workspace/')
      }
    }

    void verifyOwner()
    return () => { cancelled = true }
  }, [])

  if (access !== 'allowed') return null
  return <FoundryWorkbench />
}
