import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'

const source = await readFile(new URL('../api/mcp.ts', import.meta.url), 'utf8')
const version = source.match(/const SERVER_VERSION = '([^']+)'/)[1]
const toolset = source.match(/const TOOLSET_VERSION = '([^']+)'/)[1]
const expectedTools = [...source.matchAll(/name: '(proofttl_[a-z0-9_]+)'/g)].map((m) => m[1]).sort()
const endpoint = process.env.MCP_URL || 'https://proofttl-web.vercel.app/api/mcp/'
let id = 0
async function rpc(method, params = {}, modern = false) {
  const response = await fetch(endpoint, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(60000),
    headers: { 'content-type': 'application/json', accept: 'application/json', ...(modern ? { 'mcp-protocol-version': '2026-07-28', 'mcp-method': method } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  })
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.error, undefined, JSON.stringify(body.error))
  return body.result
}

// During alias propagation, successive requests can reach different releases.
// Check the whole read-only discovery contract and require two consistent
// rounds in rollout-wait mode. Mutation/payment calls below are never retried.
const attempts = Math.max(1, Math.min(90, Number(process.env.MCP_WAIT_ATTEMPTS || 1)))
const requiredRounds = attempts > 1 ? 2 : 1
let consistentRounds = 0
let discoveryError
for (let attempt = 1; attempt <= attempts; attempt++) {
  try {
    const initialized = await rpc('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'proofttl-smoke', version: '1.0' } })
    assert.equal(initialized?.serverInfo.version, version, 'expected deployed MCP release')
    assert.match(initialized.instructions, /proofttl_verify_claim/)
    for (const modern of [false, true]) {
      const listed = await rpc('tools/list', {}, modern)
      assert.deepEqual(listed.tools.map((t) => t.name).sort(), expectedTools)
      assert.equal(listed.tools.find((t) => t.name === 'proofttl_verify_claim').annotations.readOnlyHint, false)
    }
    const discovered = await rpc('server/discover', {}, true)
    assert.equal(discovered.toolsetVersion, toolset)
    assert.deepEqual([...discovered.toolNames].sort(), expectedTools)
    assert.equal(discovered.ttlMs, 0)
    consistentRounds++
    if (consistentRounds >= requiredRounds) break
  } catch (error) {
    consistentRounds = 0
    discoveryError = error
  }
  if (attempt < attempts) await delay(10000)
}
if (consistentRounds < requiredRounds) throw discoveryError || new Error('MCP discovery did not stabilize before the deadline')
const call = (name, args = {}) => rpc('tools/call', { name, arguments: args })
const unpaid = await call('proofttl_verify_claim', { claim: 'IANA manages the DNS root zone.', source_url: 'https://www.iana.org/domains/root', ttl_seconds: 300 })
assert.equal(unpaid.isError, true)
assert.equal(unpaid.structuredContent.error.code, 'PAYMENT_REQUIRED')
assert.equal(unpaid.structuredContent.error.details.status, 402)
assert.ok(unpaid.structuredContent.error.details.payment_required, 'x402 challenge header must survive MCP')
assert.equal(unpaid.structuredContent.status, undefined)
const blocked = await call('proofttl_create_test_fact_lease', { claim: 'Arbitrary claim' })
assert.equal(blocked.structuredContent.error.code, 'INVALID_ARGUMENT')
const roundtrip = await call('proofttl_fact_lease_roundtrip_test')
assert.equal(roundtrip.isError, false)
assert.equal(roundtrip.structuredContent.checks.lease_ids_match, true)
assert.equal(roundtrip.structuredContent.created.claim, 'Example Domain')
assert.equal(roundtrip.structuredContent.created.lease_id, roundtrip.structuredContent.retrieved.lease_id)
const info = await call('proofttl_service_info')
assert.equal(info.structuredContent.mcp.verification.tool, 'proofttl_verify_claim')
const capabilities = await call('proofttl_capabilities')
assert.equal(capabilities.structuredContent.mcp.verification.payment_required, true)
assert.equal(capabilities.structuredContent.mcp.audit.tool, null)
console.log(JSON.stringify({ endpoint, version, toolset, tools: expectedTools, unpaid: 'PAYMENT_REQUIRED', fixture_lease_id: roundtrip.structuredContent.lease_id, paid_verification_tested: false, checked_at: new Date().toISOString() }, null, 2))
