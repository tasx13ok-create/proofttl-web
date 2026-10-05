import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test, afterEach } from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../api/mcp.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const { default: handler } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
let sequence = 0
const core = 'https://proofttl.tasx13ok.workers.dev'
const valid = { claim: 'A specific arbitrary claim', source_url: 'https://example.org/evidence', ttl_seconds: 300 }

async function rpc(method, params = {}, modern = false, requestOverrides = {}) {
  const headers = {}
  let payload
  const response = { statusCode: 0, setHeader: (name, value) => { headers[name] = value }, end: (body) => { payload = body ? JSON.parse(body) : null } }
  await handler({ method: 'POST', headers: { 'x-forwarded-for': `test-${++sequence}`, ...(modern ? { 'mcp-protocol-version': '2026-07-28', 'mcp-method': method } : {}) }, body: { jsonrpc: '2.0', id: sequence, method, params }, ...requestOverrides }, response)
  return { status: response.statusCode, headers, ...payload }
}
const call = async (args = valid, modern = false) => (await rpc('tools/call', { name: 'proofttl_verify_claim', arguments: args }, modern)).result
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers })

test('legacy and modern discovery advertise the protected tool and matching metadata', async () => {
  for (const modern of [false, true]) {
    const listed = await rpc('tools/list', {}, modern)
    assert.equal(listed.headers['x-proofttl-mcp-version'], '0.5.0')
    assert.equal(listed.headers['x-proofttl-toolset-version'], '6')
    assert.equal(listed.result.tools.length, 7)
    const tool = listed.result.tools.find((t) => t.name === 'proofttl_verify_claim')
    assert.deepEqual(tool.inputSchema.required, ['claim', 'source_url'])
    assert.equal(tool.inputSchema.additionalProperties, false)
    assert.equal(tool.annotations.readOnlyHint, false)
    assert.equal(tool.annotations.idempotentHint, false)
    if (modern) assert.equal(listed.result.resultType, 'complete')
  }
  const initialized = await rpc('initialize', { protocolVersion: '2025-11-25' })
  assert.match(initialized.result.instructions, /proofttl_verify_claim/)
  const discovery = await rpc('server/discover')
  assert.equal(discovery.result.toolsetVersion, '6')
  assert.ok(discovery.result.toolNames.includes('proofttl_verify_claim'))
  const info = await rpc('tools/call', { name: 'proofttl_service_info' })
  assert.equal(info.result.structuredContent.mcp.verification.tool, 'proofttl_verify_claim')
})

test('unpaid verification preserves the real x402 challenge without returning a verdict', async () => {
  let requests = 0
  globalThis.fetch = async (url, options) => {
    requests++
    assert.equal(url, `${core}/verify`)
    assert.equal(options.method, 'POST')
    assert.equal(options.redirect, 'error')
    assert.deepEqual(JSON.parse(options.body), valid)
    assert.deepEqual(options.headers, { accept: 'application/json', 'content-type': 'application/json' })
    return json({ x402Version: 2, accepts: [{ network: 'eip155:84532' }] }, 402, { 'payment-required': 'challenge' })
  }
  const result = await call()
  assert.equal(result.isError, true)
  assert.equal(result.structuredContent.error.code, 'PAYMENT_REQUIRED')
  assert.equal(result.structuredContent.error.details.payment_required, 'challenge')
  assert.equal(result.structuredContent.error.details.resource, `${core}/verify`)
  assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent, 'legacy text consumers must also receive the payment challenge')
  assert.equal(result.structuredContent.status, undefined)
  assert.equal(requests, 1)
})

for (const status of ['SUPPORTED', 'CONTRADICTED', 'UNKNOWN']) {
  test(`authorized ${status} response keeps evidence and settlement metadata`, async () => {
    const evidence = { status, lease_id: 'ftl_fixture', claim: valid.claim, source_url: valid.source_url, confidence: 0.5, expires_at: '2026-10-05T00:05:00Z', proof_basis: 'SEMANTIC' }
    let requests = 0
    globalThis.fetch = async (url, options) => {
      requests++
      assert.equal(url, `${core}/verify`)
      assert.equal(options.headers['payment-signature'], 'c2lnbmVk')
      assert.deepEqual(JSON.parse(options.body), valid)
      return json(evidence, 200, { 'payment-response': 'settlement-receipt' })
    }
    const result = await call({ ...valid, payment_signature: 'c2lnbmVk' }, true)
    assert.equal(result.isError, false)
    assert.equal(result.resultType, 'complete')
    assert.deepEqual(result.structuredContent, { ...evidence, payment_response: 'settlement-receipt' })
    assert.ok(!JSON.stringify(result).includes('c2lnbmVk'))
    assert.equal(requests, 1)
  })
}

test('invalid inputs are rejected before any upstream call', async () => {
  globalThis.fetch = () => { throw new Error('must not fetch') }
  const invalid = [[], 'claim', {}, { ...valid, claim: '' }, { ...valid, claim: '   ' }, { ...valid, claim: 'x'.repeat(1001) },
    { ...valid, source_url: 'file:///etc/passwd' }, { ...valid, source_url: 'https://user:pass@example.com' }, { ...valid, source_url: 'https://example.com:8443' }, { ...valid, source_url: 'x'.repeat(2049) },
    ...[null, '300', 59, 604801, 1.5].map((ttl_seconds) => ({ ...valid, ttl_seconds })),
    ...[null, '', 'a\r\nInjected: true', 'x'.repeat(16385)].map((payment_signature) => ({ ...valid, payment_signature })),
    { ...valid, headers: { authorization: 'secret' } }, { ...valid, upstream_url: 'http://localhost' }, { ...valid, bypass_payment: true }]
  for (const args of invalid) {
    const result = await call(args)
    assert.equal(result.structuredContent.error.code, 'INVALID_ARGUMENT', JSON.stringify(args).slice(0,100))
  }
})

test('default TTL and trimmed claim are forwarded; source access remains in core', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${core}/verify`)
    assert.deepEqual(JSON.parse(options.body), { claim: 'claim', source_url: 'http://127.0.0.1', ttl_seconds: 3600 })
    return json({ error: 'source_url_not_allowed' }, 400)
  }
  const result = await call({ claim: ' claim ', source_url: 'http://127.0.0.1' })
  assert.equal(result.isError, true)
  assert.equal(result.structuredContent.error.details.upstream.error, 'source_url_not_allowed')
})

test('core rejections and failures never become successful verification or trigger retries', async () => {
  for (const status of [400, 403, 429, 500, 502]) {
    let count = 0
    globalThis.fetch = async () => { count++; return json({ error: 'core_rejected' }, status) }
    const result = await call({ ...valid, payment_signature: 'c2lnbmVk' })
    assert.equal(result.isError, true)
    assert.equal(result.structuredContent.error.details.status, status)
    assert.equal(result.structuredContent.error.details.retry_safe, false)
    assert.equal(count, 1)
  }
})

test('malformed, oversized and interrupted responses fail closed without retrying payment', async () => {
  for (const [response, code] of [
    [() => new Response('not json'), 'UPSTREAM_INVALID_JSON'],
    [() => json({ ok: true }), 'UPSTREAM_INVALID_RESPONSE'],
    [() => json({ status: 'TRUE' }), 'UPSTREAM_INVALID_RESPONSE'],
    [() => json({ status: 'SUPPORTED', padding: 'x'.repeat(256001) }), 'UPSTREAM_RESPONSE_TOO_LARGE'],
    [() => { throw new Error('network failure') }, 'UPSTREAM_UNAVAILABLE'],
  ]) {
    let count = 0
    globalThis.fetch = async () => { count++; return response() }
    const result = await call({ ...valid, payment_signature: 'c2lnbmVk' })
    assert.equal(result.isError, true)
    assert.equal(result.structuredContent.error.code, code)
    assert.equal(result.structuredContent.error.details.retry_safe, false)
    assert.equal(count, 1)
  }
})

test('bounded fixture rejects arbitrary input and its existing roundtrip remains intact', async () => {
  let paths = []
  globalThis.fetch = async (url, options) => {
    paths.push([url, options.method])
    assert.equal(options.body, undefined)
    return json({ lease_id: 'ftl_fixed', status: 'SUPPORTED', claim: 'Example Domain' })
  }
  for (const name of ['proofttl_create_test_fact_lease', 'proofttl_fact_lease_roundtrip_test']) {
    const invalid = await rpc('tools/call', { name, arguments: valid })
    assert.equal(invalid.result.structuredContent.error.code, 'INVALID_ARGUMENT')
  }
  assert.equal(paths.length, 0)
  const roundtrip = await rpc('tools/call', { name: 'proofttl_get_fact_lease', arguments: { lease_id: '__roundtrip_test__' } })
  assert.equal(roundtrip.result.structuredContent.checks.lease_ids_match, true)
  assert.deepEqual(paths, [[`${core}/mcp/test-lease`, 'POST'], [`${core}/lease/ftl_fixed`, 'GET']])
})

test('verification timeout aborts the upstream call without retrying a submitted payment', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let requests = 0
  let signal
  globalThis.fetch = async (_url, options) => {
    requests++
    signal = options.signal
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }))
  }
  const pending = call({ ...valid, payment_signature: 'c2lnbmVk' })
  t.mock.timers.tick(55000)
  const result = await pending
  assert.equal(signal.aborted, true)
  assert.equal(requests, 1)
  assert.equal(result.structuredContent.error.code, 'UPSTREAM_UNAVAILABLE')
  assert.equal(result.structuredContent.error.details.retry_safe, false)
})

test('capabilities distinguish protected MCP verification from the commercial audit', async () => {
  globalThis.fetch = async () => json({ capabilities: [{ id: 'truth.verify', ready: true }, { id: 'truth.audit', ready: true }] })
  const result = await rpc('tools/call', { name: 'proofttl_capabilities' })
  const mcp = result.result.structuredContent.mcp
  assert.equal(mcp.verification.payment_required, true)
  assert.equal(mcp.audit.tool, null)
  assert.equal(mcp.audit.commercial_only, true)
})

test('origin, headers and unsupported-tool guards remain enforced', async () => {
  globalThis.fetch = () => { throw new Error('must not fetch') }
  assert.equal((await rpc('tools/list', {}, false, { headers: { origin: 'https://evil.example' } })).status, 403)
  assert.equal((await rpc('tools/list', {}, false, { headers: { 'mcp-protocol-version': '2026-07-28', 'mcp-method': 'tools/call' } })).status, 400)
  assert.equal((await rpc('tools/call', { name: 'truth.audit' })).result.structuredContent.error.code, 'TOOL_NOT_FOUND')
})
