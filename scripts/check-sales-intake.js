import { readFile } from 'node:fs/promises'

const auditPage = await readFile('app/audit/page.tsx', 'utf8')
const intake = await readFile('components/AuditIntakeForm.tsx', 'utf8')

for (const expected of [
  "AuditIntakeForm",
  'START A $500 AUDIT',
  '#audit-intake',
  'SCOPE CONFIRMED BEFORE PAYMENT',
]) {
  if (!auditPage.includes(expected)) throw new Error(`Audit sales page missing required sellability behavior: ${expected}`)
}

if (auditPage.includes('mailto:')) throw new Error('Audit sales page regressed to mailto intake')

for (const expected of [
  '/audit/intake',
  'company_or_project',
  'claim_scope',
  'approximate_claims',
  'why_it_matters',
  'SUBMIT FOR SCOPE REVIEW',
  'audit_intake_id',
  'company_site',
]) {
  if (!intake.includes(expected)) throw new Error(`Audit intake component missing required field/behavior: ${expected}`)
}

console.log('SUCCESS: ProofTTL paid-audit structured intake funnel passed release checks.')
