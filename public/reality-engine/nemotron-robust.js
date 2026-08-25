(() => {
  'use strict'

  const KEY_STORE = 'reality-engine-openrouter-key-v1'
  const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'
  const CHAT = 'https://openrouter.ai/api/v1/chat/completions'
  const previousFetch = window.fetch.bind(window)
  const ACTIONS = ['pulse', 'vortex', 'cool', 'heat', 'well']
  const METRICS = ['energy', 'spread', 'centerX', 'centerY']
  const DIRS = ['raises', 'lowers', 'uncertain']

  const SYSTEM = `You are the meta-scientist inside Reality Engine. A separate local learner starts from random weights and gathers evidence inside a toy universe with arbitrary hidden laws. Never assume Earth physics. Choose exactly one high-information intervention that helps falsify or separate competing explanations. Treat contradictions as uncertainty to resolve. Prefer information gain over confirmation. Do not claim synthetic results transfer to the real universe. Do not describe your reasoning process. Return only the requested final experiment.`

  const TOOL = {
    type: 'function',
    function: {
      name: 'propose_experiment',
      description: 'Choose the next falsifiable Reality Engine experiment.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', enum: ACTIONS },
          target_metric: { type: 'string', enum: METRICS },
          expected_direction: { type: 'string', enum: DIRS },
          hypothesis: { type: 'string' },
          rationale: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          test_count: { type: 'integer', minimum: 1, maximum: 8 }
        },
        required: ['action','target_metric','expected_direction','hypothesis','rationale','confidence','test_count']
      }
    }
  }

  function key() {
    try { return localStorage.getItem(KEY_STORE) || '' } catch { return '' }
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)) }

  function normalize(v) {
    if (!v || typeof v !== 'object') throw new Error('no experiment object')
    const actionText = String(v.action || '').trim().toLowerCase()
    const metricText = String(v.target_metric || v.target || '').trim().toLowerCase()
    const dirText = String(v.expected_direction || v.direction || '').trim().toLowerCase()
    const action = ACTIONS.find(a => actionText === a || actionText.includes(a))
    const metric = METRICS.find(m => metricText === m.toLowerCase())
    const direction = DIRS.find(d => dirText === d || dirText.includes(d)) || 'uncertain'
    if (!action) throw new Error('missing valid intervention')
    const hypothesis = String(v.hypothesis || '').trim()
    const rationale = String(v.rationale || v.why || '').trim()
    if (!hypothesis || /^(we need|i need|the user|the prompt|we must|i should)\b/i.test(hypothesis)) {
      throw new Error('missing final hypothesis')
    }
    return {
      action,
      target_metric: metric || 'energy',
      expected_direction: direction,
      hypothesis: hypothesis.slice(0, 280),
      rationale: (rationale || 'Chosen to resolve uncertainty in the current experiment history.').slice(0, 520),
      confidence: clamp(Number(v.confidence) || 0, 0, 1),
      test_count: clamp(Math.round(Number(v.test_count || v.count) || 1), 1, 8)
    }
  }

  function balancedObject(s) {
    const start = s.indexOf('{')
    if (start < 0) return ''
    let depth = 0, quote = '', esc = false
    for (let i = start; i < s.length; i++) {
      const c = s[i]
      if (quote) {
        if (esc) { esc = false; continue }
        if (c === '\\') { esc = true; continue }
        if (c === quote) quote = ''
        continue
      }
      if (c === '"' || c === "'") { quote = c; continue }
      if (c === '{') depth++
      if (c === '}' && --depth === 0) return s.slice(start, i + 1)
    }
    return ''
  }

  function repairJsonish(s) {
    return s
      .replace(/<\/?(?:tool_call|function|arguments)[^>]*>/gi, '')
      .replace(/\bNone\b/g, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false')
      .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, x) => `"${x.replace(/"/g, '\\"')}"`)
      .replace(/,\s*([}\]])/g, '$1')
  }

  function parseJsonish(value) {
    if (value && typeof value === 'object') return normalize(value)
    let s = String(value || '').trim()
    if (!s) throw new Error('empty model output')
    s = s.replace(/^```(?:json|javascript|python)?\s*/i, '').replace(/\s*```$/i, '')
    try { return normalize(JSON.parse(s)) } catch {}
    try {
      const unwrapped = JSON.parse(s)
      if (typeof unwrapped === 'string') return parseJsonish(unwrapped)
    } catch {}
    const fn = s.match(/propose_experiment\s*\(([^]*)\)\s*;?\s*$/i)
    if (fn) {
      try { return parseJsonish(fn[1]) } catch {}
    }
    const obj = balancedObject(s)
    if (obj) {
      try { return normalize(JSON.parse(obj)) } catch {}
      try { return normalize(JSON.parse(repairJsonish(obj))) } catch {}
    }
    throw new Error('model output was not a final experiment object')
  }

  function contentText(message) {
    if (typeof message?.content === 'string') return message.content.trim()
    if (Array.isArray(message?.content)) {
      return message.content.map(p => typeof p?.text === 'string' ? p.text : '').filter(Boolean).join('\n').trim()
    }
    return ''
  }

  function parseToolMessage(message) {
    const calls = Array.isArray(message?.tool_calls) ? message.tool_calls : []
    for (const call of calls) {
      if (call?.function?.name && call.function.name !== 'propose_experiment') continue
      for (const candidate of [call?.function?.arguments, call?.arguments, call?.input]) {
        if (candidate == null) continue
        try { return parseJsonish(candidate) } catch {}
      }
    }
    throw new Error('no usable propose_experiment tool call')
  }

  function parseProtocol(text) {
    const lines = String(text || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean)
    const line = lines.find(x => /^ACTION\s*=/i.test(x)) || ''
    if (!line) throw new Error('no final protocol line')
    const get = name => {
      const re = new RegExp(`(?:^|\\|)\\s*${name}\\s*=\\s*([^|]+)`, 'i')
      return (line.match(re)?.[1] || '').trim()
    }
    return normalize({
      action: get('ACTION'),
      target_metric: get('TARGET'),
      expected_direction: get('DIR'),
      confidence: get('CONF'),
      test_count: get('COUNT'),
      hypothesis: get('HYP'),
      rationale: get('WHY')
    })
  }

  function diagnostic(data) {
    const message = data?.choices?.[0]?.message || {}
    const content = contentText(message)
    const finish = data?.choices?.[0]?.finish_reason || 'unknown'
    const toolCount = Array.isArray(message.tool_calls) ? message.tool_calls.length : 0
    return `finish=${finish}; tools=${toolCount}; content=${content.slice(0, 120).replace(/\s+/g, ' ') || '<empty>'}`
  }

  async function call(apiKey, notebook, mode) {
    const base = {
      model: MODEL,
      temperature: 0,
      top_p: 1,
      max_tokens: mode === 'protocol' ? 650 : 1000,
      reasoning: { effort: 'none', exclude: true },
      messages: []
    }

    if (mode === 'tool') {
      base.messages = [
        { role: 'system', content: SYSTEM + '\nCall propose_experiment exactly once. Do not output prose.' },
        { role: 'user', content: JSON.stringify(notebook) }
      ]
      base.tools = [TOOL]
      base.tool_choice = { type: 'function', function: { name: 'propose_experiment' } }
      base.parallel_tool_calls = false
    } else if (mode === 'json') {
      base.messages = [
        { role: 'system', content: SYSTEM + '\nReturn exactly one JSON object with these keys: action,target_metric,expected_direction,hypothesis,rationale,confidence,test_count. No markdown and no commentary.' },
        { role: 'user', content: JSON.stringify(notebook) }
      ]
      base.response_format = { type: 'json_object' }
    } else {
      base.messages = [
        { role: 'system', content: SYSTEM + '\nReturn exactly ONE final line beginning with ACTION=. Format: ACTION=pulse|TARGET=energy|DIR=uncertain|CONF=0.40|COUNT=3|HYP=short falsifiable hypothesis|WHY=short rationale. Replace every value. Do not repeat these instructions.' },
        { role: 'user', content: JSON.stringify(notebook) }
      ]
    }

    const response = await previousFetch(CHAT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `${location.origin}${location.pathname}`,
        'X-Title': 'Reality Engine'
      },
      body: JSON.stringify(base)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const error = new Error(data?.error?.message || data?.message || `OpenRouter HTTP ${response.status}`)
      error.httpStatus = response.status
      throw error
    }
    return data
  }

  async function robustScientist(init) {
    const apiKey = key()
    if (!apiKey) return previousFetch('/api/reality-scientist', init)
    let notebook
    try { notebook = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body } catch {}
    if (!notebook) throw new Error('lab notebook missing')

    const failures = []
    let data = null
    let plan = null
    let mode = ''

    for (const attempt of ['tool', 'json', 'protocol']) {
      try {
        data = await call(apiKey, notebook, attempt)
        const message = data?.choices?.[0]?.message
        if (attempt === 'tool') plan = parseToolMessage(message)
        else if (attempt === 'json') plan = parseJsonish(contentText(message))
        else plan = parseProtocol(contentText(message))
        mode = attempt
        break
      } catch (error) {
        if (error?.httpStatus) throw error
        failures.push(`${attempt}: ${error?.message || error}${data ? ` (${diagnostic(data)})` : ''}`)
        data = null
      }
    }

    if (!plan) throw new Error(`all final-output modes failed; ${failures.slice(-2).join(' | ')}`)

    return new Response(JSON.stringify({
      ok: true,
      provider: 'openrouter-free-final-only',
      model: MODEL,
      repaired: mode !== 'tool',
      mode,
      plan,
      usage: data?.usage || null,
      finishReason: data?.choices?.[0]?.finish_reason || null
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }

  window.fetch = async (input, init) => {
    let pathname = ''
    try { pathname = new URL(typeof input === 'string' ? input : input?.url, location.href).pathname } catch {}
    if (pathname !== '/api/reality-scientist' || !key()) return previousFetch(input, init)
    try {
      return await robustScientist(init)
    } catch (error) {
      const detail = String(error?.message || error).slice(0, 360)
      return new Response(JSON.stringify({
        error: 'nemotron_final_output_failed',
        detail: `Nemotron final-output pipeline failed: ${detail}`
      }), { status: 502, headers: { 'content-type': 'application/json' } })
    }
  }
})()
