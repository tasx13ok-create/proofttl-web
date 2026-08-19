import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'app/page.tsx',
  'app/audit/page.tsx',
  'app/login/page.tsx',
  'app/console/page.tsx',
  'app/how-proofttl-works/page.tsx',
  'app/studio/page.tsx',
  'components/ProofTTLChatBar.tsx',
  'components/StudioWorkbench.tsx',
  'lib/proofttl-assistant.ts',
]

for (const relative of requiredFiles) {
  const full = path.join(root, relative)
  if (!fs.existsSync(full)) throw new Error(`1000% guard: missing required product surface ${relative}`)
}

const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8')
const layout = read('app/layout.tsx')
const home = read('app/page.tsx')
const login = read('app/login/page.tsx')
const guide = read('app/how-proofttl-works/page.tsx')
const studio = read('components/StudioWorkbench.tsx')
const assistant = read('lib/proofttl-assistant.ts')
const audit = read('app/audit/page.tsx')

const checks = [
  [layout.includes('TESTNET PREVIEW') && layout.includes('Mainnet disabled'), 'network truth banner'],
  [layout.includes('/trust.html') && layout.includes('/how-proofttl-works/') && layout.includes('/studio/'), 'global trust/guide/studio links'],
  [home.includes('Claim Stress Test') && home.includes('$129') && home.includes('$500'), 'two-tier commercial offer'],
  [audit.includes('Claim Stress Test') && audit.includes('Verification Audit'), 'audit offer ladder'],
  [login.includes('Google') && login.includes('Discord') && /Passkey/i.test(login), 'Google + Discord + passkey login surface'],
  [/Fact Lease/i.test(guide) && /L\.O\.V\.E\./i.test(guide) && /monitor/i.test(guide), 'full product explainer'],
  [/MODEL PLAYGROUND/i.test(studio) && /TERMINAL/i.test(studio) && /NO HOST SHELL/i.test(studio), 'Studio model/editor/terminal surface'],
  [assistant.includes("'studio'") && assistant.includes("'/studio/'"), 'L.O.V.E. Studio navigation'],
  [assistant.includes('I will not execute arbitrary JavaScript'), 'assistant arbitrary-script refusal'],
]

const failed = checks.filter(([ok]) => !ok).map(([, label]) => label)
if (failed.length) throw new Error(`1000% product guard failed: ${failed.join(', ')}`)

console.log(`1000% product guard passed (${checks.length} invariants).`)
