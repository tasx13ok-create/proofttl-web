(() => {
  'use strict'

  const KEY_STORE = 'reality-engine-openrouter-key-v1'
  const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'
  const CHAT = 'https://openrouter.ai/api/v1/chat/completions'
  const previousFetch = window.fetch.bind(window)
  const ACTIONS = ['pulse', 'vortex', 'cool', 'heat', 'well']
  const METRICS = ['energy', 'spread', 'centerX', 'centerY']
  const DIRS = ['raises', 'lowers', 'uncertain']

  const SYSTEM = `You are the meta-scientist inside Reality Engine. A separate local learner starts from random weights and gathers evidence inside a toy universe with arbitrary hidden laws. Never assume Earth physics. Choose exactly one high-information intervention that helps falsify or separate competing explanations. Treat contradictions as uncertainty to resolve. Prefer information gain over confirmation. Do not claim synthetic results transfer to the real universe.`

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
    const action = ACTIONS.includes(v.action) ? v.action : ACTIONS.find(a => String(v.action || '').toLowerCase().includes(a))
    const metric = METRICS.includes(v.target_metric) ? v.target_metric : METRICS.find(m => String(v.target_metric || '').toLowerCase() === m.toLowerCase())
    const dir = DIRS.includes(v.expected_direction) ? v.expected_direction : DIRS.find(d => String(v.expected_direction || '').toLowerCase().includes(d)) || 'uncertain'
    if (!action) throw new Error('missing valid intervention')
    return {
      action,
      target_metric: metric || 'energy',
      expected_direction: dir,
      hypothesis: String(v.hypothesis || `Test whether ${action} produces a repeatable change in ${metric || 'energy'}.`).slice(0, 280),
      rationale: String(v.rationale || 'Chosen to resolve uncertainty in the current experiment history.').slice(0, 520),
      confidence: clamp(Number(v.confidence) || 0, 0, 1),
      test_count: clamp(Math.round(Number(v.test_count) || 1), 1, 8)
    }
  }

  function unwrapJsonString(raw) {
    let s = String(raw || '').trim()
    for (let i = 0; i < 2; i++) {
      if (!/^(["']).*\1$/s.test(s)) break
      try {
        const parsed = JSON.parse(s)
        if (typeof parsed === 'string') s = parsed.trim(); else return parsed
      } catch { break }
    }
    return s
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

  function parseProtocol(text) {
    const s = String(text || '').replace(/\r?\n/g, ' | ')
    const get = name => {
      const re = new RegExp(`(?:^|[|;])\\s*${name}\\s*=\\s*([^|;]+)`, 'i')
      return (s.match(re)?.[1] || '').trim()
    }
    const action = get('ACTION').toLowerCase()
    if (!ACTIONS.includes(action)) throw new Error('protocol missing action')
    return normalize({
      action,
      target_metric: get('TARGET'),
      expected_direction: get('DIR').toLowerCase(),
      confidence: get('CONF'),
      test_count: get('COUNT'),
      hypothesis: get('HYP'),
      rationale: get('WHY')
    })
  }

  function parseLoose(value) {
    if (value && typeof value === 'object') return normalize(value)
    let s = unwrapJsonString(value)
    if (s && typeof s === 'object') return normalize(s)
    s = String(s || '').trim().replace(/^```(?:json|javascript|python)?\s*/i, '').replace(/\s*```$/i, '')
    if (!s) throw new Error('empty model output')

    try { return normalize(JSON.parse(s)) } catch {}
    const fn = s.match(/propose_experiment\s*\(([^]*)\)\s*;?\s*$/i)
    if (fn) {
      try { return parseLoose(fn[1]) } catch {}
    }
    const obj = balancedObject(s)
    if (obj) {
      try { return normalize(JSON.parse(obj)) } catch {}
      try { return normalize(JSON.parse(repairJsonish(obj))) } catch {}
    }
    try { return parseProtocol(s) } catch {}
    throw new Error('unrecognized model serialization')
  }

  function allText(message) {
    const out = []
    if (typeof message?.content === 'string') out.push(message.content)
    if (Array.isArray(message?.content)) for (const p of message.content) if (p?.text) out.push(p.text)
    if (typeof message?.reasoning === 'string') out.push(message.reasoning)
    if (typeof message?.reasoning_content === 'string') out.push(message.reasoning_content)
    return out.join('\n')
  }

  function parseMessage(message) {
    const calls = Array.isArray(message?.tool_calls) ? message.tool_calls : []
    for (const call of calls) {
      for (const candidate of [call?.function?.arguments, call?.arguments, call?.input]) {
        if (candidate == null) continue
        try { return parseLoose(candidate) } catch {}
      }
    }
    const text = allText(message)
    if (text) return parseLoose(text)
    throw new Error('no usable model payload')
  }

  function extractFromProse(text) {
    const s = String(text || '').trim()
    const lower = s.toLowerCase()
    const action = ACTIONS.find(a => new RegExp(`\\b${a}\\b`, 'i').test(s))
    if (!action) throw new Error('prose had no intervention')
    let metric = METRICS.find(m => lower.includes(m.toLowerCase())) || 'energy'
    if (lower.includes('kinetic')) metric = 'energy'
    if (lower.includes('dispersion')) metric = 'spread'
    const direction = lower.includes('lower') || lower.includes('decrease') ? 'lowers' : lower.includes('raise') || lower.includes('increase') ? 'raises' : 'uncertain'
    const confMatch = s.match(/(?:confidence|conf)\s*[:=]?\s*(0(?:\.\d+)?|1(?:\.0+)?|\d{1,3}%)/i)
    let confidence = confMatch ? parseFloat(confMatch[1]) : 0.35
    if (confMatch && confMatch[1].includes('%')) confidence /= 100
    const countMatch = s.match(/(?:trials?|tests?|count)\s*[:=]?\s*(\d+)/i)
    const compact = s.replace(/\s+/g, ' ').slice(0, 500)
    return normalize({ action, target_metric: metric, expected_direction: direction, confidence, test_count: countMatch?.[1] || 1, hypothesis: compact.slice(0, 280), rationale: `Nemotron selected ${action} to probe ${metric}; the provider returned prose rather than a typed tool payload, so Reality Engine recovered the plan from the response.` })
  }

  async function call(apiKey, notebook, mode) {
    const protocol = mode === 'protocol'
    const messages = protocol ? [
      { role: 'system', content: SYSTEM + `\nReturn exactly ONE LINE and nothing else in this format:\nACTION=pulse|TARGET=energy|DIR=uncertain|CONF=0.40|COUNT=3|HYP=short hypothesis|WHY=short rationale\nReplace values as needed. ACTION must be pulse,vortex,cool,heat,or well. TARGET must be energy,spread,centerX,or centerY.` },
      { role: 'user', content: JSON.stringify(notebook) }
    ] : [
      { role: 'system', content: SYSTEM + '\nCall propose_experiment exactly once. Do not answer with prose.' },
      { role: 'user', content: JSON.stringify(notebook) }
    ]

    const body = { model: MODEL, messages, temperature: 0, top_p: 0.9, max_tokens: protocol ? 320 : 600 }
    if (!protocol) {
      body.tools = [TOOL]
      body.tool_choice = { type: 'function', function: { name: 'propose_experiment' } }
      body.parallel_tool_calls = false
    }

    const r = await previousFetch(CHAT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': `${location.origin}${location.pathname}`, 'X-Title': 'Reality Engine' },
      body: JSON.stringify(body)
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(data?.error?.message || data?.message || `OpenRouter HTTP ${r.status}`)
    return data
  }

  async function robustScientist(init) {
    const apiKey = key()
    if (!apiKey) return previousFetch('/api/reality-scientist', init)
    let notebook
    try { notebook = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body } catch {}
    if (!notebook) throw new Error('lab notebook missing')

    let first, plan, repaired = false
    try {
      first = await call(apiKey, notebook, 'tool')
      plan = parseMessage(first?.choices?.[0]?.message)
    } catch (firstError) {
      const second = await call(apiKey, notebook, 'protocol')
      const msg = second?.choices?.[0]?.message
      const raw = allText(msg)
      try { plan = parseMessage(msg) }
      catch {
        try { plan = parseProtocol(raw) }
        catch { plan = extractFromProse(raw) }
      }
      first = second
      repaired = true
    }

    return new Response(JSON.stringify({ ok: true, provider: 'openrouter-free-robust', model: MODEL, repaired, plan, usage: first?.usage || null, finishReason: first?.choices?.[0]?.finish_reason || null }), { status: 200, headers: { 'content-type': 'application/json' } })
  }

  window.fetch = async (input, init) => {
    let pathname = ''
    try { pathname = new URL(typeof input === 'string' ? input : input?.url, location.href).pathname } catch {}
    if (pathname !== '/api/reality-scientist' || !key()) return previousFetch(input, init)
    try {
      return await robustScientist(init)
    } catch (error) {
      const detail = String(error?.message || error).slice(0, 220)
      return new Response(JSON.stringify({ error: 'nemotron_robust_decoder_failed', detail: `Nemotron decoder failed after tool + protocol attempts: ${detail}` }), { status: 502, headers: { 'content-type': 'application/json' } })
    }
  }
})()
