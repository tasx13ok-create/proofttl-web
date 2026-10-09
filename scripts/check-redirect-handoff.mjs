import { access, readFile } from 'node:fs/promises'

async function read(path) {
  await access(path)
  return readFile(path, 'utf8')
}

async function expect(path, markers) {
  const source = await read(path)
  for (const marker of markers) {
    if (!source.includes(marker)) throw new Error(`${path} is missing required handoff marker: ${marker}`)
  }
  return source
}

async function main() {
  const page = await expect('app/verify/page.tsx', [
    "alternates: { canonical: '/verify/' }",
    'VerifyHandoff',
    'Do not submit confidential claims',
    'does not run an audit or charge you',
  ])
  const component = await expect('components/VerifyHandoff.tsx', [
    "name: 'proofttl_verify_claim'",
    "const MCP_ENDPOINT = 'https://proofttl-web.vercel.app/api/mcp/'",
    'navigator.clipboard.writeText',
    'payment boundary',
    'payment_signature',
    'Do not sign, settle, or retry payment without my explicit approval.',
    'source_url: sourceUrl.trim()',
  ])
  if (component.includes("fetch(MCP_ENDPOINT")) throw new Error('Handoff must not submit claims automatically')
  if (component.includes('payment_signature:')) throw new Error('Handoff must not fabricate or collect payment authorization')
  if (page.includes('payment_signature')) throw new Error('Public page source must not expose a payment signature field')

  const nav = await expect('components/ProductNav.tsx', ["{ href: '/verify/', label: 'Verify a claim' }"])
  const home = await expect('public/proof-home.html', ['href="/verify/">Prepare a verification request'])
  const sitemap = await expect('app/sitemap.ts', ["'/verify/'"])
  await expect('public/sitemap.txt', ['https://proofttl-web.vercel.app/verify/'])
  await expect('public/llms.txt', ['Verify a claim / MCP handoff: https://proofttl-web.vercel.app/verify/'])
  await expect('public/llms-full.txt', ['Claim handoff / MCP entry: https://proofttl-web.vercel.app/verify/'])

  const exported = await expect('out/verify/index.html', [
    'Send the claim.',
    'Prepare a verification request',
    'proofttl_verify_claim',
    'Nothing has been submitted, verified, or charged.',
    'SUPPORT',
  ])
  if (exported.includes('payment_signature')) throw new Error('Exported handoff must not render payment-signature handling')
  console.log('PASS: ProofTTL redirect-to-verification handoff, explicit payment boundary, navigation, and discovery surfaces.')
}

main().catch((error) => {
  console.error('REDIRECT HANDOFF CHECK FAILED:', error.message || error)
  process.exitCode = 1
})
