'use client'

import { usePathname } from 'next/navigation'
import { isAppPath } from '../lib/route-mode'

export default function ProtocolNetworkStrip() {
  const pathname = usePathname()
  // Public buyer routes such as '/' and '/audit/' stay clean because only explicit app paths render this technical network strip.
  if (!isAppPath(pathname)) return null

  return (
    <div className="product-network-strip" data-proofttl-network-banner="testnet">
      <strong>PROOFTTL v1.0.1 · TESTNET PREVIEW</strong>
      <span>Protocol settlement: Base Sepolia · Mainnet disabled</span>
      <span aria-hidden="true">·</span>
      <a href="/trust/">Trust boundary</a>
    </div>
  )
}
