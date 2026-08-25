(() => {
  'use strict'

  const OLLAMA = 'http://127.0.0.1:11434'
  const MODEL = 'qwen3:4b'
  const priorFetch = window.fetch.bind(window)
  let localReady = false
  let probing = null
  let lastProbeAt = 0

  const ACTIONS = ['pulse','vortex','cool','heat','well']
  const METRICS = ['energy','spread','centerX','centerY']
  const DIRECTIONS = ['raises','lowers','uncertain']

  const SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
      action: { type: 'string', enum: ACTIONS },
      target_metric: { type: 'string', enum: METRICS },
      expected_direction: { type: 'string', enum: DIRECTIONS },
      hypothesis: { type: 'string' },
      rationale: { type: 'string' },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
      test_count: { type: 'integer', minimum: 1, maximum: 12 }
    },
    required: ['action','target_metric','expected_direction','hypothesis','rationale','confidence','test_count']
  }

  const SYSTEM = `You are the local senior scientist inside Reality Engine. A separate zero-pretrained learner gathers evidence by intervening in a deterministic toy universe with arbitrary hidden laws.
Do not assume Earth physics applies.
Use the supplied lab notebook as evidence.
Choose exactly one next intervention that maximizes information gain, resolves contradictions, or tries to falsify a current claim.
Prefer under-tested causal distinctions over repeating already-verified effects.
Do not claim synthetic discoveries apply to the real universe.
Return only the final experiment object matching the provided schema. Keep hypothesis and rationale concise and falsifiable.`

  function setUi(state, cls, note) {
    setTimeout(() => {
      const stateEl = document.querySelector('#nemotron-state')
      const modelEl = document.querySelector('.nemotron-model')
      const rationale = document.querySelector('#nemotron-rationale')
      if (stateEl) {
        stateEl.textContent = state
        stateEl.className = cls === 'ok' ? 'status-ok' : cls === 'bad' ? 'status-bad' : 'status-warn'
      }
      if (modelEl && localReady) modelEl.textContent = 'QWEN3 4B · LOCAL / UNLIMITED'
      if (note && rationale) rationale.textContent = note
    }, 0)
  }

  function normalize(plan) {
    if (!plan || typeof plan !== 'object') throw new Error('Local Qwen returned no experiment object')
    const action = ACTIONS.includes(plan.action) ? plan.action : null
    const target = METRICS.includes(plan.target_metric) ? plan.target_metric : null
    const direction = DIRECTIONS.includes(plan.expected_direction) ? plan.expected_direction : 'uncertain'
    if (!action || !target) throw new Error('Local Qwen returned an invalid experiment')
    const hypothesis = String(plan.hypothesis || '').trim()
    if (!hypothesis) throw new Error('Local Qwen returned no hypothesis')
    return {
      action,
      target_metric: target,
      expected_direction: direction,
      hypothesis: hypothesis.slice(0, 320),
      rationale: String(plan.rationale || 'Chosen for information gain.').trim().slice(0, 560),
      confidence: Math.max(0, Math.min(1, Number(plan.confidence) || 0)),
      test_count: Math.max(1, Math.min(12, Math.round(Number(plan.test_count) || 1)))
    }
  }

  function parseContent(content) {
    const raw = String(content || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    try { return normalize(JSON.parse(raw)) } catch {}
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start >= 0 && end > start) return normalize(JSON.parse(raw.slice(start, end + 1)))
    throw new Error('Local Qwen final answer was not structured JSON')
  }

  async function probe(force = false) {
    if (!force && Date.now() - lastProbeAt < 15000) return localReady
    if (probing) return probing
    probing = (async () => {
      lastProbeAt = Date.now()
      try {
        const response = await priorFetch(`${OLLAMA}/api/tags`, { method: 'GET', cache: 'no-store' })
        if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`)
        const data = await response.json()
        const names = (data.models || []).map(m => m.name)
        localReady = names.some(name => name === MODEL || name.startsWith(`${MODEL}:`))
        if (localReady) {
          setUi('LOCAL QWEN READY', 'ok', 'Qwen3 4B is running on this computer. Local reasoning is unlimited; Nemotron remains a cloud backup.')
        } else {
          setUi('LOCAL MODEL MISSING', 'warn', `Ollama is reachable, but ${MODEL} is not installed yet.`)
        }
      } catch {
        localReady = false
      } finally {
        probing = null
      }
      return localReady
    })()
    return probing
  }

  async function askLocal(init, think = true) {
    let body
    try { body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body } catch {}
    if (!body) throw new Error('Reality Engine lab notebook missing')

    const response = await priorFetch(`${OLLAMA}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: JSON.stringify(body) }
        ],
        format: SCHEMA,
        think,
        stream: false,
        keep_alive: '30m',
        options: {
          temperature: 0.15,
          top_p: 0.9,
          num_ctx: 4096
        }
      })
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data?.error || `Ollama HTTP ${response.status}`)
    const plan = parseContent(data?.message?.content)
    return {
      plan,
      thinking: typeof data?.message?.thinking === 'string' ? data.message.thinking : '',
      evalCount: data?.eval_count || 0,
      totalDuration: data?.total_duration || 0
    }
  }

  async function localScientist(init) {
    setUi('LOCAL QWEN THINKING', 'warn')
    let result
    try {
      result = await askLocal(init, true)
    } catch (firstError) {
      // Unlimited local inference: one deterministic final-only retry is safe and avoids parser failures.
      result = await askLocal(init, false)
    }
    setUi('LOCAL QWEN LIVE', 'ok', result.plan.rationale)
    return new Response(JSON.stringify({
      ok: true,
      provider: 'ollama-local',
      model: MODEL,
      plan: result.plan,
      local: true,
      unlimited: true,
      usage: { output_tokens: result.evalCount },
      durationNs: result.totalDuration
    }), { status: 200, headers: { 'content-type': 'application/json', 'x-reality-engine-local': 'qwen3-4b' } })
  }

  window.fetch = async (input, init) => {
    let pathname = ''
    try { pathname = new URL(typeof input === 'string' ? input : input?.url, location.href).pathname } catch {}
    if (pathname !== '/api/reality-scientist') return priorFetch(input, init)

    if (await probe()) {
      try {
        return await localScientist(init)
      } catch (error) {
        localReady = false
        setUi('LOCAL QWEN ERROR', 'bad', `Local Qwen failed: ${String(error?.message || error).slice(0, 180)}. Falling back to cloud scientist.`)
      }
    }

    return priorFetch(input, init)
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => probe(true), 900)
  })
})()
