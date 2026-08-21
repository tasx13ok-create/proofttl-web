const AUTH_UPSTREAM = 'https://proofttl.tasx13ok.workers.dev'

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

function authPathFromRequest(request) {
  const value = request.query?.path
  const fromQuery = Array.isArray(value) ? value.join('/') : String(value || '')
  if (fromQuery) return fromQuery

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
      const marker = '/api/auth/'
      const index = pathname.indexOf(marker)
      if (index >= 0) return pathname.slice(index + marker.length)
    } catch {}
  }
  return ''
}

export const config = {
  api: { bodyParser: false },
}

export default async function handler(request, response) {
  try {
    const path = authPathFromRequest(request)
    if (!path || path.includes('..') || path.startsWith('$')) {
      response.statusCode = 422
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.setHeader('cache-control', 'no-store')
      response.end(JSON.stringify({
        error: 'auth_proxy_path_missing',
        resolvedPath: path || null,
        url: request.url || null,
        query: request.query || null,
        routing: {
          originalPath: request.headers?.['x-vercel-original-path'] || null,
          originalUri: request.headers?.['x-original-uri'] || null,
          rewriteUrl: request.headers?.['x-rewrite-url'] || null,
          invokePath: request.headers?.['x-invoke-path'] || null,
          matchedPath: request.headers?.['x-matched-path'] || null,
          routeMatches: request.headers?.['x-now-route-matches'] || null,
        },
      }))
      return
    }

    const incoming = new URL(request.url || '/', 'https://proofttl-web.vercel.app')
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
    console.error('ProofTTL auth proxy failed', error)
    response.statusCode = 502
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.setHeader('cache-control', 'no-store')
    response.end(JSON.stringify({ error: 'auth_proxy_failed' }))
  }
}
