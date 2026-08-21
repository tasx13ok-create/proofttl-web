import AuditStatusLookup from '../../../components/AuditStatusLookup'

export const metadata = {
  title: 'Audit Status',
  description: 'Check the status of a ProofTTL Claim Stress Test or Full Verification Audit request.',
  alternates: { canonical: '/audit/status/' },
}

export default function AuditStatusPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/" aria-label="ProofTTL home">
          <img src="/proofttl-logo.png" width="32" height="32" alt="" aria-hidden="true" />
          <span>PROOF<span className="brand-muted">TTL</span></span>
        </a>
        <span className="app-meta">CUSTOMER REQUEST STATUS</span>
      </div>
      <section className="onboarding-wrap">
        <AuditStatusLookup />
      </section>
    </main>
  )
}
