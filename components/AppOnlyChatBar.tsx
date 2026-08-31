'use client'

import { usePathname } from 'next/navigation'
import ProofTTLChatBar from './ProofTTLChatBar'
import { isAppPath } from '../lib/route-mode'

export default function AppOnlyChatBar() {
  const pathname = usePathname()
  if (!isAppPath(pathname)) return null
  return <ProofTTLChatBar />
}
