import { generateText } from 'ai'

const MODEL = 'nvidia/nemotron-3-super-120b-a12b'
const ACTIONS = new Set(['pulse', 'vortex', 'cool', 'heat', 'well'])
const METRICS = new Set(['speed', 'energy', 'spread', 'angular', 'density', 'entropy', 'coherence', 'drift'])

function parseBody(request) {
  if (request.body && typeof request.body === 'object') return request.body
  if (typeof request.body === 'string') {
    try { return JSON.parse(request.body) } catch {}
  }
  return null
}

function extractJson(text) {
  const raw = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try { return JSON.parse(raw) } catch {}
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1))
  throw new Error('model_did_not_return_json')
}

function normalizePlan(value) {
  const plan = value && typeof value === 'object' ? value : {}
  const action = ACTIONS.has(plan.action) ? plan.action : null
  if (!action) throw new Error('model_returned_invalid_action')
  const targetMetric = METRICS.has(plan.target_metric) ? plan.target_metric : null
  const expectedDirection = plan.expected_direction === 'raises' || plan.expected_direction === 'lowers' || plan.expected_direction === 'uncertain'
    ? plan.expected_direction : 'uncertain'
  return {
    action,
    target_metric: targetMetric,
    expected_direction: expectedDirection,
    hypothesis: String(plan.hypothesis || 'Test the intervention that best separates competing explanations.').slice(0, 280),
    rationale: String(plan.rationale || 'Chosen to maximize information gain from the current evidence.').slice(0, 520),
    confidence: Math.max(0, Math.min(1, Number(plan.confidence) || 0)),
    test_count: Math.max(1, Math.min(8, Math.round(Number(plan.test_count) || 1))),
  }
}

export default async function handler(request, response) {
  response.setHeader('cache-control', 'no-store')
  response.setHeader('content-type', 'application/json; charset=utf-8')

  if (request.method !== 'POST') {
    response.statusCode = 405
    response.end(JSON.stringify({ error: 'method_not_allowed' }))
    return
  }

  try {
    const body = parseBody(request)
    if (!body || !body.universe || !body.notebook) {
      response.statusCode = 400
      response.end(JSON.stringify({ error: 'invalid_lab_notebook' }))
      return
    }

    const serialized = JSON.stringify(body)
    if (serialized.length > 45_000) {
      response.statusCode = 413
      response.end(JSON.stringify({ error: 'lab_notebook_too_large' }))
      return
    }

    const system = `You are the meta-scientist inside Reality Engine, a synthetic experimental laboratory.
You are NOT allowed to assume Earth physics applies. The hidden law genome may describe arbitrary toy physics.
A separate local learner starts from random weights and collects observations. Your job is only to design the next high-information intervention from its compact lab notebook.

Scientific rules:
- Prefer falsification and information gain over confirming an existing belief.
- Treat contradictory findings as uncertainty to resolve, not as two discoveries.
- Prefer actions with enough observations to distinguish signal from noise, but periodically explore under-tested actions.
- Do not call a correlation a law.
- Do not claim the synthetic result transfers to the real universe.
- Return ONLY one JSON object. No markdown. No chain-of-thought. Keep rationale concise.

JSON schema:
{"action":"pulse|vortex|cool|heat|well","target_metric":"speed|energy|spread|angular|density|entropy|coherence|drift|null","expected_direction":"raises|lowers|uncertain","hypothesis":"short falsifiable hypothesis","rationale":"short reason this test has high information value","confidence":0.0,"test_count":1}`

Choose exactly one next intervention.`

    const result = await generateText({
      model: MODEL,
      system,
      prompt: serialized,
      temperature: 1,
      topP: 0.95,
      maxOutputTokens: 900,
    })

    const plan = normalizePlan(extractJson(result.text))
    response.statusCode = 200
    response.end(JSON.stringify({
      model: MODEL,
      plan,
      usage: result.usage || null,
      finishReason: result.finishReason || null,
    }))
  } catch (error) {
    console.error('Reality Engine Nemotron scientist failed', error)
    response.statusCode = 502
    response.end(JSON.stringify({
      error: 'nemotron_unavailable',
      detail: String(error?.message || error).slice(0, 280),
    }))
  }
}
