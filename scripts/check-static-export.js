import { access, readFile } from 'node:fs/promises'

const requiredFiles = [
  'out/index.html',
  'out/login/index.html',
  'out/onboarding/index.html',
  'out/get-started/index.html',
  'out/console/index.html',
  'out/support/index.html',
  'out/_headers',
]

async function main() {
  for (const file of requiredFiles) {
    await access(file)
    console.log(`PASS static export: ${file}`)
  }

  const homepage = await readFile('out/index.html', 'utf8')
  for (const expected of ['ProofTTL', 'Truth with', 'Sign in']) {
    if (!homepage.includes(expected)) {
      throw new Error(`Static homepage is missing expected content: ${expected}`)
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

  console.log('\nSUCCESS: ProofTTL static export contains all required public/app preview routes and Pages security headers.')
}

main().catch((error) => {
  console.error('\nSTATIC EXPORT CHECK FAILED:', error.message || error)
  process.exitCode = 1
})
