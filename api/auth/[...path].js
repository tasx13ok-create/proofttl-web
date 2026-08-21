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

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(request, response) {
  try {
    const pathValue = request.query?.path
    const path = Array.isArray(pathValue) ? pathValue.join('/') : String(pathValue || '')
    if (!path) {
      response.statusCode = 404
      response.end('Not found')
      return
    }

    const incoming = new URL(request.url || '/', 'https://proofttl-web.vercel.app')
    incoming.searchParams.delete('path')
    const target = `${AUTH_UPSTREAM}/api/auth/${path}${incoming.search}`
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
      if (lower === 'content-encoding' || lower === 'content-length' || lower === 'transfer-encoding' || lower === 'connection') continue
      if (lower === 'set-cookie') continue
      response.setHeader(key, value)
    }

    const getSetCookie = upstream.headers.getSetCookie?.bind(upstream.headers)
    const setCookies = getSetCookie ? getSetCookie() : []
    if (setCookies.length) response.setHeader('set-cookie', setCookies)
    else {
      const cookie = upstream.headers.get('set-cookie')
      if (cookie) response.setHeader('set-cookie', cookie)
    }

    const bytes = Buffer.from(await upstream.arrayBuffer())
    response.end(bytes)
  } catch (error) {
    console.error('ProofTTL auth proxy failed', error)
    response.statusCode = 502
    response.setHeader('content-type', 'application/json; charset=utf-8')
    response.setHeader('cache-control', 'no-store')
    response.end(JSON.stringify({ error: 'auth_proxy_failed' }))
  }
}
