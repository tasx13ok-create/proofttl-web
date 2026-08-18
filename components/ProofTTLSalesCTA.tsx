'use client'

import { usePathname } from 'next/navigation'

export default function ProofTTLSalesCTA() {
  const pathname = usePathname()
  if (pathname !== '/') return null

  return (
    <aside className="pttl-sales-cta" aria-label="ProofTTL claim verification offers">
      <div>
        <span className="pttl-sales-cta-kicker">PAID VERIFICATION · START AT $129</span>
        <strong>About to publish, sell, raise, or defend claims that cannot afford to be wrong?</strong>
        <small>$129 Stress Test: 3–5 claims · $500 Full Audit: 10–25 claims + 7-day monitoring · scope confirmed before payment</small>
      </div>
      <div className="pttl-sales-cta-actions">
        <a href="/audit/sample/">SEE SAMPLE</a>
        <a className="primary" href="/audit/#audit-intake">START WITH $129 →</a>
      </div>
    </aside>
  )
}
