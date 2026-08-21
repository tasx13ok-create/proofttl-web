const host = 'proofttl-web.vercel.app'
const origin = `https://${host}`
const key = 'eeb839768ece1e938e70459af4bd3c90'
const keyLocation = `${origin}/${key}.txt`

const paths = [
  '/',
  '/about/',
  '/audit/',
  '/audit/sample/',
  '/services/',
  '/services/ai-claim-verification/',
  '/services/ai-output-fact-checking/',
  '/services/ai-hallucination-checking/',
  '/services/pre-publication-fact-checking/',
  '/services/marketing-claim-verification/',
  '/services/startup-claim-verification/',
  '/services/due-diligence-claim-verification/',
  '/services/research-claim-verification/',
  '/services/website-claim-audit/',
  '/services/source-backed-fact-checking/',
  '/faq/',
  '/machine-definition/',
  '/glossary/',
  '/how-proofttl-works/',
  '/trust/',
  '/solutions/fact-verification-api/',
  '/solutions/claim-verification-api/',
  '/solutions/ai-agent-verification/',
  '/solutions/source-monitoring-api/',
  '/solutions/stale-data-detection/',
  '/solutions/evidence-verification-api/',
  '/solutions/fact-leases/',
  '/feed.xml',
  '/sitemap.xml',
  '/sitemap.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/.well-known/proofttl.json',
  '/.well-known/proofttl-intents.json',
].map((path) => new URL(path, origin).href)

async function assertKey() {
  const response = await fetch(keyLocation, { redirect: 'follow' })
  const text = (await response.text()).trim()
  if (!response.ok || text !== key) {
    throw new Error(`IndexNow key verification failed: HTTP ${response.status}`)
  }
}

async function submit() {
  await assertKey()
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList: paths }),
  })
  const body = await response.text()
  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow rejected submission: HTTP ${response.status}${body ? ` · ${body.slice(0, 300)}` : ''}`)
  }
  console.log(`IndexNow accepted ${paths.length} ProofTTL URLs with HTTP ${response.status}.`)
}

submit().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
