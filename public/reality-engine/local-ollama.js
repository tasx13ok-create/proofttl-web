(() => {
  'use strict'

  const OLLAMA = 'http://127.0.0.1:11434'
  const MODEL = 'qwen3:4b'
  const MODE_KEY = 'reality-engine-scientist-mode-v2'
  const PLAN_KEY = 'reality-engine-local-qwen-plan-v2'
  const priorFetch = window.fetch.bind(window)
  let localReady = false
  let probing = null
  let lastProbeAt = 0
  let connectButton = null
  let cloudButton = null

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

  function mode() {
    try { return localStorage.getItem(MODE_KEY) || 'local' } catch { return 'local' }
  }

  function setMode(value) {
    try { localStorage.setItem(MODE_KEY, value) } catch {}
  }

  function cachedPlan() {
    try { return JSON.parse(localStorage.getItem(PLAN_KEY) || 'null') } catch { return null }
  }

  function savePlan(payload) {
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(payload)) } catch {}
  }

  function setUi(state, cls, note) {
    setTimeout(() => {
      const stateEl = document.querySelector('#nemotron-state')
      const modelEl = document.querySelector('.nemotron-model')
      const rationale = document.querySelector('#nemotron-rationale')
      if (stateEl) {
        stateEl.textContent = state
        stateEl.className = cls === 'ok' ? 'status-ok' : cls === 'bad' ? 'status-bad' : 'status-warn'
      }
      if (modelEl) {
        modelEl.textContent = mode() === 'local'
          ? 'QWEN3 4B · LOCAL / UNLIMITED'
          : 'NEMOTRON 3 SUPER 120B A12B · CLOUD BACKUP'
      }
      if (note && rationale) rationale.textContent = note
      refreshButtons()
    }, 0)
  }

  function refreshButtons() {
    if (connectButton) {
      connectButton.textContent = localReady ? 'Local Qwen connected' : 'Connect local Qwen'
      connectButton.disabled = localReady
    }
    if (cloudButton) {
      cloudButton.textContent = mode() === 'cloud' ? 'Using cloud backup' : 'Use cloud backup'
      cloudButton.disabled = mode() === 'cloud'
    }
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

  function loopbackFetch(url, init = {}) {
    const options = { ...init, mode: 'cors' }
    // Chromium 145+ uses this to classify the request as an on-device loopback request.
    options.targetAddressSpace = 'loopback'
    return priorFetch(url, options)
  }

  async function permissionState() {
    try {
      if (!navigator.permissions?.query) return 'unknown'
      const status = await navigator.permissions.query({ name: 'loopback-network' })
      return status?.state || 'unknown'
    } catch {
      try {
        const status = await navigator.permissions.query({ name: 'local-network-access' })
        return status?.state || 'unknown'
      } catch { return 'unknown' }
    }
  }

  async function probe(force = false, interactive = false) {
    if (!force && Date.now() - lastProbeAt < 15000) return localReady
    if (probing) return probing
    probing = (async () => {
      lastProbeAt = Date.now()
      try {
        if (interactive) {
          setMode('local')
          const p = await permissionState()
          setUi('REQUESTING LOCAL ACCESS', 'warn', p === 'denied'
            ? 'Browser loopback access is currently denied. Allow “Apps on device” for this site, then click Connect local Qwen again.'
            : 'Connecting this site to the Ollama service running only on this computer…')
        }
        const response = await loopbackFetch(`${OLLAMA}/api/tags`, { method: 'GET', cache: 'no-store' })
        if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`)
        const data = await response.json()
        const names = (data.models || []).map(m => m.name)
        localReady = names.some(name => name === MODEL || name.startsWith(`${MODEL}:`))
        if (!localReady) throw new Error(`${MODEL} is not installed in Ollama`)
        setMode('local')
        setUi('LOCAL QWEN READY', 'ok', 'Qwen3 4B is connected directly to this browser. Local reasoning has no API quota; cloud Nemotron is disabled unless you explicitly switch to it.')
      } catch (error) {
        localReady = false
        if (interactive) {
          const p = await permissionState()
          const detail = p === 'denied'
            ? 'Browser access to apps on this device is denied. Open this site’s permissions and allow “Apps on device”, then click Connect local Qwen again.'
            : `Could not reach Ollama from the browser (${String(error?.message || error).slice(0,120)}). Fully quit/relaunch Ollama after setting OLLAMA_ORIGINS, then click Connect local Qwen again.`
          setUi('LOCAL QWEN BLOCKED', 'bad', detail)
        } else if (mode() === 'local') {
          setUi('CONNECT LOCAL QWEN', 'warn', 'Qwen is installed on this computer, but the browser still needs permission to talk to Ollama. Click “Connect local Qwen” below. Cloud calls are paused meanwhile.')
        }
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

    const response = await loopbackFetch(`${OLLAMA}/api/chat`, {
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
    } catch {
      result = await askLocal(init, false)
    }
    const payload = {
      ok: true,
      provider: 'ollama-local',
      model: MODEL,
      plan: result.plan,
      local: true,
      unlimited: true,
      usage: { output_tokens: result.evalCount },
      durationNs: result.totalDuration
    }
    savePlan(payload)
    setUi('LOCAL QWEN LIVE', 'ok', result.plan.rationale)
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json', 'x-reality-engine-local': 'qwen3-4b' } })
  }

  function cachedLocalResponse() {
    const payload = cachedPlan()
    if (!payload?.plan) return null
    setUi('LOCAL PLAN CACHE', 'warn', 'Ollama is temporarily unreachable, so Reality Engine is reusing the last local Qwen plan without touching the cloud API.')
    return new Response(JSON.stringify({ ...payload, cached: true, provider: 'ollama-local-cache' }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-reality-engine-local': 'cache' }
    })
  }

  function localWaitingResponse() {
    return new Response(JSON.stringify({
      error: 'local_qwen_waiting_for_browser_permission',
      detail: 'Local Qwen mode is selected. Click “Connect local Qwen” in the meta-scientist panel to grant this site access to Ollama. Cloud Nemotron calls are intentionally paused.'
    }), { status: 503, headers: { 'content-type': 'application/json' } })
  }

  window.fetch = async (input, init) => {
    let pathname = ''
    try { pathname = new URL(typeof input === 'string' ? input : input?.url, location.href).pathname } catch {}
    if (pathname !== '/api/reality-scientist') return priorFetch(input, init)

    if (mode() === 'cloud') return priorFetch(input, init)

    if (localReady || await probe()) {
      try {
        return await localScientist(init)
      } catch (error) {
        localReady = false
        const cached = cachedLocalResponse()
        if (cached) return cached
        setUi('LOCAL QWEN ERROR', 'bad', `Local Qwen failed: ${String(error?.message || error).slice(0,160)}. Cloud fallback remains paused until you explicitly select it.`)
        return localWaitingResponse()
      }
    }

    const cached = cachedLocalResponse()
    if (cached) return cached
    return localWaitingResponse()
  }

  function mountControls() {
    const host = document.querySelector('.nemotron-status')
    if (!host || document.querySelector('#local-qwen-connect')) return

    connectButton = document.createElement('button')
    connectButton.id = 'local-qwen-connect'
    connectButton.className = 'ghost wide'
    connectButton.style.marginTop = '14px'
    connectButton.textContent = 'Connect local Qwen'
    connectButton.addEventListener('click', async () => {
      connectButton.disabled = true
      connectButton.textContent = 'Connecting local Qwen…'
      await probe(true, true)
      refreshButtons()
    })
    host.appendChild(connectButton)

    cloudButton = document.createElement('button')
    cloudButton.id = 'use-cloud-scientist'
    cloudButton.className = 'ghost wide'
    cloudButton.style.marginTop = '8px'
    cloudButton.textContent = 'Use cloud backup'
    cloudButton.addEventListener('click', () => {
      setMode('cloud')
      localReady = false
      setUi('CLOUD BACKUP', 'warn', 'Cloud Nemotron is selected. Its provider rate limits still apply. Click Connect local Qwen anytime to return to unlimited local reasoning.')
    })
    host.appendChild(cloudButton)

    const note = document.createElement('p')
    note.className = 'muted'
    note.style.margin = '8px 0 0'
    note.style.fontSize = '9px'
    note.textContent = 'Local mode talks only to Ollama on this computer. Your browser may ask for “Apps on device” access once.'
    host.appendChild(note)

    refreshButtons()
  }

  document.addEventListener('DOMContentLoaded', () => {
    mountControls()
    if (mode() === 'local') {
      setUi('CONNECT LOCAL QWEN', 'warn', 'Click “Connect local Qwen” once so the browser can authorize access to Ollama on this computer. Cloud calls are paused until then.')
      // Silent probe may succeed on browsers that already granted loopback access.
      setTimeout(() => probe(true, false), 1000)
    }
  })
})()
