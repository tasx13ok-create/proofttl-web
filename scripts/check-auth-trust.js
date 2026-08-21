import { readFile } from 'node:fs/promises'

const login = await readFile('components/AuthLoginPanel.tsx', 'utf8')
const trust = await readFile('components/TrustCenter.tsx', 'utf8')
const auth = await readFile('lib/proofttl-auth.ts', 'utf8')
const vercel = await readFile('vercel.json', 'utf8')
const proxy = await readFile('api/auth/[...path].js', 'utf8')

for (const expected of [
  "id: 'github'",
  "id: 'google'",
  "id: 'discord'",
  'CONTINUE WITH PASSKEY',
  'secure_http_only_sessions',
  'csrf_protection',
  'origin_allowlist',
  'No ProofTTL password database',
]) {
  if (!login.includes(expected)) throw new Error(`Login trust surface missing: ${expected}`)
}

for (const expected of [
  'CUSTOMER AUTHENTICATION',
  "body?.sign_in?.github",
  "body?.sign_in?.google",
  "body?.sign_in?.discord",
  "body?.sign_in?.passkey",
  '/.well-known/proofttl-auth.json',
  'HttpOnly sessions',
  'CSRF protection',
  'TRUST BOUNDARY',
]) {
  if (!trust.includes(expected)) throw new Error(`Trust Center auth surface missing: ${expected}`)
}

for (const expected of [
  'twoFactorClient',
  'passkeyClient',
  "export type SocialProvider = 'github' | 'google' | 'discord'",
  'PROOFTTL_AUTH_URL',
  'window.location.origin',
  "provider, callbackURL",
  "credentials: 'include'",
]) {
  if (!auth.includes(expected)) throw new Error(`Auth client behavior missing: ${expected}`)
}

for (const expected of [
  "const AUTH_UPSTREAM = 'https://proofttl.tasx13ok.workers.dev'",
  '/api/auth/',
  'bodyParser: false',
  "redirect: 'manual'",
  "response.setHeader('set-cookie'",
]) {
  if (!proxy.includes(expected)) throw new Error(`First-party auth function missing: ${expected}`)
}

if (vercel.includes('https://proofttl.tasx13ok.workers.dev/api/auth/:path*')) throw new Error('Legacy external auth rewrite must not shadow the first-party auth function')
if (login.includes('type="password"')) throw new Error('Password field must not appear in ProofTTL login')
if (auth.includes('baseURL: PROOFTTL_API_URL')) throw new Error('Browser auth regressed to cross-site Worker origin')

console.log('SUCCESS: first-party GitHub, Google, Discord, passkey, and canonical Trust auth surfaces passed release checks.')
