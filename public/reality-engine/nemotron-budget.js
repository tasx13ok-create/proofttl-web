(() => {
  'use strict'

  const STORE = 'reality-engine-nemotron-budget-v1'
  const previousFetch = window.fetch.bind(window)
  const PATH = '/api/reality-scientist'
  const MAX_REAL_CALLS_PER_UTC_DAY = 18
  const AUTO_MIN_EXPERIMENT_DELTA = 24
  const MANUAL_MIN_MS = 60 * 1000
  const DEFAULT_RATE_COOLDOWN_MS = 20 * 60 * 1000
  let manualOnce = false

  function utcDay() {
    const d = new Date()
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`
  }

  function nextUtcMidnight() {
    const d = new Date()
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 5)
  }

  function load() {
    let s = {}
    try { s = JSON.parse(localStorage.getItem(STORE) || '{}') || {} } catch {}
    if (s.day !== utcDay()) s = { day: utcDay(), calls: 0, lastRealExperiment: -9999, lastRealAt: 0, cooldownUntil: 0, cached: null }
    s.calls = Number(s.calls) || 0
    s.lastRealExperiment = Number.isFinite(Number(s.lastRealExperiment)) ? Number(s.lastRealExperiment) : -9999
    s.lastRealAt = Number(s.lastRealAt) || 0
    s.cooldownUntil = Number(s.cooldownUntil) || 0
    return s
  }

  function save(s) {
    try { localStorage.setItem(STORE, JSON.stringify(s)) } catch {}
  }

  function notebookFrom(init) {
    try {
      const body = typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body
      return body?.notebook || null
    } catch { return null }
  }

  function experimentsFrom(init) {
    return Number(notebookFrom(init)?.experiments) || 0
  }

  function cachedResponse(s, reason) {
    if (!s.cached?.plan) return null
    const payload = { ...s.cached, cached: true, budgetReason: reason, provider: 'nemotron-local-plan-cache' }
    setTimeout(() => {
      const state = document.querySelector('#nemotron-state')
      const cycle = document.querySelector('#nemotron-cycle')
      if (state) { state.textContent = 'CACHED PLAN'; state.className = 'status-warn' }
      if (cycle) cycle.textContent = `${reason} · ${s.calls}/${MAX_REAL_CALLS_PER_UTC_DAY} live calls today`
    }, 0)
    return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': 'application/json', 'x-reality-engine-cache': 'HIT' } })
  }

  function isRateLimitFailure(response, data) {
    const text = `${data?.detail || ''} ${data?.error || ''}`.toLowerCase()
    return response.status === 429 || /rate.?limit|too many requests|free-models-per-day|requests per day/.test(text)
  }

  function setRateCooldown(s, response, data) {
    const text = `${data?.detail || ''} ${data?.error || ''}`.toLowerCase()
    let until = Date.now() + DEFAULT_RATE_COOLDOWN_MS
    const retry = response.headers.get('retry-after')
    if (retry) {
      const seconds = Number(retry)
      if (Number.isFinite(seconds) && seconds > 0) until = Date.now() + seconds * 1000
      else {
        const parsed = Date.parse(retry)
        if (Number.isFinite(parsed)) until = parsed
      }
    }
    if (/per.?day|daily|free-models-per-day|50 requests/.test(text)) until = nextUtcMidnight()
    s.cooldownUntil = Math.max(s.cooldownUntil || 0, until)
    save(s)
    return until
  }

  function formatCooldown(ms) {
    const mins = Math.max(1, Math.ceil((ms - Date.now()) / 60000))
    if (mins >= 60) return `${Math.ceil(mins / 60)}h cooldown`
    return `${mins}m cooldown`
  }

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#consult-nemotron')
    if (button) button.addEventListener('click', () => { manualOnce = true }, true)
  })

  window.fetch = async (input, init) => {
    let pathname = ''
    try { pathname = new URL(typeof input === 'string' ? input : input?.url, location.href).pathname } catch {}
    if (pathname !== PATH) return previousFetch(input, init)

    const s = load()
    const experiments = experimentsFrom(init)
    const manual = manualOnce
    manualOnce = false
    const now = Date.now()

    if (s.cooldownUntil > now) {
      const cached = cachedResponse(s, formatCooldown(s.cooldownUntil))
      if (cached) return cached
      return new Response(JSON.stringify({
        error: 'nemotron_rate_cooldown',
        detail: `Nemotron free route is cooling down after a rate limit. ${formatCooldown(s.cooldownUntil)} remaining; local curiosity continues without using another API request.`
      }), { status: 429, headers: { 'content-type': 'application/json' } })
    }

    if (s.calls >= MAX_REAL_CALLS_PER_UTC_DAY) {
      const cached = cachedResponse(s, 'local daily safety budget')
      if (cached) return cached
      return new Response(JSON.stringify({
        error: 'nemotron_local_daily_budget',
        detail: `Reality Engine reached its ${MAX_REAL_CALLS_PER_UTC_DAY}-call local safety budget for today. Local experiments continue; Nemotron resumes on the next UTC day.`
      }), { status: 429, headers: { 'content-type': 'application/json' } })
    }

    if (!manual && s.cached?.plan && experiments - s.lastRealExperiment < AUTO_MIN_EXPERIMENT_DELTA) {
      return cachedResponse(s, `waiting for ${AUTO_MIN_EXPERIMENT_DELTA} new experiments`)
    }

    if (manual && s.cached?.plan && now - s.lastRealAt < MANUAL_MIN_MS) {
      return cachedResponse(s, 'manual anti-spam guard')
    }

    // Count the attempt before sending so refreshes/tabs cannot create a burst.
    s.calls += 1
    s.lastRealAt = now
    s.lastRealExperiment = experiments
    save(s)

    const response = await previousFetch(input, init)
    let data = null
    try { data = await response.clone().json() } catch {}

    if (isRateLimitFailure(response, data)) {
      const until = setRateCooldown(s, response, data)
      const cached = cachedResponse(s, formatCooldown(until))
      if (cached) return cached
      return new Response(JSON.stringify({
        error: 'nemotron_rate_limited',
        detail: `OpenRouter rate limit reached. Reality Engine paused live Nemotron calls (${formatCooldown(until)}); the local scientist continues autonomously.`
      }), { status: 429, headers: { 'content-type': 'application/json' } })
    }

    if (response.ok && data?.plan) {
      s.cached = data
      s.lastRealExperiment = experiments
      s.cooldownUntil = 0
      save(s)
    }

    return response
  }
})()
