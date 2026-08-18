export const metadata = {
  title: 'Support — ProofTTL',
}

export default function SupportPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <a className="app-back" href="/">← BACK TO PROOFTTL</a>
      </div>

      <section className="onboarding-wrap">
        <div className="support-card">
          <p className="app-kicker">SUPPORT</p>
          <h1 className="app-title">Need help with ProofTTL?</h1>
          <p className="app-copy">The permanent private support inbox/ticket backend is not connected yet. During testnet, technical issues should be filed through the public repository so they remain trackable.</p>

          <form className="app-form" aria-label="Future support form preview">
            <label className="app-input-label">NAME<input type="text" placeholder="Your name" disabled /></label>
            <label className="app-input-label">REPLY EMAIL<input type="email" placeholder="you@example.com" disabled /></label>
            <label className="app-input-label">CATEGORY
              <select disabled defaultValue="technical"><option value="technical">Technical issue</option><option>Payment issue</option><option>Fact Lease question</option><option>Account / security</option><option>API integration</option><option>Other</option></select>
            </label>
            <label className="app-input-label">OPTIONAL LEASE / TRANSACTION ID<input type="text" placeholder="ftl_… or transaction hash" disabled /></label>
            <label className="app-input-label">MESSAGE<textarea rows={5} placeholder="Tell us what happened" disabled /></label>
          </form>

          <div className="hero-actions">
            <a className="button button-primary" href="https://github.com/tasx13ok-create/proofttl/issues" target="_blank" rel="noreferrer">OPEN GITHUB ISSUES ↗</a>
            <a className="button button-secondary" href="/console#support">CONSOLE SUPPORT PREVIEW</a>
          </div>

          <p className="app-note"><strong>No personal founder contact information is exposed here.</strong> A future support backend can route requests to the founder or authorized employees without publishing private phone numbers or personal email addresses.</p>
        </div>
      </section>
    </main>
  )
}
