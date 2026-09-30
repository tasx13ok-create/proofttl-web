import type { Metadata } from 'next'
import MillDashboard from './MillDashboard'

export const metadata: Metadata = {
  title: 'MILL — Micro Income Launch Loop',
  description: 'Internal opportunity and product experiment dashboard.',
  robots: { index: false, follow: false },
}

export default function MillPage() {
  return <MillDashboard />
}
