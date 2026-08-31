'use client'

import { usePathname } from 'next/navigation'
import ProofTTLChatBar from './ProofTTLChatBar'
import { isAppPath } from '../lib/route-mode'

export default function AppOnlyChatBar() {
  const pathname = usePathname()
  // Buyer routes including '/trust/', '/ai-fact-checker/', '/services/', '/audit/', '/support/', and '/status/' never render the legacy app chat shell; only explicit app paths do.
  if (!isAppPath(pathname)) return null
  return <ProofTTLChatBar />
}
