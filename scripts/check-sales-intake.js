import { readFile } from 'node:fs/promises'

const home = await readFile('app/page.tsx', 'utf8')
const auditPage = await readFile('app/audit/page.tsx', 'utf8')
const intake = await readFile('components/AuditIntakeForm.tsx', 'utf8')

for (const expected of [
  'Find the claim that breaks',
  'Stress-test 3–5 claims — $129',
  'Full audit — $500',
  '/audit/sample/',
  'SCOPE CONFIRMED BEFORE PAYMENT',
]) {
  if (!home.includes(expected)) throw new Error(`Homepage missing required conversion behavior: ${expected}`)
}

if (home.includes('<nav className="nav shell"')) throw new Error('Homepage regressed to duplicate local navigation')
if (home.includes('brand-mark">P')) throw new Error('Homepage regressed to legacy P branding')

for (const expected of [
  'AuditIntakeForm',
  'Claim Stress Test',
  '$129',
  'Full Verification Audit',
  '$500',
  '$371 more',
  '#audit-intake',
  'SCOPE BEFORE PAYMENT',
  '48-hour turnaround',
  '3–5 business-day turnaround',
]) {
  if (!auditPage.includes(expected)) throw new Error(`Audit sales page missing required sellability behavior: ${expected}`)
}

if (auditPage.includes('mailto:')) throw new Error('Audit sales page regressed to mailto intake')

for (const expected of [
  '/audit/intake',
  'offer_type',
  'stress_test',
  'full_audit',
  'company_or_project',
  'claim_scope',
  'approximate_claims',
  'why_it_matters',
  'SCOPE REVIEW',
  'audit_intake_id',
  'company_site',
  '$371 more',
  'No card. No commitment. Scope first.',
]) {
  if (!intake.includes(expected)) throw new Error(`Audit intake component missing required field/behavior: ${expected}`)
}

console.log('SUCCESS: ProofTTL clean two-tier paid verification funnel passed release checks.')