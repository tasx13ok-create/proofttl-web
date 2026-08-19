'use client'

import { useEffect, useState } from 'react'

const API_URL = (process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev').replace(/\/$/, '')
const STORAGE_KEY = 'proofttl-studio-workspace-v2'

type RunnerStatus = {
  configured?: boolean
  provider?: string
  supported?: string[]
  unsupported?: string[]
  isolation?: { timeout_ms?: number; network_default?: string }
}

type StoredFile = { id: string; name: string; language: string; content: string }
type StoredWorkspace = { name: string; files: StoredFile[]; activeFileId: string }

type RunResult = {
  ok?: boolean
  error?: string
  message?: string
  supported?: string[]
  job?: { id?: string; language?: string; exit_code?: number | null; output?: string; truncated?: boolean }
  isolation?: { provider?: string; runtime?: string; network?: string; timeout_ms?: number; production_secrets_injected?: boolean }
}

export default function StudioRunnerPanel() {
  const [status, setStatus] = useState<RunnerStatus | null>(null)
  const [state, setState] = useState<'checking' | 'ready' | 'locked' | 'running' | 'error'>('checking')
  const [result, setResult] = useState<RunResult | null>(null)
  const [active, setActive] = useState<{ name: string; language: string; chars: number } | null>(null)

  useEffect(() => { void refresh() }, [])

  async function refresh() {
    setState('checking')
    try {
      const response = await fetch(`${API_URL}/studio/runner`, { credentials: 'include', cache: 'no-store' })
      const body = await response.json().catch(() => ({})) as RunnerStatus
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setStatus(body)
      setState(body.configured ? 'ready' : 'locked')
      inspectActive()
    } catch {
      setState('error')
    }
  }

  function readWorkspace(): StoredWorkspace | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as StoredWorkspace
      return parsed?.files?.length ? parsed : null
    } catch { return null }
  }

  function inspectActive() {
    const workspace = readWorkspace()
    const file = workspace?.files.find((item) => item.id === workspace.activeFileId) || workspace?.files?.[0]
    setActive(file ? { name: file.name, language: file.language, chars: file.content.length } : null)
  }

  async function runActive() {
    const workspace = readWorkspace()
    const file = workspace?.files.find((item) => item.id === workspace.activeFileId) || workspace?.files?.[0]
    if (!file) { setResult({ error: 'no_active_file', message: 'No Studio file is available to run.' }); return }
    inspectActive()

    const runtimeLanguage = file.language === 'javascript' ? 'javascript' : file.language === 'python' ? 'python' : file.language === 'bash' ? 'bash' : ''
    if (!runtimeLanguage) {
      setResult({ error: 'unsupported_runtime', message: `${file.language} is not executable in the current isolated runner. JavaScript, Python, and Bash are supported first.` })
      return
    }

    setState('running')
    setResult(null)
    try {
      const response = await fetch(`${API_URL}/studio/run`, {
        method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ language: runtimeLanguage, code: file.content }),
      })
      const body = await response.json().catch(() => ({})) as RunResult
      if (response.status === 401) {
        setResult({ error: 'authentication_required', message: 'Sign in before running isolated code jobs.' })
        setState(status?.configured ? 'ready' : 'locked')
        return
      }
      setResult(body)
      setState(status?.configured ? 'ready' : 'locked')
    } catch {
      setResult({ error: 'runner_unreachable', message: 'Could not reach the isolated runner.' })
      setState('error')
    }
  }

  return (
    <section className="console-panel wide" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <p className="app-kicker">ISOLATED EXECUTION</p>
          <h2 style={{ marginBottom: 4 }}>Run code without touching ProofTTL production.</h2>
          <p className="app-copy">Execution uses a separate ephemeral sandbox job. The runner receives the active file only, gets no ProofTTL production secrets, and is configured with no outbound network access by default.</p>
        </div>
        <span className="app-status">{state === 'ready' ? 'SANDBOX READY' : state === 'running' ? 'RUNNING…' : state === 'locked' ? 'SANDBOX CREDENTIALS NEEDED' : state.toUpperCase()}</span>
      </div>

      <div className="security-summary" style={{ marginTop: 14 }}>
        <div><span>PROVIDER</span><strong>{status?.provider || 'Vercel Sandbox'}</strong></div>
        <div><span>RUNTIMES</span><strong>{status?.supported?.join(' / ') || 'JS / PYTHON / BASH'}</strong></div>
        <div><span>NETWORK</span><strong>{status?.isolation?.network_default === 'deny' ? 'DENY BY DEFAULT' : 'LOCKED'}</strong></div>
        <div><span>TIMEOUT</span><strong>{status?.isolation?.timeout_ms ? `${status.isolation.timeout_ms / 1000}s` : '15s'}</strong></div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
        <button type="button" className="button button-primary" onClick={() => void runActive()} disabled={state === 'running' || state === 'checking'}>{state === 'running' ? 'RUNNING ISOLATED JOB…' : 'RUN ACTIVE FILE →'}</button>
        <button type="button" className="button" onClick={() => { inspectActive(); void refresh() }}>REFRESH RUNNER</button>
        {active && <small>{active.name} · {active.language} · {active.chars} chars</small>}
      </div>

      {state === 'locked' && <p className="app-note"><strong>Execution adapter built; provider credentials are not connected yet.</strong> The code editor, AI, terminal, and cloud project storage still work without the runner.</p>}

      {result && <div style={{ marginTop: 14, borderRadius: 12, border: '1px solid rgba(103,232,249,.14)', background: 'rgba(2,8,12,.8)', padding: 14 }}>
        <div className="app-empty-meta">{result.ok ? `JOB ${result.job?.id || ''}` : result.error || 'RUNNER RESULT'}</div>
        {result.message && <p className="app-note">{result.message}</p>}
        {result.job && <>
          <p className="app-note">Runtime: {result.isolation?.runtime || result.job.language} · exit {result.job.exit_code ?? 'unknown'} · network {result.isolation?.network || 'restricted'}{result.job.truncated ? ' · output truncated' : ''}</p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 420, overflow: 'auto', margin: 0 }}>{result.job.output || '(no stdout/stderr returned)'}</pre>
        </>}
        {result.error === 'authentication_required' && <a className="text-link" href="/login/">SIGN IN →</a>}
      </div>}

      <p className="app-note">PowerShell editing and command drafting are supported in Studio, but PowerShell execution stays disabled until an isolated runtime image with `pwsh` is deliberately provisioned and tested.</p>
    </section>
  )
}
