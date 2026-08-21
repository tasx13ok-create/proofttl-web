const feedUrl = 'https://proofttl-web.vercel.app/feed.xml'
const hubUrl = 'https://pubsubhubbub.appspot.com/'
const expectedMarker = 'ProofTTL — Claim Verification Updates'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForLiveFeed() {
  let lastStatus = 0
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      const response = await fetch(`${feedUrl}?v=${Date.now()}`, {
        redirect: 'follow',
        headers: { 'cache-control': 'no-cache' },
      })
      lastStatus = response.status
      const text = await response.text()
      if (response.ok && text.includes(expectedMarker) && text.includes('rel="hub"')) {
        console.log(`Live ProofTTL Atom feed verified on attempt ${attempt}.`)
        return
      }
    } catch (error) {
      console.warn(`Feed check attempt ${attempt} failed: ${error instanceof Error ? error.message : error}`)
    }
    if (attempt < 8) await sleep(15000)
  }
  throw new Error(`ProofTTL live feed did not become ready for WebSub publishing. Last HTTP status: ${lastStatus || 'unreachable'}`)
}

async function publish() {
  await waitForLiveFeed()
  const body = new URLSearchParams({
    'hub.mode': 'publish',
    'hub.url': feedUrl,
  })
  const response = await fetch(hubUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  const responseText = await response.text()
  if (![200, 204].includes(response.status)) {
    throw new Error(`WebSub hub rejected ProofTTL feed: HTTP ${response.status}${responseText ? ` · ${responseText.slice(0, 300)}` : ''}`)
  }
  console.log(`WebSub hub accepted ProofTTL feed publication with HTTP ${response.status}.`)
}

publish().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
