import { readFile } from 'node:fs/promises'

const login = await readFile('components/AuthLoginPanel.tsx', 'utf8')
const trust = await readFile('components/TrustCenter.tsx', 'utf8')
const auth = await readFile('lib/proofttl-auth.ts', 'utf8')

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
  "provider, callbackURL",
  "credentials: 'include'",
]) {
  if (!auth.includes(expected)) throw new Error(`Auth client behavior missing: ${expected}`)
}

if (login.includes('type="password"')) throw new Error('Password field must not appear in ProofTTL login')

console.log('SUCCESS: GitHub, Google, Discord, passkey, and canonical Trust security surfaces passed release checks.')
