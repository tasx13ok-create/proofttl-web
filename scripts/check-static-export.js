import { access, readFile } from 'node:fs/promises'

const requiredFiles = [
  'package.json','out/index.html','out/login/index.html','out/two-factor/index.html','out/onboarding/index.html','out/get-started/index.html','out/console/index.html','out/support/index.html','out/docs/index.html','out/audit/index.html','out/audit/sample/index.html','out/audit/status/index.html','out/solutions/index.html','out/solutions/ai-agent-verification/index.html','out/trust/index.html','out/workspace/index.html','out/worlds/index.html','out/cinematics/index.html','out/verify-lease.html','out/lease-ops.html','out/methodology.html','out/status.html','out/robots.txt','out/_headers','public/proofttl-mark.svg','public/proofttl-lockup.svg','components/ProductNav.tsx','components/ProtocolNetworkStrip.tsx','components/WorkspaceDesktopShell.tsx','components/WorldBuilder.tsx','components/CinematicsStudio.tsx','components/LocalCinematicPreview.tsx','cinematics/core/Types.ts','cinematics/prompt/PromptParser.ts','cinematics/ai/Types.ts','lib/proofttl-cinematics.ts','components/AssistantRichText.tsx','components/ProofTTLAds.tsx','components/ProofTTLAssistant.tsx','components/ProofTTLChatBar.tsx','components/LoveEntity.module.css','lib/proofttl-assistant.ts','lib/proofttl-auth.ts','components/AuthLoginPanel.tsx','components/AuditIntakeForm.tsx','components/AuditStatusLookup.tsx','api/auth-proxy.js','app/product-nav.css','app/brand-polish.css','app/audit-sales.css','app/workspace-shell.css','app/worlds.css','app/cinematics.css','app/cinematics-v3.css','app/chat-bar.css','app/chat-fullscreen.css','app/glass-polish.css','ADSENSE-SETUP.md'
]

async function expect(file, values, label = file) {
  const text = await readFile(file, 'utf8')
  for (const value of values) if (!text.toLowerCase().includes(value.toLowerCase())) throw new Error(`${label} is missing expected content: ${value}`)
  return text
}

async function main() {
  for (const file of requiredFiles) { await access(file); console.log(`PASS static export: ${file}`) }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
  if (packageJson.version !== '1.0.1') throw new Error(`ProofTTL web release version must be 1.0.1, got ${packageJson.version}`)
  if (packageJson.type !== 'module') throw new Error('ProofTTL web package must declare type=module')

  const homepage = await expect('out/index.html', ['ProofTTL','Find the claim','Open Workspace','Message L.O.V.E.','Stress-test 3–5 claims'], 'Homepage')
  if (homepage.includes('class="nav shell"')) throw new Error('Homepage contains a duplicate local navigation bar')
  if (homepage.includes('brand-mark">P')) throw new Error('Homepage contains legacy P placeholder branding')

  await expect('out/console/index.html', ['CUSTOMER CONSOLE','SECURITY','Message L.O.V.E.','noindex'], 'Console')
  await expect('out/login/index.html', ['noindex','CONTINUE WITH GITHUB','CONTINUE WITH GOOGLE','CONTINUE WITH DISCORD','CONTINUE WITH PASSKEY','TOTP','RECOVERY CODES'], 'Login')
  await expect('out/two-factor/index.html', ['noindex','SECURITY CHECK','AUTHENTICATOR','RECOVERY CODE'], 'Two factor')
  await expect('out/docs/index.html', ['ProofTTL API Docs','HTTP 402','PAYMENT-REQUIRED','Fact Lease'], 'Docs')
  await expect('out/audit/index.html', ['Claim Stress Test','Verification Audit','$129','$500','SCOPE BEFORE PAYMENT','/audit/sample/'], 'Audit')
  await expect('out/audit/sample/index.html', ['Sample Verification Audit','PX-006','CONTRADICTED','PUBLIC DEMONSTRATION'], 'Sample audit')
  await expect('out/audit/status/index.html', ['SECURE AUDIT ACCESS','Checking your session','signed-in ProofTTL account'], 'Audit status auth gate')
  await expect('out/workspace/index.html', ['Workspace','Code','Verify claims','Open files'], 'Workspace')
  await expect('out/worlds/index.html', ['WORLDS / 3D STUDIO','LIVE WEBGL PREVIEW','GENERATE LOCALLY','EXPORT JSON'], 'Worlds preserved code')
  await expect('out/cinematics/index.html', ['CINEMATICS','DIRECT · STORYBOARD · RENDER · CUT','AI FILM','LOCAL PREVIS','DIRECT SCENE WITH AI','TIMELINE','RENDER SCENE'], 'Cinematics preserved code')
  await expect('out/trust/index.html', ['TRUST CENTER','API HEALTH','CUSTOMER AUTHENTICATION','AUTOMATIC MONITORING','CRYPTOGRAPHIC SIGNING','VOICE PIPELINE','RELEASE READINESS','TRUST BOUNDARY'], 'Trust Center')
  await expect('out/verify-lease.html', ['Verify a signed','Ed25519','proofttl-issuance-v1','/.well-known/proofttl-keys.json','Export signed Lease JSON'], 'Lease verifier')
  await expect('out/lease-ops.html', ['Lease Operations','Share verification link','Prepare renewal'], 'Lease operations')
  await expect('out/methodology.html', ['SUPPORTED','CONTRADICTED','UNKNOWN','ACTIVE','REVOKED','EXPIRED'], 'Methodology')
  await expect('out/status.html', ['System status','/health','/monitor/status','Base Sepolia testnet'], 'Status')

  await expect('components/CinematicsStudio.tsx', ['data-ai-render-mode="true"','DIRECT SCENE WITH AI','STORYBOARD ALL','RENDER SCENE','PLAY REEL','CONTINUITY BIBLE','EXPORT V3 PROJECT','LocalCinematicPreview'], 'AI Cinematics v3 preserved')
  await expect('cinematics/ai/Types.ts', ['proofttl-cinematic-v3','CinematicShotV3','ShotGenerationState'], 'Cinematic v3 AI schema')
  await expect('lib/proofttl-cinematics.ts', ['/cinematics/plan','/cinematics/storyboard','/cinematics/render',"credentials: 'include'"], 'Cinematics AI client')
  await expect('components/LocalCinematicPreview.tsx', ['data-local-cinematic','proofttl-cinematic-v2','RECORD WEBM','captureStream','MediaRecorder','REGENERATE TAKE','TIMELINE IS SCRUBBABLE'], 'Local cinematic previs')

  const chat = await expect('components/ProofTTLChatBar.tsx', ['fetchProofTTLAssistantUsage','Message L.O.V.E.…','voicePhase === \'recording\'','LoveEntity','askProofTTLByVoice','loveSpeechDataUrl','AssistantHistoryMessage','FactLeaseCard','LoveVisualStrip','AssistantRichText'], 'L.O.V.E. chat')
  if (!chat.includes('data-love-fact-lease="materialized"')) throw new Error('L.O.V.E. chat is missing materialized Lease context')
  await expect('components/AssistantRichText.tsx', ['data-love-code-block','navigator.clipboard.writeText','```'], 'L.O.V.E. code rendering')
  await expect('components/LoveEntity.module.css', ['.stage','.eyes','.smoke','.voiceWave','prefers-reduced-motion'], 'Reactive L.O.V.E. entity')

  const authClient = await expect('lib/proofttl-auth.ts', ['AUTH_RETURN_KEY','rememberAuthReturn','resolveAuthReturn','signInHref','credentials: \'include\''], 'First-party auth client')
  if (authClient.includes("callbackURL: `${PROOFTTL_AUTH_URL}/console/`")) throw new Error('Auth client still hard-codes Console as the post-login destination')
  await expect('components/AuthLoginPanel.tsx', ['resolveAuthReturn','clearAuthReturn','AFTER SIGN-IN','window.location.replace(target)'], 'Login return flow')
  await expect('components/AuditIntakeForm.tsx', ['AUDIT_DRAFT_KEY','localStorage.setItem(AUDIT_DRAFT_KEY','requireSession','signInHref','credentials: \'include\'','#audit-intake'], 'Audit draft + sign-in flow')
  await expect('components/AuditStatusLookup.tsx', ['authClient.getSession','SECURE AUDIT ACCESS','signInHref','credentials: \'include\''], 'Audit status auth flow')
  await expect('api/auth-proxy.js', ['upstreamCookies','browserCookie','browserLocation','getSetCookie','redirect: \'manual\''], 'OAuth cookie + redirect proxy')

  const layout = await readFile('app/layout.tsx', 'utf8')
  for (const expected of ['<ProofTTLChatBar />','<ProductNav />','<ProtocolNetworkStrip />',"'./brand-polish.css'","'./audit-sales.css'","'./workspace-shell.css'","'./cinematics.css'","'/proofttl-mark.svg'","'/proofttl-lockup.svg'","generator: 'ProofTTL v1.0.1'"]) if (!layout.includes(expected)) throw new Error(`Global shell is missing: ${expected}`)
  if (layout.includes('<ProofTTLAssistant />')) throw new Error('Legacy separate voice assistant is mounted')

  const networkStrip = await readFile('components/ProtocolNetworkStrip.tsx', 'utf8')
  for (const expected of ['PROOFTTL v1.0.1 · TESTNET PREVIEW','Mainnet disabled',"'/'","'/audit/'","'/audit/sample/'","'/audit/status/'"]) if (!networkStrip.includes(expected)) throw new Error(`Protocol network strip is missing launch boundary: ${expected}`)

  const nav = await readFile('components/ProductNav.tsx', 'utf8')
  for (const expected of ['/workspace/','/studio/','/work/','/files/','/automations/','/money/','/connections/','/trust/','product-brand-lockup','product-brand-lockup-image','/proofttl-lockup.svg','ProofTTL','signInHref']) if (!nav.includes(expected)) throw new Error(`Global navigation is missing: ${expected}`)
  for (const legacyBrand of ['product-brand-mark','product-brand-wordmark','/proofttl-logo-lockup.png']) if (nav.includes(legacyBrand)) throw new Error(`Legacy placeholder branding leaked into global navigation: ${legacyBrand}`)
  for (const hidden of ["{ href: '/worlds/', label: 'Worlds' }","{ href: '/cinematics/', label: 'Cinematics' }"]) if (nav.includes(hidden)) throw new Error(`Hidden render surface leaked into global navigation: ${hidden}`)

  const brandPolish = await readFile('app/brand-polish.css', 'utf8')
  for (const expected of ['product-brand-lockup-image','main > nav.nav.shell','.pttl-chat-orb span','/proofttl-mark.svg']) if (!brandPolish.includes(expected)) throw new Error(`Brand polish is missing: ${expected}`)

  const workspaceShell = await readFile('components/WorkspaceDesktopShell.tsx', 'utf8')
  for (const hidden of ['href="/worlds/"','href="/cinematics/"','Build a world','Direct a scene','New 3D world','New cinematic']) if (workspaceShell.includes(hidden)) throw new Error(`Hidden render surface leaked into Workspace controls: ${hidden}`)

  const assistantClient = await readFile('lib/proofttl-assistant.ts', 'utf8')
  for (const expected of ['/assistant/text','/assistant/voice','/assistant/speech','/assistant/usage',"credentials: 'include'",'requestFinalLoveSpeech','final_response_tts']) if (!assistantClient.includes(expected)) throw new Error(`Assistant client is missing: ${expected}`)

  const adsSource = await readFile('components/ProofTTLAds.tsx', 'utf8')
  for (const expected of ["AD_ELIGIBLE_PREFIXES = ['/docs/', '/solutions/']",'NEXT_PUBLIC_ADSENSE_CLIENT']) if (!adsSource.includes(expected)) throw new Error(`Ad loader is missing: ${expected}`)
  if (adsSource.includes("new Set(['/'])")) throw new Error('Commercial homepage must not be eligible for ads')
  await expect('ADSENSE-SETUP.md', ['Side rail ads','Disable **Anchor ads**','Disable **Vignette ads**','No popups or pop-unders'], 'Ad policy')

  const robots = await readFile('out/robots.txt', 'utf8')
  if (!robots.includes('Allow: /')) throw new Error('robots.txt must allow crawlers')
  const headers = await readFile('out/_headers', 'utf8')
  for (const expected of ['X-Content-Type-Options: nosniff','X-Frame-Options: DENY','Permissions-Policy: camera=(), microphone=(self), geolocation=()']) if (!headers.includes(expected)) throw new Error(`Static headers missing: ${expected}`)
  if (headers.includes('microphone=()')) throw new Error('Static headers disable L.O.V.E. microphone')

  console.log('\nSUCCESS: ProofTTL web v1.0.1 static export passed with first-party auth return flow, protected audit access, launch branding, commercial funnel protection, private Foundry gating, and hidden render code preserved for later reactivation.')
}

main().catch((error) => { console.error('\nSTATIC EXPORT CHECK FAILED:', error.message || error); process.exitCode = 1 })
