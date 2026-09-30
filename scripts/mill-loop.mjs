import fs from 'node:fs/promises'

const STATE_PATH = new URL('../public/mill-state.json', import.meta.url)
const HN = 'https://hacker-news.firebaseio.com/v0'

function scoreTitle(title = '') {
  const t = title.toLowerCase()
  let score = 20
  const strong = ['ask hn', 'how do', 'how can', 'looking for', 'recommend', 'alternative', 'need a', 'is there a', 'best way', 'tool for']
  for (const phrase of strong) if (t.includes(phrase)) score += 11
  if (/\b(ai|agent|llm|automation|workflow|verify|audit|developer|api|data|security)\b/.test(t)) score += 9
  if (/\b(problem|pain|slow|expensive|manual|broken|difficult|hard)\b/.test(t)) score += 7
  return Math.min(score, 100)
}

function offerFor(title = '') {
  const t = title.toLowerCase()
  if (t.includes('agent') || t.includes('ai') || t.includes('llm')) return ['AI workflow/checklist micro-kit', 5]
  if (t.includes('api') || t.includes('developer')) return ['developer reference/checker', 7]
  if (t.includes('security') || t.includes('verify')) return ['verification checklist', 9]
  return ['focused template/checklist', 5]
}

async function fetchCandidateItems() {
  const ids = await fetch(`${HN}/topstories.json`).then(r => r.json())
  const sample = ids.slice(0, 70)
  const items = await Promise.all(sample.map(id => fetch(`${HN}/item/${id}.json`).then(r => r.json()).catch(() => null)))
  return items.filter(Boolean).filter(x => x.type === 'story' && x.title)
}

async function maybeAskClaude(candidates) {
  const key = process.env.ANTHROPIC_API_KEY
  const model = process.env.MILL_MODEL
  if (!key || !model || candidates.length === 0) return { mode: 'deterministic', candidates }

  const payload = {
    model,
    max_tokens: 1200,
    temperature: 0,
    messages: [{
      role: 'user',
      content: `You are MILL's opportunity judge. Rank these public demand signals for a tiny, ethical, automatically fulfilled digital product. Reject spam, deception, regulated/high-risk offers, and anything needing invented credentials. Return strict JSON array only with at most 8 objects: {"id","score","signal","offer","price","status"}. status must be "draft". Candidates:\n${JSON.stringify(candidates)}`
    }]
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const body = await res.json()
    const text = body?.content?.find(x => x.type === 'text')?.text || ''
    const parsed = JSON.parse(text)
    const map = new Map(candidates.map(c => [String(c.id), c]))
    const merged = parsed.map(p => ({ ...map.get(String(p.id)), ...p })).filter(x => x.title && x.url)
    return { mode: `claude:${model}`, candidates: merged.slice(0, 8) }
  } catch (err) {
    console.error('Claude judge failed; using deterministic fallback:', err.message)
    return { mode: 'deterministic-fallback', candidates }
  }
}

async function main() {
  const items = await fetchCandidateItems()
  const ranked = items
    .map(item => {
      const [offer, price] = offerFor(item.title)
      const score = scoreTitle(item.title)
      return {
        id: String(item.id),
        title: item.title,
        url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        score,
        signal: score >= 60 ? 'strong problem/buyer-intent language' : 'possible demand signal; requires validation',
        offer,
        price,
        status: 'draft',
      }
    })
    .filter(x => x.score >= 42)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  const judged = await maybeAskClaude(ranked)
  let existing = { revenueCents: 0, spendCents: 0 }
  try { existing = JSON.parse(await fs.readFile(STATE_PATH, 'utf8')) } catch {}

  const next = {
    generatedAt: new Date().toISOString(),
    mode: judged.mode,
    revenueCents: Number(existing.revenueCents || 0),
    spendCents: Number(existing.spendCents || 0),
    candidates: judged.candidates,
  }

  await fs.writeFile(STATE_PATH, JSON.stringify(next, null, 2) + '\n')
  console.log(`MILL: wrote ${next.candidates.length} candidates in ${next.mode} mode`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
