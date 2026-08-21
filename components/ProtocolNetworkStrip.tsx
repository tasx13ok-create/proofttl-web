'use client'

import { usePathname } from 'next/navigation'

const COMMERCIAL_ROUTES = ['/', '/audit/', '/audit/sample/', '/audit/status/']

export default function ProtocolNetworkStrip() {
  const pathname = usePathname()
  if (COMMERCIAL_ROUTES.some((route) => pathname === route || (route !== '/' && pathname.startsWith(route)))) return null

  return (
    <div className="product-network-strip" data-proofttl-network-banner="testnet">
      <strong>PROOFTTL v1.0.0 · TESTNET PREVIEW</strong>
      <span>Protocol settlement: Base Sepolia · Mainnet disabled</span>
      <span aria-hidden="true">·</span>
      <a href="/trust/">Trust boundary</a>
    </div>
  )
}