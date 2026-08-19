import { readFile } from 'node:fs/promises'

const login = await readFile('components/AuthLoginPanel.tsx', 'utf8')
const trust = await readFile('public/trust.html', 'utf8')
const auth = await readFile('lib/proofttl-auth.ts', 'utf8')

for (const expected of [
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
  'Google OAuth / Discord OAuth / WebAuthn passkeys',
  'Secure HttpOnly cookies',
  'Trusted-origin allowlist + CSRF protection',
  '/.well-known/proofttl-auth.json',
  'TRUSTED CUSTOMER AUTH READY',
]) {
  if (!trust.includes(expected)) throw new Error(`Trust Center auth surface missing: ${expected}`)
}

for (const expected of [
  'twoFactorClient',
  'passkeyClient',
  "provider, callbackURL",
  "credentials: 'include'",
]) {
  if (!auth.includes(expected)) throw new Error(`Auth client behavior missing: ${expected}`)
}

if (login.includes('type="password"')) throw new Error('Password field must not appear in ProofTTL login')

console.log('SUCCESS: Google, Discord, passkey, and trust security surfaces passed release checks.')
