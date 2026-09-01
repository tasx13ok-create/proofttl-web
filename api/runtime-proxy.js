const RUNTIME_UPSTREAM = 'https://proofttl.tasx13ok.workers.dev'
const UPSTREAM_TIMEOUT_MS = 15000

// Production browser runtime is intentionally narrow. Legacy assistant, studio,
// automation, file, command, foundry, and general-purpose execution surfaces
// are not reachable through the public ProofTTL origin.
const ALLOWED_PATHS = [
  /^\.well-known\/proofttl-auth\.json$/,
  /^account\/(?:preferences|audits)$/i,
  /^audit\/intake(?:\/status)?$/,
]

function copyRequestHeaders(request) {
  const headers = {}
  for (const [key, value] of Object.entries(request.headers || {})) {
    if (value == null) continue
    const lower = key.toLowerCase()
    if (lower === 'host' || lower === 'content-length' || lower === 'connection') continue
    headers[key] = Array.isArray(value) ? value.join(', ') : String(value)
  }
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

function cleanPath(value) {
  return String(value || '').trim().replace(/^\/+|\/+$/g, '')
}

function runtimePathFromRequest(request) {
  const value = request.query?.path
  const fromQuery = cleanPath(Array.isArray(value) ? value.join('/') : value)
  if (fromQuery && !fromQuery.startsWith('$')) return fromQuery

  const routeMatches = request.headers?.['x-now-route-matches']
  if (routeMatches) {
    const matches = new URLSearchParams(String(routeMatches))
    const fromRoute = cleanPath(matches.get('runtimepath') || matches.get('path'))
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
      const marker = '/api/runtime/'
      const index = pathname.indexOf(marker)
      if (index >= 0) return cleanPath(pathname.slice(index + marker.length))
    } catch {}
  }

  return ''
}

function allowedRuntimePath(path) {
  return Boolean(path) && !path.includes('..') && ALLOWED_PATHS.some((pattern) => pattern.test(path))
}

export const config = {
  api: { bodyParser: false },
}

export default async function handler(request, response) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

  try {
    const path = runtimePathFromRequest(request)
    if (!allowedRuntimePath(path)) {
      response.statusCode = 404
      response.setHeader('cache-control', 'no-store')
      response.end('Not found')
      return
    }

    const incoming = new URL(request.url || '/', 'https://proofttl-web.vercel.app')
    incoming.searchParams.delete('path')
    const query = incoming.searchParams.toString()
    const target = `${RUNTIME_UPSTREAM}/${path}${query ? `?${query}` : ''}`
    const method = String(request.method || 'GET').toUpperCase()
    const body = method === 'GET' || method === 'HEAD' ? undefined : await rawBody(request)

    const upstream = await fetch(target, {
      method,
      headers: copyRequestHeaders(request),
      body,
      redirect: 'manual',
      signal: controller.signal,
    })

    response.statusCode = upstream.status

    for (const [key, value] of upstream.headers.entries()) {
      const lower = key.toLowerCase()
      if (lower === 'content-encoding' || lower === 'content-length' || lower === 'transfer-encoding' || lower === 'connection' || lower === 'set-cookie') continue
      response.setHeader(key, value)
    }

    const setCookies = typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : []
    if (setCookies.length) response.setHeader('set-cookie', setCookies)
    else {
      const cookie = upstream.headers.get('set-cookie')
      if (cookie) response.setHeader('set-cookie', cookie)
    }

    response.setHeader('cache-control', 'no-store')
    response.end(Buffer.from(await upstream.arrayBuffer()))
  } catch (error) {
    const timedOut = error?.name === 'AbortError' || controller.signal.aborted
    console.error('ProofTTL runtime proxy failed', error)
    response.statusCode = timedOut ? 504 : 502
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.setHeader('cache-control', 'no-store')
    response.end(JSON.stringify({ error: timedOut ? 'runtime_upstream_timeout' : 'runtime_proxy_failed' }))
  } finally {
    clearTimeout(timeout)
  }
}
