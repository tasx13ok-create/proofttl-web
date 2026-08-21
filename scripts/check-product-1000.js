import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const requiredFiles = [
  'app/page.tsx','app/audit/page.tsx','app/login/page.tsx','components/AuthLoginPanel.tsx','app/console/page.tsx',
  'components/ProductNav.tsx','components/ProtocolNetworkStrip.tsx','app/how-proofttl-works/page.tsx','app/workspace/page.tsx','components/WorkspaceDesktopShell.tsx',
  'public/proofttl-mark.svg','public/proofttl-lockup.svg',
  'app/worlds/page.tsx','components/WorldBuilder.tsx','app/cinematics/page.tsx','app/cinematics-v3.css','components/CinematicsStudio.tsx','components/LocalCinematicPreview.tsx','cinematics/core/Types.ts','cinematics/prompt/PromptParser.ts','cinematics/ai/Types.ts','lib/proofttl-cinematics.ts',
  'components/AssistantRichText.tsx','components/ProofTTLChatBar.tsx','app/trust/page.tsx','components/TrustCenter.tsx',
  'lib/proofttl-capabilities.ts','lib/proofttl-command.ts','lib/proofttl-visuals.ts','app/money/page.tsx','app/work/page.tsx',
  'components/WorkTaskCenter.tsx','app/files/page.tsx','components/FilesCenter.tsx','app/automations/page.tsx','components/AutomationCenter.tsx',
  'app/connections/page.tsx','components/ConnectionsCenter.tsx','app/studio/page.tsx','components/StudioWorkbench.tsx','components/StudioRunnerPanel.tsx','lib/proofttl-assistant.ts'
]
for (const relative of requiredFiles) if (!fs.existsSync(path.join(root, relative))) throw new Error(`1000% guard: missing required product surface ${relative}`)
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const layout = read('app/layout.tsx')
const networkStrip = read('components/ProtocolNetworkStrip.tsx')
const nav = read('components/ProductNav.tsx')
const home = read('app/page.tsx')
const login = read('components/AuthLoginPanel.tsx')
const guide = read('app/how-proofttl-works/page.tsx')
const workspacePage = read('app/workspace/page.tsx')
const workspace = read('components/WorkspaceDesktopShell.tsx')
const worlds = read('components/WorldBuilder.tsx')
const cinematics = read('components/CinematicsStudio.tsx')
const cinematicsCss = read('app/cinematics-v3.css')
const localCinematics = read('components/LocalCinematicPreview.tsx')
const cinematicAiTypes = read('cinematics/ai/Types.ts')
const cinematicClient = read('lib/proofttl-cinematics.ts')
const richText = read('components/AssistantRichText.tsx')
const chat = read('components/ProofTTLChatBar.tsx')
const trust = read('components/TrustCenter.tsx')
const capabilities = read('lib/proofttl-capabilities.ts')
const commandClient = read('lib/proofttl-command.ts')
const visuals = read('lib/proofttl-visuals.ts')
const tasks = read('components/WorkTaskCenter.tsx')
const files = read('components/FilesCenter.tsx')
const automations = read('components/AutomationCenter.tsx')
const connections = read('components/ConnectionsCenter.tsx')
const studio = read('components/StudioWorkbench.tsx')
const runner = read('components/StudioRunnerPanel.tsx')
const assistant = read('lib/proofttl-assistant.ts')
const audit = read('app/audit/page.tsx')

const checks = [
  [layout.includes('<ProtocolNetworkStrip />') && networkStrip.includes('TESTNET PREVIEW') && networkStrip.includes('Mainnet disabled') && networkStrip.includes("'/'") && networkStrip.includes("'/audit/'"), 'technical network truth preserved while commercial routes stay clean'],
  [layout.includes('<ProductNav />') && nav.includes('/workspace/') && nav.includes('/studio/') && nav.includes('/trust/') && !nav.includes("{ href: '/worlds/', label: 'Worlds' }") && !nav.includes("{ href: '/cinematics/', label: 'Cinematics' }"), 'revenue-focused canonical product navigation'],
  [nav.includes('/work/') && nav.includes('/files/') && nav.includes('/automations/') && nav.includes('/money/') && nav.includes('/connections/'), 'global work/product areas'],
  [nav.includes('/proofttl-lockup.svg') && nav.includes('product-brand-lockup-image') && !nav.includes('product-brand-mark') && !nav.includes('product-brand-wordmark'), 'canonical full vector logo lockup in product navigation'],
  [!home.includes('<nav className="nav shell"') && !home.includes('brand-mark">P') && home.includes('/proofttl-lockup.svg'), 'homepage has one canonical nav and no legacy P branding'],
  [/claim stress test/i.test(home) && home.includes('$129') && home.includes('$500'), 'two-tier commercial offer'],
  [/claim stress test/i.test(audit) && /verification audit/i.test(audit), 'audit offer ladder'],
  [/GitHub/i.test(login) && /Google/i.test(login) && /Discord/i.test(login) && /Passkey/i.test(login), 'GitHub + Google + Discord + passkey login'],
  [/Fact Lease/i.test(guide) && /L\.O\.V\.E\./i.test(guide) && /monitor/i.test(guide), 'single deep product guide'],
  [workspacePage.includes('WorkspaceDesktopShell') && !workspacePage.includes('WorkspaceLaunchpad') && !workspacePage.includes('ProofTTLOSWorkspace'), 'Workspace stays sparse instead of duplicating documentation'],
  [workspace.includes('os-activity') && workspace.includes('os-sidebar') && workspace.includes('os-tabs') && workspace.includes('os-terminal') && workspace.includes('os-status'), 'VS Code familiar Workspace shell'],
  [workspace.includes('/studio/') && workspace.includes('/audit/') && workspace.includes('/files/') && !workspace.includes('href="/worlds/"') && !workspace.includes('href="/cinematics/"'), 'Workspace routes to current revenue-focused capability pages'],
  [worlds.includes('LIVE WEBGL PREVIEW') && worlds.includes('GENERATE LOCALLY') && worlds.includes('EXPORT JSON') && worlds.includes('OrbitControls'), 'hidden browser Worlds renderer code preserved'],
  [cinematics.includes('data-ai-render-mode="true"') && cinematics.includes('DIRECT SCENE WITH AI') && cinematics.includes('STORYBOARD ALL') && cinematics.includes('RENDER SCENE') && cinematics.includes('PLAY REEL'), 'hidden AI-first Cinematics v3 code preserved'],
  [cinematics.includes('LOCAL PREVIS') && cinematics.includes('LocalCinematicPreview') && cinematics.includes('IMPORT WORLD') && cinematics.includes('TIMELINE'), 'Cinematics keeps local previs and canonical world handoff'],
  [cinematics.includes('CONTINUITY BIBLE') && cinematics.includes('CONTACT') && cinematics.includes('continuity_in') && cinematics.includes('continuity_out'), 'Cinematics exposes continuity and physical-contact planning'],
  [cinematics.includes('cinematic-v3.json') && cinematics.includes('EXPORT V3 PROJECT'), 'portable Cinematics v3 project export'],
  [cinematicAiTypes.includes("schema: 'proofttl-cinematic-v3'") && cinematicAiTypes.includes('CinematicShotV3') && cinematicAiTypes.includes('ShotGenerationState'), 'portable Cinematics v3 AI schema'],
  [cinematicClient.includes('/cinematics/plan') && cinematicClient.includes('/cinematics/storyboard') && cinematicClient.includes('/cinematics/render') && cinematicClient.includes("credentials: 'include'"), 'credential-aware Cinematics AI client'],
  [cinematicsCss.includes('.cine-v3-workspace') && cinematicsCss.includes('.cine-v3-stage') && cinematicsCss.includes('.cine-v3-timeline'), 'film-first Cinematics desktop layout'],
  [localCinematics.includes('proofttl-cinematic-v2') && localCinematics.includes('captureStream') && localCinematics.includes('MediaRecorder') && localCinematics.includes('RECORD WEBM') && localCinematics.includes('TIMELINE IS SCRUBBABLE'), 'free local cinematic previs remains available'],
  [richText.includes('```') && richText.includes('data-love-code-block') && richText.includes('navigator.clipboard.writeText'), 'safe copyable chat code blocks'],
  [chat.includes('AssistantRichText') && chat.includes('LoveVisualStrip') && chat.includes('fetchRelevantVisuals'), 'L.O.V.E. rich answer rendering'],
  [chat.includes('askProofTTLByVoice') && chat.includes('loveSpeechDataUrl') && chat.includes("type LoveState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'awake'"), 'voice and reactive L.O.V.E. preserved'],
  [trust.includes('/readiness') && /TRUST BOUNDARY/i.test(trust), 'Trust Center remains canonical'],
  [visuals.includes('/assistant/visuals') && visuals.includes('provider_returned_only'), 'grounded visual retrieval'],
  [tasks.includes('/account/tasks'), 'native account tasks'],
  [files.includes('/account/files'), 'native account files'],
  [automations.includes('/account/automations'), 'account automations'],
  [connections.includes('/capabilities') && connections.includes('/readiness') && /SERVER SIDE ONLY/i.test(connections), 'live Connections control plane'],
  [/MODEL PLAYGROUND/i.test(studio) && /TERMINAL/i.test(studio) && /NO HOST SHELL/i.test(studio), 'Studio coding boundary'],
  [runner.includes('/studio/run') && /PowerShell execution stays disabled/i.test(runner), 'isolated runner boundary'],
  [capabilities.includes('Cloud AI models') && capabilities.includes('Vercel') && capabilities.includes('GitHub') && capabilities.includes('Browser 3D Worlds'), 'provider capability map retains dormant capabilities'],
  [capabilities.includes('MONEY / SEND / DELETE / SECURITY') && capabilities.includes('Explicit user confirmation'), 'sensitive action policy'],
  [commandClient.includes('/commands/plan') && commandClient.includes('/actions/plan') && commandClient.includes("credentials: 'include'"), 'credential-aware command planner'],
  [assistant.includes('/assistant/speech') && assistant.includes('requestFinalLoveSpeech') && assistant.includes('final_response_tts'), 'final routed response TTS'],
  [/will not execute arbitrary code/i.test(assistant), 'arbitrary production code refusal']
]
const failed = checks.filter(([ok]) => !ok).map(([, label]) => label)
if (failed.length) throw new Error(`1000% product guard failed: ${failed.join(', ')}`)
console.log(`1000% product guard passed (${checks.length} invariants).`)