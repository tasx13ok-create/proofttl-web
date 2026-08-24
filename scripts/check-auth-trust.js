import { readFile } from 'node:fs/promises'

const login = await readFile('components/AuthLoginPanel.tsx', 'utf8')
const trust = await readFile('components/TrustCenter.tsx', 'utf8')
const auth = await readFile('lib/proofttl-auth.ts', 'utf8')
const vercel = await readFile('vercel.json', 'utf8')
const proxy = await readFile('api/auth-proxy.js', 'utf8')

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
  'CUSTOMER ACCOUNT SECURITY',
  "body?.sign_in?.github",
  "body?.sign_in?.google",
  "body?.sign_in?.passkey",
  '/.well-known/proofttl-auth.json',
  'HttpOnly sessions',
  'CSRF protection',
  'PAYMENT + DELIVERY BOUNDARY',
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
  'AUTH_RETURN_KEY',
  'rememberAuthReturn',
  'resolveAuthReturn',
]) {
  if (!auth.includes(expected)) throw new Error(`Auth client behavior missing: ${expected}`)
}

for (const expected of [
  "const AUTH_UPSTREAM = 'https://proofttl.tasx13ok.workers.dev'",
  'cleanAuthPath',
  '/api/auth/',
  'bodyParser: false',
  "redirect: 'manual'",
  'upstreamCookies',
  'browserCookie',
  'browserLocation',
  ".replace(/;\\s*Domain=[^;]+/ig, '')",
  ".replace(/;\\s*Path=\\/api\\/auth(?:\\/)?/ig, '; Path=/')",
  "response.setHeader('set-cookie'",
  "response.setHeader('cache-control', 'no-store')",
]) {
  if (!proxy.includes(expected)) throw new Error(`First-party auth proxy missing: ${expected}`)
}

for (const expected of [
  '^/api/auth/(?<authpath>.*)$',
  '/api/auth-proxy.js?path=$authpath',
  '^/api/runtime/(?<runtimepath>.*)$',
  '/api/runtime-proxy.js?path=$runtimepath',
]) {
  if (!vercel.includes(expected)) throw new Error(`Vercel first-party auth/runtime route missing: ${expected}`)
}

if (vercel.includes('https://proofttl.tasx13ok.workers.dev/api/auth/:path*')) throw new Error('Legacy external auth rewrite must not shadow the first-party auth function')
if (login.includes('type="password"')) throw new Error('Password field must not appear in ProofTTL login')
if (auth.includes('baseURL: PROOFTTL_API_URL')) throw new Error('Browser auth regressed to cross-site Worker origin')
if (proxy.includes('x-proofttl-auth-path') || proxy.includes('auth_proxy_path_missing')) throw new Error('Auth proxy diagnostic output must not ship')
if (/Domain=proofttl\.tasx13ok\.workers\.dev/i.test(proxy) && !proxy.includes('replace')) throw new Error('Auth proxy contains a hard-coded upstream cookie domain without normalization')

console.log('SUCCESS: first-party GitHub, Google, Discord, passkey, cookie normalization, return-to-page, and buyer-facing Trust security surfaces passed release checks.')
