import { readFile } from 'node:fs/promises'

const homePage = await readFile('app/page.tsx', 'utf8')
const home = await readFile('components/CommercialHome.tsx', 'utf8')
const auditPage = await readFile('app/audit/page.tsx', 'utf8')
const auditStatusPage = await readFile('app/audit/status/page.tsx', 'utf8')
const intake = await readFile('components/AuditIntakeForm.tsx', 'utf8')
const status = await readFile('components/AuditStatusLookup.tsx', 'utf8')
const nav = await readFile('components/ProductNav.tsx', 'utf8')

for (const expected of [
  'Find the expensive wrong answer',
  'Start the $1,500 Fact Audit',
  'UP TO 25 OUTPUTS',
  'HUMAN APPROVAL',
  '/audit/sample/',
  'SCOPE CONFIRMED BEFORE PAYMENT',
  '/audit/#audit-intake',
  'No raw card number is stored by ProofTTL',
]) {
  if (!home.includes(expected)) throw new Error(`Homepage missing required conversion behavior: ${expected}`)
}
for (const obsolete of ['$129', '$500', 'Stress Test', 'Start small. Upgrade']) if (home.includes(obsolete)) throw new Error(`Homepage still exposes obsolete launch offer: ${obsolete}`)

for (const expected of ["alternates: { canonical: '/' }", 'CommercialHome']) {
  if (!homePage.includes(expected)) throw new Error(`Homepage metadata wrapper missing required search behavior: ${expected}`)
}
if (home.includes('RUN TESTNET VERIFICATION')) throw new Error('Commercial homepage must not expose the technical testnet verifier')
if (home.includes('Base Sepolia') || home.includes('x402')) throw new Error('Commercial homepage must not mix protocol testnet payment language into the paid human service')
if (home.includes('<nav className="nav shell"')) throw new Error('Homepage regressed to duplicate local navigation')
if (home.includes('brand-mark">P')) throw new Error('Homepage regressed to legacy P branding')

for (const expected of [
  'AuditIntakeForm',
  '$1,500 Fact Audit',
  'Up to 25 real outputs',
  'HUMAN APPROVAL',
  '7-DAY WATCH',
  'SCOPE',
  '3–5 business days',
]) {
  if (!auditPage.includes(expected)) throw new Error(`Audit sales page missing required sellability behavior: ${expected}`)
}
for (const obsolete of ['$129', '$500', 'Claim Stress Test', '$371 more']) if (auditPage.includes(obsolete)) throw new Error(`Audit sales page still exposes obsolete launch offer: ${obsolete}`)
if (auditPage.includes('mailto:')) throw new Error('Audit sales page regressed to mailto intake')

for (const expected of [
  '/audit/intake',
  'offer_type',
  'full_audit',
  'company_or_project',
  'claim_scope',
  'approximate_claims',
  'why_it_matters',
  'SCOPE REVIEW',
  'audit_intake_id',
  'company_site',
  '$1,500',
  'up to 25 outputs / claims',
  'AUDIT_DRAFT_KEY',
  'localStorage.setItem(AUDIT_DRAFT_KEY',
  'requireSession',
  'rememberAuthReturn',
  'signInHref',
  "credentials: 'include'",
  "window.location.hash === '#audit-intake'",
  'onPointerDownCapture={gatePointer}',
  'onFocusCapture={gateFocus}',
  'SIGN IN TO START FACT AUDIT',
  'SCOPE CONFIRMED BEFORE PAYMENT',
  'HUMAN APPROVAL REQUIRED',
  'const formElement = event.currentTarget',
  'new FormData(formElement)',
  'INTAKE_TIMEOUT_MS',
  'controller.abort()',
]) {
  if (!intake.includes(expected)) throw new Error(`Audit intake component missing required field/behavior: ${expected}`)
}
for (const obsolete of ['stress_test', '$129', '$500', '$371 more']) if (intake.includes(obsolete)) throw new Error(`Audit intake still exposes obsolete launch offer: ${obsolete}`)

const captureTargetIndex = intake.indexOf('const formElement = event.currentTarget')
const firstSubmitAwaitIndex = intake.indexOf('await requireSession()')
const submittingTrueIndex = intake.indexOf('setSubmitting(true)')
const tryIndex = intake.indexOf('    try {', submittingTrueIndex)
if (captureTargetIndex < 0 || firstSubmitAwaitIndex < 0 || captureTargetIndex > firstSubmitAwaitIndex) {
  throw new Error('Audit submit must capture event.currentTarget before its first await to prevent a stranded submit state')
}
if (submittingTrueIndex < 0 || tryIndex < 0 || tryIndex < submittingTrueIndex) {
  throw new Error('Audit submit must enter protected request handling after setting the submitting state')
}
if (!intake.includes('finally {\n      window.clearTimeout(timeout)\n      setSubmitting(false)')) {
  throw new Error('Audit submit must always clear its timeout and release the submitting state')
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
  '<span>Fact Audit</span>',
]) {
  if (!status.includes(expected)) throw new Error(`Audit status component missing secure return behavior: ${expected}`)
}
for (const obsolete of ['Claim Stress Test', 'Full Verification Audit', 'Upgrade credit', 'Stress Test payment credited', '$129', '$371 more', '$500']) {
  if (status.includes(obsolete)) throw new Error(`Audit status still exposes obsolete launch offer: ${obsolete}`)
  if (auditStatusPage.includes(obsolete)) throw new Error(`Audit status metadata still exposes obsolete launch offer: ${obsolete}`)
}
if (!auditStatusPage.includes('ProofTTL Fact Audit request')) throw new Error('Audit status metadata must describe the current Fact Audit offer')
if (status.includes(".catch(() => {\n      if (!cancelled) setAuthReady(true)")) throw new Error('Audit status must never fail open when session lookup fails')
if (!nav.includes('Log out / Switch account')) throw new Error('Signed-in navigation must expose Log out / Switch account')
if (!nav.includes('signInHref(returnTo)')) throw new Error('Account switching must preserve the current return location')

console.log('SUCCESS: ProofTTL authenticated $1,500 Fact Audit funnel passed saved-draft, sign-in-gate, non-stranding submit, return-to-page, secure-status, buyer-focused homepage, canonical metadata, human-approval, and scope-before-payment checks.')
