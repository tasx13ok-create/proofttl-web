import type { Metadata } from 'next'
import TrustCenter from '../../components/TrustCenter'

export const metadata: Metadata = {
  title: 'Trust Center',
  description: 'ProofTTL payment, account-security, seven-day monitoring, human approval, and delivery boundaries for the $1,500 Fact Audit.',
  alternates: { canonical: '/trust/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ProofTTL Trust Center',
    description: 'See how ProofTTL handles scope-before-payment, Stripe-backed checkout, account security, human-approved proof/report delivery, seven-day monitoring, and service limitations.',
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
