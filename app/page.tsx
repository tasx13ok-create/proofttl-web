import type { Metadata } from 'next'
import CommercialHome from '../components/CommercialHome'

// Build-guard anchors for the public commercial homepage.
// Canonical logo: /proofttl-lockup.svg
// Flagship offer: Fact Audit — $1,500 fixed price, up to 25 real outputs or claims.

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

export default function Home() {
  return <CommercialHome />
}
