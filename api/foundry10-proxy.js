const FOUNDRY_UPSTREAM = 'https://evrsofjaaudibnihjafb.supabase.co/functions/v1/foundry10-api'
const UPSTREAM_TIMEOUT_MS = 15000

const ALLOWED_PATHS = [
  /^health$/,
  /^state$/,
  /^world-state$/,
  /^tick$/,
  /^controls$/,
  /^revenue$/,
  /^discover$/,
  /^approval\/[0-9a-f-]{36}$/i,
  /^experiment\/[0-9a-f-]{36}\/kill$/i,
  /^experiment\/[0-9a-f-]{36}\/checkout$/i,
]

function cleanPath(value) {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '')
}

function pathFromRequest(request) {
  const value = request.query?.path
  const fromQuery = cleanPath(Array.isArray(value) ? value.join('/') : value)
  if (fromQuery && !fromQuery.startsWith('$')) return fromQuery

  const routeMatches = request.headers?.['x-now-route-matches']
  if (routeMatches) {
    const matches = new URLSearchParams(String(routeMatches))
    const fromRoute = cleanPath(matches.get('f10path') || matches.get('path'))
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
      const pathname = new URL(String(candidate), 'https://proofttl-web.vercel.app').pathname
      const marker = '/api/foundry10/'
      const index = pathname.indexOf(marker)
      if (index >= 0) return cleanPath(pathname.slice(index + marker.length))
    } catch {}
  }
  return ''
}

function expectedOrigin(request) {
  const proto = String(request.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim()
  const host = String(request.headers?.['x-forwarded-host'] || request.headers?.host || '').split(',')[0].trim()
  return host ? `${proto}://${host}` : ''
}

function sameOriginMutation(request) {
  const method = String(request.method || 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return true
  const origin = String(request.headers?.origin || '').trim()
  const expected = expectedOrigin(request)
  return Boolean(origin && expected && origin === expected)
}

function rawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

function upstreamHeaders(request) {
  const headers = {
    accept: 'application/json',
    'user-agent': 'proofttl-foundry10-proxy/1',
  }
  const contentType = request.headers?.['content-type']
  const cookie = request.headers?.cookie
  if (contentType) headers['content-type'] = String(contentType)
  if (cookie) headers.cookie = String(cookie)
  return headers
}

export const config = {
  api: { bodyParser: false },
}

export default async function handler(request, response) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  try {
    const path = pathFromRequest(request)
    if (!path || path.includes('..') || !ALLOWED_PATHS.some((pattern) => pattern.test(path))) {
      response.statusCode = 404
      response.setHeader('cache-control', 'no-store')
      response.end('Not found')
      return
    }

    if (!sameOriginMutation(request)) {
      response.statusCode = 403
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.setHeader('cache-control', 'no-store')
      response.end(JSON.stringify({ error: 'cross_origin_mutation_blocked' }))
      return
    }

    const incoming = new URL(request.url || '/', expectedOrigin(request) || 'https://proofttl-web.vercel.app')
    incoming.searchParams.delete('path')
    const query = incoming.searchParams.toString()
    const target = `${FOUNDRY_UPSTREAM}/${path}${query ? `?${query}` : ''}`
    const method = String(request.method || 'GET').toUpperCase()
    const body = method === 'GET' || method === 'HEAD' ? undefined : await rawBody(request)

    const upstream = await fetch(target, {
      method,
      headers: upstreamHeaders(request),
      body,
      redirect: 'manual',
      signal: controller.signal,
    })

    response.statusCode = upstream.status
    response.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
    response.setHeader('cache-control', 'private, no-store')
    response.setHeader('x-content-type-options', 'nosniff')
    response.end(Buffer.from(await upstream.arrayBuffer()))
  } catch (error) {
    const timedOut = error?.name === 'AbortError' || controller.signal.aborted
    console.error('FOUNDRY-10 proxy failed', error)
    response.statusCode = timedOut ? 504 : 502
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.setHeader('cache-control', 'no-store')
    response.end(JSON.stringify({ error: timedOut ? 'foundry_upstream_timeout' : 'foundry_proxy_failed' }))
  } finally {
    clearTimeout(timeout)
  }
}
