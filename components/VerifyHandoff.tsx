'use client'

import { useMemo, useState, type FormEvent } from 'react'
import styles from './VerifyHandoff.module.css'

const MCP_ENDPOINT = 'https://proofttl-web.vercel.app/api/mcp/'

function validateSource(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    if (!['http:', 'https:'].includes(url.protocol)) return 'Use a public HTTP or HTTPS source URL.'
    if (url.username || url.password) return 'Remove any username or password from the source URL.'
    if (url.port && url.port !== '80' && url.port !== '443') return 'Use a standard HTTP or HTTPS port.'
    if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost') || url.hostname === '127.0.0.1' || url.hostname === '::1') return 'Use a public source URL, not a local address.'
    return null
  } catch {
    return 'Enter a complete HTTP or HTTPS source URL.'
  }
}

export default function VerifyHandoff() {
  const [claim, setClaim] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [ttlSeconds, setTtlSeconds] = useState('3600')
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState<'request' | 'prompt' | null>(null)

  const sourceError = useMemo(() => sourceUrl.trim() ? validateSource(sourceUrl) : null, [sourceUrl])
  const claimError = claim.trim().length > 1000 ? 'Keep the claim under 1,000 characters.' : null
  const valid = claim.trim().length > 0 && claim.trim().length <= 1000 && sourceUrl.trim().length <= 2048 && !sourceError
  const request = useMemo(() => JSON.stringify({
    jsonrpc: '2.0',
    id: 'proofttl-verify-handoff',
    method: 'tools/call',
    params: {
      name: 'proofttl_verify_claim',
      arguments: {
        claim: claim.trim(),
        source_url: sourceUrl.trim(),
        ttl_seconds: Number(ttlSeconds),
      },
    },
  }, null, 2), [claim, sourceUrl, ttlSeconds])
  const prompt = useMemo(() => [
    'Use the configured ProofTTL MCP tool proofttl_verify_claim for this specific factual claim.',
    'Do not invent a verdict or substitute other sources. Submit only the supplied public source URL.',
    'If x402 payment is required, stop and explain the amount and authorization step; do not sign, settle, or retry payment without my explicit approval.',
    'Preserve SUPPORTED, CONTRADICTED, or UNKNOWN exactly as returned, and explain evidence, freshness, and limitations.',
    '',
    'CLAIM:',
    claim.trim(),
    '',
    'PUBLIC SOURCE URL:',
    sourceUrl.trim(),
    '',
    'TTL_SECONDS:',
    ttlSeconds,
  ].join('\n'), [claim, sourceUrl, ttlSeconds])

  async function copyText(value: string, kind: 'request' | 'prompt') {
    setStatus('')
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setStatus(kind === 'request' ? 'MCP request copied.' : 'Assistant instruction copied.')
    } catch {
      setCopied(null)
      setStatus('Clipboard access was blocked. Select and copy the prepared text below.')
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCopied(null)
    if (!valid) {
      setStatus('Check the claim and public source URL before preparing the request.')
      return
    }
    setStatus('Request prepared. Nothing has been submitted, verified, or charged.')
  }

  return (
    <section className={styles.card} aria-labelledby="handoff-title">
      <div className={styles.cardHead}>
        <span className={styles.step}>01 / PREPARE</span>
        <h2 id="handoff-title">Prepare a verification request</h2>
        <p>Use a specific factual claim and one public source that can be examined.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="claim">Factual claim <span>Required · up to 1,000 characters</span></label>
        <textarea id="claim" value={claim} onChange={event => { setClaim(event.target.value); setStatus(''); setCopied(null) }} maxLength={1200} rows={4} placeholder="Example: The product’s published documentation states that feature X is available on plan Y." required />
        {claimError && <p className={styles.error}>{claimError}</p>}
        <label htmlFor="source-url">Public source URL <span>Required · HTTP(S)</span></label>
        <input id="source-url" type="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} value={sourceUrl} onChange={event => { setSourceUrl(event.target.value); setStatus(''); setCopied(null) }} maxLength={2048} placeholder="https://example.com/documentation" required />
        {sourceError && <p className={styles.error}>{sourceError}</p>}
        <label htmlFor="ttl">Evidence freshness window</label>
        <select id="ttl" value={ttlSeconds} onChange={event => { setTtlSeconds(event.target.value); setCopied(null) }}>
          <option value="3600">1 hour</option>
          <option value="86400">24 hours</option>
          <option value="604800">7 days</option>
        </select>
        <button className={styles.primary} type="submit" disabled={!valid}>Prepare request</button>
      </form>
      {status && <p className={styles.status} role="status">{status}</p>}
      <div className={styles.output}>
        <div className={styles.outputTitle}>
          <h3>Copy into your MCP client</h3>
          <span>Uses the existing ProofTTL tool</span>
        </div>
        <p className={styles.muted}>Choose the assistant instruction for a guided invocation, or the JSON-RPC request for an MCP-aware integration. Neither action sends the claim to ProofTTL.</p>
        <div className={styles.actions}>
          <button type="button" onClick={() => void copyText(prompt, 'prompt')} disabled={!valid}>{copied === 'prompt' ? 'Instruction copied' : 'Copy assistant instruction'}</button>
          <button type="button" onClick={() => void copyText(request, 'request')} disabled={!valid}>{copied === 'request' ? 'Request copied' : 'Copy MCP request'}</button>
        </div>
        <details>
          <summary>Preview the prepared request</summary>
          <pre>{request}</pre>
        </details>
        <div className={styles.endpoint}>
          <span>Canonical MCP endpoint</span>
          <a href={MCP_ENDPOINT} target="_blank" rel="noreferrer">{MCP_ENDPOINT}</a>
        </div>
      </div>
      <p className={styles.boundary}><strong>Payment boundary:</strong> ProofTTL’s technical verification requires the existing x402 payment flow. This handoff page does not request payment credentials, sign a payment, submit a claim, or bypass that requirement. A compatible MCP client must be configured to use ProofTTL.</p>
    </section>
  )
}
