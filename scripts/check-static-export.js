import { access, readFile } from 'node:fs/promises'

const requiredFiles = [
  'out/index.html',
  'out/login/index.html',
  'out/onboarding/index.html',
  'out/get-started/index.html',
  'out/console/index.html',
  'out/support/index.html',
  'out/solutions/index.html',
  'out/solutions/fact-verification-api/index.html',
  'out/solutions/claim-verification-api/index.html',
  'out/solutions/ai-agent-verification/index.html',
  'out/solutions/source-monitoring-api/index.html',
  'out/solutions/stale-data-detection/index.html',
  'out/solutions/evidence-verification-api/index.html',
  'out/solutions/x402-verification-api/index.html',
  'out/solutions/fact-leases/index.html',
  'out/robots.txt',
  'out/_headers',
]

async function main() {
  for (const file of requiredFiles) {
    await access(file)
    console.log(`PASS static export: ${file}`)
  }

  const homepage = await readFile('out/index.html', 'utf8')
  for (const expected of ['ProofTTL', 'Truth with', 'Sign in', 'Talk to ProofTTL Assistant']) {
    if (!homepage.includes(expected)) {
      throw new Error(`Static homepage is missing expected content: ${expected}`)
    }
  }

  const consolePage = await readFile('out/console/index.html', 'utf8')
  for (const expected of ['CUSTOMER CONSOLE', 'Talk to ProofTTL Assistant']) {
    if (!consolePage.includes(expected)) {
      throw new Error(`Static console is missing expected content: ${expected}`)
    }
  }

  const solution = await readFile('out/solutions/ai-agent-verification/index.html', 'utf8')
  for (const expected of ['AI Agent', 'ProofTTL', 'Fact Lease', 'Talk to ProofTTL Assistant']) {
    if (!solution.includes(expected)) {
      throw new Error(`Static solution page is missing expected content: ${expected}`)
    }
  }

  const robots = await readFile('out/robots.txt', 'utf8')
  for (const expected of ['Allow: /', 'Disallow: /console/', 'Disallow: /login/']) {
    if (!robots.includes(expected)) {
      throw new Error(`robots.txt is missing expected crawl rule: ${expected}`)
    }
  }

  const headers = await readFile('out/_headers', 'utf8')
  for (const expected of [
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Permissions-Policy:',
  ]) {
    if (!headers.includes(expected)) {
      throw new Error(`Static export is missing expected security header rule: ${expected}`)
    }
  }

  console.log('\nSUCCESS: ProofTTL static export contains all required public/app preview routes, search-intent pages, voice assistant trigger, crawl rules, and Pages security headers.')
}

main().catch((error) => {
  console.error('\nSTATIC EXPORT CHECK FAILED:', error.message || error)
  process.exitCode = 1
})
