const CORE_ORIGIN = 'https://proofttl.tasx13ok.workers.dev'
const SERVER_NAME = 'proofttl'
const SERVER_VERSION = '0.3.1'
const MODERN_PROTOCOL = '2026-07-28'
const LEGACY_PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26']
const MAX_UPSTREAM_CHARS = 256_000
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 30

type JsonRpcId = string | number | null
type JsonObject = Record<string, unknown>

type RateEntry = { startedAt: number; count: number }
const rateBuckets = new Map<string, RateEntry>()

const tools = [
  {
    name: 'proofttl_status',
    title: 'ProofTTL status',
    description: 'Read the live ProofTTL core health/status. This does not run verification or mutate data.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'proofttl_capabilities',
    title: 'ProofTTL capabilities',
    description: 'Read the live ProofTTL capability registry and current machine-facing feature surface.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'proofttl_get_fact_lease',
    title: 'Get ProofTTL Fact Lease',
    description: 'Read a public ProofTTL Fact Lease by lease ID. Returns the current stored lease or a not-found/error result.',
    inputSchema: {
      type: 'object',
      properties: {
        lease_id: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Existing ProofTTL Fact Lease identifier.',
        },
      },
      required: ['lease_id'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'proofttl_create_test_fact_lease',
    title: 'Create ProofTTL test Fact Lease',
    description: 'Create or reuse a real ProofTTL Fact Lease for the fixed Example Domain test fixture. This is only for end-to-end MCP testing and does not expose arbitrary unpaid verification.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'proofttl_service_info',
    title: 'ProofTTL service info',
    description: 'Return canonical ProofTTL service identity, use cases, commercial entry points, and the boundary between human audits and the technical Fact Lease protocol.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
] as const

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '64kb',
    },
  },
}

function ipFromRequest(request: any): string {
  const forwarded = String(request.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
  return forwarded || String(request.socket?.remoteAddress || 'unknown')
}

function rateLimited(request: any): boolean {
  const key = ipFromRequest(request)
  const now = Date.now()
  const current = rateBuckets.get(key)
  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 })
    if (rateBuckets.size > 5000) {
      for (const [bucketKey, entry] of rateBuckets) {
        if (now - entry.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(bucketKey)
      }
    }
    return false
  }
  current.count += 1
  return current.count > RATE_MAX
}

function originAllowed(request: any): boolean {
  const raw = request.headers?.origin
  if (!raw) return true
  try {
    const origin = new URL(String(raw))
    if (origin.protocol !== 'https:' && origin.hostname !== 'localhost' && origin.hostname !== '127.0.0.1') return false
    return (
      origin.hostname === 'proofttl-web.vercel.app' ||
      origin.hostname === 'chatgpt.com' ||
      origin.hostname === 'claude.ai' ||
      origin.hostname === 'localhost' ||
      origin.hostname === '127.0.0.1'
    )
  } catch {
    return false
  }
}

function acceptable(request: any): boolean {
  const accept = String(request.headers?.accept || '').toLowerCase()
  if (!accept) return true
  return accept.includes('application/json') || accept.includes('text/event-stream') || accept.includes('*/*')
}

function modernRequest(request: any, body: any): boolean {
  if (body?.method === 'server/discover') return true
  const headerVersion = String(request.headers?.['mcp-protocol-version'] || '')
  if (headerVersion === MODERN_PROTOCOL) return true
  return body?.params?._meta?.['io.modelcontextprotocol/protocolVersion'] === MODERN_PROTOCOL
}

function serverMeta(): JsonObject {
  return {
    'io.modelcontextprotocol/serverInfo': {
      name: SERVER_NAME,
      version: SERVER_VERSION,
      title: 'ProofTTL',
      websiteUrl: 'https://proofttl-web.vercel.app/',
      description: 'Source-backed claim verification and expiring Fact Leases.',
    },
  }
}

function complete(result: JsonObject, modern: boolean): JsonObject {
  if (!modern) return result
  return { resultType: 'complete', ...result, _meta: { ...(result._meta as JsonObject | undefined), ...serverMeta() } }
}

function rpcResult(id: JsonRpcId, result: JsonObject) {
  return { jsonrpc: '2.0', id, result }
}

function rpcError(id: JsonRpcId, code: number, message: string, data?: unknown) {
  return { jsonrpc: '2.0', id, error: data === undefined ? { code, message } : { code, message, data } }
}

function sendJson(response: any, status: number, payload: unknown) {
  response.statusCode = status
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('cache-control', 'no-store')
  response.setHeader('x-content-type-options', 'nosniff')
  response.end(JSON.stringify(payload))
}

function parseBody(body: unknown): any | null {
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) return body
  if (typeof body === 'string') {
    try { return JSON.parse(body) } catch { return null }
  }
  if (Buffer.isBuffer(body)) {
    try { return JSON.parse(body.toString('utf8')) } catch { return null }
  }
  return null
}

function validRpc(body: any): boolean {
  return Boolean(body && !Array.isArray(body) && body.jsonrpc === '2.0' && typeof body.method === 'string')
}

function validLeaseId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9._:-]{1,200}$/.test(value)
}

async function fetchCore(path: string): Promise<{ ok: boolean; status: number; data: unknown }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const upstream = await fetch(`${CORE_ORIGIN}${path}`, {
      method: 'GET',
      headers: { accept: 'application/json' },
      redirect: 'error',
      signal: controller.signal,
    })
    const text = await upstream.text()
    if (text.length > MAX_UPSTREAM_CHARS) return { ok: false, status: 502, data: { error: 'UPSTREAM_RESPONSE_TOO_LARGE' } }
    let data: unknown
    try { data = text ? JSON.parse(text) : null } catch { data = { error: 'UPSTREAM_INVALID_JSON' } }
    return { ok: upstream.ok, status: upstream.status, data }
  } catch {
    return { ok: false, status: 502, data: { error: 'UPSTREAM_UNAVAILABLE' } }
  } finally {
    clearTimeout(timeout)
  }
}

async function postCore(path: string): Promise<{ ok: boolean; status: number; data: unknown }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const upstream = await fetch(`${CORE_ORIGIN}${path}`, {
      method: 'POST',
      headers: { accept: 'application/json' },
      redirect: 'error',
      signal: controller.signal,
    })
    const text = await upstream.text()
    if (text.length > MAX_UPSTREAM_CHARS) return { ok: false, status: 502, data: { error: 'UPSTREAM_RESPONSE_TOO_LARGE' } }
    let data: unknown
    try { data = text ? JSON.parse(text) : null } catch { data = { error: 'UPSTREAM_INVALID_JSON' } }
    return { ok: upstream.ok, status: upstream.status, data }
  } catch {
    return { ok: false, status: 502, data: { error: 'UPSTREAM_UNAVAILABLE' } }
  } finally {
    clearTimeout(timeout)
  }
}

function toolSuccess(data: unknown, modern: boolean): JsonObject {
  const text = JSON.stringify(data, null, 2)
  return complete({
    content: [{ type: 'text', text }],
    structuredContent: data && typeof data === 'object' ? data as JsonObject : { value: data },
    isError: false,
  }, modern)
}

function toolFailure(code: string, message: string, modern: boolean, details?: unknown): JsonObject {
  const structuredContent: JsonObject = { error: { code, message, ...(details === undefined ? {} : { details }) } }
  return complete({
    content: [{ type: 'text', text: `${code}: ${message}` }],
    structuredContent,
    isError: true,
  }, modern)
}

function serviceInfo() {
  return {
    service: 'ProofTTL',
    website: 'https://proofttl-web.vercel.app/',
    technical_api: CORE_ORIGIN,
    purpose: 'Source-backed verification of specific factual claims, with explicit SUPPORTED, CONTRADICTED, or UNKNOWN outcomes and expiring Fact Leases.',
    commercial: {
      rapid_claim_check: 'https://proofttl-web.vercel.app/audit/',
      services: 'https://proofttl-web.vercel.app/services/',
      sample_report: 'https://proofttl-web.vercel.app/audit/sample/',
    },
    boundaries: [
      'This public MCP test surface is read-only except for one bounded fixed test-lease action.',
      'The fixed test action can only verify the Example Domain fixture and does not expose arbitrary unpaid POST /verify.',
      'It does not create audit intakes, charge cards, access private reports, or mutate accounts.',
      'ProofTTL records what examined evidence supports at a point in time; it is not a permanent-truth oracle.',
    ],
  }
}

async function callTool(name: string, args: unknown, modern: boolean): Promise<JsonObject> {
  if (name === 'proofttl_service_info') return toolSuccess(serviceInfo(), modern)

  if (name === 'proofttl_create_test_fact_lease') {
    const upstream = await postCore('/mcp/test-lease')
    if (!upstream.ok) return toolFailure('UPSTREAM_UNAVAILABLE', 'ProofTTL could not create the bounded test Fact Lease.', modern, { status: upstream.status, upstream: upstream.data })
    return toolSuccess(upstream.data, modern)
  }

  if (name === 'proofttl_status') {
    const upstream = await fetchCore('/health')
    if (!upstream.ok) return toolFailure('UPSTREAM_UNAVAILABLE', 'ProofTTL core health could not be read.', modern, { status: upstream.status })
    return toolSuccess(upstream.data, modern)
  }

  if (name === 'proofttl_capabilities') {
    const upstream = await fetchCore('/capabilities')
    if (!upstream.ok) return toolFailure('UPSTREAM_UNAVAILABLE', 'ProofTTL capabilities could not be read.', modern, { status: upstream.status })
    return toolSuccess(upstream.data, modern)
  }

  if (name === 'proofttl_get_fact_lease') {
    const value = args && typeof args === 'object' ? (args as Record<string, unknown>).lease_id : undefined
    if (!validLeaseId(value)) return toolFailure('INVALID_ARGUMENT', 'lease_id must be a 1-200 character ProofTTL lease identifier.', modern)
    const upstream = await fetchCore(`/lease/${encodeURIComponent(value)}`)
    if (!upstream.ok) {
      const code = upstream.status === 404 ? 'LEASE_NOT_FOUND' : 'UPSTREAM_UNAVAILABLE'
      const message = upstream.status === 404 ? 'No public Fact Lease was found for that ID.' : 'ProofTTL could not read that Fact Lease.'
      return toolFailure(code, message, modern, { status: upstream.status })
    }
    return toolSuccess(upstream.data, modern)
  }

  return toolFailure('TOOL_NOT_FOUND', 'Unknown ProofTTL tool.', modern)
}

function validateModernHeaders(request: any, body: any): string | null {
  if (!modernRequest(request, body)) return null
  const protocol = request.headers?.['mcp-protocol-version']
  if (protocol && String(protocol) !== MODERN_PROTOCOL) return 'MCP-Protocol-Version does not match the supported modern revision.'
  const method = request.headers?.['mcp-method']
  if (method && String(method) !== body.method) return 'Mcp-Method header does not match the JSON-RPC method.'
  const name = request.headers?.['mcp-name']
  if (name && body.method === 'tools/call' && String(name) !== String(body.params?.name || '')) return 'Mcp-Name header does not match params.name.'
  return null
}

export default async function handler(request: any, response: any) {
  response.setHeader('access-control-allow-methods', 'POST, OPTIONS')
  response.setHeader('access-control-allow-headers', 'content-type, accept, authorization, mcp-protocol-version, mcp-method, mcp-name')
  response.setHeader('vary', 'Origin')

  if (request.method === 'OPTIONS') {
    if (!originAllowed(request)) {
      response.statusCode = 403
      response.end()
      return
    }
    const origin = request.headers?.origin
    if (origin) response.setHeader('access-control-allow-origin', String(origin))
    response.statusCode = 204
    response.end()
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, {
      error: 'method_not_allowed',
      message: 'ProofTTL MCP uses Streamable HTTP over POST at this URL.',
      endpoint: 'https://proofttl-web.vercel.app/api/mcp/',
    })
    return
  }

  if (!originAllowed(request)) {
    sendJson(response, 403, { error: 'origin_not_allowed' })
    return
  }
  const origin = request.headers?.origin
  if (origin) response.setHeader('access-control-allow-origin', String(origin))

  if (!acceptable(request)) {
    sendJson(response, 406, { error: 'not_acceptable' })
    return
  }

  if (rateLimited(request)) {
    response.setHeader('retry-after', '60')
    sendJson(response, 429, { error: 'rate_limited' })
    return
  }

  const body = parseBody(request.body)
  if (!body) {
    sendJson(response, 400, rpcError(null, -32700, 'Parse error'))
    return
  }
  if (!validRpc(body)) {
    sendJson(response, 400, rpcError(body?.id ?? null, -32600, 'Invalid Request'))
    return
  }

  const modern = modernRequest(request, body)
  const headerError = validateModernHeaders(request, body)
  if (headerError) {
    sendJson(response, 400, rpcError(body.id ?? null, -32020, 'Header mismatch', { message: headerError }))
    return
  }

  const id: JsonRpcId = body.id ?? null

  if (body.method.startsWith('notifications/')) {
    response.statusCode = modern ? 202 : 204
    response.setHeader('cache-control', 'no-store')
    response.end()
    return
  }

  if (body.method === 'server/discover') {
    sendJson(response, 200, rpcResult(id, complete({
      supportedVersions: [MODERN_PROTOCOL],
      capabilities: { tools: {} },
      instructions: 'Use ProofTTL for source-backed factual verification context. The MCP exposes one bounded fixed test-lease action for end-to-end testing; arbitrary verification remains x402-protected.',
      ttlMs: 60_000,
      cacheScope: 'public',
    }, true)))
    return
  }

  if (body.method === 'initialize') {
    const requested = typeof body.params?.protocolVersion === 'string' ? body.params.protocolVersion : LEGACY_PROTOCOLS[0]
    const protocolVersion = LEGACY_PROTOCOLS.includes(requested) ? requested : LEGACY_PROTOCOLS[0]
    sendJson(response, 200, rpcResult(id, {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: {
        name: SERVER_NAME,
        version: SERVER_VERSION,
        title: 'ProofTTL',
        websiteUrl: 'https://proofttl-web.vercel.app/',
      },
      instructions: 'Use ProofTTL for source-backed factual verification context. The public MCP exposes one bounded fixed test-lease action; arbitrary verification remains protected and is not exposed here.',
    }))
    return
  }

  if (body.method === 'ping' && !modern) {
    sendJson(response, 200, rpcResult(id, {}))
    return
  }

  if (body.method === 'tools/list') {
    sendJson(response, 200, rpcResult(id, complete({
      tools: [...tools],
      ...(modern ? { ttlMs: 60_000, cacheScope: 'public' } : {}),
    }, modern)))
    return
  }

  if (body.method === 'resources/list' || body.method === 'resources/templates/list') {
    sendJson(response, 200, rpcResult(id, complete({
      resources: [],
      ...(modern ? { ttlMs: 60_000, cacheScope: 'public' } : {}),
    }, modern)))
    return
  }

  if (body.method === 'prompts/list') {
    sendJson(response, 200, rpcResult(id, complete({
      prompts: [],
      ...(modern ? { ttlMs: 60_000, cacheScope: 'public' } : {}),
    }, modern)))
    return
  }

  if (body.method === 'tools/call') {
    const name = typeof body.params?.name === 'string' ? body.params.name : ''
    if (!name) {
      sendJson(response, 200, rpcError(id, -32602, 'Invalid params', { message: 'params.name is required' }))
      return
    }
    const result = await callTool(name, body.params?.arguments ?? {}, modern)
    sendJson(response, 200, rpcResult(id, result))
    return
  }

  sendJson(response, 200, rpcError(id, -32601, 'Method not found'))
}
