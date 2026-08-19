'use client'

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'

const API_URL = (process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev').replace(/\/$/, '')

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type TerminalLine = { kind: 'input' | 'output' | 'error'; text: string }
type StudioFile = { id: string; name: string; language: string; content: string }
type Workspace = { name: string; files: StudioFile[]; activeFileId: string }
type CloudProject = { project_id: string; name: string; language?: string | null; active_file?: string | null; updated_at?: string }
type CloudState = 'checking' | 'signed-out' | 'ready' | 'saving' | 'error'

const STARTER_TS = `// ProofTTL Studio\n// Multi-file browser workspace\n\nasync function verifyClaim(claim: string, sourceUrl: string) {\n  const response = await fetch('https://proofttl.tasx13ok.workers.dev/verify', {\n    method: 'POST',\n    headers: { 'content-type': 'application/json' },\n    body: JSON.stringify({ claim, source_url: sourceUrl }),\n  })\n\n  return response.json()\n}\n`

const STARTER_PS = `# ProofTTL Studio\n# Draft PowerShell here. Host-shell execution is intentionally disabled.\n\n$Health = Invoke-RestMethod -Uri 'https://proofttl.tasx13ok.workers.dev/health'\n$Health | ConvertTo-Json -Depth 5\n`

const STARTER_README = `# ProofTTL Studio workspace\n\nThis project is always cached locally. Signed-in accounts can also save projects to ProofTTL cloud storage.\n\n- Ask Studio AI to edit, explain, test, or refactor the active file.\n- Use the terminal for safe ProofTTL/browser commands.\n- Real Node/Python/PowerShell execution will use isolated per-job sandboxes, never the production Worker shell.\n`

const DEFAULT_WORKSPACE: Workspace = {
  name: 'ProofTTL Project',
  activeFileId: 'main-ts',
  files: [
    { id: 'main-ts', name: 'main.ts', language: 'typescript', content: STARTER_TS },
    { id: 'health-ps1', name: 'health.ps1', language: 'powershell', content: STARTER_PS },
    { id: 'readme-md', name: 'README.md', language: 'markdown', content: STARTER_README },
  ],
}

const LANGUAGE_OPTIONS = ['typescript', 'javascript', 'python', 'powershell', 'bash', 'json', 'html', 'css', 'markdown', 'text']
const STORAGE_KEY = 'proofttl-studio-workspace-v2'
const TERMINAL_HISTORY_KEY = 'proofttl-studio-terminal-history-v1'

function cloneDefaultWorkspace(): Workspace { return JSON.parse(JSON.stringify(DEFAULT_WORKSPACE)) as Workspace }
function safeId() { return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}` }
function languageForName(name: string) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript'
  if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs')) return 'javascript'
  if (lower.endsWith('.py')) return 'python'
  if (lower.endsWith('.ps1')) return 'powershell'
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'bash'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.html')) return 'html'
  if (lower.endsWith('.css')) return 'css'
  if (lower.endsWith('.md')) return 'markdown'
  return 'text'
}

export default function StudioWorkbench() {
  const [workspace, setWorkspace] = useState<Workspace>(() => cloneDefaultWorkspace())
  const [prompt, setPrompt] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [runtime, setRuntime] = useState('ProofTTL router')
  const [newFileName, setNewFileName] = useState('')
  const [jobState, setJobState] = useState<'idle' | 'blocked' | 'ready'>('idle')
  const [terminal, setTerminal] = useState<TerminalLine[]>([
    { kind: 'output', text: 'ProofTTL Studio terminal — safe command mode.' },
    { kind: 'output', text: 'Type help. Production host-shell execution is disabled by design.' },
  ])
  const [terminalValue, setTerminalValue] = useState('')
  const [terminalHistory, setTerminalHistory] = useState<string[]>([])
  const [terminalHistoryIndex, setTerminalHistoryIndex] = useState(-1)
  const [cloudState, setCloudState] = useState<CloudState>('checking')
  const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([])
  const [cloudProjectId, setCloudProjectId] = useState<string | null>(null)
  const [cloudMessage, setCloudMessage] = useState('')
  const terminalEnd = useRef<HTMLDivElement | null>(null)

  const activeFile = workspace.files.find((file) => file.id === workspace.activeFileId) || workspace.files[0]
  const lineCount = useMemo(() => activeFile?.content.split('\n').length || 0, [activeFile?.content])
  const totalChars = useMemo(() => workspace.files.reduce((sum, file) => sum + file.content.length, 0), [workspace.files])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Workspace
        if (parsed?.files?.length && parsed.activeFileId) setWorkspace(parsed)
      }
      const historyRaw = window.localStorage.getItem(TERMINAL_HISTORY_KEY)
      if (historyRaw) setTerminalHistory(JSON.parse(historyRaw))
    } catch {}
    void refreshCloudProjects()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)), 180)
    return () => window.clearTimeout(timer)
  }, [workspace])

  useEffect(() => { terminalEnd.current?.scrollIntoView({ block: 'end' }) }, [terminal])

  async function refreshCloudProjects() {
    setCloudState('checking')
    try {
      const response = await fetch(`${API_URL}/studio/projects`, { credentials: 'include', cache: 'no-store' })
      if (response.status === 401) { setCloudState('signed-out'); setCloudProjects([]); return }
      const body = await response.json().catch(() => ({})) as { projects?: CloudProject[]; message?: string; error?: string }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      setCloudProjects(Array.isArray(body.projects) ? body.projects : [])
      setCloudState('ready')
    } catch (error) {
      setCloudState('error')
      setCloudMessage(error instanceof Error ? error.message : 'Cloud project storage unavailable.')
    }
  }

  function cloudPayload() {
    return {
      name: workspace.name,
      language: activeFile?.language || null,
      active_file: activeFile?.name || null,
      files: Object.fromEntries(workspace.files.map((file) => [file.name, file.content])),
    }
  }

  async function saveCloudProject() {
    if (cloudState === 'signed-out') { window.location.assign('/login/'); return }
    if (cloudState === 'saving') return
    setCloudState('saving')
    setCloudMessage('')
    try {
      const target = cloudProjectId ? `${API_URL}/studio/projects/${cloudProjectId}` : `${API_URL}/studio/projects`
      const response = await fetch(target, {
        method: cloudProjectId ? 'PUT' : 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cloudPayload()),
      })
      if (response.status === 401) { setCloudState('signed-out'); setCloudMessage('Sign in to save this project across devices.'); return }
      const body = await response.json().catch(() => ({})) as { project?: { project_id?: string }; message?: string; error?: string }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      if (body.project?.project_id) setCloudProjectId(body.project.project_id)
      setCloudMessage('Project saved to your ProofTTL account.')
      await refreshCloudProjects()
    } catch (error) {
      setCloudState('error')
      setCloudMessage(error instanceof Error ? error.message : 'Could not save cloud project.')
    }
  }

  async function loadCloudProject(projectId: string) {
    setCloudState('checking')
    setCloudMessage('')
    try {
      const response = await fetch(`${API_URL}/studio/projects/${projectId}`, { credentials: 'include', cache: 'no-store' })
      if (response.status === 401) { setCloudState('signed-out'); return }
      const body = await response.json().catch(() => ({})) as { project?: { project_id: string; name?: string; files?: Record<string,string>; active_file?: string | null }; message?: string; error?: string }
      if (!response.ok || !body.project?.files) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      const files = Object.entries(body.project.files).map(([name, content]) => ({ id: safeId(), name, language: languageForName(name), content: String(content) }))
      const active = files.find((file) => file.name === body.project?.active_file) || files[0]
      setWorkspace({ name: body.project.name || 'ProofTTL Project', files, activeFileId: active.id })
      setCloudProjectId(body.project.project_id)
      setCloudMessage('Cloud project loaded. Local fallback updated automatically.')
      setCloudState('ready')
    } catch (error) {
      setCloudState('error')
      setCloudMessage(error instanceof Error ? error.message : 'Could not load cloud project.')
    }
  }

  function updateActiveFile(patch: Partial<StudioFile>) {
    if (!activeFile) return
    setWorkspace((current) => ({ ...current, files: current.files.map((file) => file.id === activeFile.id ? { ...file, ...patch } : file) }))
  }

  function addFile() {
    const name = newFileName.trim().replace(/^\/+/, '').slice(0, 100)
    if (!name || workspace.files.some((file) => file.name.toLowerCase() === name.toLowerCase())) return
    const file: StudioFile = { id: safeId(), name, language: languageForName(name), content: '' }
    setWorkspace((current) => ({ ...current, files: [...current.files, file], activeFileId: file.id }))
    setNewFileName('')
  }

  function deleteActiveFile() {
    if (!activeFile || workspace.files.length <= 1) return
    setWorkspace((current) => { const files = current.files.filter((file) => file.id !== activeFile.id); return { ...current, files, activeFileId: files[0].id } })
  }

  function renameActiveFile() {
    if (!activeFile) return
    const name = window.prompt('Rename file', activeFile.name)?.trim().replace(/^\/+/, '').slice(0, 100)
    if (!name || workspace.files.some((file) => file.id !== activeFile.id && file.name.toLowerCase() === name.toLowerCase())) return
    updateActiveFile({ name, language: languageForName(name) })
  }

  function resetWorkspace() {
    if (!window.confirm('Reset the local Studio workspace to the starter project?')) return
    setWorkspace(cloneDefaultWorkspace()); setCloudProjectId(null); setChat([]); appendTerminal('output', 'Workspace reset to starter project.')
  }

  async function askModel(event: FormEvent) {
    event.preventDefault()
    const clean = prompt.trim()
    if (!clean || loading || !activeFile) return
    const history = chat.slice(-8)
    const projectManifest = workspace.files.map((file) => `${file.name} [${file.language}] ${file.content.length} chars`).join('\n')
    const modelMessage = [clean, '', `Active file: ${activeFile.name}`, `Project: ${workspace.name}`, 'Workspace manifest:', projectManifest].join('\n')
    setChat((current) => [...current, { role: 'user', content: clean }]); setPrompt(''); setLoading(true)
    try {
      const response = await fetch(`${API_URL}/studio/chat`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: modelMessage, language: activeFile.language, editor: activeFile.content, history }) })
      const body = await response.json().catch(() => ({})) as { response?: string; message?: string; error?: string; runtime?: { provider?: string; model?: string } }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      setChat((current) => [...current, { role: 'assistant', content: body.response || 'No response returned.' }])
      if (body.runtime?.provider || body.runtime?.model) setRuntime([body.runtime.provider, body.runtime.model].filter(Boolean).join(' · '))
    } catch (error) { setChat((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Studio model unavailable.' }]) }
    finally { setLoading(false) }
  }

  function quickAsk(text: string) { setPrompt(text) }
  function appendTerminal(kind: TerminalLine['kind'], text: string) { setTerminal((current) => [...current, { kind, text }]) }
  function rememberTerminal(raw: string) {
    setTerminalHistory((current) => { const next = [...current.filter((item) => item !== raw), raw].slice(-50); window.localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(next)); return next })
    setTerminalHistoryIndex(-1)
  }

  function terminalKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault(); if (!terminalHistory.length) return
    if (event.key === 'ArrowUp') { const nextIndex = terminalHistoryIndex < 0 ? terminalHistory.length - 1 : Math.max(0, terminalHistoryIndex - 1); setTerminalHistoryIndex(nextIndex); setTerminalValue(terminalHistory[nextIndex] || ''); return }
    if (terminalHistoryIndex < 0) return
    const nextIndex = terminalHistoryIndex + 1
    if (nextIndex >= terminalHistory.length) { setTerminalHistoryIndex(-1); setTerminalValue('') } else { setTerminalHistoryIndex(nextIndex); setTerminalValue(terminalHistory[nextIndex] || '') }
  }

  async function runTerminal(event: FormEvent) {
    event.preventDefault(); const raw = terminalValue.trim(); if (!raw) return
    setTerminalValue(''); rememberTerminal(raw); appendTerminal('input', `PS ProofTTL:\\studio> ${raw}`)
    const [commandRaw, ...args] = raw.split(/\s+/); const command = commandRaw.toLowerCase(); const rest = args.join(' ')
    if (command === 'clear' || command === 'cls') return void setTerminal([])
    if (command === 'help' || command === '?') return void appendTerminal('output', 'Commands: help, clear/cls, pwd, ls, cat <file>, echo <text>, status, models, files, save, cloudsave, cloudlist, reset, sandbox, open <target>. ↑/↓ recalls history.')
    if (command === 'pwd') return void appendTerminal('output', `ProofTTL:\\studio\\${workspace.name.replace(/\s+/g, '-')}`)
    if (command === 'echo') return void appendTerminal('output', rest)
    if (command === 'files' || command === 'ls') return void appendTerminal('output', workspace.files.map((file) => `${file.id === workspace.activeFileId ? '*' : ' '} ${file.name}  ${file.language}  ${file.content.length} bytes`).join('\n'))
    if (command === 'cat') { const file = workspace.files.find((item) => item.name.toLowerCase() === rest.toLowerCase()); return void appendTerminal(file ? 'output' : 'error', file ? file.content : `File not found: ${rest}`) }
    if (command === 'models') return void appendTerminal('output', `Active response route: ${runtime}. Provider credentials remain server-side.`)
    if (command === 'save') { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); return void appendTerminal('output', `Saved ${workspace.files.length} files locally.`) }
    if (command === 'cloudsave') { appendTerminal('output', cloudState === 'signed-out' ? 'Sign in before cloud saving.' : 'Saving project to account workspace…'); void saveCloudProject(); return }
    if (command === 'cloudlist') return void appendTerminal('output', cloudProjects.length ? cloudProjects.map((project) => `${project.project_id}  ${project.name}`).join('\n') : 'No cloud projects loaded. Sign in or refresh cloud storage.')
    if (command === 'reset') return void resetWorkspace()
    if (command === 'sandbox') { setJobState('blocked'); return void appendTerminal('output', 'Sandbox execution adapter is not connected yet. Real code execution requires an isolated per-job runtime with CPU/memory/time/network limits. Production shell access remains forbidden.') }
    if (command === 'status') {
      try { const response = await fetch(`${API_URL}/health`, { cache: 'no-store' }); const body = await response.json().catch(() => ({})) as Record<string, unknown>; appendTerminal(response.ok ? 'output' : 'error', response.ok ? `API ${String(body.ok ? 'OK' : 'DEGRADED')} · version ${String(body.version || 'unknown')} · protocol ${String(body.protocol || 'unknown')}` : `Status request failed: HTTP ${response.status}`) }
      catch { appendTerminal('error', 'Could not reach the ProofTTL API.') }
      return
    }
    if (command === 'open') {
      const targets: Record<string, string> = { home: '/', docs: '/docs/', trust: '/trust.html', verify: '/verify-lease.html', audit: '/audit/', console: '/console/', studio: '/studio/', login: '/login/', guide: '/how-proofttl-works/' }
      const target = targets[rest.toLowerCase()]; if (!target) return void appendTerminal('error', `Unknown open target: ${rest}`)
      appendTerminal('output', `Opening ${rest.toLowerCase()}…`); window.setTimeout(() => window.location.assign(target), 200); return
    }
    appendTerminal('error', `Command '${commandRaw}' is not available in browser-safe mode. Use Studio AI to draft the command, or wait for the isolated sandbox runner.`)
  }

  function insertAssistantCode(text: string) { const fenced = text.match(/```(?:[\w.+-]+)?\n([\s\S]*?)```/); if (!fenced?.[1] || !activeFile) return; updateActiveFile({ content: fenced[1].trimEnd() + '\n' }) }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><p className="app-kicker">PROOFTTL STUDIO</p><h1 className="app-title" style={{ marginBottom: 6 }}>Code + models + terminal + workspace.</h1><p className="app-copy" style={{ maxWidth: 900 }}>A browser-native development workspace with local fallback and authenticated cross-device project storage. Real execution stays separated behind an isolated sandbox boundary.</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="app-status">{runtime}</span><span className="app-status">{workspace.files.length} FILES · {totalChars} CHARS</span><span className="app-status">{cloudState === 'ready' ? 'CLOUD READY' : cloudState === 'signed-out' ? 'LOCAL MODE' : cloudState.toUpperCase()}</span></div>
      </div>

      <section className="console-panel wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div><h2 style={{ marginBottom: 2 }}>PROJECT STORAGE</h2><small>LOCAL FALLBACK + AUTHENTICATED D1 CLOUD</small></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="button" onClick={() => void refreshCloudProjects()}>REFRESH CLOUD</button>
            <button type="button" className="button button-primary" onClick={() => void saveCloudProject()} disabled={cloudState === 'saving'}>{cloudState === 'signed-out' ? 'SIGN IN TO CLOUD SAVE →' : cloudState === 'saving' ? 'SAVING…' : cloudProjectId ? 'SAVE CLOUD VERSION →' : 'CREATE CLOUD PROJECT →'}</button>
          </div>
        </div>
        {cloudProjects.length > 0 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>{cloudProjects.map((project) => <button type="button" className="text-link" key={project.project_id} onClick={() => void loadCloudProject(project.project_id)}>{project.name} · {project.project_id.slice(0, 12)}…</button>)}</div>}
        {cloudState === 'signed-out' && <p className="app-note">Local autosave is active. Sign in with a trusted provider to save projects across browsers/devices.</p>}
        {cloudMessage && <p className="app-note">{cloudMessage}</p>}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '210px minmax(0,1.15fr) minmax(320px,.75fr)', gap: 14 }} className="studio-grid">
        <aside className="console-panel wide" style={{ minWidth: 0, alignSelf: 'stretch' }}>
          <div><h2 style={{ marginBottom: 2 }}>PROJECT</h2><input value={workspace.name} onChange={(event) => setWorkspace((current) => ({ ...current, name: event.target.value.slice(0, 120) }))} aria-label="Studio project name" /></div>
          <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>{workspace.files.map((file) => <button key={file.id} type="button" onClick={() => setWorkspace((current) => ({ ...current, activeFileId: file.id }))} style={{ textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: file.id === workspace.activeFileId ? '1px solid rgba(103,232,249,.42)' : '1px solid rgba(148,163,184,.1)', background: file.id === workspace.activeFileId ? 'rgba(103,232,249,.08)' : 'rgba(255,255,255,.02)' }}><strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</strong><small>{file.language}</small></button>)}</div>
          <div style={{ display: 'grid', gap: 6, marginTop: 12 }}><input value={newFileName} onChange={(event) => setNewFileName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addFile() }} placeholder="new-file.py" aria-label="New Studio file name" /><button type="button" className="button" onClick={addFile}>+ FILE</button><button type="button" className="text-link" onClick={renameActiveFile}>RENAME ACTIVE</button><button type="button" className="text-link" onClick={deleteActiveFile} disabled={workspace.files.length <= 1}>DELETE ACTIVE</button></div>
        </aside>

        <section className="console-panel wide" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}><div><h2 style={{ marginBottom: 2 }}>{activeFile?.name || 'EDITOR'}</h2><small>{lineCount} lines · locally autosaved</small></div><select value={activeFile?.language || 'text'} onChange={(event) => updateActiveFile({ language: event.target.value })} aria-label="Studio language">{LANGUAGE_OPTIONS.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}</select></div>
          <textarea value={activeFile?.content || ''} onChange={(event) => updateActiveFile({ content: event.target.value })} spellCheck={false} aria-label="Studio code editor" style={{ width: '100%', minHeight: 540, resize: 'vertical', border: '1px solid rgba(103,232,249,.16)', borderRadius: 12, background: 'rgba(2,8,12,.84)', color: '#dffcff', padding: 16, font: '13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace', tabSize: 2 }} />
        </section>

        <section className="console-panel wide" style={{ minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 610 }}>
          <div><h2 style={{ marginBottom: 2 }}>MODEL PLAYGROUND</h2><small>CODE ASSISTANT · ROUTED SERVER-SIDE</small></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}><button type="button" className="text-link" onClick={() => quickAsk('Review the active file for bugs, security issues, and edge cases. Give concrete fixes.')}>REVIEW</button><button type="button" className="text-link" onClick={() => quickAsk('Write tests for the active file. Return the best test file in a fenced code block.')}>TESTS</button><button type="button" className="text-link" onClick={() => quickAsk('Refactor the active file for clarity and reliability without changing behavior. Return the full improved file.')}>REFACTOR</button><button type="button" className="text-link" onClick={() => quickAsk('Explain the active file and how it fits into this project in plain English.')}>EXPLAIN</button></div>
          <div style={{ flex: 1, overflow: 'auto', margin: '12px 0', display: 'grid', alignContent: 'start', gap: 10, maxHeight: 460 }}>{chat.length === 0 && <div className="app-empty"><strong>Ask about the active file or project.</strong>Studio sends the active file plus a compact project manifest to the routed coding model.</div>}{chat.map((item, index) => <article key={`${item.role}-${index}`} style={{ padding: 12, borderRadius: 10, border: '1px solid rgba(148,163,184,.12)', background: item.role === 'user' ? 'rgba(103,232,249,.045)' : 'rgba(255,255,255,.025)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}><small style={{ opacity: .7 }}>{item.role === 'user' ? 'YOU' : 'STUDIO AI'}</small><div style={{ marginTop: 6 }}>{item.content}</div>{item.role === 'assistant' && /```/.test(item.content) && <button type="button" className="text-link" onClick={() => insertAssistantCode(item.content)} style={{ marginTop: 8 }}>REPLACE ACTIVE FILE WITH FIRST CODE BLOCK →</button>}</article>)}{loading && <div className="app-note">Studio model is working…</div>}</div>
          <form onSubmit={askModel} style={{ display: 'grid', gap: 8 }}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask the coding model…" maxLength={5000} rows={3} /><button className="button button-primary" disabled={!prompt.trim() || loading}>{loading ? 'THINKING…' : 'SEND TO STUDIO AI →'}</button></form>
        </section>
      </div>

      <section className="console-panel wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><h2 style={{ marginBottom: 2 }}>TERMINAL</h2><small>POWERSHELL-STYLE · BROWSER-SAFE COMMAND MODE · HISTORY ENABLED</small></div><span className="app-status">NO HOST SHELL</span></div>
        <div style={{ marginTop: 12, minHeight: 230, maxHeight: 360, overflow: 'auto', padding: 14, borderRadius: 12, background: '#020608', border: '1px solid rgba(103,232,249,.13)', font: '12px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' }}>{terminal.map((line, index) => <div key={index} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', opacity: line.kind === 'input' ? 1 : .82 }}>{line.text}</div>)}<div ref={terminalEnd} /></div>
        <form onSubmit={runTerminal} style={{ display: 'flex', gap: 8, marginTop: 10 }}><span style={{ alignSelf: 'center', fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>PS&gt;</span><input value={terminalValue} onChange={(event) => setTerminalValue(event.target.value)} onKeyDown={terminalKeyDown} placeholder="help" aria-label="Studio terminal command" style={{ flex: 1 }} /><button className="button">RUN</button></form>
      </section>

      <section className="console-panel wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}><div><h2 style={{ marginBottom: 2 }}>EXECUTION JOBS</h2><small>ISOLATED RUNNER BOUNDARY</small></div><span className="app-status">{jobState === 'blocked' ? 'SANDBOX NOT CONNECTED' : 'DESIGN READY'}</span></div>
        <div className="app-empty" style={{ marginTop: 12 }}><strong>Real code execution will never reuse the ProofTTL production process.</strong>The runner contract is intentionally separate: temporary job filesystem, language/runtime allowlist, CPU/memory/time limits, network policy, streamed stdout/stderr, package restrictions, and automatic destruction after completion.<button type="button" className="text-link" onClick={() => { setJobState('blocked'); appendTerminal('output', 'Execution requested, but no isolated sandbox provider is connected yet.') }}>CHECK RUNNER STATUS →</button></div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}><small>LOCAL FALLBACK ALWAYS ON · account cloud sync when authenticated</small><button type="button" className="text-link" onClick={resetWorkspace}>RESET LOCAL WORKSPACE</button></div>
    </div>
  )
}
