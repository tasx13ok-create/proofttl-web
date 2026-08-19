'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

const API_URL = (process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev').replace(/\/$/, '')

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type TerminalLine = { kind: 'input' | 'output' | 'error'; text: string }

const STARTER = `// ProofTTL Studio\n// Draft, inspect, and refine code here.\n\nasync function verifyClaim(claim, sourceUrl) {\n  const response = await fetch('/api/verify', {\n    method: 'POST',\n    headers: { 'content-type': 'application/json' },\n    body: JSON.stringify({ claim, source_url: sourceUrl }),\n  })\n\n  return response.json()\n}\n`

const LANGUAGES = ['auto', 'typescript', 'javascript', 'python', 'powershell', 'bash', 'json', 'html', 'css']

export default function StudioWorkbench() {
  const [editor, setEditor] = useState(STARTER)
  const [language, setLanguage] = useState('typescript')
  const [prompt, setPrompt] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [runtime, setRuntime] = useState('ProofTTL router')
  const [terminal, setTerminal] = useState<TerminalLine[]>([
    { kind: 'output', text: 'ProofTTL Studio terminal — safe command mode.' },
    { kind: 'output', text: 'Type help to see available commands. Arbitrary host shell execution is disabled.' },
  ])
  const [terminalValue, setTerminalValue] = useState('')
  const terminalEnd = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('proofttl-studio-editor')
    if (saved) setEditor(saved)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => window.localStorage.setItem('proofttl-studio-editor', editor), 250)
    return () => window.clearTimeout(timer)
  }, [editor])

  useEffect(() => {
    terminalEnd.current?.scrollIntoView({ block: 'end' })
  }, [terminal])

  const lineCount = useMemo(() => editor.split('\n').length, [editor])

  async function askModel(event: FormEvent) {
    event.preventDefault()
    const clean = prompt.trim()
    if (!clean || loading) return

    const history = chat.slice(-8)
    setChat((current) => [...current, { role: 'user', content: clean }])
    setPrompt('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/studio/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: clean, language, editor, history }),
      })
      const body = await response.json().catch(() => ({})) as { response?: string; message?: string; error?: string; runtime?: { provider?: string; model?: string } }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      setChat((current) => [...current, { role: 'assistant', content: body.response || 'No response returned.' }])
      if (body.runtime?.provider || body.runtime?.model) {
        setRuntime([body.runtime.provider, body.runtime.model].filter(Boolean).join(' · '))
      }
    } catch (error) {
      setChat((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Studio model unavailable.' }])
    } finally {
      setLoading(false)
    }
  }

  function appendTerminal(kind: TerminalLine['kind'], text: string) {
    setTerminal((current) => [...current, { kind, text }])
  }

  async function runTerminal(event: FormEvent) {
    event.preventDefault()
    const raw = terminalValue.trim()
    if (!raw) return
    setTerminalValue('')
    appendTerminal('input', `PS ProofTTL:\\studio> ${raw}`)

    const [commandRaw, ...args] = raw.split(/\s+/)
    const command = commandRaw.toLowerCase()
    const rest = args.join(' ')

    if (command === 'clear' || command === 'cls') {
      setTerminal([])
      return
    }
    if (command === 'help' || command === '?') {
      appendTerminal('output', 'Commands: help, clear/cls, pwd, echo <text>, status, models, save, reset, open <home|docs|trust|verify|audit|console|studio>.')
      return
    }
    if (command === 'pwd') {
      appendTerminal('output', 'ProofTTL:\\studio')
      return
    }
    if (command === 'echo') {
      appendTerminal('output', rest)
      return
    }
    if (command === 'models') {
      appendTerminal('output', `Active response route: ${runtime}. External providers are server-side and never expose API keys in the browser.`)
      return
    }
    if (command === 'save') {
      window.localStorage.setItem('proofttl-studio-editor', editor)
      appendTerminal('output', 'Editor buffer saved locally in this browser.')
      return
    }
    if (command === 'reset') {
      setEditor(STARTER)
      appendTerminal('output', 'Editor reset to the ProofTTL starter snippet.')
      return
    }
    if (command === 'status') {
      try {
        const response = await fetch(`${API_URL}/health`, { cache: 'no-store' })
        const body = await response.json().catch(() => ({})) as Record<string, unknown>
        appendTerminal(response.ok ? 'output' : 'error', response.ok ? `API ${String(body.ok ? 'OK' : 'DEGRADED')} · version ${String(body.version || 'unknown')} · protocol ${String(body.protocol || 'unknown')}` : `Status request failed: HTTP ${response.status}`)
      } catch {
        appendTerminal('error', 'Could not reach the ProofTTL API.')
      }
      return
    }
    if (command === 'open') {
      const targets: Record<string, string> = {
        home: '/', docs: '/docs/', trust: '/trust.html', verify: '/verify-lease.html', audit: '/audit/', console: '/console/', studio: '/studio/',
      }
      const target = targets[rest.toLowerCase()]
      if (!target) {
        appendTerminal('error', 'Unknown open target. Try: home, docs, trust, verify, audit, console, studio.')
        return
      }
      appendTerminal('output', `Opening ${rest.toLowerCase()}…`)
      window.setTimeout(() => window.location.assign(target), 250)
      return
    }

    appendTerminal('error', `Command '${commandRaw}' is not available in browser-safe mode. Ask the coding model for the PowerShell/Bash command, or use an isolated execution sandbox when one is connected.`)
  }

  function insertAssistantCode(text: string) {
    const fenced = text.match(/```(?:[\w.+-]+)?\n([\s\S]*?)```/)
    if (!fenced?.[1]) return
    setEditor(fenced[1].trimEnd() + '\n')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <p className="app-kicker">PROOFTTL STUDIO</p>
          <h1 className="app-title" style={{ marginBottom: 6 }}>Code + models + terminal.</h1>
          <p className="app-copy" style={{ maxWidth: 860 }}>A single workspace for drafting code, asking routed AI models for help, testing ProofTTL surfaces, and preparing PowerShell/Bash commands. Server host-shell execution stays disabled until an isolated sandbox is connected.</p>
        </div>
        <div className="app-status">{runtime}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(320px,.75fr)', gap: 14 }} className="studio-grid">
        <section className="console-panel wide" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div><h2 style={{ marginBottom: 2 }}>EDITOR</h2><small>{lineCount} lines · autosaved locally</small></div>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Studio language">
              {LANGUAGES.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
            </select>
          </div>
          <textarea
            value={editor}
            onChange={(event) => setEditor(event.target.value)}
            spellCheck={false}
            aria-label="Studio code editor"
            style={{ width: '100%', minHeight: 520, resize: 'vertical', border: '1px solid rgba(103,232,249,.16)', borderRadius: 12, background: 'rgba(2,8,12,.84)', color: '#dffcff', padding: 16, font: '13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace', tabSize: 2 }}
          />
        </section>

        <section className="console-panel wide" style={{ minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 590 }}>
          <div><h2 style={{ marginBottom: 2 }}>MODEL PLAYGROUND</h2><small>CODE ASSISTANT · ROUTED SERVER-SIDE</small></div>
          <div style={{ flex: 1, overflow: 'auto', margin: '12px 0', display: 'grid', alignContent: 'start', gap: 10, maxHeight: 470 }}>
            {chat.length === 0 && <div className="app-empty"><strong>Ask about the code in the editor.</strong>Examples: “debug this”, “rewrite this in PowerShell”, “add tests”, “explain the error”, or “generate a Cloudflare Worker route”.</div>}
            {chat.map((item, index) => (
              <article key={`${item.role}-${index}`} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(148,163,184,.12)', background: item.role === 'user' ? 'rgba(103,232,249,.045)' : 'rgba(255,255,255,.025)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                <small style={{ opacity: .7 }}>{item.role === 'user' ? 'YOU' : 'STUDIO AI'}</small>
                <div style={{ marginTop: 6 }}>{item.content}</div>
                {item.role === 'assistant' && /```/.test(item.content) && <button type="button" className="text-link" onClick={() => insertAssistantCode(item.content)} style={{ marginTop: 8 }}>REPLACE EDITOR WITH FIRST CODE BLOCK →</button>}
              </article>
            ))}
            {loading && <div className="app-note">Studio model is working…</div>}
          </div>
          <form onSubmit={askModel} style={{ display: 'grid', gap: 8 }}>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask the coding model…" maxLength={5000} rows={3} />
            <button className="button button-primary" disabled={!prompt.trim() || loading}>{loading ? 'THINKING…' : 'SEND TO STUDIO AI →'}</button>
          </form>
        </section>
      </div>

      <section className="console-panel wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div><h2 style={{ marginBottom: 2 }}>TERMINAL</h2><small>POWERSHELL-STYLE · BROWSER-SAFE COMMAND MODE</small></div>
          <span className="app-status">NO HOST SHELL</span>
        </div>
        <div style={{ marginTop: 12, minHeight: 220, maxHeight: 340, overflow: 'auto', padding: 14, borderRadius: 12, background: '#020608', border: '1px solid rgba(103,232,249,.13)', font: '12px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' }}>
          {terminal.map((line, index) => <div key={index} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', opacity: line.kind === 'input' ? 1 : .82 }}>{line.text}</div>)}
          <div ref={terminalEnd} />
        </div>
        <form onSubmit={runTerminal} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <span style={{ alignSelf: 'center', fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>PS&gt;</span>
          <input value={terminalValue} onChange={(event) => setTerminalValue(event.target.value)} placeholder="help" aria-label="Studio terminal command" style={{ flex: 1 }} />
          <button className="button">RUN</button>
        </form>
        <p className="app-note">For real PowerShell/Bash execution, Studio will use an isolated per-job sandbox when that backend is added. It will never expose the ProofTTL Worker or production host as an interactive shell.</p>
      </section>
    </div>
  )
}
