import { access, readFile } from 'node:fs/promises'

async function expect(path, needles) {
  await access(path)
  const text = await readFile(path, 'utf8')
  for (const needle of needles) {
    if (!text.toLowerCase().includes(needle.toLowerCase())) {
      throw new Error(`${path} is missing discovery identity marker: ${needle}`)
    }
  }
  return text
}

async function main() {
  const about = await expect('out/about/index.html', [
    'ProofTTL is the source-backed claim-verification service',
    'proofttl-web.vercel.app',
    'time-to-live',
    'formal temporal-logic',
    '$1,500',
  ])
  if (!about.includes('application/ld+json')) throw new Error('About page is missing structured data')

  const home = await expect('out/index.html', ['ProofTTL', 'Fact Audit'])
  for (const marker of ['#brand', 'ProofTTL Fact Audit', 'github.com/tasx13ok-create/proofttl-web']) {
    if (!home.includes(marker)) throw new Error(`Homepage structured identity is missing ${marker}`)
  }

  const machine = await expect('out/machine-definition/index.html', [
    'CANONICAL IDENTITY',
    'proofttl-web.vercel.app',
    'formal temporal-logic',
    'generic token-TTL',
    'blockchain timestamping',
  ])
  if (!machine.includes('/about/')) throw new Error('Machine definition must link to canonical About identity')

  const manifest = JSON.parse(await readFile('out/.well-known/proofttl.json', 'utf8'))
  if (manifest.name !== 'ProofTTL') throw new Error('ProofTTL manifest name is not canonical')
  if (manifest.canonical_url !== 'https://proofttl-web.vercel.app/') throw new Error('ProofTTL manifest canonical URL drifted')
  if (!manifest.identity?.not_confused_with?.length) throw new Error('ProofTTL manifest lacks brand disambiguation')
  if (!String(manifest.identity?.ttl_meaning || '').toLowerCase().includes('time-to-live')) throw new Error('ProofTTL manifest lacks TTL meaning')

  await expect('out/llms.txt', ['Official website:', 'Identity and name resolution', 'formal temporal-logic', 'Atom update feed'])
  await expect('out/llms-full.txt', ['Canonical identity', 'Brand resolution', 'formal temporal-logic', 'Machine discovery surfaces'])
  await expect('out/feed.xml', ['xmlns="http://www.w3.org/2005/Atom"', 'rel="hub"', 'pubsubhubbub.appspot.com', '/about/', 'AI Claim Verification Service'])
  await expect('out/sitemap.txt', ['https://proofttl-web.vercel.app/about/', 'https://proofttl-web.vercel.app/services/ai-claim-verification/'])
  await expect('out/codemeta.json', ['ProofTTL Web', 'source-backed claim verification', 'https://proofttl-web.vercel.app/'])

  const sitemap = await readFile('out/sitemap.xml', 'utf8')
  for (const required of ['/about/', '/audit/', '/services/', '/services/ai-claim-verification/', '/machine-definition/']) {
    if (!sitemap.includes(required)) throw new Error(`Search sitemap is missing ${required}`)
  }
  for (const privateRoute of ['/workspace/', '/studio/', '/work/', '/files/', '/automations/', '/money/', '/connections/']) {
    if (sitemap.includes(privateRoute)) throw new Error(`Search sitemap leaked app surface ${privateRoute}`)
  }

  const robots = await readFile('out/robots.txt', 'utf8')
  for (const discovery of ['/sitemap.xml', '/feed.xml', '/sitemap.txt']) {
    if (!robots.includes(discovery)) throw new Error(`robots.txt is missing discovery surface ${discovery}`)
  }

  const layout = await readFile('app/layout.tsx', 'utf8')
  for (const marker of ["'@type': 'Brand'", 'rel="me"', '/feed.xml', '/.well-known/proofttl.json', 'ProofTTL Fact Audit']) {
    if (!layout.includes(marker)) throw new Error(`Root identity schema is missing ${marker}`)
  }

  const nav = await readFile('components/ProductNav.tsx', 'utf8')
  if (!nav.includes("{ href: '/about/', label: 'About' }")) throw new Error('Global navigation does not expose canonical About page')

  const vercel = await readFile('vercel.json', 'utf8')
  for (const marker of ['X-Robots-Tag', '/workspace/:path*', '/studio/:path*', 'X-Frame-Options']) {
    if (!vercel.includes(marker)) throw new Error(`Vercel search/security boundary is missing ${marker}`)
  }

  console.log('SUCCESS: ProofTTL discovery identity, brand disambiguation, feed, sitemaps, and index boundaries are internally consistent.')
}

main().catch((error) => {
  console.error('DISCOVERY IDENTITY CHECK FAILED:', error?.message || error)
  process.exitCode = 1
})
