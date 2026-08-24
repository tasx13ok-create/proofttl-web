import type { Metadata } from 'next'
import TrustCenter from '../../components/TrustCenter'

export const metadata: Metadata = {
  title: 'Trust Center',
  description: 'ProofTTL payment, account-security, monitoring, signing, and delivery boundaries for the source-backed claim verification service.',
  alternates: { canonical: '/trust/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ProofTTL Trust Center',
    description: 'See how ProofTTL handles scope-before-payment, Stripe-backed checkout, account security, signed Fact Leases, monitoring, and service limitations.',
    url: '/trust/',
    type: 'website',
  },
}

export default function TrustPage() {
  return (
    <main className="app-page">
      <section className="app-shell" style={{ paddingTop: 34, paddingBottom: 100 }}>
        <TrustCenter />
      </section>
    </main>
  )
}
