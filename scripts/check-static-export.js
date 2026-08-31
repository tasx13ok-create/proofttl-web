import { access, readFile } from 'node:fs/promises'

const requiredFiles = ['package.json','out/index.html','out/audit/index.html','out/audit/sample/index.html','out/audit/status/index.html','out/robots.txt','out/_headers','components/CommercialHome.tsx','components/AuditIntakeForm.tsx','scripts/check-public-sales-shell.js']

async function expect(file, values, label = file) {
  const text = await readFile(file, 'utf8')
  for (const value of values) if (!text.toLowerCase().includes(value.toLowerCase())) throw new Error(`${label} is missing expected content: ${value}`)
  return text
}

async function main() {
  for (const file of requiredFiles) { await access(file); console.log(`PASS static export: ${file}`) }
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'))
  if (packageJson.version !== '1.0.1') throw new Error(`ProofTTL web release version must be 1.0.1, got ${packageJson.version}`)

  const homepage = await expect('out/index.html', ['ProofTTL','Find the expensive wrong answer','Start the $1,500 Fact Audit','up to 25 outputs','human approval'], 'Homepage')
  for (const obsolete of ['$129','$500']) if (homepage.includes(obsolete)) throw new Error(`Homepage still exposes obsolete launch pricing: ${obsolete}`)
  if (homepage.includes('TESTNET PREVIEW')) throw new Error('Homepage leaked protocol preview messaging into the commercial funnel')

  const audit = await expect('out/audit/index.html', ['Fact Audit','$1,500','up to 25','7-day','human approval','/audit/sample/'], 'Audit')
  for (const obsolete of ['$129','$500']) if (audit.includes(obsolete)) throw new Error(`Audit still exposes obsolete launch pricing: ${obsolete}`)
  await expect('out/audit/sample/index.html', ['Sample Verification Audit','CONTRADICTED','PUBLIC DEMONSTRATION'], 'Sample audit')
  await expect('out/audit/status/index.html', ['SECURE AUDIT ACCESS','signed-in ProofTTL account'], 'Audit status auth gate')

  const intake = await expect('components/AuditIntakeForm.tsx', ['AUDIT_DRAFT_KEY','requireSession','signInHref','credentials: \'include\''], 'Audit intake')
  if (intake.includes('$129') || intake.includes('$500')) throw new Error('Audit intake still exposes obsolete pricing')

  const robots = await readFile('out/robots.txt', 'utf8')
  if (!robots.includes('Allow: /')) throw new Error('robots.txt must allow crawlers')
  const headers = await readFile('out/_headers', 'utf8')
  for (const expected of ['X-Content-Type-Options: nosniff','X-Frame-Options: DENY']) if (!headers.includes(expected)) throw new Error(`Static headers missing: ${expected}`)

  console.log('\nSUCCESS: flagship $1,500 Fact Audit funnel static export passed.')
}

main().catch((error) => { console.error('\nSTATIC EXPORT CHECK FAILED:', error.message || error); process.exitCode = 1 })
