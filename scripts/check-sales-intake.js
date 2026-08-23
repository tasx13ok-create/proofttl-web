import { readFile } from 'node:fs/promises'

const homePage = await readFile('app/page.tsx', 'utf8')
const home = await readFile('components/HomeClient.tsx', 'utf8')
const auditPage = await readFile('app/audit/page.tsx', 'utf8')
const intake = await readFile('components/AuditIntakeForm.tsx', 'utf8')
const status = await readFile('components/AuditStatusLookup.tsx', 'utf8')
const nav = await readFile('components/ProductNav.tsx', 'utf8')

for (const expected of [
  'Find the claim that breaks',
  'Stress-test 3–5 claims — $129',
  'Full audit — $500',
  '/audit/sample/',
  'SCOPE CONFIRMED BEFORE PAYMENT',
]) {
  if (!home.includes(expected)) throw new Error(`Homepage missing required conversion behavior: ${expected}`)
}

for (const expected of [
  "alternates: { canonical: '/' }",
  'HomeClient',
]) {
  if (!homePage.includes(expected)) throw new Error(`Homepage metadata wrapper missing required search behavior: ${expected}`)
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
  'AUDIT_DRAFT_KEY',
  'localStorage.setItem(AUDIT_DRAFT_KEY',
  'requireSession',
  'rememberAuthReturn',
  'signInHref',
  "credentials: 'include'",
  "window.location.hash === '#audit-intake'",
  'onPointerDownCapture={gatePointer}',
  'onFocusCapture={gateFocus}',
  'SIGN IN TO START VERIFICATION',
  'SIGN-IN REQUIRED TO USE AUDIT INTAKE',
  'DRAFT SAVED LOCALLY',
  'SCOPE REVIEW BEFORE PAYMENT',
]) {
  if (!intake.includes(expected)) throw new Error(`Audit intake component missing required field/behavior: ${expected}`)
}

for (const expected of [
  'authClient.getSession',
  "type AuthState = 'checking' | 'signed_in' | 'signed_out' | 'error'",
  'rememberAuthReturn',
  'signInHref',
  "credentials: 'include'",
  'Session check unavailable.',
  'pollAfterPayment',
  'Payment confirmed by Stripe',
  'Older requests can be claimed automatically',
]) {
  if (!status.includes(expected)) throw new Error(`Audit status component missing secure return behavior: ${expected}`)
}
if (status.includes(".catch(() => {\n      if (!cancelled) setAuthReady(true)")) throw new Error('Audit status must never fail open when session lookup fails')

if (!nav.includes('Log out / Switch account')) throw new Error('Signed-in navigation must expose Log out / Switch account')
if (!nav.includes('signInHref(returnTo)')) throw new Error('Account switching must preserve the current return location')

console.log('SUCCESS: ProofTTL authenticated two-tier paid verification funnel passed saved-draft, sign-in-gate, return-to-page, secure-status, homepage canonical, and scope-before-payment checks.')
