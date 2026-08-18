export const metadata = {
  title: 'Account setup — ProofTTL',
}

export default function OnboardingPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <span className="app-meta">ACCOUNT SETUP · PREVIEW</span>
      </div>

      <section className="onboarding-wrap">
        <div className="app-progress" aria-label="Onboarding progress">
          <span>ACCOUNT</span><span>→</span><span className="active">PROFILE</span><span>→</span><span>GET STARTED</span>
        </div>

        <div className="onboarding-card">
          <p className="app-kicker">STEP 2 OF 3</p>
          <h1 className="app-title">Finish setting up your account.</h1>
          <p className="app-copy">After real authentication is connected, new users will complete this private profile once. Returning users will skip this step.</p>

          <form className="app-form" aria-label="Profile setup preview">
            <label className="app-input-label">
              DISPLAY / FULL NAME
              <input type="text" placeholder="Your name" disabled />
            </label>
            <label className="app-input-label">
              DATE OF BIRTH
              <input type="date" disabled />
            </label>
            <button type="button" className="button button-primary full-button" disabled>
              CONTINUE →
            </button>
          </form>

          <p className="app-note"><strong>Private account information.</strong> Date of birth will not be shown publicly. The production implementation must define why it is collected, how long it is retained, and who is allowed to access it before collection is enabled.</p>
        </div>
      </section>
    </main>
  )
}
