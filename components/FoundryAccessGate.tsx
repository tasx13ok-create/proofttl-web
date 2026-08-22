'use client'

import { useEffect, useState } from 'react'
import { authClient, signInHref } from '../lib/proofttl-auth'
import { isFoundryOwnerEmail } from '../lib/foundry-access'
import FoundryWorkbench from './FoundryWorkbench'

type AccessState = 'checking' | 'allowed'

export default function FoundryAccessGate() {
  const [access, setAccess] = useState<AccessState>('checking')

  useEffect(() => {
    let cancelled = false

    async function verifyOwner() {
      try {
        const result = await authClient.getSession()
        const email = result?.data?.user?.email || null
        if (cancelled) return
        if (isFoundryOwnerEmail(email)) {
          setAccess('allowed')
          return
        }

        const signedIn = Boolean(result?.data?.user)
        window.location.replace(signedIn ? '/workspace/' : signInHref('/workspace/'))
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
