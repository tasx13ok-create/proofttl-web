'use client'

import { FormEvent, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'
const GITHUB_URL = 'https://github.com/tasx13ok-create/proofttl'
const SUPPORT_URL = `${GITHUB_URL}/issues`
const MAX_TTL_SECONDS = 604800

type VerifyResult = { kind: 'valid' | 'contradicted' | 'unknown' | 'payment' | 'error'; title: string; body: string }
type VerifyResponse = { status?: 'SUPPORTED' | 'CONTRADICTED' | 'UNKNOWN'; lease_state?: 'ACTIVE' | 'REVOKED' | 'EXPIRED'; lease_id?: string; [key: string]: unknown }

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1600) }
    catch { setCopied(false) }
  }
  return <button className="copy-button" onClick={copy} type="button" aria-label="Copy code to clipboard">{copied ? 'COPIED' : 'COPY'}</button>
}
function CodeBlock({ children }: { children: string }) { return <div className="code-block"><CopyButton value={children} /><pre>{children}</pre></div> }
function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) { return <div className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <p className="section-lede">{children}</p>}</div> }
function isHttpUrl(value: string) { try { const parsed = new URL(value); return parsed.protocol === 'http:' || parsed.protocol === 'https:' } catch { return false } }
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
    event.preventDefault(); setResult(null)
    const ttlSeconds = Number(ttl)
    if (!claim.trim() || claim.trim().length > 1000 || !source.trim() || !isHttpUrl(source.trim()) || !Number.isInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > MAX_TTL_SECONDS) {
      setResult({ kind: 'error', title: 'INVALID INPUT', body: `Provide a claim (1–1000 characters), an http(s) source URL, and a whole-number TTL from 60 to ${MAX_TTL_SECONDS} seconds.` }); return
    }
    setLoading(true)
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/verify`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ claim: claim.trim(), source_url: source.trim(), ttl_seconds: ttlSeconds }) })
      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) as VerifyResponse & { error?: string; message?: string } : {}
      if (response.status === 402) setResult({ kind: 'payment', title: 'PAYMENT REQUIRED', body: 'ProofTTL returned the expected HTTP 402 challenge. This browser demo does not hold a wallet or payment signature; x402-capable clients can settle the $0.001 testnet verification and retry.' })
      else if (!response.ok) setResult({ kind: 'error', title: `HTTP ${response.status}`, body: data.message || data.error || 'The verifier returned an error. Try again with a different public source.' })
      else setResult(resultFromLease(data))
    } catch { setResult({ kind: 'error', title: 'UNREACHABLE', body: 'Could not reach the verifier from this browser. Check the API URL, CORS/network access, or try again.' }) }
    finally { setLoading(false) }
  }

  return <main>
    <nav className="nav shell" aria-label="Primary navigation">
      <a className="brand" href="#top"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
      <div className="nav-links"><a href="/audit/">Verification services</a><a href="/audit/sample/">Sample audit</a><a href="#how">How it works</a><a href="/trust.html">Trust</a><a href="#api">API</a><a href="/login">Sign in</a></div>
      <a className="nav-cta" href="/audit/#audit-intake">Start at $129 <span>↗</span></a>
    </nav>

    <section className="hero shell" id="top">
      <div className="hero-copy">
        <div className="status-line"><span className="pulse" /> CLAIM RISK BEFORE PUBLIC EXPOSURE <span className="status-rule" /> SCOPE BEFORE PAYMENT</div>
        <h1>Find the claim that breaks<br /><em>before someone else does.</em></h1>
        <p className="hero-lede">About to publish, sell, raise, launch, or defend factual claims? ProofTTL pressure-tests the exact claims that could cost you a deal, a correction, or trust — against public primary sources before the market sees them.</p>
        <div className="hero-actions"><a className="button button-primary" href="/audit/#audit-intake">Stress-test 3–5 claims — $129 <span>→</span></a><a className="button button-secondary" href="/audit/">Full audit — $500</a><a className="text-link" href="/audit/sample/">See the sample <span>↗</span></a></div>
        <div className="hero-notes"><span>48H STRESS TEST</span><span>3–5 DAY FULL AUDIT</span><span>SCOPE CONFIRMED BEFORE PAYMENT</span></div>
      </div>
      <div className="hero-visual">
        <div className="visual-header"><span>PAID_VERIFICATION</span><span className="live-label">● EARLY PILOT</span></div>
        <div className="pipeline">
          <div className="pipeline-node active"><span className="node-index">$129</span><strong>STRESS TEST</strong><small>3–5 high-stakes claims</small><code>48h · signed Fact Leases</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">$371</span><strong>UPGRADE</strong><small>your first payment is credited</small><code>$129 + $371 = $500</code></div>
          <div className="pipeline-line"><span /></div>
          <div className="pipeline-node"><span className="node-index">$500</span><strong>FULL AUDIT</strong><small>10–25 claims + report</small><code>7-day monitoring included</code></div>
        </div>
        <div className="visual-footer"><span>SUPPORTED / CONTRADICTED / UNKNOWN</span><span>SIGNED <b>SOURCE-BACKED</b></span></div>
      </div>
    </section>

    <section className="ticker"><div className="ticker-inner"><span>PUBLISH → SELL → RAISE → DEFEND</span><span>◈</span><span>CHECK THE CLAIM BEFORE THE MARKET DOES</span><span>◈</span><span>SOURCE → VERDICT → SIGNED FACT LEASE</span></div></section>

    <section className="section shell" id="offers">
      <SectionTitle eyebrow="01 / START HERE" title="Two ways to buy certainty before exposure.">Start small to prove the output, or send the full claim set. The $129 Stress Test is credited in full if you upgrade.</SectionTitle>
      <div className="pricing-cards">
        <article><span className="plan-label">CLAIM STRESS TEST</span><div className="price">$129<span> one-time</span></div><p>3–5 high-stakes claims · source-backed verdicts · signed Fact Leases · 48-hour turnaround · no ongoing monitoring.</p><a className="button button-primary" href="/audit/#audit-intake">Start Stress Test</a></article>
        <article className="featured-plan"><span className="plan-label">FULL VERIFICATION AUDIT</span><div className="price">$500<span> one-time</span></div><p>10–25 claims · full report · signed Fact Leases · contradictions prioritized · 7-day monitoring · 3–5 business days.</p><a className="button button-primary" href="/audit/#audit-intake">Start Full Audit</a></article>
      </div>
      <div className="hero-actions"><a className="text-link" href="/audit/sample/">Inspect a public sample <span>→</span></a><a className="text-link" href="/docs/">Read the verification method <span>→</span></a></div>
    </section>

    <section className="section shell" id="how">
      <SectionTitle eyebrow="02 / THE PROCESS" title="No mystery checkout. Scope first.">The paid service is designed around a visible human checkpoint before money changes hands.</SectionTitle>
      <div className="steps">
        <article><span>01</span><h3>Submit the claims</h3><p>Tell us what you are about to publish or defend, why it matters, and your deadline.</p></article>
        <article><span>02</span><h3>Confirm scope</h3><p>Within 24 hours we confirm the exact claims, source priorities, format, and turnaround. No payment yet.</p></article>
        <article><span>03</span><h3>Pay after approval</h3><p>You only receive the payment request after the scope matches what you actually need.</p></article>
        <article><span>04</span><h3>Receive evidence</h3><p>Get source-backed verdicts, signed Fact Leases, and the agreed report or Stress Test output.</p></article>
      </div>
    </section>

    <section className="section shell split-section" id="lease">
      <div><SectionTitle eyebrow="03 / WHAT YOU RECEIVE" title="A verdict you can inspect.">ProofTTL does not hide uncertainty. Every checked claim stays tied to the source observation that produced the verdict.</SectionTitle><dl className="fact-list"><div><dt>CLAIM</dt><dd>The exact assertion being evaluated.</dd></div><div><dt>SOURCE</dt><dd>Where the supporting or contradicting evidence came from.</dd></div><div><dt>VERDICT</dt><dd>SUPPORTED, CONTRADICTED, or UNKNOWN.</dd></div><div><dt>SIGNATURE</dt><dd>A cryptographically signed ProofTTL issuance record.</dd></div><div><dt>TIME</dt><dd>When the observation was made and when its trust window ends.</dd></div></dl></div>
      <div className="lease-card"><div className="lease-top"><span>EXAMPLE FACT LEASE</span><span className="valid-pill">SUPPORTED</span></div><div className="lease-claim">Example.com is intended for illustrative examples in documents.</div><div className="lease-meta"><span>SOURCE<strong>example.com</strong></span><span>TTL<strong>300 SECONDS</strong></span><span>LEASE STATE<strong className="accent-text">ACTIVE</strong></span></div><div className="lease-signature"><span>FINGERPRINT</span><code>sha256:d003f90b…acad8</code><span className="signature-seal">✓</span></div></div>
    </section>

    <section className="section ttl-section"><div className="ttl-number">TTL<span>≠</span>TRUTH</div><div><SectionTitle eyebrow="04 / THE LIMIT" title="A signed verdict is evidence, not magic." /><p className="large-copy">ProofTTL records what examined sources support at a point in time. <strong>UNKNOWN stays UNKNOWN.</strong> We do not claim a Fact Lease creates legal authority or guarantees future truth.</p><a className="text-link" href="/trust.html">Read the Trust Center <span>→</span></a></div></section>

    <section className="section shell verify-section" id="verify">
      <div className="verify-intro"><SectionTitle eyebrow="05 / TECHNICAL VERIFIER" title="The engine underneath the service.">Developers can inspect the testnet verification endpoint directly. This is infrastructure beneath the paid audit offer, not the thing a business buyer has to understand first.</SectionTitle><div className="endpoint-chip"><span className="method">POST</span> {API_URL}/verify</div></div>
      <form className="verify-card" onSubmit={verify} noValidate><label>CLAIM<textarea value={claim} onChange={e => setClaim(e.target.value)} rows={3} maxLength={1000} required /></label><label>SOURCE URL<input value={source} onChange={e => setSource(e.target.value)} inputMode="url" required /></label><label>TRUST WINDOW / SECONDS<input value={ttl} onChange={e => setTtl(e.target.value)} inputMode="numeric" min="60" max={String(MAX_TTL_SECONDS)} required /></label><button className="button button-primary full-button" disabled={loading}>{loading ? 'VERIFYING...' : 'RUN TESTNET VERIFICATION →'}</button>{result && <div className={`result ${result.kind}`} role="status" aria-live="polite"><div><span className="result-dot" />{result.title}</div><pre>{result.body}</pre></div>}</form>
    </section>

    <section className="section shell x402-section"><div className="x402-copy"><p className="eyebrow">TECHNICAL PREVIEW</p><h2>Machine verification stays available.<br /><em>The business offer comes first.</em></h2><p>The current API payment rail remains Base Sepolia testnet USDC via x402. Mainnet remains disabled while paid human-facing services are being productized separately.</p><a className="text-link" href="#api">See API surface <span>↗</span></a></div><div className="payment-grid"><div><span>NETWORK</span><strong>BASE SEPOLIA</strong></div><div><span>UNIT PRICE</span><strong>$0.001</strong></div><div><span>SETTLEMENT ASSET</span><strong>TEST USDC</strong></div><div><span>MAINNET</span><strong>DISABLED</strong></div></div></section>

    <section className="section shell architecture" id="api">
      <SectionTitle eyebrow="06 / API" title="The verification machinery is still inspectable.">Developers and technical buyers can verify how the underlying Fact Lease system behaves without making the homepage depend on protocol terminology.</SectionTitle>
      <div className="architecture-visual"><div className="arch-box"><span>YOUR APP / AGENT</span><code>claim + source + TTL</code></div><div className="arch-arrow">→</div><div className="arch-box accent-box"><span>X402 + PROOFTTL</span><code>settle → validate → verify</code></div><div className="arch-arrow">→</div><div className="arch-box"><span>FACT LEASE</span><code>verdict + evidence + TTL</code></div></div>
      <div className="api-grid"><div><h3>Quickstart</h3><CodeBlock>{`curl -X POST ${API_URL}/verify \\
  -H "Content-Type: application/json" \\
  -d '{\n    "claim": "Example.com is intended for illustrative examples in documents.",\n    "source_url": "https://example.com",\n    "ttl_seconds": 300\n  }'`}</CodeBlock></div><div className="api-endpoints"><h3>Endpoints</h3><div><span className="method">POST</span><code>/verify</code><small>Issue a paid testnet Fact Lease</small></div><div><span className="method get">GET</span><code>/lease/:id</code><small>Read a Fact Lease</small></div><div><span className="method get">GET</span><code>/health</code><small>Check service health</small></div><div><span className="method get">GET</span><code>/openapi.json</code><small>Read machine API specification</small></div></div></div>
    </section>

    <section className="section shell support-section" id="support"><SectionTitle eyebrow="07 / SUPPORT" title="A small pilot with explicit boundaries.">Technical issues remain trackable through the public repository. Paid-service scope is confirmed before payment so the buyer knows exactly what is being delivered.</SectionTitle><div className="hero-actions"><a className="button button-secondary" href="/support">Open support <span>→</span></a><a className="text-link" href={SUPPORT_URL} target="_blank" rel="noreferrer">GitHub issues <span>↗</span></a></div></section>

    <section className="section shell final-cta"><p className="eyebrow">BEFORE YOU PUT THE CLAIM IN FRONT OF THE MARKET</p><h2>Find out what holds up.<br /><em>Start with 3–5 claims.</em></h2><div className="hero-actions"><a className="button button-primary" href="/audit/#audit-intake">Start the $129 Stress Test <span>→</span></a><a className="button button-secondary" href="/audit/">See the $500 Full Audit</a><a className="text-link" href="/audit/sample/">View sample <span>↗</span></a></div></section>

    <footer className="footer shell"><a className="brand" href="#top"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a><span>SOURCE-BACKED CLAIM VERIFICATION BEFORE PUBLIC EXPOSURE.</span><div><a href="/audit/">Services</a><a href="/audit/sample/">Sample</a><a href="/trust.html">Trust</a><a href="#api">API</a><a href="/support">Support</a><a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a></div></footer>
  </main>
}
