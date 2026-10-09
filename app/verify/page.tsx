import type { Metadata } from 'next'
import SharedProductHeader from '../../components/SharedProductHeader'
import VerifyHandoff from '../../components/VerifyHandoff'
import styles from './verify-page.module.css'

export const metadata: Metadata = {
  title: 'Verify a Claim — ProofTTL',
  description: 'Prepare a source-backed ProofTTL claim verification request for a compatible MCP client. Inspect evidence, preserve uncertainty, and respect payment authorization.',
  alternates: { canonical: '/verify/' },
  robots: { index: true, follow: true },
}

export default function VerifyPage() {
  return (
    <main className={styles.page}>
      <SharedProductHeader />
      <section className={styles.hero}>
        <p className={styles.eyebrow}>PROOFTTL · CLAIM HANDOFF</p>
        <h1>Send the claim.<br /><span>Follow the evidence.</span></h1>
        <p className={styles.lede}>
          Prepare a claim and public source for ProofTTL’s existing verification MCP. The request can be copied into a compatible MCP client without rebuilding or bypassing the verification service.
        </p>
      </section>
      <VerifyHandoff />
      <section className={styles.notes} aria-label="Verification boundaries">
        <h2>Before you verify</h2>
        <ul>
          <li>Only submit information you are authorized to share. Do not submit confidential claims: issued Fact Leases may be public.</li>
          <li>A public HTTP(S) source URL is required. ProofTTL checks source and network safety before accessing it.</li>
          <li>Preparing or copying a request does not run an audit or charge you. Verification requires the existing x402 payment authorization and an explicit decision to submit it.</li>
          <li>Results are time-bounded evidence assessments: SUPPORTED, CONTRADICTED, or UNKNOWN. They are not a guarantee of permanent truth.</li>
        </ul>
        <p>Need a human-reviewed business audit instead? Visit <a href="/audit/">the paid audit intake</a> or inspect <a href="/audit/sample/">the sample report</a>.</p>
      </section>
    </main>
  )
}
