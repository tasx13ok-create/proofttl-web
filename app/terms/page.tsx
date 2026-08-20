export const metadata = {
  title: 'Terms of Service — ProofTTL',
  description: 'Terms governing access to and use of ProofTTL.',
}

const sections = [
  ['1. Acceptance of Terms', 'By accessing or using ProofTTL, you agree to these Terms of Service. If you do not agree, do not use the service.'],
  ['2. The Service', 'ProofTTL provides software for AI-assisted work, source-backed verification, Fact Leases, developer tools, files, automations, integrations, and related product surfaces. Some capabilities depend on third-party providers and may be unavailable until configured or authorized.'],
  ['3. Accounts and Security', 'You are responsible for activity performed through your account and for keeping your sign-in methods secure. You must not attempt to access accounts, systems, data, or capabilities you are not authorized to use.'],
  ['4. Acceptable Use', 'You may not use ProofTTL to break applicable law, interfere with the service, bypass security controls, abuse third-party services, distribute malware, perform unauthorized access, or misrepresent ProofTTL output as independently verified when it is not.'],
  ['5. AI Output and Verification', 'AI-generated content can be incomplete or incorrect. ProofTTL verification features are designed to preserve source evidence, status, time bounds, and uncertainty, but they do not guarantee that every claim is permanently or universally true. Users remain responsible for decisions made from generated or verified information.'],
  ['6. Third-Party Services', 'ProofTTL may connect to external identity, model, cloud, payment, developer, storage, communications, or other providers. Your use of those services may also be governed by their own terms and privacy policies. ProofTTL is not responsible for failures or changes made by third-party providers.'],
  ['7. User Content and Data', 'You retain ownership of content you submit. You grant ProofTTL the limited rights necessary to process, store, transmit, and display that content to provide the service and requested features.'],
  ['8. Payments and Paid Features', 'If paid services are offered, prices, scope, payment terms, refunds, and any usage limits will be shown before purchase or otherwise agreed for that service. Testnet assets, demonstrations, or simulated financial surfaces are not representations of real monetary value unless explicitly stated otherwise.'],
  ['9. Availability and Changes', 'ProofTTL may change, add, suspend, or remove features. We may also impose reasonable limits to protect reliability, security, legal compliance, or third-party provider constraints.'],
  ['10. Disclaimers', 'ProofTTL is provided on an as-available basis. To the maximum extent permitted by law, no warranty is made that the service will be uninterrupted, error-free, or suitable for every purpose. ProofTTL is not a substitute for professional legal, medical, financial, or other regulated advice.'],
  ['11. Limitation of Liability', 'To the maximum extent permitted by applicable law, ProofTTL and its operators will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from use of the service.'],
  ['12. Termination', 'Access may be suspended or terminated for material violations of these terms, misuse of the service, security risk, legal requirements, or prolonged service discontinuation.'],
  ['13. Changes to These Terms', 'These terms may be updated as the service changes. The effective date on this page will be updated when material revisions are published. Continued use after an update constitutes acceptance of the revised terms.'],
  ['14. Contact', 'Questions about these terms can be sent through the contact method published by ProofTTL on its official website.'],
] as const

export default function TermsPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div>
          <div className="app-meta">LEGAL / TERMS</div>
          <small style={{ color: 'var(--muted-foreground)' }}>Effective August 20, 2026</small>
        </div>
        <a className="text-link" href="/privacy/">PRIVACY POLICY →</a>
      </div>

      <section className="app-shell" style={{ padding: '34px 0 110px', display: 'grid', gap: 18 }}>
        <section className="onboarding-card" style={{ padding: 30 }}>
          <p className="app-kicker">PROOFTTL TERMS OF SERVICE</p>
          <h1 className="app-title">Terms for using ProofTTL.</h1>
          <p className="app-copy" style={{ maxWidth: 920 }}>These terms describe the rules for accessing and using ProofTTL, including AI, verification, developer, connected-provider, and account features.</p>
        </section>

        {sections.map(([title, body]) => (
          <section className="console-panel wide" key={title}>
            <h2>{title}</h2>
            <p className="app-copy">{body}</p>
          </section>
        ))}
      </section>
    </main>
  )
}
