'use client'

import { useEffect, useState } from 'react'
import { authClient } from '../lib/proofttl-auth'

export default function ConsoleAccountActions() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    authClient.getSession()
      .then((result) => {
        if (!cancelled) setSignedIn(Boolean(result?.data?.user))
      })
      .catch(() => {
        if (!cancelled) setSignedIn(false)
      })
    return () => { cancelled = true }
  }, [])

  async function logOut() {
    if (busy) return
    setBusy(true)
    try {
      await authClient.signOut()
      window.location.assign('/login/')
    } finally {
      setBusy(false)
    }
  }

  async function switchAccount() {
    if (busy) return
    setBusy(true)
    try {
      if (signedIn) await authClient.signOut()
      window.location.assign('/login/')
    } finally {
      setBusy(false)
    }
  }

  if (signedIn === null) {
    return <span className="console-account-action-loading" aria-hidden="true">ACCOUNT…</span>
  }

  if (!signedIn) {
    return <a href="/login/">Log in</a>
  }

  return (
    <div className="console-account-actions" aria-label="Account actions">
      <button type="button" onClick={() => void logOut()} disabled={busy}>Log out</button>
      <span aria-hidden="true">/</span>
      <button type="button" onClick={() => void switchAccount()} disabled={busy}>Switch account</button>
    </div>
  )
}
