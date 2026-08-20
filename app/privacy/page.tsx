export const metadata = {
  title: 'Privacy Policy — ProofTTL',
  description: 'How ProofTTL handles account, usage, connected-provider, and verification data.',
}

const sections = [
  ['1. Information We Collect', 'ProofTTL may process account identifiers, authentication data, settings, content you submit, files or records you intentionally create, verification requests, source URLs, usage and diagnostic information, and data returned by third-party providers you explicitly connect.'],
  ['2. Authentication Data', 'When you sign in with providers such as Google, GitHub, or Discord, ProofTTL receives the limited identity information authorized by that provider and required to create or maintain your account. ProofTTL does not need your third-party account password.'],
  ['3. Connected Services', 'If you connect an external provider, ProofTTL processes only the information needed to perform the actions you request or support the connected feature. Access may be limited by provider scopes, product permissions, and account authorization.'],
  ['4. How We Use Information', 'Information is used to provide and secure the service, authenticate users, maintain account-owned data, perform requested AI or verification operations, operate connected features, prevent abuse, troubleshoot failures, and improve reliability.'],
  ['5. AI Processing', 'Content submitted to AI features may be sent to configured model providers when required to perform the requested task. Provider-backed features are only used when that integration is configured and available.'],
  ['6. Fact Leases and Public Verification', 'Some verification records may be intentionally designed for sharing or public verification. If you create or publish a shareable verification artifact, information contained in that artifact may be visible to anyone with access to it. Do not place secrets or unnecessary personal information into public verification records.'],
  ['7. Cookies and Sessions', 'ProofTTL uses secure session cookies and related authentication mechanisms to keep users signed in and protect account access. Security features such as passkeys, two-factor authentication, and recovery methods may also store the minimum data necessary to operate those features.'],
  ['8. Data Sharing', 'ProofTTL does not sell personal information. Data may be shared with service providers only as necessary to operate requested features, comply with law, protect users or the service, or complete a transaction or integration you initiate.'],
  ['9. Data Retention', 'Information is retained for as long as reasonably necessary to provide the service, preserve account-owned records, satisfy security or legal requirements, resolve disputes, or maintain intentionally durable verification history. Retention may vary by feature and provider.'],
  ['10. Security', 'ProofTTL uses technical and organizational safeguards intended to protect account and service data, including server-side credentials, secure cookies, scoped provider access, and explicit authorization boundaries. No online system can guarantee absolute security.'],
  ['11. Your Choices', 'You may choose not to connect optional providers. Where supported, you may disconnect integrations, revoke provider access, change account security settings, or request deletion of account-owned information subject to legal, security, or intentionally immutable verification requirements.'],
  ['12. Children', 'ProofTTL is not directed to children under the minimum age required to consent to online services in their jurisdiction, and the service should not knowingly be used in violation of applicable child privacy laws.'],
  ['13. International Processing', 'Depending on the providers and infrastructure used, information may be processed in locations outside your state, province, or country. Appropriate provider and legal safeguards may apply to those transfers.'],
  ['14. Changes to This Policy', 'This policy may be updated as ProofTTL adds features, integrations, or legal requirements. The effective date will be updated when revisions are published.'],
  ['15. Contact', 'Questions about privacy can be sent through the contact method published by ProofTTL on its official website.'],
] as const

export default function PrivacyPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div>
          <div className="app-meta">LEGAL / PRIVACY</div>
          <small style={{ color: 'var(--muted-foreground)' }}>Effective August 20, 2026</small>
        </div>
        <a className="text-link" href="/terms/">TERMS OF SERVICE →</a>
      </div>

      <section className="app-shell" style={{ padding: '34px 0 110px', display: 'grid', gap: 18 }}>
        <section className="onboarding-card" style={{ padding: 30 }}>
          <p className="app-kicker">PROOFTTL PRIVACY POLICY</p>
          <h1 className="app-title">How ProofTTL handles data.</h1>
          <p className="app-copy" style={{ maxWidth: 920 }}>This policy explains what ProofTTL may process, why it is processed, how connected services fit into the system, and the choices available to users.</p>
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
