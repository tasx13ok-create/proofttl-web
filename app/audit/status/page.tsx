import AuditStatusLookup from '../../../components/AuditStatusLookup'
import SharedProductHeader from '../../../components/SharedProductHeader'

export const metadata = {
  title: 'Audit Status',
  description: 'Check the status, approved scope, payment state, and fulfillment progress of a ProofTTL Fact Audit request.',
  alternates: { canonical: '/audit/status/' },
}

export default function AuditStatusPage() {
  return (
    <main className="app-page audit-status-page">
      <SharedProductHeader />
      <section className="onboarding-wrap">
        <AuditStatusLookup />
      </section>
    </main>
  )
}
