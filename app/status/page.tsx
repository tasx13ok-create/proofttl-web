import type { Metadata } from 'next'
import PublicServiceStatus from '../../components/PublicServiceStatus'

export const metadata: Metadata = {
  title: 'Service Status',
  description: 'Live ProofTTL customer-facing status for claim verification, account security, and Fact Lease monitoring.',
  alternates: { canonical: '/status/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'ProofTTL Service Status',
    description: 'Customer-facing status for ProofTTL claim verification, account security, and monitoring.',
    url: '/status/',
    type: 'website',
  },
}

export default function StatusPage() {
  return (
    <main className="app-page">
      <section className="app-shell" style={{ padding: '42px 0 90px' }}>
        <PublicServiceStatus />
      </section>
    </main>
  )
}
