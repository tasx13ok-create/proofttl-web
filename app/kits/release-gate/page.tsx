import type { Metadata } from 'next'
import ReleaseGate from './ReleaseGate'

export const metadata: Metadata = {
  title: 'AI Release Gate Kit — ProofTTL',
  description: 'A self-serve agent and rubric pack for stress-testing consequential AI output before it ships.',
  alternates: { canonical: '/kits/release-gate/' },
}

export default function ReleaseGatePage() {
  return <ReleaseGate />
}
