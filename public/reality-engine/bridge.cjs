'use strict'

const http = require('http')
const { URL } = require('url')

const PORT = Number(process.env.REALITY_ENGINE_PORT || 4317)
const HOST = '127.0.0.1'
const OLLAMA = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const MODEL = process.env.REALITY_ENGINE_MODEL || 'qwen3:4b'
const VERSION = '0.3.0-rc1'
const ALLOWED_ORIGINS = new Set([
  'https://proofttl-web.vercel.app',
  'https://proofttl-web-tasx13ok-1769s-projects.vercel.app',
  'https://proofttl-web-git-main-tasx13ok-1769s-projects.vercel.app',
  'http://127.0.0.1:4317',
  'http://localhost:4317'
])

const ACTIONS = ['pulse', 'vortex', 'cool', 'heat', 'well']
const METRICS = ['energy', 'spread', 'centerX', 'centerY']
const DIRECTIONS = ['raises', 'lowers', 'uncertain']

const SCIENCE_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    action: { type: 'string', enum: ACTIONS },
    target_metric: { type: 'string', enum: METRICS },
    expected_direction: { type: 'string', enum: DIRECTIONS },
    hypothesis: { type: 'string' },
    rationale: { type: 'string' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    test_count: { type: 'integer', minimum: 1, maximum: 20 }
  },
  required: ['action','target_metric','expected_direction','hypothesis','rationale','confidence','test_count']
}

const CHAT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    reply: { type: 'string' },
    commands: {
      type: 'array', maxItems: 6,
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          type: { type: 'string', enum: ['run_experiment','compare_actions','consult','pause','resume'] },
          action: { type: 'string', enum: ACTIONS },
          actions: { type: 'array', maxItems: 5, items: { type: 'string', enum: ACTIONS } },
          trials: { type: 'integer', minimum: 1, maximum: 20 },
          trials_each: { type: 'integer', minimum: 1, maximum: 10 },
          reason: { type: 'string' }
        },
        required: ['type']
      }
    },
    proposed_hypothesis: { type: ['string','null'] }
  },
  required: ['reply','commands','proposed_hypothesis']
}

const SCIENCE_SYSTEM = `You are Qwen3 acting as the senior experimental scientist inside Reality Engine.
A separate zero-pretrained local learner gathers controlled evidence inside a synthetic universe with hidden arbitrary laws.
Never assume Earth physics. Use only the supplied notebook, theory ledger, current state, and controlled-trial summaries.
Choose ONE next experiment that maximizes information gain, resolves a contradiction, probes a regime boundary, or attempts to falsify a current hypothesis.
Prefer under-tested causal distinctions to repeating an already verified effect.
Return only the requested structured experiment. Do not expose chain-of-thought. Synthetic findings are not claims about the real universe.`

const CHAT_SYSTEM = `You are Qwen3, the interactive Science Director for Reality Engine.
You can talk naturally with the operator and can request REAL controlled experiments in the synthetic universe.
You are not pretending to run experiments: commands you return are validated and executed by the engine.
Available interventions: pulse, vortex, cool, heat, well.
Use evidence in the supplied lab context. Challenge weak conclusions. Treat contradictions as opportunities to test conditional laws.
When useful, request run_experiment or compare_actions commands. Keep batches efficient; do not spam experiments without a reason.
Never claim the toy universe proves facts about real physics. Do not expose chain-of-thought. Return only the requested structured response.`

function isLoopback(address = '') {
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

function allowedOrigin(origin) { return !origin || ALLOWED_ORIGINS.has(origin) }

function cors(req, res) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin, Access-Control-Request-Private-Network')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '600')
  if (String(req.headers['access-control-request-private-network']).toLowerCase() === 'true') res.setHeader('Access-Control-Allow-Private-Network', 'true')
  res.setHeader('Cache-Control', 'no-store')
}

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

async function readBody(req, max = 1500000) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > max) throw new Error('request body too large')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

async function ollama(path, init = {}, timeoutMs = 120000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${OLLAMA}${path}`, { ...init, signal: controller.signal })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || `Ollama HTTP ${response.status}`)
    return data
  } finally { clearTimeout(timer) }
}

function parseObject(content) {
  if (content && typeof content === 'object') return content
  const raw = String(content || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  if (!raw) throw new Error('model returned an empty final response')
  try { return JSON.parse(raw) } catch {}
  const first = raw.indexOf('{'), last = raw.lastIndexOf('}')
  if (first >= 0 && last > first) return JSON.parse(raw.slice(first, last + 1))
  throw new Error('model final response was not JSON')
}

async function chatOllama(messages, schema, think = true) {
  const payload = { model: MODEL, messages, format: schema, think, stream: false, keep_alive: '30m', options: { temperature: 0.15, top_p: 0.9, num_ctx: 4096 } }
  const data = await ollama('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  return { parsed: parseObject(data?.message?.content), raw: data }
}

async function structured(messages, schema) {
  try { return await chatOllama(messages, schema, true) }
  catch (firstError) {
    const retry = [...messages]
    retry[0] = { ...retry[0], content: `${retry[0].content}\nReturn only the final structured object. No reasoning text.` }
    try { return await chatOllama(retry, schema, false) }
    catch (secondError) { throw new Error(`Qwen structured response failed: ${secondError.message || firstError.message}`) }
  }
}

function validateScience(plan) {
  if (!plan || !ACTIONS.includes(plan.action) || !METRICS.includes(plan.target_metric)) throw new Error('invalid experiment plan')
  const hypothesis = String(plan.hypothesis || '').trim()
  if (!hypothesis) throw new Error('experiment plan had no hypothesis')
  return { action: plan.action, target_metric: plan.target_metric, expected_direction: DIRECTIONS.includes(plan.expected_direction) ? plan.expected_direction : 'uncertain', hypothesis: hypothesis.slice(0, 420), rationale: String(plan.rationale || 'Selected for information gain.').trim().slice(0, 700), confidence: Math.max(0, Math.min(1, Number(plan.confidence) || 0)), test_count: Math.max(1, Math.min(20, Math.round(Number(plan.test_count) || 1))) }
}

function validateChat(result) {
  const commands = []
  for (const cmd of Array.isArray(result?.commands) ? result.commands : []) {
    if (!['run_experiment','compare_actions','consult','pause','resume'].includes(cmd?.type)) continue
    if (cmd.type === 'run_experiment') {
      if (!ACTIONS.includes(cmd.action)) continue
      commands.push({ type: cmd.type, action: cmd.action, trials: Math.max(1, Math.min(20, Math.round(Number(cmd.trials) || 1))), reason: String(cmd.reason || '').slice(0,240) })
    } else if (cmd.type === 'compare_actions') {
      const actions = [...new Set((Array.isArray(cmd.actions) ? cmd.actions : []).filter(a => ACTIONS.includes(a)))].slice(0,5)
      if (actions.length < 2) continue
      commands.push({ type: cmd.type, actions, trials_each: Math.max(1, Math.min(10, Math.round(Number(cmd.trials_each) || 2))), reason: String(cmd.reason || '').slice(0,240) })
    } else commands.push({ type: cmd.type, reason: String(cmd.reason || '').slice(0,240) })
  }
  return { reply: String(result?.reply || 'I need more evidence before choosing a useful next step.').slice(0,2400), commands, proposed_hypothesis: result?.proposed_hypothesis == null ? null : String(result.proposed_hypothesis).slice(0,500) }
}

async function health() {
  const [tags, ps, version] = await Promise.all([ollama('/api/tags', {}, 5000), ollama('/api/ps', {}, 5000).catch(() => ({ models: [] })), ollama('/api/version', {}, 5000).catch(() => ({}))])
  const models = (tags.models || []).map(m => m.name)
  const loaded = (ps.models || []).find(m => m.name === MODEL || String(m.name || '').startsWith(`${MODEL}:`)) || null
  return { ok: true, bridge: VERSION, ollama: version.version || 'unknown', model: MODEL, installed: models.includes(MODEL) || models.some(n => n.startsWith(`${MODEL}:`)), loaded }
}

const server = http.createServer(async (req, res) => {
  cors(req, res)
  if (!isLoopback(req.socket.remoteAddress)) return json(res, 403, { error: 'loopback_only' })
  if (!allowedOrigin(req.headers.origin)) return json(res, 403, { error: 'origin_not_allowed' })
  if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end() }
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  try {
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, await health())
    if (req.method === 'POST' && url.pathname === '/science') {
      const body = await readBody(req)
      const context = { universe: body.universe || {}, notebook: body.notebook || {}, theories: body.theories || [], regimes: body.regimes || {}, recent_trials: body.recent_trials || [] }
      const result = await structured([{ role: 'system', content: SCIENCE_SYSTEM },{ role: 'user', content: JSON.stringify(context) }], SCIENCE_SCHEMA)
      return json(res, 200, { ok: true, provider: 'ollama-local-bridge', model: MODEL, plan: validateScience(result.parsed), usage: { prompt: result.raw.prompt_eval_count || 0, output: result.raw.eval_count || 0 }, duration_ns: result.raw.total_duration || 0 })
    }
    if (req.method === 'POST' && url.pathname === '/chat') {
      const body = await readBody(req)
      const messages = Array.isArray(body.messages) ? body.messages.slice(-12).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0,4000) })) : []
      const result = await structured([{ role: 'system', content: CHAT_SYSTEM }, ...messages, { role: 'user', content: `CURRENT_LAB_CONTEXT\n${JSON.stringify(body.context || {})}` }], CHAT_SCHEMA)
      return json(res, 200, { ok: true, provider: 'ollama-local-bridge', model: MODEL, ...validateChat(result.parsed), usage: { prompt: result.raw.prompt_eval_count || 0, output: result.raw.eval_count || 0 }, duration_ns: result.raw.total_duration || 0 })
    }
    return json(res, 404, { error: 'not_found' })
  } catch (error) {
    const message = String(error?.message || error)
    const status = /aborted|timeout/i.test(message) ? 504 : /JSON|body too large|invalid experiment/i.test(message) ? 400 : 502
    return json(res, status, { error: 'bridge_request_failed', detail: message.slice(0,600) })
  }
})

server.listen(PORT, HOST, async () => {
  console.log(`\nReality Engine Local Runtime ${VERSION}`)
  console.log(`Bridge: http://${HOST}:${PORT}`)
  console.log(`Model:  ${MODEL}`)
  try { const h = await health(); console.log(`Ollama: ${h.ollama} · model ${h.installed ? 'installed' : 'MISSING'}`); if (!h.installed) console.log(`Run: ollama pull ${MODEL}`) }
  catch (error) { console.log(`Ollama not reachable: ${error.message}`) }
  console.log('Keep this window open while Reality Engine is running.\n')
})

process.on('SIGINT', () => server.close(() => process.exit(0)))
