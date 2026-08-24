import { readFile } from 'node:fs/promises'

const nav = await readFile('components/ProductNav.tsx', 'utf8')
const network = await readFile('components/ProtocolNetworkStrip.tsx', 'utf8')
const chat = await readFile('components/AppOnlyChatBar.tsx', 'utf8')
const layout = await readFile('app/layout.tsx', 'utf8')
const trust = await readFile('components/TrustCenter.tsx', 'utf8')

for (const expected of [
  "{ href: '/audit/', label: 'Verification' }",
  "{ href: '/services/', label: 'Services' }",
  "{ href: '/audit/sample/', label: 'Sample' }",
  "{ href: '/how-proofttl-works/', label: 'How it works' }",
  'data-nav-mode={publicMode',
  'Start verification',
  "href=\"/audit/#audit-intake\"",
]) {
  if (!nav.includes(expected)) throw new Error(`Public sales navigation missing required behavior: ${expected}`)
}

for (const internalLabel of ["label: 'Workspace'", "label: 'Studio'", "label: 'Foundry'", "label: 'Work'", "label: 'Files'", "label: 'Automations'", "label: 'Money'"]) {
  if (!nav.includes(internalLabel)) throw new Error(`App navigation unexpectedly lost internal surface: ${internalLabel}`)
}

for (const route of ['/trust/', '/ai-fact-checker/', '/services/', '/audit/']) {
  if (!network.includes(`'${route}'`)) throw new Error(`Protocol banner exclusion missing buyer route: ${route}`)
  if (!chat.includes(`'${route}'`)) throw new Error(`App-only chat exclusion missing buyer route: ${route}`)
}

if (!layout.includes("import AppOnlyChatBar from '../components/AppOnlyChatBar'")) throw new Error('Root layout must use buyer-aware chat wrapper')
if (layout.includes('<ProofTTLChatBar />')) throw new Error('Root layout must not render assistant chat directly on every page')

for (const expected of [
  'Know what you are paying for before you pay.',
  'START VERIFICATION',
  'VIEW SAMPLE',
  'Stripe',
  'NO CARD REQUIRED',
  'CONFIRMED BEFORE PAYMENT REQUEST',
  'TECHNICAL PROTOCOL BOUNDARY',
]) {
  if (!trust.includes(expected)) throw new Error(`Trust Center missing buyer-facing trust behavior: ${expected}`)
}

for (const forbidden of ['OPEN WORKSPACE', 'VOICE PIPELINE', 'Studio cloud', 'Isolated runner']) {
  if (trust.includes(forbidden)) throw new Error(`Trust Center leaked internal/prototype messaging: ${forbidden}`)
}

console.log('SUCCESS: public ProofTTL sales shell is buyer-focused; app-only surfaces, protocol preview messaging, and assistant UI are separated from the commercial funnel.')
