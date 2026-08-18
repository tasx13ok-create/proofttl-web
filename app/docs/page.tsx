import type { Metadata } from 'next'
import styles from '../solutions/search-page.module.css'

const API_URL = process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev'

export const metadata: Metadata = {
  title: 'ProofTTL API Docs — Fact Verification & Expiring Fact Leases',
  description: 'Developer documentation for ProofTTL: verify source-backed claims, handle x402 payment challenges, read Fact Leases, and integrate expiration-aware evidence into apps and AI agents.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ProofTTL API Docs',
    description: 'Integrate source-backed, expiring Fact Leases with the ProofTTL API.',
    type: 'website',
  },
}

const requestExample = `POST ${API_URL}/verify\nContent-Type: application/json\n\n{\n  "claim": "Example.com is intended for illustrative examples in documents.",\n  "source_url": "https://example.com",\n  "ttl_seconds": 300\n}`

const readExample = `GET ${API_URL}/lease/ftl_<lease_id>`

export default function DocsPage() {
  return (
    <main className={styles.page}>
      <nav className={`${styles.shell} ${styles.nav}`} aria-label="ProofTTL documentation navigation">
        <a className={styles.brand} href="/">PROOF<span>TTL</span></a>
        <div className={styles.navLinks}>
          <a href="/solutions/">Solutions</a>
          <a href="/#verify">Verifier</a>
          <a href="/support/">Support</a>
          <a href="/console/">Console</a>
        </div>
      </nav>

      <section className={`${styles.shell} ${styles.hero}`}>
        <div>
          <p className={styles.eyebrow}>DEVELOPER DOCUMENTATION</p>
          <h1>Give software facts that expire.</h1>
          <p className={styles.lede}>
            ProofTTL verifies whether a specified public source currently supports a precise claim, fingerprints the observed source, and issues a time-bound Fact Lease that can later be monitored, revoked, or expired.
          </p>
        </div>
        <aside className={styles.card} aria-label="ProofTTL request example">
          <span className={styles.cardLabel}>VERIFY REQUEST</span>
          <code>{requestExample}</code>
        </aside>
      </section>

      <section className={`${styles.shell} ${styles.mainGrid}`}>
        <article className={styles.panel}>
          <h2>1. Verify a claim</h2>
          <p>
            Send a precise claim, a public HTTP(S) source URL, and a TTL. The current protected testnet endpoint is <code>POST /verify</code>.
          </p>
          <p>
            Requests must use <code>application/json</code>. Claims are limited to 1,000 characters and TTLs are currently accepted from 60 to 604,800 seconds.
          </p>
        </article>

        <article className={styles.panel}>
          <h2>2. Handle HTTP 402</h2>
          <p>
            An unpaid verification returns HTTP 402 with an x402 v2 <code>PAYMENT-REQUIRED</code> response header. The current testnet price is $0.001 USDC on Base Sepolia.
          </p>
          <p>
            An x402-capable client settles the requirement, retries with <code>PAYMENT-SIGNATURE</code>, and can read settlement metadata from <code>PAYMENT-RESPONSE</code>.
          </p>
        </article>

        <article className={styles.panel}>
          <h2>3. Receive a Fact Lease</h2>
          <p>
            A successful verification records the claim, source, evidence, verdict, issue time, expiry, SHA-256 source fingerprint, confidence, verifier, monitoring state, and lease ID.
          </p>
          <p>
            Verdicts are <strong>SUPPORTED</strong>, <strong>CONTRADICTED</strong>, or <strong>UNKNOWN</strong>. Lease states are <strong>ACTIVE</strong>, <strong>REVOKED</strong>, or <strong>EXPIRED</strong>.
          </p>
        </article>

        <article className={styles.panel}>
          <h2>4. Read it later</h2>
          <p>Fetch a stored lease by ID without creating another verification:</p>
          <div className={styles.card} style={{ marginTop: 16 }}>
            <code>{readExample}</code>
          </div>
          <p>
            Prefer <code>current_status</code> when evaluating the lease now. <code>issued_status</code> preserves the original issuance verdict.
          </p>
        </article>

        <article className={styles.panel}>
          <h2>Automatic monitoring</h2>
          <p>
            Active leases are rechecked automatically. If the source changes and ProofTTL can no longer maintain the original verdict, the lease can move to <strong>REVOKED</strong>. A lease reaches <strong>EXPIRED</strong> when its TTL ends.
          </p>
          <p>Public manual reverification is intentionally disabled so callers cannot force unmetered source-fetch and AI work.</p>
        </article>

        <article className={styles.panel}>
          <h2>Browser integrations</h2>
          <p>
            ProofTTL exposes CORS for the browser x402 flow, including <code>Content-Type</code> and <code>Payment-Signature</code> request headers and the <code>Payment-Required</code>, <code>Payment-Response</code>, and <code>Retry-After</code> response headers.
          </p>
          <p>The public website demo intentionally does not pretend to hold a wallet or payment signature.</p>
        </article>

        <article className={styles.panel}>
          <h2>Machine-readable surfaces</h2>
          <ul>
            <li><a href={`${API_URL}/openapi.json`}>OpenAPI 3.1 specification</a></li>
            <li><a href={`${API_URL}/.well-known/proofttl.json`}>ProofTTL discovery document</a></li>
            <li><a href={`${API_URL}/pricing`}>Machine-readable pricing</a></li>
            <li><a href={`${API_URL}/.well-known/proofttl-keys.json`}>Fact Lease public signing keys</a></li>
            <li><a href={`${API_URL}/.well-known/proofttl-assistant.json`}>Voice assistant discovery</a></li>
          </ul>
        </article>

        <article className={styles.panel}>
          <h2>Current environment</h2>
          <p>
            ProofTTL is currently operating on <strong>Base Sepolia testnet</strong>. Mainnet is not enabled. The current public verifier price is $0.001 per Fact Lease issuance in test USDC.
          </p>
          <p>No account is required for the public x402 API path.</p>
        </article>

        <div className={styles.cta}>
          <div>
            <h2>Try the actual endpoint.</h2>
            <p>Start with the unpaid 402 challenge or inspect the machine-readable API contract.</p>
          </div>
          <div className={styles.actions}>
            <a className={styles.primary} href="/#verify">Try verifier</a>
            <a className={styles.secondary} href={`${API_URL}/openapi.json`}>OpenAPI</a>
          </div>
        </div>
      </section>

      <footer className={`${styles.shell} ${styles.footer}`}>
        ProofTTL · ProofTTL/0.3.1 · Base Sepolia testnet
      </footer>
    </main>
  )
}
