import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const source = await readFile('lib/proofttl-assistant.ts', 'utf8')

const requiredCalls = [
  'fetchProofTTLAssistantUsage',
  'askProofTTLByVoice',
  'askProofTTLByText',
]

for (const name of requiredCalls) {
  assert(source.includes(`export async function ${name}`), `Missing assistant client function: ${name}`)
}

const credentialMatches = source.match(/credentials:\s*['"]include['"]/g) || []
assert(
  credentialMatches.length >= 3,
  `Expected usage, voice, and text assistant fetches to include credentials; found ${credentialMatches.length}`,
)

assert(source.includes('/assistant/usage'), 'Assistant usage endpoint is missing')
assert(source.includes('/assistant/voice'), 'Assistant voice endpoint is missing')
assert(source.includes('/assistant/text'), 'Assistant text endpoint is missing')
assert(source.includes('.slice(-6)'), 'Assistant conversation history is no longer bounded to six recent messages')

console.log('SUCCESS: assistant usage, voice, and text requests preserve credentialed sessions and bounded context.')
