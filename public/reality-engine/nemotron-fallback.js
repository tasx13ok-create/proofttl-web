(() => {
  'use strict'

  const KEY_STORE = 'reality-engine-openrouter-key-v1'
  const VERIFIER_STORE = 'reality-engine-openrouter-verifier-v1'
  const RETURN_STORE = 'reality-engine-openrouter-return-v1'
  const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'
  const OPENROUTER_CHAT = 'https://openrouter.ai/api/v1/chat/completions'
  const OPENROUTER_AUTH = 'https://openrouter.ai/auth'
  const OPENROUTER_EXCHANGE = 'https://openrouter.ai/api/v1/auth/keys'
  const nativeFetch = window.fetch.bind(window)

  // IMPORTANT: capture the OAuth callback synchronously, before app.js boots.
  // app.js intentionally rewrites the URL to persist the universe seed. The old
  // implementation waited for DOMContentLoaded and the ?code= value was gone by then.
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
{"action":"pulse|vortex|cool|heat|well","target_metric":"speed|energy|spread|angular|density|entropy|coherence|drift|null","expected_direction":"raises|lowers|uncertain","hypothesis":"short falsifiable hypothesis","rationale":"short reason this test has high information value","confidence":0.0,"test_count":1}

Choose exactly one next intervention.`

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

  function cleanModelJson(text) {
    const raw = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    try { return JSON.parse(raw) } catch {}
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1))
    throw new Error('Nemotron did not return a JSON experiment plan')
  }

  function normalizePlan(plan) {
    const actions = new Set(['pulse', 'vortex', 'cool', 'heat', 'well'])
    const metrics = new Set(['speed', 'energy', 'spread', 'angular', 'density', 'entropy', 'coherence', 'drift'])
    if (!plan || !actions.has(plan.action)) throw new Error('Nemotron returned an invalid intervention')
    return {
      action: plan.action,
      target_metric: metrics.has(plan.target_metric) ? plan.target_metric : null,
      expected_direction: ['raises', 'lowers', 'uncertain'].includes(plan.expected_direction) ? plan.expected_direction : 'uncertain',
      hypothesis: String(plan.hypothesis || 'Run the test that best separates the current explanations.').slice(0, 280),
      rationale: String(plan.rationale || 'Chosen for information gain.').slice(0, 520),
      confidence: Math.max(0, Math.min(1, Number(plan.confidence) || 0)),
      test_count: Math.max(1, Math.min(8, Math.round(Number(plan.test_count) || 1))),
    }
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
      body: JSON.stringify({
        code: bootCode,
        code_verifier: verifier,
        code_challenge_method: 'S256',
      }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.key) {
      throw new Error(data?.error?.message || data?.message || `Authorization HTTP ${response.status}`)
    }

    localStorage.setItem(KEY_STORE, data.key)
    sessionStorage.removeItem(VERIFIER_STORE)
    sessionStorage.removeItem(RETURN_STORE)
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

  async function openRouterScientist(init) {
    const apiKey = await ensureKey()
    if (!apiKey) throw new Error('OpenRouter is not connected')

    let notebook = null
    try { notebook = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body } catch {}
    if (!notebook) throw new Error('Reality Engine lab notebook was missing')

    const response = await nativeFetch(OPENROUTER_CHAT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `${location.origin}${location.pathname}`,
        'X-Title': 'Reality Engine',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: JSON.stringify(notebook) },
        ],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 700,
        response_format: { type: 'json_object' },
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      const message = data?.error?.message || data?.message || `OpenRouter HTTP ${response.status}`
      throw new Error(message)
    }

    const plan = normalizePlan(cleanModelJson(data?.choices?.[0]?.message?.content))
    return new Response(JSON.stringify({
      ok: true,
      provider: 'openrouter-free',
      model: MODEL,
      plan,
      usage: data.usage || null,
      finishReason: data?.choices?.[0]?.finish_reason || null,
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
        setConnectionState('FREE 120B LIVE', 'ok', 'Nemotron 3 Super 120B is actively planning experiments through the free OpenRouter route.')
        return result
      } catch (error) {
        setConnectionState('FREE ROUTE ERROR', 'bad', `Free Nemotron route failed: ${String(error?.message || error).slice(0, 180)}`)
        return new Response(JSON.stringify({
          error: 'openrouter_nemotron_unavailable',
          detail: `Free Nemotron route failed: ${String(error?.message || error).slice(0, 180)}`,
        }), { status: 502, headers: { 'content-type': 'application/json' } })
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
        detail: 'Nemotron is ready, but this Vercel project is billing-locked. Click “Connect free Nemotron” in the meta-scientist panel.',
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
    note.id = 'openrouter-note'
    note.className = 'muted'
    note.style.margin = '8px 0 0'
    note.style.fontSize = '9px'
    note.textContent = 'Free fallback sends only the synthetic lab notebook to NVIDIA through OpenRouter; free-endpoint requests may be logged by the provider.'
    host.appendChild(note)

    const refresh = () => {
      if (storedKey()) {
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
        button.disabled = false
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
        // Keep the universe seed in the callback so the same experiment resumes.
        const callback = `${current.origin}${current.pathname}${current.search}`
        sessionStorage.setItem(RETURN_STORE, callback)

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
        button.disabled = false
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
