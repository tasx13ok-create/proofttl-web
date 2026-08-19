import { access, readFile } from 'node:fs/promises'

const requiredFiles = [
  'package.json',
  'out/index.html',
  'out/login/index.html',
  'out/two-factor/index.html',
  'out/onboarding/index.html',
  'out/get-started/index.html',
  'out/console/index.html',
  'out/support/index.html',
  'out/docs/index.html',
  'out/audit/index.html',
  'out/audit/sample/index.html',
  'out/solutions/index.html',
  'out/solutions/fact-verification-api/index.html',
  'out/solutions/claim-verification-api/index.html',
  'out/solutions/ai-agent-verification/index.html',
  'out/solutions/source-monitoring-api/index.html',
  'out/solutions/stale-data-detection/index.html',
  'out/solutions/evidence-verification-api/index.html',
  'out/solutions/x402-verification-api/index.html',
  'out/solutions/fact-leases/index.html',
  'out/verify-lease.html',
  'out/lease-ops.html',
  'out/methodology.html',
  'out/status.html',
  'out/trust.html',
  'out/robots.txt',
  'out/_headers',
  'components/ProofTTLAds.tsx',
  'components/ProofTTLAssistant.tsx',
  'components/ProofTTLChatBar.tsx',
  'components/LoveEntity.module.css',
  'lib/proofttl-assistant.ts',
  'app/nav-glass.css',
  'app/chat-bar.css',
  'app/chat-fullscreen.css',
  'app/glass-polish.css',
  'ADSENSE-SETUP.md',
]

async function main() {
  for (const file of requiredFiles) {
    await access(file)
    console.log(`PASS static export: ${file}`)
  }

  const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
  if (packageJson.version !== '1.0.0') throw new Error(`ProofTTL web release version must be 1.0.0, got ${packageJson.version}`)
  if (packageJson.type !== 'module') throw new Error('ProofTTL web package must declare type=module for release scripts')

  const homepage = await readFile('out/index.html', 'utf8')
  for (const expected of ['ProofTTL', 'Truth with', 'Sign in', 'Message L.O.V.E.']) {
    if (!homepage.includes(expected)) throw new Error(`Static homepage is missing expected content: ${expected}`)
  }

  const consolePage = await readFile('out/console/index.html', 'utf8')
  for (const expected of ['CUSTOMER CONSOLE', 'SECURITY', 'SECURITY BACKEND LOCKED', 'Message L.O.V.E.', 'noindex']) {
    if (!consolePage.toLowerCase().includes(expected.toLowerCase())) throw new Error(`Static console is missing expected content: ${expected}`)
  }

  const loginPage = await readFile('out/login/index.html', 'utf8')
  for (const expected of ['noindex', 'CONTINUE WITH GOOGLE', 'CONTINUE WITH DISCORD', 'CONTINUE WITH PASSKEY', 'TOTP', 'RECOVERY CODES', 'HTTPONLY SESSIONS', 'CSRF PROTECTION']) {
    if (!loginPage.toLowerCase().includes(expected.toLowerCase())) throw new Error(`Static login page is missing auth capability content: ${expected}`)
  }

  const twoFactorPage = await readFile('out/two-factor/index.html', 'utf8')
  for (const expected of ['noindex', 'SECURITY CHECK', 'AUTHENTICATOR', 'RECOVERY CODE']) {
    if (!twoFactorPage.toLowerCase().includes(expected.toLowerCase())) throw new Error(`Static two-factor page is missing expected content: ${expected}`)
  }

  const onboardingPage = await readFile('out/onboarding/index.html', 'utf8')
  if (!onboardingPage.toLowerCase().includes('noindex')) throw new Error('Static onboarding page is missing its noindex directive')

  const docs = await readFile('out/docs/index.html', 'utf8')
  for (const expected of ['ProofTTL API Docs', 'HTTP 402', 'PAYMENT-REQUIRED', 'Fact Lease']) {
    if (!docs.includes(expected)) throw new Error(`Static developer docs are missing expected content: ${expected}`)
  }

  const solution = await readFile('out/solutions/ai-agent-verification/index.html', 'utf8')
  for (const expected of ['AI Agent', 'ProofTTL', 'Fact Lease', 'Message L.O.V.E.', '/docs/']) {
    if (!solution.includes(expected)) throw new Error(`Static solution page is missing expected content: ${expected}`)
  }

  const audit = await readFile('out/audit/index.html', 'utf8')
  for (const expected of ['ProofTTL', 'Verification Audit', '$500', '/audit/sample/']) {
    if (!audit.includes(expected)) throw new Error(`Static audit page is missing expected pilot content: ${expected}`)
  }

  const sampleAudit = await readFile('out/audit/sample/index.html', 'utf8')
  for (const expected of ['Sample Verification Audit', 'Verification that', 'PX-006', 'CONTRADICTED', 'PUBLIC DEMONSTRATION']) {
    if (!sampleAudit.toLowerCase().includes(expected.toLowerCase())) throw new Error(`Static sample audit is missing required evidence content: ${expected}`)
  }

  const chat = await readFile('components/ProofTTLChatBar.tsx', 'utf8')
  for (const expected of [
    'fetchProofTTLAssistantUsage',
    "'Message L.O.V.E.…'",
    "voicePhase === 'recording'",
    'remaining === 0',
    'LoveEntity',
    "type LoveState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'awake'",
    'askProofTTLByVoice',
    'loveSpeechDataUrl',
    'voicePhase',
    'trackEntity',
    'AssistantHistoryMessage',
    'FactLeaseCard',
    'inspectLeaseFromMessage',
    'data-love-fact-lease="materialized"',
  ]) {
    if (!chat.includes(expected)) throw new Error(`L.O.V.E. chat bar is missing required quota/conversation/reactive-entity/voice/lease behavior: ${expected}`)
  }

  const entityStyles = await readFile('components/LoveEntity.module.css', 'utf8')
  for (const expected of ['.stage', '.eyes', '.smoke', '.voiceWave', "[data-state='speaking']", '[data-state=', '@media (prefers-reduced-motion: reduce)']) {
    if (!entityStyles.includes(expected)) throw new Error(`Reactive L.O.V.E. entity is missing required visual behavior: ${expected}`)
  }

  const verifier = await readFile('out/verify-lease.html', 'utf8')
  for (const expected of ['Verify a signed', 'Ed25519', 'proofttl-issuance-v1', 'proofttl-event-v1', '/.well-known/proofttl-keys.json', 'Export signed Lease JSON', 'Signed verification history', 'verifyEventChain', 'previous_event_hash']) {
    if (!verifier.includes(expected)) throw new Error(`Independent Lease verifier is missing required trust behavior: ${expected}`)
  }

  const leaseOps = await readFile('out/lease-ops.html', 'utf8')
  for (const expected of ['Lease Operations', 'Share verification link', 'Prepare renewal', 'SOURCE_UNAVAILABLE']) {
    if (!leaseOps.toLowerCase().includes(expected.toLowerCase())) throw new Error(`Lease operations surface is missing lifecycle behavior: ${expected}`)
  }

  const methodology = await readFile('out/methodology.html', 'utf8')
  for (const expected of ['proofttl-methodology-v1', 'proofttl-event-v1', 'previous_event_hash', 'SUPPORTED', 'CONTRADICTED', 'UNKNOWN', 'ACTIVE', 'REVOKED', 'EXPIRED']) {
    if (!methodology.includes(expected)) throw new Error(`Verification methodology is missing required semantics: ${expected}`)
  }

  const statusPage = await readFile('out/status.html', 'utf8')
  for (const expected of ['System status', '/health', '/monitor/status', 'Base Sepolia testnet']) {
    if (!statusPage.includes(expected)) throw new Error(`Public status page is missing required status behavior: ${expected}`)
  }

  const trustPage = await readFile('out/trust.html', 'utf8')
  for (const expected of ['Trust Center', 'API HEALTH', 'CUSTOMER AUTHENTICATION', 'Google OAuth / Discord OAuth / WebAuthn passkeys', 'Secure HttpOnly cookies', 'Trusted-origin allowlist + CSRF protection', 'AUTOMATIC MONITORING', 'CRYPTOGRAPHIC SIGNING', 'RELEASE READINESS', 'Ed25519 signed + SHA-256 hash chained', 'Mainnet settlement is intentionally disabled']) {
    if (!trustPage.includes(expected)) throw new Error(`Trust Center is missing required release/trust behavior: ${expected}`)
  }

  const layout = await readFile('app/layout.tsx', 'utf8')
  if (!layout.includes('<ProofTTLChatBar />')) throw new Error('Global L.O.V.E. chat bar is not mounted')
  if (layout.includes('<ProofTTLAssistant />')) throw new Error('Legacy separate voice assistant is mounted alongside the unified L.O.V.E. chat surface')
  if (!layout.includes("'./chat-fullscreen.css'")) throw new Error('Fullscreen L.O.V.E. chat styles are not loaded')
  for (const expected of ['/trust.html', '/verify-lease.html', '/lease-ops.html', '/methodology.html', '/status.html', 'TESTNET PREVIEW', 'Mainnet disabled']) {
    if (!layout.includes(expected)) throw new Error(`Global trust strip is missing required content: ${expected}`)
  }

  const voiceAssistant = await readFile('components/ProofTTLAssistant.tsx', 'utf8')
  for (const expected of ['L.O.V.E.', "data-love-state={visualState}", 'loveSpeechDataUrl', "phase === 'speaking'", 'REPLAY VOICE']) {
    if (!voiceAssistant.includes(expected)) throw new Error(`L.O.V.E. voice capability implementation is missing required behavior: ${expected}`)
  }

  const assistantClient = await readFile('lib/proofttl-assistant.ts', 'utf8')
  for (const expected of ['NEXT_PUBLIC_PROOFTTL_API_URL', 'https://proofttl.tasx13ok.workers.dev', '/assistant/text', '/assistant/voice', '/assistant/usage', "credentials: 'include'", 'loveSpeechDataUrl', 'audio_base64', 'lease_grounding']) {
    if (!assistantClient.includes(expected)) throw new Error(`Assistant API client is missing required production/L.O.V.E. wiring: ${expected}`)
  }

  const glass = await readFile('app/glass-polish.css', 'utf8')
  for (const expected of ['backdrop-filter: blur(34px) saturate(185%)', 'env(safe-area-inset-bottom)', '.pttl-chat-dock']) {
    if (!glass.includes(expected)) throw new Error(`Final glass/mobile polish is missing required rule: ${expected}`)
  }

  const fullscreen = await readFile('app/chat-fullscreen.css', 'utf8')
  for (const expected of ['body.pttl-chat-fullscreen-open', '.pttl-chat-dock.fullscreen', '@keyframes pttl-mist-in']) {
    if (!fullscreen.includes(expected)) throw new Error(`Fullscreen L.O.V.E. smoke layer is missing required rule: ${expected}`)
  }

  const navGlass = await readFile('app/nav-glass.css', 'utf8')
  for (const expected of ['.nav::before', '.nav::after', '@media (max-width: 900px)']) {
    if (!navGlass.includes(expected)) throw new Error(`Floating navigation glass layer is missing required rule: ${expected}`)
  }

  const adsSource = await readFile('components/ProofTTLAds.tsx', 'utf8')
  for (const expected of ["AD_ELIGIBLE_PREFIXES = ['/docs/', '/solutions/']", "AD_ELIGIBLE_EXACT = new Set(['/'])", 'NEXT_PUBLIC_ADSENSE_CLIENT', 'ca-pub-']) {
    if (!adsSource.includes(expected)) throw new Error(`ProofTTL ad loader is missing the public-only advertising guard: ${expected}`)
  }

  const adsPolicy = await readFile('ADSENSE-SETUP.md', 'utf8')
  for (const expected of ['Side rail ads', 'Left and right', 'Disable **Anchor ads**', 'Disable **Vignette ads**', 'No popups or pop-unders']) {
    if (!adsPolicy.includes(expected)) throw new Error(`AdSense policy is missing required side-rail-only rule: ${expected}`)
  }

  const robots = await readFile('out/robots.txt', 'utf8')
  if (!robots.includes('Allow: /')) throw new Error('robots.txt must allow crawlers to reach indexable pages and page-level noindex directives')

  const headers = await readFile('out/_headers', 'utf8')
  for (const expected of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Permissions-Policy: camera=(), microphone=(self), geolocation=()']) {
    if (!headers.includes(expected)) throw new Error(`Static export is missing expected security header rule: ${expected}`)
  }
  if (headers.includes('microphone=()')) throw new Error('Pages headers disable the L.O.V.E. microphone')

  console.log('\nSUCCESS: ProofTTL web v1.0.0 static export, audit offer/sample, Google/Discord/passkey auth trust, security, unified reactive L.O.V.E. voice + Lease context, independent issuance/event-chain verification, lifecycle operations, Trust Center, versioned methodology, public status, docs, ad policy, crawl rules, and microphone-safe security headers all passed release checks.')
}

main().catch((error) => {
  console.error('\nSTATIC EXPORT CHECK FAILED:', error.message || error)
  process.exitCode = 1
})
