import { readFile } from 'node:fs/promises'

const how = await readFile('app/how-proofttl-works/page.tsx', 'utf8')
const nav = await readFile('app/product-nav.css', 'utf8')

for (const expected of [
  'how-works-page',
  'how-works-shell',
  'how-works-matrix',
  'grid-template-columns: minmax(0, 1fr)',
  'overflow-x: clip',
  '@media (max-width: 760px)',
  'width: calc(100% - 24px)',
  'white-space: normal',
  'overflow-wrap: anywhere',
]) {
  if (!how.includes(expected)) throw new Error(`How-it-works mobile layout missing regression guard: ${expected}`)
}

if (!how.includes('.how-works-shell > *') || !how.includes('grid-column: 1 !important')) {
  throw new Error('How-it-works panels can regress into implicit desktop grid columns on mobile')
}

if (!how.includes('.how-works-matrix .app-table-row') || !how.includes('grid-template-columns: minmax(0, 1fr);')) {
  throw new Error('How-it-works customer-flow rows must collapse to one column on mobile')
}

for (const expected of ['@media (max-width:', '.product-nav-inner', '.product-nav-primary']) {
  if (!nav.includes(expected)) throw new Error(`Product navigation mobile contract missing: ${expected}`)
}

console.log('SUCCESS: buyer-facing mobile layout regression guards passed for How ProofTTL Works and shared product navigation.')
