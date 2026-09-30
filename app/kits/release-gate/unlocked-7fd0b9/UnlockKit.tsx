'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

const ENCRYPTED_PAYLOAD = '__ENCRYPTED_PAYLOAD__'

function b64urlToBytes(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const raw = atob(padded)
  return Uint8Array.from(raw, ch => ch.charCodeAt(0))
}

async function decryptPayload(access: string) {
  if (!ENCRYPTED_PAYLOAD.startsWith('enc:v1:')) {
    throw new Error('Fulfillment payload is not connected yet.')
  }

  const [, , ivText, cipherText] = ENCRYPTED_PAYLOAD.split(':')
  if (!ivText || !cipherText) throw new Error('Invalid fulfillment payload.')

  const keyBytes = b64urlToBytes(access)
  if (keyBytes.byteLength !== 32) throw new Error('Invalid access token.')

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )

  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64urlToBytes(ivText) },
    key,
    b64urlToBytes(cipherText),
  )

  return new TextDecoder().decode(plain)
}

export default function UnlockKit() {
  const [kit, setKit] = useState('')
  const [status, setStatus] = useState('Checking purchase access…')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const access = params.get('access')

    if (!access) {
      setStatus('A valid post-purchase access token is required.')
      return
    }

    decryptPayload(access)
      .then(value => {
        setKit(value)
        setStatus('')
        history.replaceState(null, '', window.location.pathname)
      })
      .catch(err => {
        setStatus(err instanceof Error ? err.message : 'Unable to unlock this purchase.')
      })
  }, [])

  async function copy() {
    if (!kit) return
    await navigator.clipboard.writeText(kit)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function download() {
    if (!kit) return
    const blob = new Blob([kit], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proofttl-release-gate-kit-v1.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className={styles.shell}>
      <section className={styles.top}>
        <div className={styles.kicker}>PURCHASE ACCESS · NOINDEX</div>
        <h1>Release Gate Kit</h1>
        {status ? (
          <p>{status}</p>
        ) : (
          <>
            <p>Access verified by the post-purchase token. Save a local copy now; the token is removed from the address bar after decryption.</p>
            <div className={styles.actions}>
              <button onClick={copy}>{copied ? 'Copied' : 'Copy full kit'}</button>
              <button onClick={download}>Download .txt</button>
            </div>
          </>
        )}
      </section>
      {kit ? <pre>{kit}</pre> : null}
      <footer><a href="/">ProofTTL</a> · Evidence &gt; confidence.</footer>
    </main>
  )
}
