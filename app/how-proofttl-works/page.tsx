export const metadata = {
  title: 'How ProofTTL Works — Full Product & L.O.V.E. Guide',
  description: 'A plain-English, end-to-end explanation of ProofTTL, Fact Leases, verification, monitoring, L.O.V.E., commands, trust, accounts, audits, payments, and current product limits.',
}

const sections = [
  ['01', 'What ProofTTL is', 'ProofTTL is a verification and monitoring system for factual claims. It takes a precise claim, checks it against a public source, records the result, timestamps the observation, fingerprints the source material, and packages the result into a Fact Lease that can be inspected later.'],
  ['02', 'Why a Fact Lease expires', 'A fact can be correct today and wrong next week because pricing, documentation, policies, product capabilities, regulations, or source pages change. ProofTTL therefore records what the evidence supported at a specific time instead of pretending a verdict is permanently true.'],
  ['03', 'How a claim is verified', 'A verification begins with the exact claim, a source URL, and a trust window. ProofTTL validates and retrieves the source, extracts usable evidence, evaluates whether that evidence supports or contradicts the claim, then returns SUPPORTED, CONTRADICTED, or UNKNOWN.'],
  ['04', 'What gets stored', 'A Fact Lease can include the exact claim, source and final URL, evidence, verdict, timestamps, expiry, verifier information, source fingerprint, issuance signature, current lease state, monitoring checks, and signed monitoring history.'],
  ['05', 'What monitoring does', 'While a Lease is active, ProofTTL can revisit the source. If the evidence changes materially, the current status can change and the Lease can be revoked. If the TTL ends first, the Lease expires. Issued status and current status are kept separate so the history is not rewritten.'],
  ['06', 'What the signatures prove', 'ProofTTL signs Lease issuance with Ed25519 and signs retained monitoring events. The visible event history is hash-chained so changes to the retained signed history are detectable. A signature proves what ProofTTL attested to; it does not magically make the underlying claim true or create outside legal authority.'],
]

const loveCapabilities = [
  ['Conversation', 'L.O.V.E. can answer questions about ProofTTL, explain product behavior, discuss a Fact Lease when its ID is provided, and handle ordinary conversational exchanges.'],
  ['Lease grounding', 'When a Fact Lease ID is present, L.O.V.E. can load live Lease data and is instructed to treat that stored data as authoritative instead of inventing a status, expiry, source, or monitoring result.'],
  ['Voice', 'Voice mode transcribes microphone audio, resolves safe commands or Lease context, generates a response, and can synthesize spoken output.'],
  ['Navigation commands', 'Natural phrases such as “go home,” “open settings,” “show payments,” “open Trust Center,” “go to audit status,” or “show methodology” can be resolved into deterministic product navigation.'],
  ['Browser/UI commands', 'L.O.V.E. can interpret safe local controls such as closing/minimizing its own panel, exiting fullscreen, going back or forward, reloading, or scrolling to the top or bottom. Browser security rules still apply.'],
  ['Approved scripts', 'Commands such as “run the verifier,” “open the Lease verifier,” “run the status check,” or “start an audit” map to approved product actions. Arbitrary JavaScript or unrestricted code execution from chat is intentionally not allowed.'],
]

const verdicts = [
  ['SUPPORTED', 'The examined evidence supports the claim at the time of verification.'],
  ['CONTRADICTED', 'The examined evidence materially conflicts with the claim.'],
  ['UNKNOWN', 'The available evidence is not strong enough to responsibly call the claim supported or contradicted.'],
]

const states = [
  ['ACTIVE', 'The Lease is still within its TTL and has not been revoked.'],
  ['REVOKED', 'Monitoring found a material change or another condition caused the active Lease to stop maintaining its prior verdict.'],
  ['EXPIRED', 'The Lease reached the end of its configured trust window.'],
]

export default function HowProofTTLWorksPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <a className="brand" href="/"><span className="brand-mark">P</span> PROOF<span className="brand-muted">TTL</span></a>
        <span className="app-meta">FULL PRODUCT GUIDE · PLAIN ENGLISH + TECHNICAL DEPTH</span>
      </div>

      <section className="onboarding-wrap">
        <div className="onboarding-card">
          <p className="app-kicker">HOW PROOFTTL WORKS</p>
          <h1 className="app-title">The whole system, without the mystery.</h1>
          <p className="app-copy">
            This page explains what the website does, what L.O.V.E. does, what happens to a claim from submission to monitoring, how trust and signatures work, how paid audits differ from the testnet API, and what ProofTTL deliberately does not claim.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#system">START WITH THE SYSTEM →</a>
            <a className="button button-secondary" href="#love">UNDERSTAND L.O.V.E.</a>
            <a className="button button-secondary" href="/trust.html">OPEN TRUST CENTER</a>
          </div>

          <div id="system" className="onboarding-card" style={{ marginTop: 28 }}>
            <p className="app-kicker">THE CORE IDEA</p>
            <h2>ProofTTL records what evidence supports <em>now</em> — and when you should stop relying on that observation.</h2>
            <p className="app-copy">
              Most systems flatten truth into a permanent yes/no. ProofTTL adds source, evidence, time, expiry, current state, and cryptographic attestation so another person or machine can inspect the context behind the verdict.
            </p>
          </div>

          <div className="app-table" style={{ marginTop: 24 }} aria-label="ProofTTL system explanation">
            {sections.map(([index, title, description]) => (
              <div className="app-table-row" key={index}>
                <span>{index} · {title}</span>
                <span>{description}</span>
                <span>→</span>
              </div>
            ))}
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">THE VERIFICATION PIPELINE</p>
            <div className="app-table">
              <div className="app-table-row"><span>1. CLAIM</span><span>A precise factual assertion is submitted.</span><span>INPUT</span></div>
              <div className="app-table-row"><span>2. SOURCE</span><span>A public HTTP(S) source is supplied and safely retrieved.</span><span>EVIDENCE</span></div>
              <div className="app-table-row"><span>3. EVALUATE</span><span>ProofTTL compares the claim with the usable source evidence.</span><span>VERDICT</span></div>
              <div className="app-table-row"><span>4. LEASE</span><span>The result is timestamped, fingerprinted, signed, and assigned a TTL.</span><span>RECEIPT</span></div>
              <div className="app-table-row"><span>5. MONITOR</span><span>Active Leases can be rechecked for material source/evidence changes.</span><span>CURRENT STATE</span></div>
              <div className="app-table-row"><span>6. INSPECT</span><span>A person or machine can read the Lease and independently inspect its signature surfaces.</span><span>TRUST</span></div>
            </div>
          </div>

          <div className="pricing-cards" style={{ marginTop: 24 }}>
            <article>
              <span className="plan-label">VERDICTS</span>
              <h2>What the answer means</h2>
              {verdicts.map(([name, description]) => <p key={name}><strong>{name}</strong> — {description}</p>)}
            </article>
            <article>
              <span className="plan-label">LEASE STATE</span>
              <h2>What happens over time</h2>
              {states.map(([name, description]) => <p key={name}><strong>{name}</strong> — {description}</p>)}
            </article>
          </div>

          <div id="love" className="onboarding-card" style={{ marginTop: 28 }}>
            <p className="app-kicker">L.O.V.E. · PROOFTTL PRODUCT INTELLIGENCE</p>
            <h2>L.O.V.E. is the conversational control layer over ProofTTL.</h2>
            <p className="app-copy">
              It is not a separate source of truth and it is not allowed to invent product state. Its job is to understand what you are trying to do, explain the system, load live ProofTTL context when available, and turn natural language into safe product actions.
            </p>
          </div>

          <div className="app-table" style={{ marginTop: 24 }} aria-label="LOVE capabilities">
            {loveCapabilities.map(([title, description]) => (
              <div className="app-table-row" key={title}>
                <span>{title}</span>
                <span>{description}</span>
                <span>✓</span>
              </div>
            ))}
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">HOW COMMANDS WORK</p>
            <p className="app-copy">
              Safe commands are resolved deterministically whenever possible. That means “go to settings” does not require L.O.V.E. to guess a URL, and “run the verifier” does not let a model create and execute arbitrary code. The browser receives a small allowlisted action such as navigate, scroll, back, reload, close the L.O.V.E. panel, or launch an approved ProofTTL tool.
            </p>
            <div className="app-table">
              <div className="app-table-row"><span>“Go to home page”</span><span>Navigate to ProofTTL home.</span><span>SAFE</span></div>
              <div className="app-table-row"><span>“Go to settings”</span><span>Open the account/security area in the customer console.</span><span>SAFE</span></div>
              <div className="app-table-row"><span>“Close this out”</span><span>Close/minimize the L.O.V.E. interface. A browser tab can only be closed programmatically when browser rules permit it.</span><span>LOCAL</span></div>
              <div className="app-table-row"><span>“Run the verifier”</span><span>Open the approved verifier flow.</span><span>ALLOWLISTED</span></div>
              <div className="app-table-row"><span>“Run this JavaScript…”</span><span>Not executed as arbitrary browser code.</span><span>BLOCKED</span></div>
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">WHEN L.O.V.E. USES AI</p>
            <p className="app-copy">
              Navigation and simple product commands can be resolved without a generative model. Voice input is transcribed first. Substantive conversational responses use the configured response model. When a Lease ID is present, live Lease data can be injected as authoritative context. Voice responses can then be converted to speech. This separation keeps simple commands predictable while leaving natural-language explanation flexible.
            </p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">THE WEBSITE</p>
            <h2>The public site has different surfaces for different jobs.</h2>
            <div className="app-table">
              <div className="app-table-row"><span>Homepage</span><span>Explains the business problem and routes buyers toward the Claim Stress Test or Full Verification Audit.</span><span>SALES</span></div>
              <div className="app-table-row"><span>Audit</span><span>Structured scope intake for 3–5 claim Stress Tests or 10–25 claim Full Audits.</span><span>SERVICE</span></div>
              <div className="app-table-row"><span>Audit Status</span><span>Lets a customer check scope/payment/fulfillment state using their intake reference plus matching email.</span><span>CUSTOMER</span></div>
              <div className="app-table-row"><span>Console</span><span>Account-oriented area for Leases, usage, payments, security, and related customer state as those services are enabled.</span><span>ACCOUNT</span></div>
              <div className="app-table-row"><span>Trust Center</span><span>Live health, monitoring, signing, readiness, and authentication posture.</span><span>TRUST</span></div>
              <div className="app-table-row"><span>Lease Verifier</span><span>Public surface for inspecting signed Lease data without needing an account.</span><span>VERIFY</span></div>
              <div className="app-table-row"><span>Methodology</span><span>Documents the verification semantics and state model.</span><span>METHOD</span></div>
              <div className="app-table-row"><span>API/docs</span><span>Developer-facing verification and Lease endpoints.</span><span>BUILD</span></div>
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">PAID SERVICES VS TESTNET API</p>
            <p className="app-copy">
              These are intentionally separate concepts. The public verification API currently exposes a Base Sepolia testnet x402 path. Mainnet settlement is disabled. The human-facing Claim Stress Test and Verification Audit are commercial service offers with scope-before-payment workflow. Stripe Checkout architecture is being integrated for those services, but the site must not represent testnet x402 settlement as live commercial card payment.
            </p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">ACCOUNTS & SECURITY</p>
            <p className="app-copy">
              ProofTTL is designed around provider login and modern account security instead of creating another password database. Google, Discord, and passkeys are first-class target sign-in methods. The auth stack includes secure HttpOnly session cookies, trusted-origin controls, CSRF protections, rate limiting, TOTP/recovery-code capability, and passkey support. Provider buttons stay locked until their real credentials are deployed.
            </p>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">WHAT PROOFTTL DOES NOT CLAIM</p>
            <div className="app-table">
              <div className="app-table-row"><span>Not permanent truth</span><span>A Lease records a time-bounded evidence-backed observation.</span><span>LIMIT</span></div>
              <div className="app-table-row"><span>Not legal certification</span><span>A signed Fact Lease is a cryptographic attestation from ProofTTL, not regulatory or legal approval.</span><span>LIMIT</span></div>
              <div className="app-table-row"><span>Not omniscient</span><span>Missing or conflicting evidence can and should produce UNKNOWN.</span><span>LIMIT</span></div>
              <div className="app-table-row"><span>Not unrestricted automation</span><span>L.O.V.E. does not receive arbitrary code execution or unlimited destructive browser privileges.</span><span>LIMIT</span></div>
              <div className="app-table-row"><span>Not mainnet today</span><span>Current x402 settlement is explicitly Base Sepolia testnet; mainnet is intentionally disabled.</span><span>TESTNET</span></div>
            </div>
          </div>

          <div className="onboarding-card" style={{ marginTop: 24 }}>
            <p className="app-kicker">A COMPLETE EXAMPLE</p>
            <h2>Suppose a company says: “Our API supports feature X.”</h2>
            <p className="app-copy">
              The company supplies that claim and the relevant public documentation. ProofTTL retrieves the source and evaluates whether it actually supports the statement. If the docs clearly support it, the issued verdict can be SUPPORTED. The Lease records the evidence, fingerprint, issue time, expiry, and signature. During the trust window, monitoring can revisit the docs. If feature X disappears from the source or the evidence changes enough that the original verdict is no longer maintained, the Lease can move to REVOKED. Anyone reviewing the Lease can distinguish what was supported when it was issued from what ProofTTL currently observes.
            </p>
          </div>

          <div className="hero-actions" style={{ marginTop: 28 }}>
            <a className="button button-primary" href="/audit/">START A CLAIM REVIEW →</a>
            <a className="button button-secondary" href="/trust.html">INSPECT TRUST CENTER</a>
            <a className="button button-secondary" href="/verify-lease.html">VERIFY A LEASE</a>
            <a className="button button-secondary" href="/methodology.html">READ METHODOLOGY</a>
          </div>

          <p className="app-note" style={{ marginTop: 22 }}>
            ProofTTL v1.0.0 product release · compatible wire protocol ProofTTL/0.3.1 · current x402 settlement: Base Sepolia testnet · Mainnet disabled.
          </p>
        </div>
      </section>
    </main>
  )
}
