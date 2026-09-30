import type { Metadata } from 'next'
import UnlockKit from './UnlockKit'

export const metadata: Metadata = {
  title: 'Release Gate Kit — Access',
  robots: { index: false, follow: false },
}

export default function UnlockPage() {
  return <UnlockKit />
}
