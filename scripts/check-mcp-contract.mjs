import { readFile } from 'node:fs/promises'

const source = await readFile(new URL('../api/mcp.ts', import.meta.url), 'utf8')

function assert(condition, message) {
  if (!condition) {
    console.error(`MCP CONTRACT CHECK FAILED: ${message}`)
    process.exit(1)
  }
}

const requiredTools = [
  'proofttl_status',
  'proofttl_capabilities',
  'proofttl_get_fact_lease',
  'proofttl_create_test_fact_lease',
  'proofttl_fact_lease_roundtrip_test',
  'proofttl_service_info',
]

assert(source.includes("const SERVER_VERSION = '0.4.0'"), 'server version must be 0.4.0')
assert(source.includes("const TOOLSET_VERSION = '4'"), 'toolset version must be 4')
assert(source.includes("const CORE_ORIGIN = 'https://proofttl.tasx13ok.workers.dev'"), 'core origin must remain fixed')
assert(source.includes("postCore('/mcp/test-lease')"), 'bounded test-lease creation route must remain wired')
assert(source.includes("fetchCore(\`/lease/\${encodeURIComponent(leaseId)}\`)"), 'round-trip must retrieve the created lease')
assert(source.includes("ttlMs: 0"), 'modern discovery must not advertise a stale tool-list TTL')
assert(source.includes("'x-proofttl-mcp-version'"), 'MCP version diagnostic header must remain exposed')
assert(source.includes("'x-proofttl-toolset-version'"), 'toolset version diagnostic header must remain exposed')

for (const tool of requiredTools) {
  assert(source.includes(`name: '${tool}'`), `required MCP tool missing: ${tool}`)
}

const declaredNames = [...source.matchAll(/name:\s*'(proofttl_[a-z0-9_]+)'/g)].map((match) => match[1])
const duplicates = declaredNames.filter((name, index) => declaredNames.indexOf(name) !== index)
assert(duplicates.length === 0, `duplicate MCP tool names: ${[...new Set(duplicates)].join(', ')}`)

console.log(`MCP contract check passed: server 0.4.0, toolset 4, ${requiredTools.length} required tools present.`)
