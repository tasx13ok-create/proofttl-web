'use client'

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react'

const AREAS = [
  { key: 'explorer', icon: '▱', label: 'Explorer' },
  { key: 'search', icon: '⌕', label: 'Search' },
  { key: 'love', icon: '◉', label: 'L.O.V.E.' },
  { key: 'source', icon: '⑂', label: 'Source' },
  { key: 'run', icon: '▷', label: 'Run' },
  { key: 'connections', icon: '◇', label: 'Connections' },
] as const

type AreaKey = typeof AREAS[number]['key']
type PanelMode = 'terminal' | 'output' | 'problems'
type TerminalLine = { kind: 'input' | 'output' | 'error'; text: string }

const TREE = [
  ['studio', 'Studio', '/studio/'],
  ['work', 'Work', '/work/'],
  ['files', 'Files', '/files/'],
  ['automations', 'Automations', '/automations/'],
  ['money', 'Money', '/money/'],
  ['truth', 'Trust', '/trust/'],
] as const

const ROUTES: Record<string, string> = Object.fromEntries(TREE.flatMap(([key, label, href]) => [[key, href], [label.toLowerCase(), href]]))
ROUTES.workspace = '/workspace/'
ROUTES.home = '/workspace/'
ROUTES.connections = '/connections/'
ROUTES.account = '/console/'
ROUTES.console = '/console/'
ROUTES.audit = '/audit/'

export default function WorkspaceDesktopShell() {
  const [area, setArea] = useState<AreaKey>('explorer')
  const [activeTab, setActiveTab] = useState<'workspace' | 'quick'>('workspace')
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [panelMode, setPanelMode] = useState<PanelMode>('terminal')
  const [search, setSearch] = useState('')
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false)
  const [terminalValue, setTerminalValue] = useState('')
  const [terminalHistory, setTerminalHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { kind: 'output', text: 'ProofTTL Workspace terminal — type help.' },
  ])

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return TREE
    return TREE.filter(([, label, href]) => `${label} ${href}`.toLowerCase().includes(term))
  }, [search])
  const problemLines = useMemo(() => terminalLines.filter((line) => line.kind === 'error'), [terminalLines])
  const outputLines = useMemo(() => terminalLines.filter((line) => line.kind !== 'input').slice(-12), [terminalLines])

  function openPanel(mode: PanelMode) {
    setPanelMode(mode)
    setTerminalOpen(true)
  }

  function appendLine(kind: TerminalLine['kind'], text: string) {
    setTerminalLines((current) => [...current, { kind, text }].slice(-80))
  }

  function remember(command: string) {
    setTerminalHistory((current) => [...current.filter((item) => item !== command), command].slice(-30))
    setHistoryIndex(-1)
  }

  function runWorkspaceCommand(event: FormEvent) {
    event.preventDefault()
    const raw = terminalValue.trim()
    if (!raw) return
    setTerminalValue('')
    remember(raw)
    appendLine('input', `PS Workspace:> ${raw}`)

    const [verbRaw, ...args] = raw.split(/\s+/)
    const verb = verbRaw.toLowerCase()
    const argument = args.join(' ').trim().toLowerCase()

    if (verb === 'clear' || verb === 'cls') { setTerminalLines([]); return }
    if (verb === 'help' || verb === '?') {
      appendLine('output', 'Commands: help, open <surface>, ls, pwd, search <term>, love, status, clear. Code execution lives in Studio.')
      return
    }
    if (verb === 'pwd') { appendLine('output', 'ProofTTL:\\workspace'); return }
    if (verb === 'ls' || verb === 'dir') { appendLine('output', TREE.map(([, label, href]) => `${label.padEnd(12)} ${href}`).join('\n')); return }
    if (verb === 'status') { appendLine('output', `Workspace ready · ${problemLines.length} recorded problem${problemLines.length === 1 ? '' : 's'} · Testnet`); return }
    if (verb === 'love') {
      appendLine('output', 'L.O.V.E. is available in the global chat dock. Type there to reason, code, navigate, or use connected tools.')
      setArea('love')
      return
    }
    if (verb === 'search') {
      if (!argument) { appendLine('error', 'Usage: search <surface>'); return }
      setSearch(argument)
      setArea('search')
      appendLine('output', `Searching Workspace for “${argument}”.`)
      return
    }
    if (verb === 'open' || verb === 'cd') {
      const target = ROUTES[argument]
      if (!target) { appendLine('error', `Unknown Workspace surface: ${argument || '(missing)'}`); return }
      appendLine('output', `Opening ${argument}.`)
      window.location.assign(target)
      return
    }
    if (['run', 'node', 'python', 'py', 'bash', 'npm'].includes(verb)) {
      appendLine('error', 'Workspace does not execute arbitrary code. Open Studio for isolated JavaScript, Python, and Bash jobs.')
      return
    }
    appendLine('error', `Unknown command: ${verb}. Type help.`)
  }

  function terminalKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    if (!terminalHistory.length) return
    if (event.key === 'ArrowUp') {
      const next = historyIndex < 0 ? terminalHistory.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(next)
      setTerminalValue(terminalHistory[next] || '')
      return
    }
    if (historyIndex < 0) return
    const next = historyIndex + 1
    if (next >= terminalHistory.length) { setHistoryIndex(-1); setTerminalValue('') }
    else { setHistoryIndex(next); setTerminalValue(terminalHistory[next] || '') }
  }

  return (
    <section className="os-shell" aria-label="ProofTTL Workspace">
      <aside className="os-activity" aria-label="Workspace activity">
        {AREAS.map((item) => <button key={item.key} type="button" className={area === item.key ? 'active' : ''} onClick={() => setArea(item.key)} title={item.label} aria-label={item.label}><span>{item.icon}</span></button>)}
        <a href="/console/" title="Account" aria-label="Account">⚙</a>
      </aside>

      <aside className="os-sidebar">
        <div className="os-sidebar-title">
          <span>{AREAS.find((item) => item.key === area)?.label.toUpperCase()}</span>
          <div className="os-sidebar-menu-wrap">
            <button type="button" aria-label="Workspace sidebar menu" aria-expanded={sidebarMenuOpen} onClick={() => setSidebarMenuOpen((value) => !value)}>···</button>
            {sidebarMenuOpen && <div className="os-sidebar-menu"><a href="/workspace/">Workspace home</a><a href="/connections/">Manage connections</a><a href="/console/">Account & security</a></div>}
          </div>
        </div>
        {area === 'explorer' && <>
          <div className="os-section-label">WORKSPACE</div>
          <div className="os-tree">{TREE.map(([key, label, href]) => <a href={href} key={key}><span>›</span><b>{label}</b></a>)}</div>
          <div className="os-section-label secondary">OPEN EDITORS</div>
          <button className="os-open-file" type="button" onClick={() => setActiveTab('workspace')}>◈ workspace.home</button>
          <button className="os-open-file" type="button" onClick={() => setActiveTab('quick')}>⌘ quick.actions</button>
        </>}
        {area === 'search' && <div className="os-side-tool"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Workspace" aria-label="Search Workspace" /><small>{search ? `${searchResults.length} matching surface${searchResults.length === 1 ? '' : 's'}.` : 'Search routes and project surfaces.'}</small><div className="os-tree">{searchResults.map(([key, label, href]) => <a href={href} key={key}><span>›</span><b>{label}</b></a>)}</div></div>}
        {area === 'love' && <div className="os-side-tool"><strong>L.O.V.E.</strong><small>Use the global chat dock below. Ask naturally or give platform commands.</small><code>“verify this claim”</code><code>“help me code this”</code><code>“open files”</code></div>}
        {area === 'source' && <div className="os-side-tool"><strong>Source control</strong><small>GitHub project operations stay permissioned through Connections.</small><a href="/connections/">Connect GitHub →</a></div>}
        {area === 'run' && <div className="os-side-tool"><strong>Run & debug</strong><small>Approved code runs go through isolated cloud sandboxes.</small><a href="/studio/">Open Studio →</a></div>}
        {area === 'connections' && <div className="os-side-tool"><strong>Providers</strong><small>Identity, models, GitHub, Vercel and future provider rails.</small><a href="/connections/">Open Connections →</a></div>}
      </aside>

      <main className="os-workbench">
        <div className="os-tabs"><button type="button" className={activeTab === 'workspace' ? 'active' : ''} onClick={() => setActiveTab('workspace')}>◈ workspace.home</button><button type="button" onClick={() => setActiveTab('quick')} className={activeTab === 'quick' ? 'active' : ''}>⌘ quick.actions</button></div>
        <div className="os-editor">
          {activeTab === 'workspace' ? <div className="os-welcome">
            <div className="os-welcome-mark">P</div><h1>Workspace</h1><p>Ask L.O.V.E. or open a tool.</p>
            <div className="os-quick-grid"><a href="/studio/"><span>⌘</span><strong>Code</strong><small>Studio</small></a><a href="/audit/"><span>◈</span><strong>Verify claims</strong><small>Verification</small></a><a href="/files/"><span>▤</span><strong>Open files</strong><small>Files</small></a><a href="/work/"><span>✓</span><strong>Get work done</strong><small>Work</small></a><a href="/automations/"><span>↻</span><strong>Automate</strong><small>Automations</small></a><a href="/connections/"><span>◇</span><strong>Connect tools</strong><small>Connections</small></a></div>
            <div className="os-recent"><span>CONTINUE</span><a href="/studio/">Studio <small>Code projects</small></a><a href="/audit/">Verification <small>Claim audits</small></a><a href="/files/">Files <small>Project artifacts</small></a></div>
          </div> : <div className="os-command-sheet"><span>QUICK ACTIONS</span><a href="/studio/">New code project</a><a href="/audit/">New verification audit</a><a href="/files/">Open files</a><a href="/work/">Open work</a><a href="/automations/">New automation</a></div>}
        </div>

        <section className={`os-panel ${terminalOpen ? 'open' : ''}`}>
          <div className="os-panel-tabs"><button className={panelMode === 'terminal' ? 'active' : ''} type="button" onClick={() => openPanel('terminal')}>TERMINAL</button><button className={panelMode === 'output' ? 'active' : ''} type="button" onClick={() => openPanel('output')}>OUTPUT</button><button className={panelMode === 'problems' ? 'active' : ''} type="button" onClick={() => openPanel('problems')}>PROBLEMS {problemLines.length ? `(${problemLines.length})` : ''}</button><span /><button type="button" aria-label={terminalOpen ? 'Collapse panel' : 'Expand panel'} onClick={() => setTerminalOpen((value) => !value)}>{terminalOpen ? '⌄' : '⌃'}</button></div>
          {terminalOpen && panelMode === 'terminal' && <div className="os-terminal">
            <div style={{ maxHeight: 150, overflow: 'auto', whiteSpace: 'pre-wrap' }}>{terminalLines.map((line, index) => <code key={index} style={{ display: 'block', color: line.kind === 'error' ? '#fca5a5' : undefined }}>{line.text}</code>)}</div>
            <form onSubmit={runWorkspaceCommand} style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span>PS Workspace:&gt;</span><input value={terminalValue} onChange={(event) => setTerminalValue(event.target.value)} onKeyDown={terminalKeyDown} aria-label="Workspace terminal command" autoComplete="off" spellCheck={false} style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 0, color: 'inherit', font: 'inherit' }} /></form>
            <small>Navigation and Workspace commands run here. Isolated code execution runs in Studio.</small>
          </div>}
          {terminalOpen && panelMode === 'output' && <div className="os-terminal"><span>Workspace output</span>{outputLines.length ? outputLines.map((line, index) => <code key={index} style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{line.text}</code>) : <code>No output yet.</code>}<small>Successful command output is mirrored here.</small></div>}
          {terminalOpen && panelMode === 'problems' && <div className="os-terminal"><span>Problems</span>{problemLines.length ? problemLines.map((line, index) => <code key={index} style={{ display: 'block', color: '#fca5a5' }}>{line.text}</code>) : <code>0 workspace errors</code>}<small>Invalid commands and Workspace validation failures appear here.</small></div>}
        </section>
      </main>

      <footer className="os-status"><span>◉ L.O.V.E. ready</span><span>main</span><button type="button" onClick={() => openPanel('problems')}>{problemLines.length} error{problemLines.length === 1 ? '' : 's'}</button><span>Testnet</span><a href="/connections/">Cloud actions permissioned</a></footer>
    </section>
  )
}
