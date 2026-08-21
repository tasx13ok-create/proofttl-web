import { access, readFile } from 'node:fs/promises'

const requiredFiles = [
  'package.json','out/index.html','out/login/index.html','out/two-factor/index.html','out/onboarding/index.html','out/get-started/index.html','out/console/index.html','out/support/index.html','out/docs/index.html','out/audit/index.html','out/audit/sample/index.html','out/solutions/index.html','out/solutions/ai-agent-verification/index.html','out/trust/index.html','out/workspace/index.html','out/worlds/index.html','out/cinematics/index.html','out/verify-lease.html','out/lease-ops.html','out/methodology.html','out/status.html','out/robots.txt','out/_headers','public/proofttl-logo.png','public/proofttl-logo-lockup.png','components/ProductNav.tsx','components/WorkspaceDesktopShell.tsx','components/WorldBuilder.tsx','components/CinematicsStudio.tsx','components/LocalCinematicPreview.tsx','cinematics/core/Types.ts','cinematics/prompt/PromptParser.ts','cinematics/ai/Types.ts','lib/proofttl-cinematics.ts','components/AssistantRichText.tsx','components/ProofTTLAds.tsx','components/ProofTTLAssistant.tsx','components/ProofTTLChatBar.tsx','components/LoveEntity.module.css','lib/proofttl-assistant.ts','app/product-nav.css','app/workspace-shell.css','app/worlds.css','app/cinematics.css','app/cinematics-v3.css','app/chat-bar.css','app/chat-fullscreen.css','app/glass-polish.css','ADSENSE-SETUP.md'
]

async function expect(file, values, label = file) {
  const text = await readFile(file, 'utf8')
  for (const value of values) if (!text.toLowerCase().includes(value.toLowerCase())) throw new Error(`${label} is missing expected content: ${value}`)
  return text
}

async function main() {
  for (const file of requiredFiles) { await access(file); console.log(`PASS static export: ${file}`) }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
  if (packageJson.version !== '1.0.0') throw new Error(`ProofTTL web release version must be 1.0.0, got ${packageJson.version}`)
  if (packageJson.type !== 'module') throw new Error('ProofTTL web package must declare type=module')

  await expect('out/index.html', ['ProofTTL','Find the claim','Open Workspace','Message L.O.V.E.'], 'Homepage')
  await expect('out/console/index.html', ['CUSTOMER CONSOLE','SECURITY','Message L.O.V.E.','noindex'], 'Console')
  await expect('out/login/index.html', ['noindex','CONTINUE WITH GITHUB','CONTINUE WITH GOOGLE','CONTINUE WITH DISCORD','CONTINUE WITH PASSKEY','TOTP','RECOVERY CODES'], 'Login')
  await expect('out/two-factor/index.html', ['noindex','SECURITY CHECK','AUTHENTICATOR','RECOVERY CODE'], 'Two factor')
  await expect('out/docs/index.html', ['ProofTTL API Docs','HTTP 402','PAYMENT-REQUIRED','Fact Lease'], 'Docs')
  await expect('out/audit/index.html', ['ProofTTL','Verification Audit','$500','/audit/sample/'], 'Audit')
  await expect('out/audit/sample/index.html', ['Sample Verification Audit','PX-006','CONTRADICTED','PUBLIC DEMONSTRATION'], 'Sample audit')
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

  const layout = await readFile('app/layout.tsx', 'utf8')
  for (const expected of ['<ProofTTLChatBar />','<ProductNav />',"'./workspace-shell.css'","'./cinematics.css'",'TESTNET PREVIEW','Mainnet disabled',"'/proofttl-logo.png'"]) if (!layout.includes(expected)) throw new Error(`Global shell is missing: ${expected}`)
  if (layout.includes('<ProofTTLAssistant />')) throw new Error('Legacy separate voice assistant is mounted')

  const nav = await readFile('components/ProductNav.tsx', 'utf8')
  for (const expected of ['/workspace/','/studio/','/work/','/files/','/automations/','/money/','/connections/','/trust/','product-brand-mark','product-brand-wordmark','ProofTTL']) if (!nav.includes(expected)) throw new Error(`Global navigation is missing: ${expected}`)
  for (const hidden of ["{ href: '/worlds/', label: 'Worlds' }","{ href: '/cinematics/', label: 'Cinematics' }"]) if (nav.includes(hidden)) throw new Error(`Hidden render surface leaked into global navigation: ${hidden}`)

  const workspaceShell = await readFile('components/WorkspaceDesktopShell.tsx', 'utf8')
  for (const hidden of ['href="/worlds/"','href="/cinematics/"','Build a world','Direct a scene','New 3D world','New cinematic']) if (workspaceShell.includes(hidden)) throw new Error(`Hidden render surface leaked into Workspace controls: ${hidden}`)

  const assistantClient = await readFile('lib/proofttl-assistant.ts', 'utf8')
  for (const expected of ['/assistant/text','/assistant/voice','/assistant/speech','/assistant/usage',"credentials: 'include'",'requestFinalLoveSpeech','final_response_tts']) if (!assistantClient.includes(expected)) throw new Error(`Assistant client is missing: ${expected}`)

  const adsSource = await readFile('components/ProofTTLAds.tsx', 'utf8')
  for (const expected of ["AD_ELIGIBLE_PREFIXES = ['/docs/', '/solutions/']","AD_ELIGIBLE_EXACT = new Set(['/'])",'NEXT_PUBLIC_ADSENSE_CLIENT']) if (!adsSource.includes(expected)) throw new Error(`Ad loader is missing: ${expected}`)
  await expect('ADSENSE-SETUP.md', ['Side rail ads','Disable **Anchor ads**','Disable **Vignette ads**','No popups or pop-unders'], 'Ad policy')

  const robots = await readFile('out/robots.txt', 'utf8')
  if (!robots.includes('Allow: /')) throw new Error('robots.txt must allow crawlers')
  const headers = await readFile('out/_headers', 'utf8')
  for (const expected of ['X-Content-Type-Options: nosniff','X-Frame-Options: DENY','Permissions-Policy: camera=(), microphone=(self), geolocation=()']) if (!headers.includes(expected)) throw new Error(`Static headers missing: ${expected}`)
  if (headers.includes('microphone=()')) throw new Error('Static headers disable L.O.V.E. microphone')

  console.log('\nSUCCESS: ProofTTL web v1.0.0 static export passed with revenue-focused navigation while preserving hidden Worlds and Cinematics code for later reactivation.')
}

main().catch((error) => { console.error('\nSTATIC EXPORT CHECK FAILED:', error.message || error); process.exitCode = 1 })
