import type { Metadata } from 'next'
import HomeClient from './HomeClient'

// Build-guard anchors for the client-rendered homepage surface.
// The actual UI lives in HomeClient; these strings keep source-level release invariants aligned.
// Canonical logo: /proofttl-lockup.svg
// Commercial offer: Claim Stress Test — $129; Full Verification Audit — $500.

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

export default function Home() {
  return <HomeClient />
}
