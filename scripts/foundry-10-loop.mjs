import fs from 'node:fs/promises'

const STATE_PATH = new URL('../public/foundry-10-state.json', import.meta.url)
const HN = 'https://hacker-news.firebaseio.com/v0'
const ENABLE_PAID_MODELS = process.env.FOUNDRY_ENABLE_PAID_MODELS === '1'
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''
const MODEL = process.env.FOUNDRY_MODEL || process.env.MILL_MODEL || ''

const AGENTS = [
  { id: 'scout-a', name: 'Opportunity Scout A', role: 'discovery', pairId: 'pair-discovery' },
  { id: 'scout-b', name: 'Opportunity Scout B', role: 'discovery', pairId: 'pair-discovery' },
  { id: 'validator-a', name: 'Demand Validator A', role: 'validation', pairId: 'pair-validation' },
  { id: 'validator-b', name: 'Demand Validator B', role: 'validation', pairId: 'pair-validation' },
  { id: 'builder-a', name: 'Product Builder A', role: 'product', pairId: 'pair-product' },
  { id: 'builder-b', name: 'Product Builder B', role: 'product', pairId: 'pair-product' },
  { id: 'distribution-a', name: 'Distribution Scout A', role: 'distribution', pairId: 'pair-distribution' },
  { id: 'distribution-b', name: 'Distribution Scout B', role: 'distribution', pairId: 'pair-distribution' },
  { id: 'finance', name: 'Finance Analyst', role: 'finance', pairId: 'pair-governance' },
  { id: 'risk', name: 'Risk & Kill Agent', role: 'risk', pairId: 'pair-governance' },
]

const banned = /\b(gambling|casino|weapon|gun|ammo|drugs|steroid|fake review|impersonat|ticket scalping|credential|bypass|spam)\b/i
const pain = /\b(problem|pain|manual|slow|expensive|broken|difficult|hard|annoying|frustrating|stuck|need|looking for|how do|how can|is there a|recommend|alternative)\b/i
const buyer = /\b(business|client|customer|team|company|freelance|developer|creator|seller|owner|manager)\b/i
const automatable = /\b(ai|agent|automation|workflow|spreadsheet|template|calculator|generator|checker|audit|report|api|data|seo|invoice|resume)\b/i

function cents(n) {
  return Math.round(Number(n || 0))
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function scoreSignal(title, source) {
  let score = source === 'ask' ? 28 : 18
  if (pain.test(title)) score += 24
  if (buyer.test(title)) score += 14
  if (automatable.test(title)) score += 16
  if (/\?/.test(title)) score += 6
  if (title.length > 35 && title.length < 140) score += 6
  if (banned.test(title)) score -= 100
  return clamp(score, 0, 100)
}

function offerFor(title) {
  const t = title.toLowerCase()
  if (t.includes('resume') || t.includes('job')) return { offer: 'Resume bullet + application tune-up pack', price: 9, format: 'digital-service' }
  if (t.includes('invoice') || t.includes('freelance')) return { offer: 'Freelance invoice + scope wording kit', price: 7, format: 'digital-kit' }
  if (t.includes('seo') || t.includes('title') || t.includes('youtube')) return { offer: 'SEO/title decision helper', price: 5, format: 'micro-tool' }
  if (t.includes('calculator') || t.includes('spreadsheet')) return { offer: 'Focused calculator / spreadsheet helper', price: 7, format: 'micro-tool' }
  if (t.includes('ai') || t.includes('agent') || t.includes('llm')) return { offer: 'AI workflow review micro-product', price: 9, format: 'digital-service' }
  if (t.includes('audit') || t.includes('verify') || t.includes('checker')) return { offer: 'Verification checklist / checker', price: 9, format: 'micro-tool' }
  return { offer: 'Focused checklist + template', price: 5, format: 'digital-kit' }
}

function channelFor(title) {
  const t = title.toLowerCase()
  if (t.includes('developer') || t.includes('api') || t.includes('software')) return 'developer communities + search'
  if (t.includes('resume') || t.includes('job')) return 'search + truthful freelance listing'
  if (t.includes('creator') || t.includes('youtube') || t.includes('seo')) return 'creator communities + search'
  return 'search + direct product landing page'
}

async function fetchIds(name, limit) {
  try {
    const res = await fetch(HN + '/' + name + '.json')
    if (!res.ok) return []
    const ids = await res.json()
    return Array.isArray(ids) ? ids.slice(0, limit) : []
  } catch {
    return []
  }
}

async function fetchSignals() {
  const [askIds, topIds] = await Promise.all([
    fetchIds('askstories', 80),
    fetchIds('topstories', 50),
  ])

  const source = new Map()
  for (const id of askIds) source.set(id, 'ask')
  for (const id of topIds) if (!source.has(id)) source.set(id, 'top')

  const ids = [...source.keys()]
  const items = await Promise.all(ids.map(async (id) => {
    try {
      const res = await fetch(HN + '/item/' + id + '.json')
      if (!res.ok) return null
      const item = await res.json()
      if (!item || item.type !== 'story' || !item.title) return null
      return { ...item, foundrySource: source.get(id) }
    } catch {
      return null
    }
  }))

  return items.filter(Boolean)
}

function deterministicAgent(agent, context) {
  const lead = context.lead
  if (!lead) return 'No compliant lead cleared the current threshold.'

  if (agent.role === 'discovery') {
    return agent.id.endsWith('a')
      ? 'Prioritize explicit pain plus buyer language; current lead score ' + lead.score + '.'
      : 'Cross-check whether the pain is narrow enough to solve with a tiny paid artifact before building.'
  }
  if (agent.role === 'validation') {
    return agent.id.endsWith('a')
      ? 'Validation pass: demand signal is public but payment intent is not proven. Require a low-friction price test.'
      : 'Counter-check: avoid building if the solution requires credentials, regulated advice, or custom support.'
  }
  if (agent.role === 'product') {
    return agent.id.endsWith('a')
      ? 'Build the smallest useful version of "' + lead.offer + '" with one clear outcome.'
      : 'Review scope: remove features that do not change purchase intent or fulfillment quality.'
  }
  if (agent.role === 'distribution') {
    return agent.id.endsWith('a')
      ? 'Primary channel: ' + lead.channel + '. Use truthful positioning and no unsolicited spam.'
      : 'Backup channel: publish a useful landing page or marketplace listing only where automation is allowed.'
  }
  if (agent.role === 'finance') {
    return 'Hold paid expansion until realized profit clears the governor. Suggested test price $' + lead.price + '.'
  }
  return lead.score < 55
    ? 'Kill recommendation: signal too weak for build time.'
    : 'Risk pass: no banned category detected; keep claims narrow and fulfillment truthful.'
}

async function askClaude(agent, context) {
  if (!ENABLE_PAID_MODELS || !ANTHROPIC_KEY || !MODEL) {
    return { mode: 'deterministic-zero-spend', note: deterministicAgent(agent, context), usage: null }
  }

  const prompt = [
    'You are one worker inside FOUNDRY-10, a supervised revenue lab.',
    'Role: ' + agent.name + ' (' + agent.role + ').',
    'You share pair task ' + agent.pairId + ' with another worker who must independently check the same task.',
    'Only suggest legal, truthful, low-cost work. No spam, deception, credential abuse, fake reviews, regulated claims, ticket scalping, or marketplace ToS violations.',
    'Return one concise recommendation under 90 words. Do not claim sales, traffic, or validation that is not in the data.',
    'Context: ' + JSON.stringify(context),
  ].join('\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 220,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error('Anthropic HTTP ' + res.status)
    const body = await res.json()
    const note = body && body.content && body.content.find((x) => x.type === 'text')
    return {
      mode: 'claude:' + MODEL,
      note: note ? note.text.trim() : deterministicAgent(agent, context),
      usage: body.usage || null,
    }
  } catch (err) {
    return { mode: 'deterministic-fallback', note: deterministicAgent(agent, context), usage: null, error: String(err && err.message || err) }
  }
}

function reinvestCeiling(profitCents) {
  if (profitCents <= 2500) return 0
  if (profitCents <= 10000) return Math.floor(profitCents * 0.20)
  if (profitCents <= 50000) return Math.floor(profitCents * 0.25)
  return Math.floor(profitCents * 0.30)
}

async function loadExisting() {
  try {
    return JSON.parse(await fs.readFile(STATE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

async function main() {
  const existing = await loadExisting()
  const raw = await fetchSignals()
  const candidates = raw
    .map((item) => {
      const score = scoreSignal(item.title, item.foundrySource)
      const product = offerFor(item.title)
      return {
        id: String(item.id),
        title: item.title,
        url: item.url || 'https://news.ycombinator.com/item?id=' + item.id,
        source: item.foundrySource,
        score,
        offer: product.offer,
        price: product.price,
        format: product.format,
        channel: channelFor(item.title),
        status: score >= 70 ? 'validate-now' : score >= 55 ? 'watch' : 'reject',
      }
    })
    .filter((x) => x.score >= 45 && !banned.test(x.title))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  const lead = candidates[0] || null
  const context = {
    generatedAt: new Date().toISOString(),
    lead,
    candidates: candidates.slice(0, 6),
    realizedRevenueCents: cents(existing.revenueCents),
    realizedSpendCents: cents(existing.spendCents),
    paidInferenceEnabled: ENABLE_PAID_MODELS,
  }

  const agentResults = await Promise.all(AGENTS.map(async (agent) => {
    const result = await askClaude(agent, context)
    return {
      ...agent,
      status: lead ? 'working' : 'idle',
      taskId: agent.pairId,
      currentTask: lead ? (
        agent.role === 'discovery' ? 'Find and cross-check demand signals' :
        agent.role === 'validation' ? 'Validate payment intent for top lead' :
        agent.role === 'product' ? 'Design the smallest sellable product' :
        agent.role === 'distribution' ? 'Find compliant acquisition paths' :
        agent.role === 'finance' ? 'Audit economics and reinvestment ceiling' :
        'Attack-test risk and decide kill/hold'
      ) : 'Waiting for a compliant lead',
      note: result.note,
      mode: result.mode,
      usage: result.usage,
      revenueInfluencedCents: 0,
      lastActionAt: new Date().toISOString(),
    }
  }))

  const revenueCents = cents(existing.revenueCents)
  const spendCents = cents(existing.spendCents)
  const profitCents = revenueCents - spendCents
  const ceiling = reinvestCeiling(profitCents)

  const experiments = candidates.slice(0, 5).map((c, i) => ({
    id: 'exp-' + c.id,
    title: c.offer,
    sourceTitle: c.title,
    sourceUrl: c.url,
    score: c.score,
    price: c.price,
    channel: c.channel,
    format: c.format,
    stage: i === 0 && c.score >= 60 ? 'validation' : 'queued',
    revenueCents: 0,
    spendCents: 0,
    netProfitCents: 0,
    nextGate: i === 0 ? 'prove buyer intent before build' : 'wait for higher-ranked experiment',
  }))

  const tasks = [
    { id: 'pair-discovery', title: 'Discover + cross-check signals', agentIds: ['scout-a', 'scout-b'], status: 'active' },
    { id: 'pair-validation', title: 'Validate buyer intent', agentIds: ['validator-a', 'validator-b'], status: lead ? 'active' : 'blocked' },
    { id: 'pair-product', title: 'Design minimum sellable product', agentIds: ['builder-a', 'builder-b'], status: lead ? 'active' : 'blocked' },
    { id: 'pair-distribution', title: 'Find compliant distribution', agentIds: ['distribution-a', 'distribution-b'], status: lead ? 'active' : 'blocked' },
    { id: 'pair-governance', title: 'Finance + risk gate', agentIds: ['finance', 'risk'], status: lead ? 'active' : 'blocked' },
  ]

  const next = {
    generatedAt: new Date().toISOString(),
    system: 'FOUNDRY-10',
    mode: ENABLE_PAID_MODELS ? 'paid-models-allowed' : 'zero-spend',
    cloudOnly: true,
    revenueCents,
    spendCents,
    profitCents,
    reinvestCeilingCents: ceiling,
    paidInferenceEnabled: ENABLE_PAID_MODELS,
    connectors: {
      hackerNews: { status: 'active', cost: 'free' },
      anthropic: { status: ENABLE_PAID_MODELS ? 'enabled-if-secret-present' : 'disabled-by-zero-spend-governor' },
      tinyfish: { status: 'not-embedded', reason: 'Connected ChatGPT plugin is metered and is not a GitHub Actions credential. Keep disabled until explicit reinvestment budget exists.' },
    },
    agents: agentResults,
    tasks,
    candidates,
    experiments,
    eventLog: [
      {
        at: new Date().toISOString(),
        type: 'cycle',
        message: '10 agents completed five paired task passes. No revenue is counted unless recorded as realized.',
      },
    ],
  }

  await fs.writeFile(STATE_PATH, JSON.stringify(next, null, 2) + '\n')
  console.log('FOUNDRY-10: wrote state with ' + next.agents.length + ' agents, ' + next.candidates.length + ' candidates, ' + next.experiments.length + ' experiments.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
