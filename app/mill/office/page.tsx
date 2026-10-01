import type { Metadata } from 'next'
import FoundryOffice from './FoundryOffice'

export const metadata: Metadata = {
  title: 'FOUNDRY-10 — Cloud Agent Office',
  description: 'Walkable cloud control room for ten paired revenue agents.',
  robots: { index: false, follow: false },
}

export default function FoundryOfficePage() {
  return <FoundryOffice />
}
