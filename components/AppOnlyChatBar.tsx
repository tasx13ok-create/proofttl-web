'use client'

import { usePathname } from 'next/navigation'
import ProofTTLChatBar from './ProofTTLChatBar'

const PUBLIC_ROUTES = [
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

export default function AppOnlyChatBar() {
  const pathname = usePathname()
  const publicRoute = pathname === '/' || PUBLIC_ROUTES.some((route) => route !== '/' && (pathname === route || pathname.startsWith(route)))
  if (publicRoute) return null
  return <ProofTTLChatBar />
}
