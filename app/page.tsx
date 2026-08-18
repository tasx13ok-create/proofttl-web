'use client'

import { FormEvent, useState } from 'react'
import MobileNavMenu from '../components/MobileNavMenu'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'
const GITHUB_URL = 'https://github.com/tasx13ok-create/proofttl'
const SUPPORT_URL = `${GITHUB_URL}/issues`
const MAX_TTL_SECONDS = 604800

type VerifyResult = {
  kind: 'valid' | 'contradicted' | 'unknown' | 'payment' | 'error'
  title: string
  body: string
}

type VerifyResponse = {
  status?: 'SUPPORTED' | 'CONTRADICTED' | 'UNKNOWN'
  lease_state?: 'ACTIVE' | 'REVOKED' | 'EXPIRED'
  lease_id?: string
  [key: string]: unknown
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button className="copy-button" onClick={copy} type="button" aria-label="Copy code to clipboard">
      {copied ? 'COPIED' : 'COPY'}
    </button>
  )
}

function CodeBlock({ children }: { children: string }) {
  return <div className="code-block"><CopyButton value={children} /><pre>{children}</pre></div>
}

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <p className="section-lede">{children}</p>}</div>
}

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function resultFromLease(data: VerifyResponse): VerifyResult {
  const body = JSON.stringify(data, null, 2)
  if (data.status === 'SUPPORTED') return { kind: 'valid', title: 'SUPPORTED', body }
  if (data.status === 'CONTRADICTED') return { kind: 'contradicted', title: 'CONTRADICTED', body }
  if (data.status === 'UNKNOWN') return { kind: 'unknown', title: 'UNKNOWN', body }
  return { kind: 'valid', title: data.lease_state || 'LEASE ISSUED', body }
}

export default function Home() {
  const [claim, setClaim] = useState('Example.com is intended for illustrative examples in documents.')
  const [source, setSource] = useState('https://example.com')
  const [ttl, setTtl] = useState('300')
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(null)

    const ttlSeconds = Number(ttl)
    if (
      !claim.trim() ||
      claim.trim().length > 1000 ||
      !source.trim() ||
      !isHttpUrl(source.trim()) ||
      !Number.isInteger(ttlSeconds) ||
      ttlSeconds < 60 ||
      ttlSeconds > MAX_TTL_SECONDS
    ) {
      setResult({
        kind: 'error',
        title: 'INVALID INPUT',
        body: `Provide a claim (1–1000 characters), an http(s) source URL, and a whole-number TTL from 60 to ${MAX_TTL_SECONDS} seconds.`
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          claim: claim.trim(),
          source_url: source.trim(),
          ttl_seconds: ttlSeconds
        })
      })

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await response.json().catch(() => ({})) as VerifyResponse & { error?: string; message?: string }
        : {}

      if (response.status === 402) {
        setResult({
          kind: 'payment',
          title: 'PAYMENT REQUIRED',
          body: 'ProofTTL returned the expected HTTP 402 challenge. This browser demo does not hold a wallet or payment signature; x402-capable clients can settle the $0.001 testnet verification and retry.'
        })
      } else if (!response.ok) {
        setResult({
          kind: 'error',
          title: `HTTP ${response.status}`,
          body: data.message || data.error || 'The verifier returned an error. Try again with a different public source.'
        })
      } else {
        setResult(resultFromLease(data))
      }
    } catch {
      setResult({
        kind: 'error',
        title: 'UNREACHABLE',
        body: 'Could not reach the verifier from this browser. Check the API URL, CORS/network access, or try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return <main>
    <nav className="nav shell" aria-label="Primary navigation">
      <a className="brand" href="#top"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
      <div className="nav-links"><a href="#how">How it works</a><a href="#lease">Fact leases</a><a href="#api">API</a><a href="#pricing">Pricing</a><a href="/support">Support</a><a href="/login">Sign in</a></div>
      <div className="nav-right">
        <a className="nav-cta" href="#verify">Try verifier <span>↗</span></a>
        <MobileNavMenu
          links={[
            { href: '#how', label: 'How it works' },
            { href: '#lease', label: 'Fact leases' },
            { href: '#api', label: 'API' },
            { href: '#pricing', label: 'Pricing' },
            { href: '/support', label: 'Support' },
            { href: '/login', label: 'Sign in' },
          ]}
        />
      </div>
    </nav>

    <section className="hero shell" id="top">
      <div className="hero-copy">
        <div className="status-line"><span className="pulse" /> VERIFICATION INFRASTRUCTURE <span className="status-rule" /> BASE SEPOLIA TESTNET</div>
        <h1>Truth with<br /><em>an expiry date.</em></h1>
        <p className="hero-lede">ProofTTL turns claims into source-backed, time-bound Fact Leases. Verify what a source supports now — without pretending it will stay true forever.</p>
        <div className="hero-actions"><a className="button button-primary" href="#verify">Verify a claim <span>→</span></a><a className="text-link" href="#api">Read the API docs <span>↗</span></a></div>
        <div className="hero-notes"><span>NO ACCOUNT REQUIRED</span><span>X402 PAY PER VERIFICATION</span><span>PROOFTTL/0.3.1</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-header"><span>CLAIM_PIPELINE</span><span className="live-label">● TESTNET</span></div>
        <div className="pipeline">
          <div className="pipeline-node"><span className="node-index">01</span><strong>CLAIM</strong><small>human-readable assertion</small><code>“Example.com is intended…”</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node active"><span className="node-index">02</span><strong>VERIFY</strong><small>source-backed verdict</small><code>SUPPORTED / CONTRADICTED / UNKNOWN</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">03</span><strong>LEASE</strong><small>fingerprinted + monitored</small><code>ACTIVE → REVOKED / EXPIRED</code></div>
        </div>
        <div className="visual-footer"><span>PROOFTTL/0.3.1</span><span>SHA-256 <b>SOURCE-BOUND</b></span></div>
      </div>
    </section>

    <section className="ticker"><div className="ticker-inner"><span>CLAIM → SOURCE → VERDICT → LEASE</span><span>◈</span><span>THE INTERNET NEEDS FRESH FACTS</span><span>◈</span><span>CLAIM → FINGERPRINT → MONITOR → EXPIRE</span></div></section>

    <section className="section shell" id="how">
      <SectionTitle eyebrow="01 / THE PROTOCOL" title="Facts are not forever.">A Fact Lease records what a source supported at issuance, when that observation expires, and what ProofTTL sees as it monitors the source.</SectionTitle>
      <div className="steps">
        <article><span>01</span><h3>Make a claim</h3><p>State a precise, human-readable assertion you want a source to support or contradict.</p></article>
        <article><span>02</span><h3>Attach a source</h3><p>Point to a public HTTP(S) source. ProofTTL validates, fetches, normalizes, and fingerprints it.</p></article>
        <article><span>03</span><h3>Set the TTL</h3><p>Choose how long the lease should remain active, from 60 seconds up to the configured maximum.</p></article>
        <article><span>04</span><h3>Monitor the lease</h3><p>ProofTTL rechecks active leases and can revoke one when changing evidence no longer maintains its verdict.</p></article>
      </div>
    </section>

    <section className="section shell split-section" id="lease">
      <div>
        <SectionTitle eyebrow="02 / FACT LEASE" title="A receipt for reality.">Every ProofTTL lease carries the context a bare boolean leaves behind.</SectionTitle>
        <dl className="fact-list">
          <div><dt>CLAIM</dt><dd>The exact assertion being evaluated.</dd></div>
          <div><dt>SOURCE</dt><dd>Where the supporting or contradicting evidence came from.</dd></div>
          <div><dt>EXPIRES</dt><dd>When the active lease reaches the end of its TTL.</dd></div>
          <div><dt>FINGERPRINT</dt><dd>SHA-256 of ProofTTL’s normalized source observation.</dd></div>
          <div><dt>STATE</dt><dd>ACTIVE, REVOKED, or EXPIRED as monitoring progresses.</dd></div>
        </dl>
      </div>
      <div className="lease-card">
        <div className="lease-top"><span>EXAMPLE FACT LEASE</span><span className="valid-pill">SUPPORTED</span></div>
        <div className="lease-claim">Example.com is intended for illustrative examples in documents.</div>
        <div className="lease-meta"><span>SOURCE<strong>example.com</strong></span><span>TTL<strong>300 SECONDS</strong></span><span>LEASE STATE<strong className="accent-text">ACTIVE</strong></span></div>
        <div className="lease-signature"><span>FINGERPRINT</span><code>sha256:d003f90b…acad8</code><span className="signature-seal">✓</span></div>
      </div>
    </section>

    <section className="section ttl-section">
      <div className="ttl-number">TTL<span>≠</span>TRUTH</div>
      <div><SectionTitle eyebrow="03 / WHY TIME-BOUND?" title="Stale truth is a security bug." /><p className="large-copy">A source-backed verdict is only useful in context. ProofTTL gives your systems the missing dimension: <strong>when to stop relying on it.</strong></p><a className="text-link" href="#verify">See the live endpoint <span>→</span></a></div>
    </section>

    <section className="section shell verify-section" id="verify">
      <div className="verify-intro"><SectionTitle eyebrow="04 / LIVE VERIFIER" title="Ask ProofTTL.">Submit a claim and public source to the live endpoint. An unpaid browser request should receive an HTTP 402 x402 challenge.</SectionTitle><div className="endpoint-chip"><span className="method">POST</span> {API_URL}/verify</div></div>
      <form className="verify-card" onSubmit={verify} noValidate>
        <label>CLAIM<textarea value={claim} onChange={e => setClaim(e.target.value)} rows={3} maxLength={1000} required /></label>
        <label>SOURCE URL<input value={source} onChange={e => setSource(e.target.value)} inputMode="url" required /></label>
        <label>TRUST WINDOW / SECONDS<input value={ttl} onChange={e => setTtl(e.target.value)} inputMode="numeric" min="60" max={String(MAX_TTL_SECONDS)} required /></label>
        <button className="button button-primary full-button" disabled={loading}>{loading ? 'VERIFYING...' : 'RUN VERIFICATION →'}</button>
        {result && <div className={`result ${result.kind}`} role="status" aria-live="polite"><div><span className="result-dot" />{result.title}</div><pre>{result.body}</pre></div>}
      </form>
    </section>

    <section className="section shell x402-section">
      <div className="x402-copy"><p className="eyebrow">PAYMENT, BUILT IN</p><h2>Useful facts have a cost.<br /><em>Pay per verification.</em></h2><p>ProofTTL uses x402 so machine clients can receive an HTTP 402 challenge, settle the required testnet USDC payment, and retry the protected verification request.</p><a className="text-link" href="#api">See the API surface <span>↗</span></a></div>
      <div className="payment-grid"><div><span>NETWORK</span><strong>BASE SEPOLIA</strong></div><div><span>UNIT PRICE</span><strong>$0.001</strong></div><div><span>SETTLEMENT ASSET</span><strong>USDC</strong></div><div><span>X402 SCHEME</span><strong>EXACT</strong></div></div>
    </section>

    <section className="section shell architecture" id="api">
      <SectionTitle eyebrow="05 / ARCHITECTURE" title="Drop fresh evidence into the stack.">A deliberately small API surface for source-backed facts with explicit lifetimes.</SectionTitle>
      <div className="architecture-visual"><div className="arch-box"><span>YOUR APP / AGENT</span><code>claim + source + TTL</code></div><div className="arch-arrow">→</div><div className="arch-box accent-box"><span>X402 + PROOFTTL</span><code>settle → validate → verify</code></div><div className="arch-arrow">→</div><div className="arch-box"><span>FACT LEASE</span><code>verdict + evidence + TTL</code></div></div>
      <div className="api-grid">
        <div><h3>Quickstart</h3><CodeBlock>{`curl -X POST ${API_URL}/verify \\
  -H "Content-Type: application/json" \\
  -d '{\n    "claim": "Example.com is intended for illustrative examples in documents.",\n    "source_url": "https://example.com",\n    "ttl_seconds": 300\n  }'`}</CodeBlock></div>
        <div className="api-endpoints"><h3>Endpoints</h3><div><span className="method">POST</span><code>/verify</code><small>Issue a paid Fact Lease</small></div><div><span className="method get">GET</span><code>/lease/:id</code><small>Read a Fact Lease</small></div><div><span className="method get">GET</span><code>/health</code><small>Check service health</small></div><div><span className="method get">GET</span><code>/openapi.json</code><small>Read the machine API specification</small></div><div><span className="method get">GET</span><code>/pricing</code><small>Read current machine pricing</small></div></div>
      </div>
    </section>

    <section className="section shell pricing" id="pricing">
      <SectionTitle eyebrow="06 / PRICING" title="One verification. One price.">No invented tiers or monthly minimums. ProofTTL currently exposes one testnet pay-per-verification path.</SectionTitle>
      <div className="pricing-cards"><article className="featured-plan"><span className="plan-label">BASE SEPOLIA TESTNET</span><div className="price">$0.001<span>/Fact Lease issuance</span></div><p>A source-backed verification with an expiring lease and automatic monitoring during its TTL.</p><ul><li>Source retrieval and safety validation</li><li>Exact / semantic verification</li><li>SHA-256 source fingerprint</li><li>Fact Lease issuance and monitoring</li><li>x402 exact settlement in testnet USDC</li></ul><a className="button button-primary" href="#verify">Try the endpoint</a></article></div>
    </section>

    <section className="section shell support-section" id="support">
      <SectionTitle eyebrow="07 / SUPPORT" title="Testnet support without pretending.">A dedicated ProofTTL support mailbox and employee queue are on the roadmap. During testnet, technical issues can be filed in the public repository so they are trackable.</SectionTitle>
      <div className="hero-actions"><a className="button button-secondary" href="/support">Open support <span>→</span></a><a className="text-link" href={SUPPORT_URL} target="_blank" rel="noreferrer">GitHub issues <span>↗</span></a></div>
    </section>

    <section className="section shell final-cta"><p className="eyebrow">THE NEXT LAYER OF TRUST</p><h2>Give your product<br /><em>a memory of now.</em></h2><div className="hero-actions"><a className="button button-primary" href="#verify">Verify a claim <span>→</span></a><a className="button button-secondary" href="/console">Console preview</a><a className="text-link" href="#api">Read the API <span>↗</span></a></div></section>

    <footer className="footer shell"><a className="brand" href="#top"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a><span>EXPIRING, SOURCE-BACKED FACT LEASES FOR MACHINES.</span><div><a href="#api">Docs</a><a href="#pricing">Pricing</a><a href="/support">Support</a><a href="/login">Sign in</a><a href="/console">Console</a><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a></div></footer>
  </main>
}
