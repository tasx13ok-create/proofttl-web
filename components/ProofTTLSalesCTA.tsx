'use client'

import { usePathname } from 'next/navigation'

export default function ProofTTLSalesCTA() {
  const pathname = usePathname()
  if (pathname !== '/') return null

  return (
    <aside className="pttl-sales-cta" aria-label="ProofTTL verification audit">
      <div>
        <span className="pttl-sales-cta-kicker">EARLY CUSTOMER PILOT</span>
        <strong>Have claims that need to stay correct?</strong>
        <small>$500 · 10–25 claims · source-backed report · 7-day monitoring</small>
      </div>
      <div className="pttl-sales-cta-actions">
        <a href="/audit/sample/">VIEW SAMPLE</a>
        <a className="primary" href="/audit/">START AUDIT →</a>
      </div>
    </aside>
  )
}
