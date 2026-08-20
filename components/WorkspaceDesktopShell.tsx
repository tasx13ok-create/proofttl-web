'use client'

import { useMemo, useState } from 'react'

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

const TREE = [
  ['studio', 'Studio', '/studio/'],
  ['worlds', 'Worlds', '/worlds/'],
  ['cinematics', 'Cinematics', '/cinematics/'],
  ['work', 'Work', '/work/'],
  ['files', 'Files', '/files/'],
  ['automations', 'Automations', '/automations/'],
  ['money', 'Money', '/money/'],
  ['truth', 'Trust', '/trust/'],
] as const

export default function WorkspaceDesktopShell() {
  const [area, setArea] = useState<AreaKey>('explorer')
  const [activeTab, setActiveTab] = useState<'workspace' | 'quick'>('workspace')
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [panelMode, setPanelMode] = useState<PanelMode>('terminal')
  const [search, setSearch] = useState('')
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false)

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return TREE
    return TREE.filter(([, label, href]) => `${label} ${href}`.toLowerCase().includes(term))
  }, [search])

  function openPanel(mode: PanelMode) {
    setPanelMode(mode)
    setTerminalOpen(true)
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
            {sidebarMenuOpen && <div className="os-sidebar-menu">
              <a href="/workspace/">Workspace home</a>
              <a href="/connections/">Manage connections</a>
              <a href="/console/">Account & security</a>
            </div>}
          </div>
        </div>
        {area === 'explorer' && <>
          <div className="os-section-label">WORKSPACE</div>
          <div className="os-tree">{TREE.map(([key, label, href]) => <a href={href} key={key}><span>›</span><b>{label}</b></a>)}</div>
          <div className="os-section-label secondary">OPEN EDITORS</div>
          <button className="os-open-file" type="button" onClick={() => setActiveTab('workspace')}>◈ workspace.home</button>
          <button className="os-open-file" type="button" onClick={() => setActiveTab('quick')}>⌘ quick.actions</button>
        </>}
        {area === 'search' && <div className="os-side-tool">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Workspace" aria-label="Search Workspace" />
          <small>{search ? `${searchResults.length} matching surface${searchResults.length === 1 ? '' : 's'}.` : 'Search routes and project surfaces.'}</small>
          <div className="os-tree">{searchResults.map(([key, label, href]) => <a href={href} key={key}><span>›</span><b>{label}</b></a>)}</div>
        </div>}
        {area === 'love' && <div className="os-side-tool"><strong>L.O.V.E.</strong><small>Use the global chat dock below. Ask naturally or give platform commands.</small><code>“open Cinematics”</code><code>“help me code this”</code><code>“show me an alternator”</code></div>}
        {area === 'source' && <div className="os-side-tool"><strong>Source control</strong><small>GitHub project operations stay permissioned through Connections.</small><a href="/connections/">Connect GitHub →</a></div>}
        {area === 'run' && <div className="os-side-tool"><strong>Run & debug</strong><small>Approved code runs go through isolated cloud sandboxes.</small><a href="/studio/">Open Studio →</a></div>}
        {area === 'connections' && <div className="os-side-tool"><strong>Providers</strong><small>Identity, models, GitHub, Vercel, Marble and future render rails.</small><a href="/connections/">Open Connections →</a></div>}
      </aside>

      <main className="os-workbench">
        <div className="os-tabs">
          <button type="button" className={activeTab === 'workspace' ? 'active' : ''} onClick={() => setActiveTab('workspace')}>◈ workspace.home</button>
          <button type="button" onClick={() => setActiveTab('quick')} className={activeTab === 'quick' ? 'active' : ''}>⌘ quick.actions</button>
        </div>

        <div className="os-editor">
          {activeTab === 'workspace' ? <div className="os-welcome">
            <div className="os-welcome-mark">P</div>
            <h1>Workspace</h1>
            <p>Ask L.O.V.E. or open a tool.</p>
            <div className="os-quick-grid">
              <a href="/studio/"><span>⌘</span><strong>Code</strong><small>Studio</small></a>
              <a href="/worlds/"><span>◫</span><strong>Build a world</strong><small>Worlds</small></a>
              <a href="/cinematics/"><span>▶</span><strong>Direct a scene</strong><small>Cinematics</small></a>
              <a href="/files/"><span>▤</span><strong>Open files</strong><small>Files</small></a>
              <a href="/work/"><span>✓</span><strong>Get work done</strong><small>Work</small></a>
              <a href="/connections/"><span>◇</span><strong>Connect tools</strong><small>Connections</small></a>
            </div>
            <div className="os-recent">
              <span>CONTINUE</span>
              <a href="/studio/">Studio <small>Code projects</small></a>
              <a href="/cinematics/">Cinematics <small>Scenes & renders</small></a>
              <a href="/worlds/">Worlds <small>3D projects</small></a>
            </div>
          </div> : <div className="os-command-sheet"><span>QUICK ACTIONS</span><a href="/studio/">New code project</a><a href="/worlds/">New 3D world</a><a href="/cinematics/">New cinematic</a><a href="/automations/">New automation</a><a href="/audit/">New verification audit</a></div>}
        </div>

        <section className={`os-panel ${terminalOpen ? 'open' : ''}`}>
          <div className="os-panel-tabs">
            <button className={panelMode === 'terminal' ? 'active' : ''} type="button" onClick={() => openPanel('terminal')}>TERMINAL</button>
            <button className={panelMode === 'output' ? 'active' : ''} type="button" onClick={() => openPanel('output')}>OUTPUT</button>
            <button className={panelMode === 'problems' ? 'active' : ''} type="button" onClick={() => openPanel('problems')}>PROBLEMS</button>
            <span />
            <button type="button" aria-label={terminalOpen ? 'Collapse panel' : 'Expand panel'} onClick={() => setTerminalOpen((value) => !value)}>{terminalOpen ? '⌄' : '⌃'}</button>
          </div>
          {terminalOpen && panelMode === 'terminal' && <div className="os-terminal"><span>ProofTTL Workspace terminal</span><code>PS Workspace:&gt; <i>open studio</i></code><small>Use Studio for isolated Node, JavaScript, Python and approved execution jobs.</small></div>}
          {terminalOpen && panelMode === 'output' && <div className="os-terminal"><span>Workspace output</span><code>No active jobs.</code><small>Studio and connected tools publish execution output here when a job is running.</small></div>}
          {terminalOpen && panelMode === 'problems' && <div className="os-terminal"><span>Problems</span><code>0 workspace errors</code><small>Runtime and validation failures will appear here instead of behind dead controls.</small></div>}
        </section>
      </main>

      <footer className="os-status"><span>◉ L.O.V.E. ready</span><span>main</span><button type="button" onClick={() => openPanel('problems')}>0 errors</button><span>Testnet</span><a href="/connections/">Cloud actions permissioned</a></footer>
    </section>
  )
}
