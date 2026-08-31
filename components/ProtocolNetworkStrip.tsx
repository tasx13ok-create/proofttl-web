'use client'

import { usePathname } from 'next/navigation'

const COMMERCIAL_OR_PUBLIC_ROUTES = [
  '/',
  '/audit/',
  '/services/',
  '/solutions/',
  '/faq/',
  '/about/',
  '/machine-definition/',
  '/glossary/',
  '/how-proofttl-works/',
  '/privacy/',
  '/terms/',
  '/trust/',
  '/status/',
  '/support/',
  '/ai-fact-checker/',
  '/stress-test/',
]

export default function ProtocolNetworkStrip() {
  const pathname = usePathname()
  const hideProtocolBanner = pathname === '/' || COMMERCIAL_OR_PUBLIC_ROUTES.some((route) => route !== '/' && (pathname === route || pathname.startsWith(route)))
  if (hideProtocolBanner) return null

  return (
    <div className="product-network-strip" data-proofttl-network-banner="testnet">
      <strong>PROOFTTL v1.0.1 · TESTNET PREVIEW</strong>
      <span>Protocol settlement: Base Sepolia · Mainnet disabled</span>
      <span aria-hidden="true">·</span>
      <a href="/trust/">Trust boundary</a>
    </div>
  )
}
