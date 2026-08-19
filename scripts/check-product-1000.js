import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'app/page.tsx',
  'app/audit/page.tsx',
  'app/login/page.tsx',
  'components/AuthLoginPanel.tsx',
  'app/console/page.tsx',
  'components/AccountWorkspacePanel.tsx',
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
const loginPanel = read('components/AuthLoginPanel.tsx')
const accountWorkspace = read('components/AccountWorkspacePanel.tsx')
const guide = read('app/how-proofttl-works/page.tsx')
const studio = read('components/StudioWorkbench.tsx')
const assistant = read('lib/proofttl-assistant.ts')
const audit = read('app/audit/page.tsx')

const checks = [
  [layout.includes('TESTNET PREVIEW') && layout.includes('Mainnet disabled'), 'network truth banner'],
  [layout.includes('/trust.html') && layout.includes('/how-proofttl-works/') && layout.includes('/studio/'), 'global trust/guide/studio links'],
  [/claim stress test/i.test(home) && home.includes('$129') && home.includes('$500'), 'two-tier commercial offer'],
  [/claim stress test/i.test(audit) && /verification audit/i.test(audit), 'audit offer ladder'],
  [/Google/i.test(loginPanel) && /Discord/i.test(loginPanel) && /Passkey/i.test(loginPanel), 'Google + Discord + passkey login surface'],
  [/Fact Lease/i.test(guide) && /L\.O\.V\.E\./i.test(guide) && /monitor/i.test(guide), 'full product explainer'],
  [/MODEL PLAYGROUND/i.test(studio) && /TERMINAL/i.test(studio) && /NO HOST SHELL/i.test(studio) && /EXECUTION JOBS/i.test(studio), 'Studio workspace/model/terminal/sandbox boundary'],
  [studio.includes('/studio/projects') && /CREATE CLOUD PROJECT/i.test(studio) && /LOCAL FALLBACK/i.test(studio), 'Studio authenticated cloud sync with local fallback'],
  [accountWorkspace.includes('/account/preferences') && accountWorkspace.includes('/account/audits') && /signed-in account email exactly matches/i.test(accountWorkspace), 'account-owned preferences and audit claiming'],
  [assistant.includes("'studio'") && assistant.includes("'/studio/'"), 'L.O.V.E. Studio navigation'],
  [assistant.includes('I will not execute arbitrary JavaScript'), 'assistant arbitrary-script refusal'],
]

const failed = checks.filter(([ok]) => !ok).map(([, label]) => label)
if (failed.length) throw new Error(`1000% product guard failed: ${failed.join(', ')}`)

console.log(`1000% product guard passed (${checks.length} invariants).`)
