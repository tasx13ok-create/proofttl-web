import AuditStatusLookup from '../../../components/AuditStatusLookup'

export const metadata = {
  title: 'Audit Status — ProofTTL',
  description: 'Check the status of a ProofTTL Claim Stress Test or Full Verification Audit request.',
}

export default function AuditStatusPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <span className="app-meta">CUSTOMER REQUEST STATUS</span>
      </div>
      <section className="onboarding-wrap">
        <AuditStatusLookup />
      </section>
    </main>
  )
}
