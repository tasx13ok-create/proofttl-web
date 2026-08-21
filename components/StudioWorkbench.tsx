'use client'

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'

const API_URL = (process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev').replace(/\/$/, '')

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type TerminalLine = { kind: 'input' | 'output' | 'error'; text: string }
type StudioFile = { id: string; name: string; language: string; content: string }
type Workspace = { name: string; files: StudioFile[]; activeFileId: string }
type CloudProject = { project_id: string; name: string; language?: string | null; active_file?: string | null; updated_at?: string }
type CloudState = 'checking' | 'signed-out' | 'ready' | 'saving' | 'error'
type ActivityView = 'explorer' | 'search'
type BottomPanel = 'terminal' | 'problems' | 'output'
type Problem = { line: number; severity: 'error' | 'warning' | 'info'; message: string }

const STARTER_TS = `// ProofTTL Studio\n// Multi-file browser workspace\n\nasync function verifyClaim(claim: string, sourceUrl: string) {\n  const response = await fetch('https://proofttl.tasx13ok.workers.dev/verify', {\n    method: 'POST',\n    headers: { 'content-type': 'application/json' },\n    body: JSON.stringify({ claim, source_url: sourceUrl }),\n  })\n\n  return response.json()\n}\n`
const STARTER_PS = `# ProofTTL Studio\n# Draft PowerShell here. Host-shell execution is intentionally disabled.\n\n$Health = Invoke-RestMethod -Uri 'https://proofttl.tasx13ok.workers.dev/health'\n$Health | ConvertTo-Json -Depth 5\n`
const STARTER_README = `# ProofTTL Studio workspace\n\nThis project is always cached locally. Signed-in accounts can also save projects to ProofTTL cloud storage.\n\n- Ask Studio AI to edit, explain, test, or refactor the active file.\n- Use the terminal for safe ProofTTL/browser commands.\n- Real Node/Python/Bash execution will use isolated per-job sandboxes, never the production Worker shell.\n`
const DEFAULT_WORKSPACE: Workspace = { name: 'ProofTTL Project', activeFileId: 'main-ts', files: [
  { id: 'main-ts', name: 'main.ts', language: 'typescript', content: STARTER_TS },
  { id: 'health-ps1', name: 'health.ps1', language: 'powershell', content: STARTER_PS },
  { id: 'readme-md', name: 'README.md', language: 'markdown', content: STARTER_README },
] }
const LANGUAGE_OPTIONS = ['typescript','javascript','python','powershell','bash','json','html','css','markdown','text']
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
function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

export default function StudioWorkbench() {
  const [workspace, setWorkspace] = useState<Workspace>(() => cloneDefaultWorkspace())
  const [openFileIds, setOpenFileIds] = useState<string[]>(['main-ts'])
  const [activityView, setActivityView] = useState<ActivityView>('explorer')
  const [searchQuery, setSearchQuery] = useState('')
  const [findOpen, setFindOpen] = useState(false)
  const [findQuery, setFindQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState('')
  const [bottomPanel, setBottomPanel] = useState<BottomPanel>('terminal')
  const [cursor, setCursor] = useState({ line: 1, col: 1 })
  const [editorScrollTop, setEditorScrollTop] = useState(0)
  const [prompt, setPrompt] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [runtime, setRuntime] = useState('ProofTTL router')
  const [newFileName, setNewFileName] = useState('')
  const [jobState, setJobState] = useState<'idle' | 'blocked' | 'ready'>('idle')
  const [terminal, setTerminal] = useState<TerminalLine[]>([{ kind: 'output', text: 'ProofTTL Studio terminal — safe command mode.' },{ kind: 'output', text: 'Type help. Production host-shell execution is disabled by design.' }])
  const [terminalValue, setTerminalValue] = useState('')
  const [terminalHistory, setTerminalHistory] = useState<string[]>([])
  const [terminalHistoryIndex, setTerminalHistoryIndex] = useState(-1)
  const [cloudState, setCloudState] = useState<CloudState>('checking')
  const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([])
  const [cloudProjectId, setCloudProjectId] = useState<string | null>(null)
  const [cloudMessage, setCloudMessage] = useState('')
  const terminalEnd = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<HTMLTextAreaElement | null>(null)

  const activeFile = workspace.files.find((file) => file.id === workspace.activeFileId) || workspace.files[0]
  const lineCount = useMemo(() => activeFile?.content.split('\n').length || 0, [activeFile?.content])
  const totalChars = useMemo(() => workspace.files.reduce((sum, file) => sum + file.content.length, 0), [workspace.files])
  const openFiles = useMemo(() => openFileIds.map((id) => workspace.files.find((file) => file.id === id)).filter(Boolean) as StudioFile[], [openFileIds, workspace.files])
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return [] as { fileId: string; fileName: string; line: number; preview: string }[]
    const results: { fileId: string; fileName: string; line: number; preview: string }[] = []
    for (const file of workspace.files) {
      file.content.split('\n').forEach((line, index) => {
        if (line.toLowerCase().includes(query) && results.length < 120) results.push({ fileId: file.id, fileName: file.name, line: index + 1, preview: line.trim() || '(blank line)' })
      })
    }
    return results
  }, [searchQuery, workspace.files])
  const problems = useMemo<Problem[]>(() => {
    if (!activeFile) return []
    const next: Problem[] = []
    const lines = activeFile.content.split('\n')
    lines.forEach((line, index) => {
      if (/\bFIXME\b/i.test(line)) next.push({ line: index + 1, severity: 'warning', message: 'FIXME marker remains in this file.' })
      if (/\bTODO\b/i.test(line)) next.push({ line: index + 1, severity: 'info', message: 'TODO marker remains in this file.' })
      if (line.length > 160) next.push({ line: index + 1, severity: 'info', message: `Line is ${line.length} characters long.` })
    })
    if (activeFile.language === 'json' && activeFile.content.trim()) {
      try { JSON.parse(activeFile.content) } catch (error) { next.unshift({ line: 1, severity: 'error', message: error instanceof Error ? `Invalid JSON: ${error.message}` : 'Invalid JSON.' }) }
    }
    return next.slice(0, 80)
  }, [activeFile])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Workspace
        if (parsed?.files?.length && parsed.activeFileId) {
          setWorkspace(parsed)
          setOpenFileIds([parsed.activeFileId])
        }
      }
      const historyRaw = window.localStorage.getItem(TERMINAL_HISTORY_KEY)
      if (historyRaw) setTerminalHistory(JSON.parse(historyRaw))
    } catch {}
    void refreshCloudProjects()
  }, [])
  useEffect(() => { const timer = window.setTimeout(() => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)), 180); return () => window.clearTimeout(timer) }, [workspace])
  useEffect(() => { terminalEnd.current?.scrollIntoView({ block: 'end' }) }, [terminal])
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.shiftKey && event.key.toLowerCase() === 'p') { event.preventDefault(); setPaletteOpen(true); setPaletteQuery(''); return }
      if (mod && event.shiftKey && event.key.toLowerCase() === 'f') { event.preventDefault(); setActivityView('search'); return }
      if (mod && event.key.toLowerCase() === 'f') { event.preventDefault(); setFindOpen(true); return }
      if (mod && event.key.toLowerCase() === 'p') { event.preventDefault(); setPaletteOpen(true); setPaletteQuery('open '); return }
      if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); appendTerminal('output', 'Local workspace saved. Autosave remains enabled.'); return }
      if (event.key === 'Escape') { setPaletteOpen(false); setFindOpen(false) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  async function refreshCloudProjects() {
    setCloudState('checking')
    try {
      const response = await fetch(`${API_URL}/studio/projects`, { credentials: 'include', cache: 'no-store' })
      if (response.status === 401) { setCloudState('signed-out'); setCloudProjects([]); return }
      const body = await response.json().catch(() => ({})) as { projects?: CloudProject[]; message?: string; error?: string }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      setCloudProjects(Array.isArray(body.projects) ? body.projects : [])
      setCloudState('ready')
    } catch (error) { setCloudState('error'); setCloudMessage(error instanceof Error ? error.message : 'Cloud project storage unavailable.') }
  }
  function cloudPayload() { return { name: workspace.name, language: activeFile?.language || null, active_file: activeFile?.name || null, files: Object.fromEntries(workspace.files.map((file) => [file.name, file.content])) } }
  async function saveCloudProject() {
    if (cloudState === 'signed-out') { window.location.assign('/login/'); return }
    if (cloudState === 'saving') return
    setCloudState('saving'); setCloudMessage('')
    try {
      const target = cloudProjectId ? `${API_URL}/studio/projects/${cloudProjectId}` : `${API_URL}/studio/projects`
      const response = await fetch(target, { method: cloudProjectId ? 'PUT' : 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cloudPayload()) })
      if (response.status === 401) { setCloudState('signed-out'); setCloudMessage('Sign in to save this project across devices.'); return }
      const body = await response.json().catch(() => ({})) as { project?: { project_id?: string }; message?: string; error?: string }
      if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      if (body.project?.project_id) setCloudProjectId(body.project.project_id)
      setCloudMessage('Project saved to your ProofTTL account.'); await refreshCloudProjects()
    } catch (error) { setCloudState('error'); setCloudMessage(error instanceof Error ? error.message : 'Could not save cloud project.') }
  }
  async function loadCloudProject(projectId: string) {
    setCloudState('checking'); setCloudMessage('')
    try {
      const response = await fetch(`${API_URL}/studio/projects/${projectId}`, { credentials: 'include', cache: 'no-store' })
      if (response.status === 401) { setCloudState('signed-out'); return }
      const body = await response.json().catch(() => ({})) as { project?: { project_id: string; name?: string; files?: Record<string,string>; active_file?: string | null }; message?: string; error?: string }
      if (!response.ok || !body.project?.files) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      const files = Object.entries(body.project.files).map(([name, content]) => ({ id: safeId(), name, language: languageForName(name), content: String(content) }))
      const active = files.find((file) => file.name === body.project?.active_file) || files[0]
      setWorkspace({ name: body.project.name || 'ProofTTL Project', files, activeFileId: active.id }); setOpenFileIds([active.id]); setCloudProjectId(body.project.project_id); setCloudMessage('Cloud project loaded.'); setCloudState('ready')
    } catch (error) { setCloudState('error'); setCloudMessage(error instanceof Error ? error.message : 'Could not load cloud project.') }
  }
  function updateActiveFile(patch: Partial<StudioFile>) { if (!activeFile) return; setWorkspace((current) => ({ ...current, files: current.files.map((file) => file.id === activeFile.id ? { ...file, ...patch } : file) })) }
  function selectFile(id: string) { setWorkspace((current) => ({ ...current, activeFileId: id })); setOpenFileIds((current) => current.includes(id) ? current : [...current, id].slice(-8)); setEditorScrollTop(0) }
  function closeFile(id: string) {
    setOpenFileIds((current) => {
      if (current.length <= 1) return current
      const next = current.filter((item) => item !== id)
      if (workspace.activeFileId === id) setWorkspace((value) => ({ ...value, activeFileId: next[next.length - 1] || value.activeFileId }))
      return next
    })
  }
  function addFile() { const name = newFileName.trim().replace(/^\/+/, '').slice(0,100); if (!name || workspace.files.some((file) => file.name.toLowerCase() === name.toLowerCase())) return; const file: StudioFile = { id: safeId(), name, language: languageForName(name), content: '' }; setWorkspace((current) => ({ ...current, files: [...current.files, file], activeFileId: file.id })); setOpenFileIds((current) => [...current, file.id].slice(-8)); setNewFileName('') }
  function deleteActiveFile() { if (!activeFile || workspace.files.length <= 1) return; setWorkspace((current) => { const files = current.files.filter((file) => file.id !== activeFile.id); return { ...current, files, activeFileId: files[0].id } }); setOpenFileIds((current) => current.filter((id) => id !== activeFile.id).length ? current.filter((id) => id !== activeFile.id) : [workspace.files.find((file) => file.id !== activeFile.id)?.id || workspace.activeFileId]) }
  function renameActiveFile() { if (!activeFile) return; const name = window.prompt('Rename file', activeFile.name)?.trim().replace(/^\/+/, '').slice(0,100); if (!name || workspace.files.some((file) => file.id !== activeFile.id && file.name.toLowerCase() === name.toLowerCase())) return; updateActiveFile({ name, language: languageForName(name) }) }
  function resetWorkspace() { if (!window.confirm('Reset the local Studio workspace to the starter project?')) return; const next = cloneDefaultWorkspace(); setWorkspace(next); setOpenFileIds([next.activeFileId]); setCloudProjectId(null); setChat([]); appendTerminal('output', 'Workspace reset to starter project.') }
  function updateCursor(position?: number) { const text = activeFile?.content || ''; const pos = position ?? editorRef.current?.selectionStart ?? 0; const before = text.slice(0, pos); const lines = before.split('\n'); setCursor({ line: lines.length, col: (lines[lines.length - 1]?.length || 0) + 1 }) }
  function jumpToPosition(position: number, length = 0) { window.setTimeout(() => { const editor = editorRef.current; if (!editor) return; editor.focus(); editor.setSelectionRange(position, position + length); updateCursor(position) }, 0) }
  function findNext() {
    if (!activeFile || !findQuery) return
    const source = activeFile.content.toLowerCase(); const query = findQuery.toLowerCase(); const start = editorRef.current?.selectionEnd || 0
    let index = source.indexOf(query, start); if (index < 0) index = source.indexOf(query)
    if (index >= 0) jumpToPosition(index, findQuery.length)
  }
  function replaceCurrent() {
    if (!activeFile || !findQuery || !editorRef.current) return
    const editor = editorRef.current; const selected = activeFile.content.slice(editor.selectionStart, editor.selectionEnd)
    if (selected.toLowerCase() !== findQuery.toLowerCase()) { findNext(); return }
    const start = editor.selectionStart; updateActiveFile({ content: activeFile.content.slice(0, start) + replaceQuery + activeFile.content.slice(editor.selectionEnd) }); jumpToPosition(start, replaceQuery.length)
  }
  function replaceAll() { if (!activeFile || !findQuery) return; const regex = new RegExp(escapeRegExp(findQuery), 'gi'); updateActiveFile({ content: activeFile.content.replace(regex, replaceQuery) }) }
  function jumpToLine(line: number) { if (!activeFile) return; const lines = activeFile.content.split('\n'); const position = lines.slice(0, Math.max(0, line - 1)).reduce((sum, item) => sum + item.length + 1, 0); jumpToPosition(position) }

  async function askModel(event: FormEvent) {
    event.preventDefault(); const clean = prompt.trim(); if (!clean || loading || !activeFile) return
    const history = chat.slice(-8); const projectManifest = workspace.files.map((file) => `${file.name} [${file.language}] ${file.content.length} chars`).join('\n'); const modelMessage = [clean,'',`Active file: ${activeFile.name}`,`Project: ${workspace.name}`,'Workspace manifest:',projectManifest].join('\n')
    setChat((current) => [...current,{ role:'user', content:clean }]); setPrompt(''); setLoading(true)
    try { const response = await fetch(`${API_URL}/studio/chat`, { method:'POST', credentials:'include', headers:{'content-type':'application/json'}, body:JSON.stringify({ message:modelMessage, language:activeFile.language, editor:activeFile.content, history }) }); const body = await response.json().catch(() => ({})) as { response?:string; message?:string; error?:string; runtime?:{provider?:string;model?:string} }; if (!response.ok) throw new Error(body.message || body.error || `HTTP ${response.status}`); setChat((current) => [...current,{ role:'assistant', content:body.response || 'No response returned.' }]); if (body.runtime?.provider || body.runtime?.model) setRuntime([body.runtime.provider,body.runtime.model].filter(Boolean).join(' · ')) }
    catch (error) { setChat((current) => [...current,{ role:'assistant', content:error instanceof Error ? error.message : 'Studio model unavailable.' }]) }
    finally { setLoading(false) }
  }
  function quickAsk(text:string){ setPrompt(text) }
  function appendTerminal(kind:TerminalLine['kind'],text:string){ setTerminal((current)=>[...current,{kind,text}]) }
  function rememberTerminal(raw:string){ setTerminalHistory((current)=>{ const next=[...current.filter((item)=>item!==raw),raw].slice(-50); window.localStorage.setItem(TERMINAL_HISTORY_KEY,JSON.stringify(next)); return next }); setTerminalHistoryIndex(-1) }
  function terminalKeyDown(event:KeyboardEvent<HTMLInputElement>){ if(event.key!=='ArrowUp'&&event.key!=='ArrowDown')return; event.preventDefault(); if(!terminalHistory.length)return; if(event.key==='ArrowUp'){ const nextIndex=terminalHistoryIndex<0?terminalHistory.length-1:Math.max(0,terminalHistoryIndex-1); setTerminalHistoryIndex(nextIndex); setTerminalValue(terminalHistory[nextIndex]||''); return } if(terminalHistoryIndex<0)return; const nextIndex=terminalHistoryIndex+1; if(nextIndex>=terminalHistory.length){ setTerminalHistoryIndex(-1); setTerminalValue('') } else { setTerminalHistoryIndex(nextIndex); setTerminalValue(terminalHistory[nextIndex]||'') } }
  async function runTerminal(event:FormEvent){ event.preventDefault(); const raw=terminalValue.trim(); if(!raw)return; setTerminalValue(''); rememberTerminal(raw); appendTerminal('input',`PS ProofTTL:\\studio> ${raw}`); const [commandRaw,...args]=raw.split(/\s+/); const command=commandRaw.toLowerCase(); const rest=args.join(' '); if(command==='clear'||command==='cls')return void setTerminal([]); if(command==='help'||command==='?')return void appendTerminal('output','Commands: help, clear/cls, pwd, ls, cat <file>, echo <text>, status, models, files, save, cloudsave, cloudlist, search <text>, problems, reset, sandbox, open <target>. ↑/↓ recalls history.'); if(command==='pwd')return void appendTerminal('output',`ProofTTL:\\studio\\${workspace.name.replace(/\s+/g,'-')}`); if(command==='echo')return void appendTerminal('output',rest); if(command==='files'||command==='ls')return void appendTerminal('output',workspace.files.map((file)=>`${file.id===workspace.activeFileId?'*':' '} ${file.name}  ${file.language}  ${file.content.length} bytes`).join('\n')); if(command==='cat'){ const file=workspace.files.find((item)=>item.name.toLowerCase()===rest.toLowerCase()); return void appendTerminal(file?'output':'error',file?file.content:`File not found: ${rest}`) } if(command==='search'){ setActivityView('search'); setSearchQuery(rest); return void appendTerminal('output',`Workspace search opened for: ${rest || '(empty query)'}`) } if(command==='problems'){ setBottomPanel('problems'); return void appendTerminal('output',`${problems.length} problem${problems.length===1?'':'s'} in ${activeFile?.name || 'active file'}.`) } if(command==='models')return void appendTerminal('output',`Active response route: ${runtime}. Provider credentials remain server-side.`); if(command==='save')return void appendTerminal('output','Local autosave is already active.'); if(command==='cloudsave'){ void saveCloudProject(); return } if(command==='cloudlist'){ void refreshCloudProjects(); return } if(command==='reset'){ resetWorkspace(); return } if(command==='sandbox'){ setJobState('blocked'); return void appendTerminal('output','Sandbox execution adapter is not connected yet. Real code execution requires an isolated per-job runtime with CPU/memory/time/network limits. Production shell access remains forbidden.') } if(command==='status'){ try{ const response=await fetch(`${API_URL}/health`,{cache:'no-store'}); const body=await response.json().catch(()=>({})) as Record<string,unknown>; appendTerminal(response.ok?'output':'error',response.ok?`API ${String(body.ok?'OK':'DEGRADED')} · version ${String(body.version||'unknown')} · protocol ${String(body.protocol||'unknown')}`:`Status request failed: HTTP ${response.status}`) }catch{ appendTerminal('error','Could not reach the ProofTTL API.') } return } if(command==='open'){ const targets:Record<string,string>={ home:'/',docs:'/docs/',trust:'/trust/',verify:'/verify-lease.html',audit:'/audit/',console:'/console/',studio:'/studio/',login:'/login/',guide:'/how-proofttl-works/' }; const target=targets[rest.toLowerCase()]; if(!target)return void appendTerminal('error',`Unknown open target: ${rest}`); appendTerminal('output',`Opening ${rest.toLowerCase()}…`); window.setTimeout(()=>window.location.assign(target),200); return } appendTerminal('error',`Command '${commandRaw}' is not available in browser-safe mode. Use Studio AI to draft the command, or wait for the isolated sandbox runner.`) }
  function insertAssistantCode(text:string){ const fenced=text.match(/```(?:[\w.+-]+)?\n([\s\S]*?)```/); if(!fenced?.[1]||!activeFile)return; updateActiveFile({content:fenced[1].trimEnd()+'\n'}) }

  const paletteCommands = [
    { label: 'File: New File', run: () => { setActivityView('explorer'); setPaletteOpen(false); window.setTimeout(() => document.querySelector<HTMLInputElement>('[aria-label="New Studio file name"]')?.focus(), 0) } },
    { label: 'File: Rename Active File', run: () => { setPaletteOpen(false); renameActiveFile() } },
    { label: 'File: Save Project to Cloud', run: () => { setPaletteOpen(false); void saveCloudProject() } },
    { label: 'Search: Search Workspace', run: () => { setPaletteOpen(false); setActivityView('search') } },
    { label: 'View: Open Problems', run: () => { setPaletteOpen(false); setBottomPanel('problems') } },
    { label: 'View: Open Terminal', run: () => { setPaletteOpen(false); setBottomPanel('terminal') } },
    { label: 'Editor: Find / Replace', run: () => { setPaletteOpen(false); setFindOpen(true) } },
    { label: 'AI: Review Active File', run: () => { setPaletteOpen(false); quickAsk('Review the active file for bugs, security issues, and edge cases. Give concrete fixes.') } },
    { label: 'Workspace: Reset Starter Project', run: () => { setPaletteOpen(false); resetWorkspace() } },
  ].filter((item) => item.label.toLowerCase().includes(paletteQuery.trim().toLowerCase()))

  return (
    <div className="studio-workbench studio-vscode-workbench">
      <header className="studio-workbench-bar">
        <div className="studio-project-title"><input value={workspace.name} onChange={(event)=>setWorkspace((current)=>({...current,name:event.target.value.slice(0,120)}))} aria-label="Studio project name" /><span>{activeFile?.name || 'EDITOR'}</span></div>
        <div className="studio-workbench-status"><button type="button" onClick={()=>{setPaletteOpen(true);setPaletteQuery('')}}>⌘ COMMAND</button><span>{runtime}</span><span>{workspace.files.length} FILES</span><span>{cloudState==='ready'?'CLOUD':cloudState==='signed-out'?'LOCAL':cloudState.toUpperCase()}</span></div>
      </header>

      <div className="studio-desktop-grid">
        <aside className="studio-explorer studio-activity-pane">
          <div className="studio-activity-switcher"><button type="button" className={activityView==='explorer'?'active':''} onClick={()=>setActivityView('explorer')} title="Explorer">▱</button><button type="button" className={activityView==='search'?'active':''} onClick={()=>setActivityView('search')} title="Search workspace">⌕</button></div>
          {activityView==='explorer' ? <>
            <div className="studio-pane-label"><span>EXPLORER</span><button type="button" onClick={addFile}>＋</button></div>
            <div className="studio-file-list">{workspace.files.map((file)=><button key={file.id} type="button" className={file.id===workspace.activeFileId?'active':''} onClick={()=>selectFile(file.id)}><span>▸</span><strong>{file.name}</strong><small>{file.language}</small></button>)}</div>
            <div className="studio-file-actions"><input value={newFileName} onChange={(event)=>setNewFileName(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter')addFile()}} placeholder="new-file.py" aria-label="New Studio file name" /><div><button type="button" onClick={renameActiveFile}>RENAME</button><button type="button" onClick={deleteActiveFile} disabled={workspace.files.length<=1}>DELETE</button></div></div>
            <div className="studio-cloud"><span>CLOUD</span><button type="button" onClick={()=>void saveCloudProject()} disabled={cloudState==='saving'}>{cloudState==='signed-out'?'SIGN IN TO SAVE':cloudState==='saving'?'SAVING…':cloudProjectId?'SAVE VERSION':'CREATE PROJECT'}</button><button type="button" onClick={()=>void refreshCloudProjects()}>REFRESH</button>{cloudProjects.slice(0,4).map((project)=><button type="button" key={project.project_id} onClick={()=>void loadCloudProject(project.project_id)}>{project.name}</button>)}{cloudMessage&&<small>{cloudMessage}</small>}</div>
          </> : <>
            <div className="studio-pane-label"><span>SEARCH</span><small>CTRL+SHIFT+F</small></div>
            <div className="studio-workspace-search"><input autoFocus value={searchQuery} onChange={(event)=>setSearchQuery(event.target.value)} placeholder="Search across files" aria-label="Search Studio workspace"/><small>{searchResults.length} RESULT{searchResults.length===1?'':'S'}</small></div>
            <div className="studio-search-results">{searchQuery&&!searchResults.length&&<div className="studio-empty">No matches in this workspace.</div>}{searchResults.map((result,index)=><button type="button" key={`${result.fileId}-${result.line}-${index}`} onClick={()=>{selectFile(result.fileId);jumpToLine(result.line)}}><strong>{result.fileName}:{result.line}</strong><span>{result.preview}</span></button>)}</div>
          </>}
        </aside>

        <section className="studio-editor-column studio-editor-column-v2">
          <div className="studio-tab-strip">{openFiles.map((file)=><div key={file.id} className={`studio-tab ${file.id===workspace.activeFileId?'active':''}`}><button type="button" onClick={()=>selectFile(file.id)}>{file.name}</button><button type="button" className="close" onClick={()=>closeFile(file.id)} aria-label={`Close ${file.name}`}>×</button></div>)}<div className="studio-tab-spacer"/><select value={activeFile?.language||'text'} onChange={(event)=>updateActiveFile({language:event.target.value})} aria-label="Studio language">{LANGUAGE_OPTIONS.map((item)=><option key={item} value={item}>{item.toUpperCase()}</option>)}</select></div>
          <div className="studio-breadcrumbs"><span>{workspace.name}</span><b>›</b><span>{activeFile?.name}</span><b>›</b><span>{activeFile?.language}</span></div>
          {findOpen&&<div className="studio-findbar"><input value={findQuery} onChange={(event)=>setFindQuery(event.target.value)} placeholder="Find" autoFocus/><input value={replaceQuery} onChange={(event)=>setReplaceQuery(event.target.value)} placeholder="Replace"/><button type="button" onClick={findNext}>NEXT</button><button type="button" onClick={replaceCurrent}>REPLACE</button><button type="button" onClick={replaceAll}>ALL</button><button type="button" onClick={()=>setFindOpen(false)}>×</button></div>}
          <div className="studio-editor-shell">
            <div className="studio-line-numbers" aria-hidden="true"><pre style={{transform:`translateY(-${editorScrollTop}px)`}}>{Array.from({length:lineCount},(_,index)=>index+1).join('\n')}</pre></div>
            <textarea ref={editorRef} className="studio-code-editor" value={activeFile?.content||''} onChange={(event)=>updateActiveFile({content:event.target.value})} onSelect={()=>updateCursor()} onClick={()=>updateCursor()} onKeyUp={()=>updateCursor()} onScroll={(event)=>setEditorScrollTop(event.currentTarget.scrollTop)} spellCheck={false} aria-label="Studio code editor" />
            <div className="studio-minimap" aria-hidden="true"><pre style={{transform:`translateY(-${editorScrollTop*.12}px)`}}>{(activeFile?.content||'').slice(0,7000)}</pre></div>
          </div>
          <section className="studio-terminal-pane studio-bottom-panel">
            <div className="studio-panel-tabs"><button type="button" className={bottomPanel==='terminal'?'active':''} onClick={()=>setBottomPanel('terminal')}>TERMINAL</button><button type="button" className={bottomPanel==='problems'?'active':''} onClick={()=>setBottomPanel('problems')}>PROBLEMS <span>{problems.length}</span></button><button type="button" className={bottomPanel==='output'?'active':''} onClick={()=>setBottomPanel('output')}>OUTPUT</button><small>NO HOST SHELL</small></div>
            {bottomPanel==='terminal'&&<><div className="studio-terminal-output">{terminal.map((line,index)=><div key={index} className={line.kind}>{line.text}</div>)}<div ref={terminalEnd}/></div><form onSubmit={runTerminal}><span>PS&gt;</span><input value={terminalValue} onChange={(event)=>setTerminalValue(event.target.value)} onKeyDown={terminalKeyDown} placeholder="help" aria-label="Studio terminal command"/><button>RUN</button></form></>}
            {bottomPanel==='problems'&&<div className="studio-problems">{!problems.length&&<div className="studio-empty"><strong>No detected problems.</strong><span>Browser checks currently cover JSON syntax, TODO/FIXME markers, and extreme line length.</span></div>}{problems.map((problem,index)=><button type="button" key={`${problem.line}-${index}`} onClick={()=>jumpToLine(problem.line)} className={problem.severity}><span>{problem.severity.toUpperCase()}</span><strong>Ln {problem.line}</strong><p>{problem.message}</p></button>)}</div>}
            {bottomPanel==='output'&&<div className="studio-output-panel"><div><span>PROJECT</span><strong>{workspace.name}</strong></div><div><span>ACTIVE FILE</span><strong>{activeFile?.name}</strong></div><div><span>MODEL ROUTE</span><strong>{runtime}</strong></div><div><span>STORAGE</span><strong>{cloudState==='ready'?'LOCAL + CLOUD':'LOCAL AUTOSAVE'}</strong></div><div><span>RUNNER</span><strong>{jobState==='ready'?'READY':'ISOLATED BOUNDARY'}</strong></div></div>}
          </section>
        </section>

        <aside className="studio-ai-pane">
          <div className="studio-pane-label"><span>MODEL PLAYGROUND</span><small>{totalChars} CHARS</small></div>
          <div className="studio-ai-tools"><button type="button" onClick={()=>quickAsk('Review the active file for bugs, security issues, and edge cases. Give concrete fixes.')}>REVIEW</button><button type="button" onClick={()=>quickAsk('Write tests for the active file. Return the best test file in a fenced code block.')}>TESTS</button><button type="button" onClick={()=>quickAsk('Refactor the active file for clarity and reliability without changing behavior. Return the full improved file.')}>REFACTOR</button><button type="button" onClick={()=>quickAsk('Explain the active file and how it fits into this project in plain English.')}>EXPLAIN</button></div>
          <div className="studio-chat">{chat.length===0&&<div className="studio-empty"><strong>Ask about the active file.</strong><span>Studio sends the file and a compact project manifest to the routed coding model.</span></div>}{chat.map((item,index)=><article key={`${item.role}-${index}`} className={item.role}><small>{item.role==='user'?'YOU':'STUDIO AI'}</small><div>{item.content}</div>{item.role==='assistant'&&/```/.test(item.content)&&<button type="button" onClick={()=>insertAssistantCode(item.content)}>USE FIRST CODE BLOCK</button>}</article>)}{loading&&<div className="studio-empty">Studio model is working…</div>}</div>
          <form className="studio-ai-compose" onSubmit={askModel}><textarea value={prompt} onChange={(event)=>setPrompt(event.target.value)} placeholder="Ask Studio AI…" maxLength={5000} rows={4}/><button disabled={!prompt.trim()||loading}>{loading?'THINKING…':'SEND'}</button></form>
        </aside>
      </div>

      <footer className="studio-statusbar"><span>Ln {cursor.line}, Col {cursor.col}</span><span>{activeFile?.language || 'text'}</span><button type="button" onClick={()=>setBottomPanel('problems')}>{problems.length} PROBLEMS</button><span>{jobState==='blocked'?'SANDBOX NOT CONNECTED':'ISOLATED RUNNER BOUNDARY'}</span><span>LOCAL AUTOSAVE ON</span><button type="button" onClick={resetWorkspace}>RESET WORKSPACE</button></footer>

      {paletteOpen&&<div className="studio-palette-backdrop" onMouseDown={()=>setPaletteOpen(false)}><section className="studio-command-palette" onMouseDown={(event)=>event.stopPropagation()}><input autoFocus value={paletteQuery} onChange={(event)=>setPaletteQuery(event.target.value)} placeholder="Type a command or file name"/><div>{paletteCommands.map((command)=><button type="button" key={command.label} onClick={command.run}>{command.label}</button>)}{workspace.files.filter((file)=>file.name.toLowerCase().includes(paletteQuery.replace(/^open\s+/i,'').trim().toLowerCase())).slice(0,10).map((file)=><button type="button" key={`file-${file.id}`} onClick={()=>{selectFile(file.id);setPaletteOpen(false)}}>Open File: {file.name}</button>)}</div><small>Ctrl+Shift+P · Ctrl+P · Ctrl+Shift+F · Ctrl+F · Ctrl+S</small></section></div>}
    </div>
  )
}
