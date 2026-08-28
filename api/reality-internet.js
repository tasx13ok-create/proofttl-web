import dns from 'node:dns/promises'
import https from 'node:https'
import net from 'node:net'
import crypto from 'node:crypto'

const MAX_BYTES = 512 * 1024
const MAX_REDIRECTS = 3
const TIMEOUT_MS = 7000
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 30
const ALLOWED_ORIGIN = 'https://proofttl-web.vercel.app'
const TEXT_TYPES = [
  'text/html',
  'text/plain',
  'text/markdown',
  'text/xml',
  'application/json',
  'application/xml',
  'application/xhtml+xml',
  'application/rss+xml',
  'application/atom+xml',
]
const STATIC_RESOURCE = /\.(?:css|js|mjs|map|woff2?|ttf|otf|eot|png|jpe?g|gif|webp|svg|ico|avif|mp4|webm|mp3|wav|zip|gz|tgz|tar|7z)(?:$|[?#])/i
const rate = new Map()

function parseBody(request) {
  if (request.body && typeof request.body === 'object') return request.body
  if (typeof request.body === 'string') {
    try { return JSON.parse(request.body) } catch {}
  }
  return null
}

function clientKey(request) {
  const value = String(request.headers?.['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown')
  return value.split(',')[0].trim().slice(0, 120)
}

function consumeRate(request) {
  const key = clientKey(request)
  const now = Date.now()
  const current = rate.get(key)
  if (!current || now - current.start >= RATE_WINDOW_MS) {
    rate.set(key, { start: now, count: 1 })
    return true
  }
  if (current.count >= RATE_MAX) return false
  current.count++
  return true
}

function allowedCaller(request) {
  const origin = String(request.headers?.origin || '')
  const referer = String(request.headers?.referer || '')
  if (origin && origin !== ALLOWED_ORIGIN) return false
  if (!origin && referer && !referer.startsWith(`${ALLOWED_ORIGIN}/reality-engine`)) return false
  return true
}

function ipv4Number(address) {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return (((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]) >>> 0
}

function inRange(value, base, bits) {
  if (bits === 0) return true
  const mask = bits === 32 ? 0xffffffff : (0xffffffff << (32 - bits)) >>> 0
  return (value & mask) === (base & mask)
}

function blockedIpv4(address) {
  const n = ipv4Number(address)
  if (n == null) return true
  const ranges = [
    ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
    ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
    ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
    ['224.0.0.0', 4], ['240.0.0.0', 4],
  ]
  return ranges.some(([base, bits]) => inRange(n, ipv4Number(base), bits))
}

function blockedIpv6(address) {
  const a = String(address || '').toLowerCase()
  if (!a || a === '::' || a === '::1') return true
  if (a.startsWith('fc') || a.startsWith('fd')) return true
  if (/^fe[89ab]/.test(a)) return true
  if (a.startsWith('ff')) return true
  const mapped = a.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return blockedIpv4(mapped[1])
  return false
}

function blockedAddress(address) {
  const family = net.isIP(address)
  if (family === 4) return blockedIpv4(address)
  if (family === 6) return blockedIpv6(address)
  return true
}

function blockedHostname(hostname) {
  const h = String(hostname || '').toLowerCase().replace(/\.$/, '')
  if (!h) return true
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local')) return true
  if (h === 'metadata.google.internal' || h === 'metadata') return true
  return false
}

async function resolvePublic(hostname) {
  if (blockedHostname(hostname)) throw new Error('private_network_target')
  if (net.isIP(hostname)) {
    if (blockedAddress(hostname)) throw new Error('private_network_target')
    return { address: hostname, family: net.isIP(hostname) }
  }
  const records = await dns.lookup(hostname, { all: true, verbatim: true })
  if (!records.length) throw new Error('dns_no_public_address')
  if (records.some((record) => blockedAddress(record.address))) throw new Error('dns_contains_private_address')
  const chosen = records.find((record) => record.family === 4) || records[0]
  return { address: chosen.address, family: chosen.family }
}

function pinnedLookup(pinned) {
  return (_hostname, options, callback) => {
    if (options && options.all) {
      callback(null, [{ address: pinned.address, family: pinned.family }])
      return
    }
    callback(null, pinned.address, pinned.family)
  }
}

function totalDeclaredBytes(headers) {
  const range = String(headers?.['content-range'] || '')
  const match = range.match(/\/(\d+)\s*$/)
  if (match) return Number(match[1]) || 0
  return Number(headers?.['content-length'] || 0) || 0
}

function requestPinned(url, pinned) {
  return new Promise((resolve, reject) => {
    let settled = false
    const finishResolve = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const finishReject = (error) => {
      if (settled) return
      settled = true
      reject(error)
    }

    const req = https.request({
      protocol: 'https:',
      hostname: url.hostname,
      port: 443,
      method: 'GET',
      path: `${url.pathname || '/'}${url.search || ''}`,
      servername: url.hostname,
      family: pinned.family,
      autoSelectFamily: false,
      lookup: pinnedLookup(pinned),
      headers: {
        'user-agent': 'RealityEngine-Observer/0.4 (+https://proofttl-web.vercel.app/reality-engine/)',
        accept: 'text/html,text/plain,text/markdown,application/json,application/xml,application/xhtml+xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.1',
        'accept-encoding': 'identity',
        range: `bytes=0-${MAX_BYTES - 1}`,
        connection: 'close',
      },
    }, (res) => {
      const chunks = []
      let bytes = 0
      let truncated = false
      const declaredBytes = totalDeclaredBytes(res.headers)

      const snapshot = () => ({
        status: res.statusCode || 0,
        headers: res.headers,
        body: Buffer.concat(chunks),
        bytes,
        declaredBytes,
        truncated: truncated || declaredBytes > bytes,
      })

      res.on('data', (chunk) => {
        if (settled) return
        const remaining = MAX_BYTES - bytes
        if (remaining <= 0) {
          truncated = true
          finishResolve(snapshot())
          res.destroy()
          return
        }
        if (chunk.length > remaining) {
          chunks.push(Buffer.from(chunk.subarray(0, remaining)))
          bytes += remaining
          truncated = true
          finishResolve(snapshot())
          res.destroy()
          return
        }
        chunks.push(Buffer.from(chunk))
        bytes += chunk.length
      })
      res.on('end', () => finishResolve(snapshot()))
      res.on('error', finishReject)
    })
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('upstream_timeout')))
    req.on('error', finishReject)
    req.end()
  })
}

async function fetchPublic(startUrl) {
  let url = validateUrl(startUrl)
  const hops = []
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    const pinned = await resolvePublic(url.hostname)
    const result = await requestPinned(url, pinned)
    hops.push({ url: url.href, status: result.status })
    if ([301, 302, 303, 307, 308].includes(result.status)) {
      const location = result.headers.location
      if (!location) throw new Error('redirect_without_location')
      if (redirect === MAX_REDIRECTS) throw new Error('too_many_redirects')
      url = validateUrl(new URL(location, url).href)
      continue
    }
    return { ...result, url, hops }
  }
  throw new Error('too_many_redirects')
}

function validateUrl(input) {
  let url
  try { url = new URL(String(input || '').trim()) } catch { throw new Error('invalid_url') }
  if (url.protocol !== 'https:') throw new Error('https_required')
  if (url.username || url.password) throw new Error('credentials_in_url_forbidden')
  if (url.port && url.port !== '443') throw new Error('custom_port_forbidden')
  if (blockedHostname(url.hostname)) throw new Error('private_network_target')
  url.hash = ''
  return url
}

function decodeEntities(text) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  return String(text || '')
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (m, code) => {
      if (code[0] === '#') {
        const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
        return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ' '
      }
      return named[code.toLowerCase()] ?? ' '
    })
}

function htmlToText(html) {
  return decodeEntities(String(html || ''))
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|canvas|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\t\r ]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 180_000)
}

function extractTitle(html) {
  const match = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return match ? decodeEntities(match[1]).replace(/\s+/g, ' ').trim().slice(0, 240) : ''
}

function extractLinks(html, baseUrl) {
  const found = new Set()
  const re = /\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi
  let match
  while ((match = re.exec(String(html || ''))) && found.size < 96) {
    const raw = match[1] || match[2] || match[3] || ''
    if (!raw || raw.startsWith('#') || /^(javascript|mailto|tel|data):/i.test(raw)) continue
    try {
      const link = validateUrl(new URL(raw, baseUrl).href)
      if (STATIC_RESOURCE.test(`${link.pathname}${link.search}`)) continue
      found.add(link.href)
    } catch {}
  }
  return [...found]
}

function contentAllowed(contentType) {
  const type = String(contentType || '').toLowerCase().split(';')[0].trim()
  return TEXT_TYPES.includes(type)
}

function errorCode(error) {
  const value = String(error?.message || error || 'internet_observation_failed')
  const known = new Set([
    'invalid_url','https_required','credentials_in_url_forbidden','custom_port_forbidden','private_network_target',
    'dns_no_public_address','dns_contains_private_address','upstream_timeout','redirect_without_location','too_many_redirects',
  ])
  return known.has(value) ? value : 'internet_observation_failed'
}

export default async function handler(request, response) {
  response.setHeader('cache-control', 'no-store')
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('x-content-type-options', 'nosniff')

  if (request.method !== 'POST') {
    response.statusCode = 405
    response.end(JSON.stringify({ error: 'method_not_allowed' }))
    return
  }
  if (!allowedCaller(request)) {
    response.statusCode = 403
    response.end(JSON.stringify({ error: 'origin_not_allowed' }))
    return
  }
  if (!consumeRate(request)) {
    response.statusCode = 429
    response.end(JSON.stringify({ error: 'internet_gateway_rate_limited', retryAfterMs: RATE_WINDOW_MS }))
    return
  }

  try {
    const body = parseBody(request)
    const requested = String(body?.url || '')
    if (!requested || requested.length > 2048) {
      response.statusCode = 400
      response.end(JSON.stringify({ error: 'invalid_url' }))
      return
    }

    const result = await fetchPublic(requested)
    const contentType = String(result.headers['content-type'] || 'application/octet-stream')
    if (!contentAllowed(contentType)) {
      response.statusCode = 415
      response.end(JSON.stringify({ error: 'unsupported_content_type', contentType: contentType.slice(0, 120) }))
      return
    }

    const raw = result.body.toString('utf8')
    const html = /html|xhtml/i.test(contentType)
    const text = html ? htmlToText(raw) : raw.replace(/\u0000/g, '').slice(0, 180_000)
    const links = html ? extractLinks(raw, result.url) : []
    const fingerprint = crypto.createHash('sha256').update(text).digest('hex')

    response.statusCode = 200
    response.end(JSON.stringify({
      ok: true,
      mode: 'read-only-public-web',
      gatewayVersion: '0.4.0-semantic-text',
      url: result.url.href,
      status: result.status,
      contentType: contentType.slice(0, 120),
      title: html ? extractTitle(raw) : '',
      text,
      links,
      bytes: result.bytes,
      declaredBytes: result.declaredBytes || result.bytes,
      truncated: Boolean(result.truncated),
      fingerprint,
      redirects: result.hops,
      fetchedAt: new Date().toISOString(),
      constraints: {
        methods: ['GET'],
        publicHttpsOnly: true,
        credentialsForwarded: false,
        writesAllowed: false,
        maxBytes: MAX_BYTES,
        oversizedPages: 'truncated-to-maxBytes',
        semanticTextOnly: true,
        staticResourceLinksRejected: true,
        timeoutMs: TIMEOUT_MS,
      },
    }))
  } catch (error) {
    const code = errorCode(error)
    const status = code === 'private_network_target' || code === 'dns_contains_private_address' ? 403
      : code === 'upstream_timeout' ? 504
      : 502
    console.error('Reality Engine internet observation failed', code, String(error?.stack || error?.message || error))
    response.statusCode = status
    response.end(JSON.stringify({ error: code }))
  }
}
