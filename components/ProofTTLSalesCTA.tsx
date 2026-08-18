'use client'

import { usePathname } from 'next/navigation'

export default function ProofTTLSalesCTA() {
  const pathname = usePathname()
  if (pathname !== '/') return null

  return (
    <aside className="pttl-sales-cta" aria-label="ProofTTL $500 verification audit">
      <div>
        <span className="pttl-sales-cta-kicker">FLAGSHIP PAID OFFER · $500</span>
        <strong>Find the claims that could cost you trust before someone else does.</strong>
        <small>10–25 claims · source-backed verdicts · signed Fact Leases · contradictions surfaced first · 7-day monitoring</small>
      </div>
      <div className="pttl-sales-cta-actions">
        <a href="/audit/sample/">SEE A REAL SAMPLE</a>
        <a className="primary" href="/audit/">START A $500 AUDIT →</a>
      </div>
    </aside>
  )
}
