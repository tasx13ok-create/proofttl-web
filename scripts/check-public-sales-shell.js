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
  "{ href: '/support/', label: 'Support' }",
  'data-nav-mode={publicMode',
  'Start verification',
  "href=\"/audit/#audit-intake\"",
]) {
  if (!nav.includes(expected)) throw new Error(`Public sales navigation missing required behavior: ${expected}`)
}

for (const internalLabel of ["label: 'Workspace'", "label: 'Studio'", "label: 'Foundry'", "label: 'Work'", "label: 'Files'", "label: 'Automations'", "label: 'Money'"]) {
  if (!nav.includes(internalLabel)) throw new Error(`App navigation unexpectedly lost internal surface: ${internalLabel}`)
}

for (const route of ['/trust/', '/ai-fact-checker/', '/services/', '/audit/', '/support/', '/status/']) {
  if (!network.includes(`'${route}'`)) throw new Error(`Protocol banner exclusion missing buyer route: ${route}`)
  if (!chat.includes(`'${route}'`)) throw new Error(`App-only chat exclusion missing buyer route: ${route}`)
}

if (!layout.includes("import AppOnlyChatBar from '../components/AppOnlyChatBar'")) throw new Error('Root layout must use buyer-aware chat wrapper')
if (layout.includes('<ProofTTLChatBar />')) throw new Error('Root layout must not render assistant chat directly on every page')

for (const expected of [
  'Know what you are paying for before you pay.',
  'START FACT AUDIT',
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

const buyerPages = [
  'out/index.html',
  'out/about/index.html',
  'out/audit/index.html',
  'out/audit/sample/index.html',
  'out/stress-test/index.html',
  'out/services/index.html',
  'out/ai-fact-checker/index.html',
  'out/trust/index.html',
  'out/how-proofttl-works/index.html',
  'out/support/index.html',
  'out/status/index.html',
  'out/faq/index.html',
  'out/privacy/index.html',
  'out/terms/index.html',
]

const forbiddenBuyerFragments = [
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
  'Future support form preview',
  'not connected yet',
  'CONSOLE SUPPORT PREVIEW',
]

const retiredOfferFragments = [
  '$129',
  '$371',
  '$500',
  'START 3–5 CLAIMS',
  'VERIFY THESE 3 CLAIMS',
  'Claim Stress Test payment',
  'Full Verification Audit',
  'Fact Lease',
  'fact-leases',
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

function outputFileForPublicUrl(url) {
  const parsed = new URL(url)
  const pathname = parsed.pathname
  if (pathname === '/') return 'out/index.html'
  const normalized = pathname.startsWith('/') ? pathname.slice(1) : pathname
  if (normalized.endsWith('/')) return `out/${normalized}index.html`
  if (/\.[a-z0-9]+$/i.test(normalized)) return `out/${normalized}`
  return `out/${normalized}/index.html`
}

async function checkInternalLinks(file) {
  const html = await readFile(file, 'utf8')
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1])
  for (const href of hrefs) {
    if (!href || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('data:')) continue
    if (!href.startsWith('/') || href.startsWith('/api/')) continue
    const candidates = internalHrefCandidates(href)
    let found = false
    for (const candidate of candidates) {
      if (await exists(path.normalize(candidate))) { found = true; break }
    }
    if (!found) throw new Error(`${file} contains a broken internal link: ${href} (checked ${candidates.join(', ')})`)
  }
}

for (const file of buyerPages) {
  if (!(await exists(file))) throw new Error(`Buyer-facing export missing: ${file}`)
  const html = await readFile(file, 'utf8')
  for (const fragment of forbiddenBuyerFragments) {
    if (html.includes(fragment)) throw new Error(`${file} leaked prototype/app-only public UI: ${fragment}`)
  }
  for (const fragment of retiredOfferFragments) {
    if (html.includes(fragment)) throw new Error(`${file} leaked retired ProofTTL offer copy: ${fragment}`)
  }
}

const discoveryFiles = [
  'out/llms.txt',
  'out/llms-full.txt',
  'out/.well-known/proofttl.json',
  'out/.well-known/proofttl-intents.json',
  'package.json',
]
for (const file of discoveryFiles) {
  if (!(await exists(file))) throw new Error(`Machine discovery surface missing: ${file}`)
  const body = await readFile(file, 'utf8')
  for (const fragment of retiredOfferFragments) {
    if (body.includes(fragment)) throw new Error(`${file} leaked retired ProofTTL offer copy: ${fragment}`)
  }
  if (!body.includes('1500') && !body.includes('$1,500')) throw new Error(`${file} missing canonical $1,500 Fact Audit price`)
  if (!body.includes('Fact Audit')) throw new Error(`${file} missing canonical Fact Audit identity`)
}

const faq = await readFile('out/faq/index.html', 'utf8')
for (const required of ['$1,500', 'Fact Audit', 'up to 25', 'seven days', 'Human approval']) {
  if (!faq.toLowerCase().includes(required.toLowerCase())) throw new Error(`FAQ missing canonical Fact Audit contract: ${required}`)
}

const preflight = await readFile('out/stress-test/index.html', 'utf8')
for (const required of ['$1,500', 'Fact Audit', '25']) {
  if (!preflight.includes(required)) throw new Error(`Claim preflight missing canonical Fact Audit handoff: ${required}`)
}

const sitemap = await readFile('out/sitemap.xml', 'utf8')
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
if (sitemapUrls.length < 10) throw new Error(`Public sitemap unexpectedly small: ${sitemapUrls.length} URLs`)

const sitemapFiles = [...new Set(sitemapUrls.map(outputFileForPublicUrl))]
for (const file of sitemapFiles) {
  if (!(await exists(file))) throw new Error(`Sitemap points to a missing exported page: ${file}`)
  await checkInternalLinks(file)
}

console.log(`SUCCESS: public ProofTTL sales shell is buyer-focused; ${buyerPages.length} buyer pages and ${discoveryFiles.length} discovery surfaces passed prototype/retired-offer checks, and ${sitemapFiles.length} sitemap pages passed internal-link validation.`)
