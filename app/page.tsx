import type { Metadata } from 'next'
import CommercialHome from '../components/CommercialHome'

// Build-guard anchors for the public commercial homepage.
// Canonical logo: /proofttl-lockup.svg
// Commercial offer: Claim Stress Test — $129; Full Verification Audit — $500.

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

export default function Home() {
  return <CommercialHome />
}
