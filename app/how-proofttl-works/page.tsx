export const metadata = {
  title: 'How ProofTTL Works — L.O.V.E. Workspace Guide',
  description: 'A plain-English guide to L.O.V.E., Workspace, Truth, Studio, Worlds, Work, Files, Automations, Connections, Money, identity, voice, permissions, sources, and Fact Leases.',
}

const areas = [
  ['WORKSPACE', 'LIVE', 'The home screen and universal command layer. Start with what you want done; the planner resolves navigation, known capabilities, risk, and provider requirements.'],
  ['L.O.V.E.', 'LIVE', 'General-purpose conversational AI plus the control layer for the product. It can talk normally, reason, help write/code/plan, understand commands, and use grounded product context when available.'],
  ['TRUTH', 'LIVE', 'ProofTTL verification, Fact Leases, audits, source evidence, signing, monitoring, methodology, and independent verification.'],
  ['STUDIO', 'LIVE CORE', 'Projects, coding assistance, model selection surfaces and safe execution architecture. Provider-backed sandbox execution is only marked ready when its real runtime is configured.'],
  ['WORLDS', 'WEBGL LIVE', 'A real browser 3D workspace. Prompts select bounded local scene compositions, which render as WebGL, remain inspectable as scene JSON, and can be exported. Cloud-generated meshes/textures stay locked until a provider exists.'],
  ['WORK', 'NATIVE TASKS', 'Account-owned tasks are the native foundation. Email, calendar and document providers can attach later without redefining the Work area.'],
  ['FILES', 'NATIVE', 'Account-owned bounded text/code/JSON artifacts with create, read, edit and delete controls. Connected storage can become another provider rail.'],
  ['AUTOMATIONS', 'DEFINITIONS LIVE', 'Users can own capability-bound automation definitions. Actual scheduled provider execution remains visibly disconnected until its execution adapters exist.'],
  ['CONNECTIONS', 'LIVE STATUS', 'The integration control plane. It reports which identity, AI, developer, payment, sandbox and future provider rails are actually ready or locked.'],
  ['MONEY', 'RAILS LOCKED', 'The financial surface exists as an architectural destination, but balances, transfers and banking actions are never fabricated. Real money behavior requires regulated connected providers.'],
  ['IDENTITY / SECURITY', 'PARTIAL / CONFIG-BASED', 'Provider login, passkeys, TOTP/recovery-code capability and secure sessions. Each provider is enabled only when its backend credentials and runtime are truly configured.'],
] as const

const commandFlow = [
  ['1 · INTENT', 'L.O.V.E. receives the user’s words: “open Worlds,” “run this JavaScript,” “send an email,” or an ordinary conversational question.'],
  ['2 · PLAN', 'Deterministic command rules resolve known product navigation and capability actions before a generative model is allowed to guess.'],
  ['3 · RISK', 'The central policy classifies the action as READ, NAVIGATE, CREATE / MODIFY, or SENSITIVE.'],
  ['4 · PERMISSION', 'Sensitive actions such as money movement, sending, deletion and security changes require explicit confirmation. Ambiguous high-impact requests stop and ask a follow-up.'],
  ['5 · PROVIDER', 'The capability executes only if its real provider/runtime is connected and authorized. A locked provider never becomes a fake success.'],
  ['6 · RECEIPT', 'Meaningful account actions can leave one account-owned receipt showing what was planned, confirmed, executed, failed or cancelled.'],
] as const

const voiceFlow = [
  ['MIC', 'Browser microphone capture with noise suppression / echo cancellation when available.'],
  ['STT', 'Whisper large-v3-turbo transcribes conversational speech with English guidance and voice-activity detection.'],
  ['ROUTE', 'The transcript goes through command resolution, grounding and/or the response model.'],
  ['FINAL TEXT', 'The final routed response becomes the single authoritative answer shown in the UI.'],
  ['TTS', 'Speech is synthesized from that exact final response so the spoken reply cannot intentionally diverge from the displayed reply.'],
] as const

const truthFlow = [
  ['CLAIM', 'A precise factual assertion.'],
  ['SOURCE', 'A public HTTP(S) source that passes the source-safety boundary.'],
  ['VERDICT', 'SUPPORTED, CONTRADICTED, or UNKNOWN — uncertainty is preserved instead of forced into a yes/no.'],
  ['LEASE', 'A time-bounded record containing evidence, timestamps, source fingerprint, state and cryptographic signing surfaces.'],
  ['MONITOR', 'Active Leases can be revisited; issued status and current status remain distinct so history is not silently rewritten.'],
  ['VERIFY', 'A third party can inspect the signed Lease and its retained signed/hash-chained history through public verification surfaces.'],
] as const

const grounding = [
  ['FACT LEASE CONTEXT', 'When a Lease ID is supplied and found, stored Lease data is authoritative for that Lease. L.O.V.E. should not invent a different status, source, expiry or monitoring result.'],
  ['RELEVANT VISUALS', 'Visual requests can retrieve sourced Wikimedia Commons images. The browser receives provider-returned image/source metadata; the model is not trusted to invent image URLs.'],
  ['GENERAL MODEL KNOWLEDGE', 'L.O.V.E. can answer ordinary questions from model knowledge, but it must not claim external research happened when no retrieval source was used.'],
  ['PRIVATE / LIVE DATA', 'Balances, inboxes, files, calendars, deployments, provider state and account data require real authorized context. Missing context means “not available,” not a plausible guess.'],
] as const

const risk = [
  ['READ', 'Usually immediate. Example: inspect a connected record or show available information.'],
  ['NAVIGATE', 'Immediate for allowlisted product destinations. Example: “open Worlds.”'],
  ['CREATE / MODIFY', 'May require confirmation depending on reversibility and provider behavior.'],
  ['MONEY / SEND / DELETE / SECURITY', 'Explicit confirmation before execution. Vague wording must be clarified first.'],
] as const

function Matrix({ rows }: { rows: readonly (readonly [string, string, string?])[] }) {
  return <div className="app-table">{rows.map(([name, description, state]) => <div className="app-table-row" key={name}><span>{name}</span><span>{description}</span><span>{state || '→'}</span></div>)}</div>
}

export default function HowProofTTLWorksPage() {
  return (
    <main className="app-page">
      <div className="app-shell app-topbar">
        <div><div className="app-meta">FULL PRODUCT GUIDE / CURRENT ARCHITECTURE</div><small style={{ color: 'var(--muted-foreground)' }}>What is live, what is connected, and what stays locked.</small></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><a className="text-link" href="/workspace/">WORKSPACE</a><a className="text-link" href="/trust/">TRUST</a><a className="text-link" href="/connections/">CONNECTIONS</a></div>
      </div>

      <section className="app-shell" style={{ padding: '34px 0 110px', display: 'grid', gap: 18 }}>
        <section className="onboarding-card" style={{ padding: 30 }}>
          <p className="app-kicker">HOW THE WHOLE SYSTEM WORKS</p>
          <h1 className="app-title" style={{ maxWidth: 920 }}>One AI interface. Multiple real capabilities underneath it.</h1>
          <p className="app-copy" style={{ maxWidth: 980 }}>ProofTTL started as a truth/verification system. That remains the Truth layer. The larger product is now a Workspace where L.O.V.E. can converse normally, understand intent, route commands, help create things, and use connected capabilities without pretending every provider is already live.</p>
          <div className="hero-actions"><a className="button button-primary" href="/workspace/">OPEN WORKSPACE →</a><a className="button button-secondary" href="/worlds/">OPEN WORLDS</a><a className="button button-secondary" href="/studio/">OPEN STUDIO</a><a className="text-link" href="/trust/">Trust boundary ↗</a></div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">THE PLATFORM MAP</p><h2>Each area owns one kind of job.</h2>
          <p className="app-copy">“Live” means there is a real native path today. “Locked” means the product surface exists but the external provider/runtime is intentionally unavailable until configured. “Planned” means no execution claim is made yet.</p>
          <Matrix rows={areas.map(([name, state, description]) => [name, description, state] as const)} />
        </section>

        <section className="console-panel wide" id="love">
          <p className="app-kicker">L.O.V.E. / GENERAL AI + CONTROL LAYER</p><h2>Conversation is open. Execution is constrained.</h2>
          <p className="app-copy">You can talk to L.O.V.E. like a normal AI about ordinary subjects, ask for explanations, brainstorm, write, code, plan or create. ProofTTL is a capability — not a conversational prison. The boundary appears when the answer depends on live/private data or when words would cause a real action.</p>
          <div className="pricing-cards"><article><span className="plan-label">CONVERSATION</span><h3>Normal AI behavior</h3><p>General questions, brainstorming, writing, coding help, learning, planning and creative discussion can go directly to the response model when no tool/action is required.</p></article><article><span className="plan-label">CONTROL</span><h3>Intent before apps</h3><p>Known commands are interpreted into structured navigation or capability actions before execution. Unknown commands can fall back to conversation; they do not become guessed actions.</p></article></div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">COMMAND / EXECUTION PIPELINE</p><h2>Words do not equal authority.</h2>
          <Matrix rows={commandFlow} />
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">PERMISSION MODEL</p><h2>Power scales with consequence.</h2>
          <Matrix rows={risk} />
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">VOICE</p><h2>One final response, one spoken response.</h2>
          <p className="app-copy">Voice is a pipeline, not a separate personality. The final routed text is authoritative before TTS begins.</p>
          <Matrix rows={voiceFlow} />
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">SOURCES / GROUNDING / VISUALS</p><h2>No fake citations and no invented private data.</h2>
          <Matrix rows={grounding} />
        </section>

        <section className="console-panel wide" id="worlds">
          <p className="app-kicker">WORLDS / 3D</p><h2>The current renderer is real; the cloud generator is not faked.</h2>
          <p className="app-copy">Today, Worlds converts scene intent into a bounded local scene specification and renders it in an interactive browser WebGL preview. Users can orbit/zoom, inspect scene JSON and export it. A future model/provider can generate the same bounded schema plus richer assets, but provider-produced meshes, textures and animation stay marked connection-required until that integration actually exists.</p>
          <div className="hero-actions"><a className="button button-primary" href="/worlds/">OPEN 3D STUDIO →</a><a className="text-link" href="/connections/">See provider readiness ↗</a></div>
        </section>

        <section className="console-panel wide" id="truth">
          <p className="app-kicker">TRUTH / FACT LEASES</p><h2>A source-backed observation with an expiry, not permanent truth.</h2>
          <Matrix rows={truthFlow} />
          <div className="pricing-cards" style={{ marginTop: 18 }}><article><span className="plan-label">SUPPORTED</span><p>The examined evidence supports the claim at observation time.</p></article><article><span className="plan-label">CONTRADICTED</span><p>The examined evidence materially conflicts with the claim.</p></article><article><span className="plan-label">UNKNOWN</span><p>The evidence is not strong enough to responsibly call either direction.</p></article></div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">MONEY / HIGH-IMPACT PROVIDERS</p><h2>Architecture first, regulated rails before execution.</h2>
          <p className="app-copy">The Money area is deliberately not a fake bank. L.O.V.E. can understand financial intent, but real balances, transactions, transfers, bills or banking behavior must come from an authorized financial provider. The same rule applies to email sending, deployments, destructive GitHub changes and security actions: provider authorization plus the central permission policy come before execution.</p>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">COMMERCIAL SERVICE VS PROTOCOL</p><h2>Two separate rails with separate readiness.</h2>
          <p className="app-copy">Human-facing Claim Stress Tests and Verification Audits are commercial services with scope-before-payment workflow. The machine x402 protocol remains explicitly on Base Sepolia testnet with mainnet settlement disabled. The product must never imply testnet tokens are equivalent to live commercial settlement.</p>
          <div className="hero-actions"><a className="button button-secondary" href="/audit/">VERIFICATION SERVICES</a><a className="button button-secondary" href="/trust/">TRUST CENTER</a><a className="button button-secondary" href="/connections/">CONNECTIONS</a></div>
        </section>

        <section className="console-panel wide">
          <p className="app-kicker">THE RULE THAT KEEPS THIS HONEST</p><h2>If a provider is missing, the capability says so.</h2>
          <p className="app-copy">The goal is enormous breadth without fake depth. Native features can be live. External services become real only through explicit adapters, credentials, ownership checks, permission policy, failure handling and receipts. That lets the Workspace grow into one interface for many systems without silently granting L.O.V.E. imaginary access.</p>
          <div className="hero-actions"><a className="button button-primary" href="/workspace/">GO TO WORKSPACE →</a><a className="button button-secondary" href="/trust/">INSPECT TRUST</a></div>
        </section>
      </section>
    </main>
  )
}
