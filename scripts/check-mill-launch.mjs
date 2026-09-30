import fs from 'node:fs'

const sales = fs.readFileSync('app/kits/release-gate/ReleaseGate.tsx', 'utf8')
const unlock = fs.readFileSync('app/kits/release-gate/unlocked-7fd0b9/UnlockKit.tsx', 'utf8')

const failures = []
if (sales.includes('__CHECKOUT_URL__')) failures.push('live $5 checkout URL is not wired')
if (unlock.includes('__ENCRYPTED_PAYLOAD__')) failures.push('paid kit ciphertext is not wired')
if (unlock.includes('PROOFTTL RELEASE GATE KIT')) failures.push('paid kit plaintext leaked into public source')

if (failures.length) {
  console.error('MILL launch guard failed:')
  for (const failure of failures) console.error('- ' + failure)
  process.exit(1)
}

console.log('MILL launch guard passed: checkout and encrypted fulfillment are wired; no paid-kit plaintext detected.')
