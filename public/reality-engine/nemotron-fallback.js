(() => {
  'use strict'

  const KEY_STORE = 'reality-engine-openrouter-key-v1'
  const VERIFIER_STORE = 'reality-engine-openrouter-verifier-v1'
  const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'
  const OPENROUTER_CHAT = 'https://openrouter.ai/api/v1/chat/completions'
  const OPENROUTER_AUTH = 'https://openrouter.ai/auth'
  const OPENROUTER_EXCHANGE = 'https://openrouter.ai/api/v1/auth/keys'
  const nativeFetch = window.fetch.bind(window)

  // Capture OAuth callback before app.js rewrites ?seed=.
  const bootUrl = new URL(location.href)
  const bootCode = bootUrl.searchParams.get('code') || ''
  const bootError = bootUrl.searchParams.get('error') || ''
  const bootErrorDescription = bootUrl.searchParams.get('error_description') || ''
  if (bootCode || bootError) {
    bootUrl.searchParams.delete('code')
    bootUrl.searchParams.delete('error')
    bootUrl.searchParams.delete('error_description')
    history.replaceState(null, '', `${bootUrl.pathname}${bootUrl.search}${bootUrl.hash}`)
  }

  const SYSTEM = `You are the meta-scientist inside Reality Engine, a synthetic experimental laboratory.
A separate local learner starts from random weights and gathers evidence from a toy universe with hidden, arbitrary laws.
You must NOT assume Earth physics applies.
Your job is to choose exactly one high-information intervention that helps falsify or separate competing explanations.
Treat contradictions as uncertainty to resolve. Prefer information gain over confirmation. Do not call correlation a law. Do not claim results transfer to the real universe.
You MUST respond by calling the propose_experiment tool exactly once. Do not answer with prose.`

  const TOOL = {
    type: 'function',
    function: {
      name: 'propose_experiment',
      description: 'Choose the next falsifiable experiment for the Reality Engine synthetic universe.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: {
            type: 'string',
            enum: ['pulse', 'vortex', 'cool', 'heat', 'well'],
            description: 'The intervention to run next.'
          },
          target_metric: {
            type: 'string',
            enum: ['energy', 'spread', 'centerX', 'centerY'],
            description: 'The measured observable whose response most distinguishes the hypothesis.'
          },
          expected_direction: {
            type: 'string',
            enum: ['raises', 'lowers', 'uncertain'],
            description: 'Expected direction before the test; use uncertain for exploratory tests.'
          },
          hypothesis: {
            type: 'string',
            description: 'A short falsifiable hypothesis about this synthetic universe.'
          },
          rationale: {
            type: 'string',
            description: 'A concise reason this test has high information value.'
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 1
          },
          test_count: {
            type: 'integer',
            minimum: 1,
            maximum: 8
          }
        },
        required: ['action', 'target_metric', 'expected_direction', 'hypothesis', 'rationale', 'confidence', 'test_count']
      }
    }
  }

  function storedKey() {
    try { return localStorage.getItem(KEY_STORE) || '' } catch { return '' }
  }

  function b64url(bytes) {
    let raw = ''
    for (const byte of bytes) raw += String.fromCharCode(byte)
    return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  }

  async function sha256url(text) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return b64url(new Uint8Array(digest))
  }

  function normalizePlan(plan) {
    const actions = new Set(['pulse', 'vortex', 'cool', 'heat', 'well'])
    const metrics = new Set(['energy', 'spread', 'centerX', 'centerY'])
    if (!plan || typeof plan !== 'object') throw new Error('Nemotron returned no experiment object')
    if (!actions.has(plan.action)) throw new Error('Nemotron returned an invalid intervention')
    return {
      action: plan.action,
      target_metric: metrics.has(plan.target_metric) ? plan.target_metric : 'energy',
      expected_direction: ['raises', 'lowers', 'uncertain'].includes(plan.expected_direction) ? plan.expected_direction : 'uncertain',
      hypothesis: String(plan.hypothesis || 'Test whether this intervention produces a repeatable state change.').slice(0, 280),
      rationale: String(plan.rationale || 'Chosen to maximize information gain from unresolved evidence.').slice(0, 520),
      confidence: Math.max(0, Math.min(1, Number(plan.confidence) || 0)),
      test_count: Math.max(1, Math.min(8, Math.round(Number(plan.test_count) || 1)))
    }
  }

  function parseJsonish(value) {
    if (value && typeof value === 'object') return value
    let raw = String(value || '').trim()
    if (!raw) throw new Error('empty model output')
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    try { return JSON.parse(raw) } catch {}
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try { return JSON.parse(raw.slice(start, end + 1)) } catch {}
    }
    throw new Error('model output was not parseable JSON')
  }

  function planFromMessage(message) {
    const calls = Array.isArray(message?.tool_calls) ? message.tool_calls : []
    const forced = calls.find(call => call?.function?.name === 'propose_experiment') || calls[0]
    if (forced?.function?.arguments != null) {
      return normalizePlan(parseJsonish(forced.function.arguments))
    }

    // Provider fallback: some free routes occasionally serialize a tool call in content.
    const content = message?.content
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part?.type === 'tool_call' && part?.function?.arguments) {
          return normalizePlan(parseJsonish(part.function.arguments))
        }
        if (part?.text) {
          try { return normalizePlan(parseJsonish(part.text)) } catch {}
        }
      }
    } else if (content) {
      return normalizePlan(parseJsonish(content))
    }
    throw new Error('Nemotron returned neither a tool call nor a usable experiment plan')
  }

  let connectionMessage = null
  function setConnectionState(label, cls, note) {
    connectionMessage = { label, cls, note }
    const status = document.querySelector('#nemotron-state')
    const rationale = document.querySelector('#nemotron-rationale')
    if (status) {
      status.textContent = label
      status.className = cls === 'ok' ? 'status-ok' : cls === 'bad' ? 'status-bad' : 'status-warn'
    }
    if (note && rationale) rationale.textContent = note
  }

  let oauthPromise = null
  async function exchangeCapturedCode() {
    if (!bootCode) return storedKey()
    const verifier = sessionStorage.getItem(VERIFIER_STORE)
    if (!verifier) throw new Error('The OpenRouter PKCE verifier was lost. Click Connect free Nemotron and authorize again.')
    const response = await nativeFetch(OPENROUTER_EXCHANGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: bootCode, code_verifier: verifier, code_challenge_method: 'S256' })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.key) throw new Error(data?.error?.message || data?.message || `Authorization HTTP ${response.status}`)
    localStorage.setItem(KEY_STORE, data.key)
    sessionStorage.removeItem(VERIFIER_STORE)
    return data.key
  }

  if (bootError) {
    oauthPromise = Promise.reject(new Error(bootErrorDescription || bootError))
    oauthPromise.catch(() => {})
  } else if (bootCode) {
    oauthPromise = exchangeCapturedCode()
  }

  async function ensureKey() {
    const existing = storedKey()
    if (existing) return existing
    if (oauthPromise) return oauthPromise
    return ''
  }

  async function requestNemotron(apiKey, notebook, attempt) {
    const extra = attempt
      ? '\nThe previous provider response was malformed. Call propose_experiment exactly once with every required argument.'
      : ''
    const response = await nativeFetch(OPENROUTER_CHAT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `${location.origin}${location.pathname}`,
        'X-Title': 'Reality Engine'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM + extra },
          { role: 'user', content: JSON.stringify(notebook) }
        ],
        tools: [TOOL],
        tool_choice: { type: 'function', function: { name: 'propose_experiment' } },
        temperature: attempt ? 0 : 0.2,
        top_p: 0.9,
        max_tokens: 600
      })
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = data?.error?.message || data?.message || `OpenRouter HTTP ${response.status}`
      const error = new Error(message)
      error.httpStatus = response.status
      throw error
    }
    return { data, plan: planFromMessage(data?.choices?.[0]?.message) }
  }

  async function openRouterScientist(init) {
    const apiKey = await ensureKey()
    if (!apiKey) throw new Error('OpenRouter is not connected')
    let notebook = null
    try { notebook = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body } catch {}
    if (!notebook) throw new Error('Reality Engine lab notebook was missing')

    let result
    let firstError = null
    try {
      result = await requestNemotron(apiKey, notebook, 0)
    } catch (error) {
      firstError = error
      // Retry only malformed/model-shape failures. Do not double-hit auth/rate-limit/server failures.
      if (error?.httpStatus) throw error
      result = await requestNemotron(apiKey, notebook, 1)
    }

    return new Response(JSON.stringify({
      ok: true,
      provider: 'openrouter-free',
      model: MODEL,
      repaired: Boolean(firstError),
      plan: result.plan,
      usage: result.data?.usage || null,
      finishReason: result.data?.choices?.[0]?.finish_reason || null
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url
    let pathname = ''
    try { pathname = new URL(url, location.href).pathname } catch {}
    if (pathname !== '/api/reality-scientist') return nativeFetch(input, init)

    const apiKey = await ensureKey().catch(error => {
      setConnectionState('AUTH ERROR', 'bad', `OpenRouter authorization failed: ${String(error?.message || error).slice(0, 180)}`)
      return ''
    })

    if (apiKey) {
      try {
        const result = await openRouterScientist(init)
        setConnectionState('FREE 120B LIVE', 'ok', 'Nemotron 3 Super 120B is actively selecting falsifiable experiments through a forced tool call.')
        return result
      } catch (error) {
        const detail = String(error?.message || error).slice(0, 200)
        setConnectionState('FREE ROUTE ERROR', 'bad', `Free Nemotron route failed: ${detail}`)
        return new Response(JSON.stringify({ error: 'openrouter_nemotron_unavailable', detail: `Free Nemotron route failed: ${detail}` }), {
          status: 502,
          headers: { 'content-type': 'application/json' }
        })
      }
    }

    const primary = await nativeFetch(input, init)
    if (primary.ok) return primary
    let failure = null
    try { failure = await primary.clone().json() } catch {}
    if (failure?.error === 'ai_gateway_billing_required') {
      setConnectionState('AUTH NEEDED', 'warn', 'Vercel is billing-locked. Connect the free Nemotron route below; no API-key paste is required.')
      return new Response(JSON.stringify({
        error: 'nemotron_connection_required',
        detail: 'Nemotron is ready, but this Vercel project is billing-locked. Click “Connect free Nemotron” in the meta-scientist panel.'
      }), { status: 502, headers: { 'content-type': 'application/json' } })
    }
    return primary
  }

  function mountConnectButton() {
    const host = document.querySelector('.nemotron-status')
    if (!host || document.querySelector('#openrouter-connect')) return
    const button = document.createElement('button')
    button.id = 'openrouter-connect'
    button.className = 'ghost wide'
    button.style.marginTop = '14px'
    host.appendChild(button)

    const note = document.createElement('p')
    note.className = 'muted'
    note.style.margin = '8px 0 0'
    note.style.fontSize = '9px'
    note.textContent = 'Free route sends only the synthetic lab notebook to Nemotron through OpenRouter; provider logging/rate limits may apply.'
    host.appendChild(note)

    const refresh = () => {
      if (storedKey()) {
        button.disabled = false
        button.textContent = 'Disconnect free Nemotron'
        setConnectionState('FREE 120B READY', 'ok', 'Nemotron 3 Super 120B is connected through OpenRouter. The local learner remains independent.')
      } else if (bootCode && oauthPromise) {
        button.disabled = true
        button.textContent = 'Finishing authorization…'
        setConnectionState('AUTHORIZING', 'warn', 'OpenRouter approved access. Exchanging the one-time code now…')
      } else {
        button.disabled = false
        button.textContent = 'Connect free Nemotron'
      }
    }

    button.addEventListener('click', async () => {
      if (storedKey()) {
        localStorage.removeItem(KEY_STORE)
        refresh()
        setConnectionState('STANDBY', 'warn', 'Free Nemotron disconnected. The local scientist continues autonomously.')
        return
      }
      button.disabled = true
      button.textContent = 'Opening secure authorization…'
      try {
        const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)))
        const challenge = await sha256url(verifier)
        sessionStorage.setItem(VERIFIER_STORE, verifier)
        const current = new URL(location.href)
        current.searchParams.delete('code')
        current.searchParams.delete('error')
        current.searchParams.delete('error_description')
        const callback = `${current.origin}${current.pathname}${current.search}`
        const auth = new URL(OPENROUTER_AUTH)
        auth.searchParams.set('callback_url', callback)
        auth.searchParams.set('code_challenge', challenge)
        auth.searchParams.set('code_challenge_method', 'S256')
        location.assign(auth.toString())
      } catch (error) {
        button.disabled = false
        button.textContent = 'Connect free Nemotron'
        setConnectionState('AUTH ERROR', 'bad', String(error?.message || error))
      }
    })

    refresh()
    if (oauthPromise) {
      oauthPromise.then(() => {
        refresh()
        setConnectionState('FREE 120B READY', 'ok', 'Authorization complete. Nemotron 3 Super 120B is connected; running a live scientific consultation now.')
        setTimeout(() => document.querySelector('#consult-nemotron')?.click(), 700)
      }).catch(error => {
        button.disabled = false
        button.textContent = 'Connect free Nemotron'
        setConnectionState('AUTH ERROR', 'bad', `OpenRouter authorization failed: ${String(error?.message || error).slice(0, 180)}`)
      })
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    mountConnectButton()
    if (connectionMessage) setConnectionState(connectionMessage.label, connectionMessage.cls, connectionMessage.note)
  })
})()
