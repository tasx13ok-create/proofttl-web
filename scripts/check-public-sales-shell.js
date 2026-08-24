import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

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

const publicPages = [
  'out/index.html',
  'out/about/index.html',
  'out/audit/index.html',
  'out/audit/sample/index.html',
  'out/services/index.html',
  'out/ai-fact-checker/index.html',
  'out/trust/index.html',
  'out/how-proofttl-works/index.html',
  'out/faq/index.html',
  'out/privacy/index.html',
  'out/terms/index.html',
]

const forbiddenPublicFragments = [
  '>Workspace</a>',
  '>Studio</a>',
  '>Foundry</a>',
  '>Work</a>',
  '>Files</a>',
  '>Automations</a>',
  '>Money</a>',
  '>Connections</a>',
  'Message L.O.V.E.',
  'TESTNET PREVIEW',
  'OPEN WORKSPACE',
  'RUN TESTNET VERIFICATION',
]

async function exists(file) {
  try { await access(file, constants.F_OK); return true } catch { return false }
}

function internalHrefCandidates(href) {
  const clean = href.split('#')[0].split('?')[0]
  if (!clean || clean === '/') return ['out/index.html']
  const normalized = clean.startsWith('/') ? clean.slice(1) : clean
  if (!normalized) return ['out/index.html']
  if (normalized.endsWith('/')) return [`out/${normalized}index.html`, `out/${normalized.slice(0, -1)}.html`]
  if (/\.[a-z0-9]+$/i.test(normalized)) return [`out/${normalized}`]
  return [`out/${normalized}/index.html`, `out/${normalized}.html`]
}

for (const file of publicPages) {
  if (!(await exists(file))) throw new Error(`Buyer-facing export missing: ${file}`)
  const html = await readFile(file, 'utf8')

  for (const fragment of forbiddenPublicFragments) {
    if (html.includes(fragment)) throw new Error(`${file} leaked prototype/app-only public UI: ${fragment}`)
  }

  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1])
  for (const href of hrefs) {
    if (!href || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('data:')) continue
    if (!href.startsWith('/')) continue
    const candidates = internalHrefCandidates(href)
    let found = false
    for (const candidate of candidates) {
      if (await exists(path.normalize(candidate))) { found = true; break }
    }
    if (!found) throw new Error(`${file} contains a broken internal link: ${href} (checked ${candidates.join(', ')})`)
  }
}

console.log(`SUCCESS: public ProofTTL sales shell is buyer-focused and ${publicPages.length} exported buyer pages passed internal-link and prototype-leak checks.`)
