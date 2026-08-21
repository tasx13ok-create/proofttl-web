const AUTH_UPSTREAM = 'https://proofttl.tasx13ok.workers.dev'
const DEFAULT_WEB_ORIGIN = 'https://proofttl-web.vercel.app'

function requestWebOrigin(request) {
  const forwardedHost = String(request.headers?.['x-forwarded-host'] || '').split(',')[0].trim()
  const host = forwardedHost || String(request.headers?.host || '').trim()
  if (!host) return DEFAULT_WEB_ORIGIN
  const proto = String(request.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim() || 'https'
  return `${proto}://${host}`
}

function copyRequestHeaders(request) {
  const headers = {}
  for (const [key, value] of Object.entries(request.headers || {})) {
    if (value == null) continue
    const lower = key.toLowerCase()
    if (lower === 'host' || lower === 'content-length' || lower === 'connection') continue
    headers[key] = Array.isArray(value) ? value.join(', ') : String(value)
  }
  const webOrigin = requestWebOrigin(request)
  const webUrl = new URL(webOrigin)
  headers['x-forwarded-host'] = webUrl.host
  headers['x-forwarded-proto'] = webUrl.protocol.replace(':', '')
  return headers
}

function rawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

function cleanAuthPath(value) {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '')
}

function authPathFromRequest(request) {
  const value = request.query?.path
  const fromQuery = cleanAuthPath(Array.isArray(value) ? value.join('/') : value)
  if (fromQuery && !fromQuery.startsWith('$')) return fromQuery

  const routeMatches = request.headers?.['x-now-route-matches']
  if (routeMatches) {
    const matches = new URLSearchParams(String(routeMatches))
    const fromRoute = cleanAuthPath(matches.get('authpath') || matches.get('path'))
    if (fromRoute) return fromRoute
  }

  const candidates = [
    request.headers?.['x-vercel-original-path'],
    request.headers?.['x-original-uri'],
    request.headers?.['x-rewrite-url'],
    request.headers?.['x-invoke-path'],
    request.url,
  ]
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const pathname = new URL(String(candidate), DEFAULT_WEB_ORIGIN).pathname
      const marker = '/api/auth/'
      const index = pathname.indexOf(marker)
      if (index >= 0) return cleanAuthPath(pathname.slice(index + marker.length))
    } catch {}
  }
  return ''
}

function splitSetCookieHeader(raw) {
  if (!raw) return []
  return String(raw).split(/,(?=\s*[^;,=\s]+=[^;,]*)/g).map((value) => value.trim()).filter(Boolean)
}

function upstreamCookies(headers) {
  if (typeof headers.getSetCookie === 'function') {
    const values = headers.getSetCookie()
    if (Array.isArray(values) && values.length) return values
  }
  return splitSetCookieHeader(headers.get('set-cookie'))
}

function browserCookie(cookie) {
  return String(cookie)
    .replace(/;\s*Domain=[^;]+/ig, '')
    .replace(/;\s*Path=\/api\/auth(?:\/)?/ig, '; Path=/')
}

function browserLocation(location, webOrigin) {
  if (!location) return location
  try {
    const target = new URL(location, AUTH_UPSTREAM)
    if (target.origin === AUTH_UPSTREAM) return `${webOrigin}${target.pathname}${target.search}${target.hash}`
  } catch {}
  return location
}

export const config = {
  api: { bodyParser: false },
}

export default async function handler(request, response) {
  try {
    const path = authPathFromRequest(request)
    if (!path || path.includes('..')) {
      response.statusCode = 404
      response.setHeader('cache-control', 'no-store')
      response.end('Not found')
      return
    }

    const webOrigin = requestWebOrigin(request)
    const incoming = new URL(request.url || '/', webOrigin)
    incoming.searchParams.delete('path')
    const query = incoming.searchParams.toString()
    const target = `${AUTH_UPSTREAM}/api/auth/${path}${query ? `?${query}` : ''}`
    const method = String(request.method || 'GET').toUpperCase()
    const body = method === 'GET' || method === 'HEAD' ? undefined : await rawBody(request)

    const upstream = await fetch(target, {
      method,
      headers: copyRequestHeaders(request),
      body,
      redirect: 'manual',
    })

    response.statusCode = upstream.status

    for (const [key, value] of upstream.headers.entries()) {
      const lower = key.toLowerCase()
      if (lower === 'content-encoding' || lower === 'content-length' || lower === 'transfer-encoding' || lower === 'connection' || lower === 'set-cookie' || lower === 'location') continue
      response.setHeader(key, value)
    }

    const cookies = upstreamCookies(upstream.headers).map(browserCookie)
    if (cookies.length) response.setHeader('set-cookie', cookies)

    const location = browserLocation(upstream.headers.get('location'), webOrigin)
    if (location) response.setHeader('location', location)

    response.setHeader('cache-control', 'no-store')
    response.end(Buffer.from(await upstream.arrayBuffer()))
  } catch (error) {
    console.error('ProofTTL auth proxy failed', error)
    response.statusCode = 502
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.setHeader('cache-control', 'no-store')
    response.end(JSON.stringify({ error: 'auth_proxy_failed' }))
  }
}
