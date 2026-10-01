import fs from 'node:fs'

const src = fs.readFileSync('scripts/foundry-10-loop.mjs', 'utf8')
const failures = []

const agentIds = [
  'scout-a','scout-b','validator-a','validator-b','builder-a','builder-b',
  'distribution-a','distribution-b','finance','risk'
]
for (const id of agentIds) {
  if (!src.includes("id: '" + id + "'")) failures.push('missing agent ' + id)
}

const pairIds = ['pair-discovery','pair-validation','pair-product','pair-distribution','pair-governance']
for (const pair of pairIds) {
  const count = src.split("pairId: '" + pair + "'").length - 1
  if (count !== 2) failures.push(pair + ' must have exactly two workers; found ' + count)
}

if (!src.includes("FOUNDRY_ENABLE_PAID_MODELS === '1'")) failures.push('paid model governor is missing')
if (!src.includes('const banned =')) failures.push('risk filter is missing')
if (!src.includes('reinvestCeiling')) failures.push('reinvestment governor is missing')

if (failures.length) {
  console.error('FOUNDRY-10 guard failed:')
  for (const failure of failures) console.error('- ' + failure)
  process.exit(1)
}

console.log('FOUNDRY-10 guard passed: 10 workers, five two-agent pairs, zero-spend gate, risk filter, and reinvestment governor present.')
