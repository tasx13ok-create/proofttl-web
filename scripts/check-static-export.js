import { access, readFile } from 'node:fs/promises'

const requiredFiles = [
  'out/index.html',
  'out/login/index.html',
  'out/two-factor/index.html',
  'out/onboarding/index.html',
  'out/get-started/index.html',
  'out/console/index.html',
  'out/support/index.html',
  'out/docs/index.html',
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
  for (const expected of ['CUSTOMER CONSOLE', 'SECURITY', 'SECURITY BACKEND LOCKED', 'Talk to ProofTTL Assistant', 'noindex']) {
    if (!consolePage.toLowerCase().includes(expected.toLowerCase())) {
      throw new Error(`Static console is missing expected content: ${expected}`)
    }
  }

  const loginPage = await readFile('out/login/index.html', 'utf8')
  for (const expected of ['noindex', 'CONTINUE WITH GITHUB', 'TOTP', 'RECOVERY CODES', 'PASSKEYS']) {
    if (!loginPage.toLowerCase().includes(expected.toLowerCase())) {
      throw new Error(`Static login page is missing auth capability content: ${expected}`)
    }
  }

  const twoFactorPage = await readFile('out/two-factor/index.html', 'utf8')
  for (const expected of ['noindex', 'SECURITY CHECK', 'AUTHENTICATOR', 'RECOVERY CODE']) {
    if (!twoFactorPage.toLowerCase().includes(expected.toLowerCase())) {
      throw new Error(`Static two-factor page is missing expected content: ${expected}`)
    }
  }

  const onboardingPage = await readFile('out/onboarding/index.html', 'utf8')
  if (!onboardingPage.toLowerCase().includes('noindex')) {
    throw new Error('Static onboarding page is missing its noindex directive')
  }

  const docs = await readFile('out/docs/index.html', 'utf8')
  for (const expected of ['ProofTTL API Docs', 'HTTP 402', 'PAYMENT-REQUIRED', 'Fact Lease']) {
    if (!docs.includes(expected)) {
      throw new Error(`Static developer docs are missing expected content: ${expected}`)
    }
  }

  const solution = await readFile('out/solutions/ai-agent-verification/index.html', 'utf8')
  for (const expected of ['AI Agent', 'ProofTTL', 'Fact Lease', 'Talk to ProofTTL Assistant', '/docs/']) {
    if (!solution.includes(expected)) {
      throw new Error(`Static solution page is missing expected content: ${expected}`)
    }
  }

  const robots = await readFile('out/robots.txt', 'utf8')
  if (!robots.includes('Allow: /')) {
    throw new Error('robots.txt must allow crawlers to reach indexable pages and page-level noindex directives')
  }
  for (const forbidden of ['Disallow: /console/', 'Disallow: /login/', 'Disallow: /two-factor/', 'Disallow: /onboarding/']) {
    if (robots.includes(forbidden)) {
      throw new Error(`robots.txt blocks a page whose noindex directive must remain crawlable: ${forbidden}`)
    }
  }

  const headers = await readFile('out/_headers', 'utf8')
  for (const expected of [
    'X-Content-Type-Options: nosniff',
    'X-Frame-Options: DENY',
    'Permissions-Policy: camera=(), microphone=(self), geolocation=()',
  ]) {
    if (!headers.includes(expected)) {
      throw new Error(`Static export is missing expected security header rule: ${expected}`)
    }
  }
  if (headers.includes('microphone=()')) {
    throw new Error('Pages headers disable the ProofTTL voice assistant microphone')
  }

  console.log('\nSUCCESS: ProofTTL static export contains all required public/account routes, MFA challenge UI, Security Center locked state, developer docs, search-intent pages, voice assistant trigger, noindex rules, crawl rules, and microphone-safe Pages security headers.')
}

main().catch((error) => {
  console.error('\nSTATIC EXPORT CHECK FAILED:', error.message || error)
  process.exitCode = 1
})
