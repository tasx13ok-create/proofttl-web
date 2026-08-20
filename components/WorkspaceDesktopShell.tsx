'use client'

import { useState } from 'react'

const AREAS = [
  { key: 'explorer', icon: '▱', label: 'Explorer' },
  { key: 'search', icon: '⌕', label: 'Search' },
  { key: 'love', icon: '◉', label: 'L.O.V.E.' },
  { key: 'source', icon: '⑂', label: 'Source' },
  { key: 'run', icon: '▷', label: 'Run' },
  { key: 'connections', icon: '◇', label: 'Connections' },
] as const

type AreaKey = typeof AREAS[number]['key']

const TREE = [
  ['studio', 'Studio', '/studio/'],
  ['worlds', 'Worlds', '/worlds/'],
  ['cinematics', 'Cinematics', '/cinematics/'],
  ['work', 'Work', '/work/'],
  ['files', 'Files', '/files/'],
  ['automations', 'Automations', '/automations/'],
  ['money', 'Money', '/money/'],
  ['truth', 'Truth', '/trust/'],
] as const

export default function WorkspaceDesktopShell() {
  const [area, setArea] = useState<AreaKey>('explorer')
  const [activeTab, setActiveTab] = useState('workspace')
  const [terminalOpen, setTerminalOpen] = useState(true)

  return (
    <section className="os-shell" aria-label="ProofTTL Workspace">
      <aside className="os-activity" aria-label="Workspace activity">
        {AREAS.map((item) => <button key={item.key} type="button" className={area === item.key ? 'active' : ''} onClick={() => setArea(item.key)} title={item.label} aria-label={item.label}><span>{item.icon}</span></button>)}
        <a href="/console/" title="Account" aria-label="Account">⚙</a>
      </aside>

      <aside className="os-sidebar">
        <div className="os-sidebar-title"><span>{AREAS.find((item) => item.key === area)?.label.toUpperCase()}</span><button type="button">···</button></div>
        {area === 'explorer' && <>
          <div className="os-section-label">WORKSPACE</div>
          <div className="os-tree">{TREE.map(([key, label, href]) => <a href={href} key={key}><span>›</span><b>{label}</b></a>)}</div>
          <div className="os-section-label secondary">OPEN EDITORS</div>
          <button className="os-open-file" type="button" onClick={() => setActiveTab('workspace')}>◈ workspace.home</button>
        </>}
        {area === 'search' && <div className="os-side-tool"><input placeholder="Search Workspace" aria-label="Search Workspace" /><small>Search routes, files and project surfaces.</small></div>}
        {area === 'love' && <div className="os-side-tool"><strong>L.O.V.E.</strong><small>Use the global chat dock below. Ask naturally or give platform commands.</small><code>“open Cinematics”</code><code>“help me code this”</code><code>“show me an alternator”</code></div>}
        {area === 'source' && <div className="os-side-tool"><strong>Source control</strong><small>GitHub project operations stay permissioned through Connections.</small><a href="/connections/">Connect GitHub →</a></div>}
        {area === 'run' && <div className="os-side-tool"><strong>Run & debug</strong><small>Approved code runs go through isolated cloud sandboxes.</small><a href="/studio/">Open Studio →</a></div>}
        {area === 'connections' && <div className="os-side-tool"><strong>Providers</strong><small>Identity, models, GitHub, Vercel, Marble and future render rails.</small><a href="/connections/">Open Connections →</a></div>}
      </aside>

      <main className="os-workbench">
        <div className="os-tabs">
          <button type="button" className={activeTab === 'workspace' ? 'active' : ''} onClick={() => setActiveTab('workspace')}>◈ workspace.home <span>×</span></button>
          <button type="button" onClick={() => setActiveTab('quick')} className={activeTab === 'quick' ? 'active' : ''}>⌘ quick.actions <span>×</span></button>
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
            <div className="os-recent"><span>RECENT</span><button type="button">ProofTTL Project <small>Studio</small></button><button type="button">Untitled cinematic <small>Cinematics</small></button><button type="button">Neon Alley <small>Worlds</small></button></div>
          </div> : <div className="os-command-sheet"><span>QUICK ACTIONS</span><a href="/studio/">New code project</a><a href="/worlds/">New 3D world</a><a href="/cinematics/">New cinematic</a><a href="/automations/">New automation</a><a href="/audit/">New verification audit</a></div>}
        </div>

        <section className={`os-panel ${terminalOpen ? 'open' : ''}`}>
          <div className="os-panel-tabs"><button className="active" type="button" onClick={() => setTerminalOpen(true)}>TERMINAL</button><button type="button">OUTPUT</button><button type="button">PROBLEMS</button><span /><button type="button" onClick={() => setTerminalOpen((value) => !value)}>{terminalOpen ? '⌄' : '⌃'}</button></div>
          {terminalOpen && <div className="os-terminal"><span>ProofTTL Workspace terminal</span><code>PS Workspace:&gt; <i>open studio</i></code><small>Use Studio for isolated Node, JavaScript, Python and approved execution jobs.</small></div>}
        </section>
      </main>

      <footer className="os-status"><span>◉ L.O.V.E. ready</span><span>main</span><span>0 errors</span><span>Testnet</span><span>Cloud actions permissioned</span></footer>
    </section>
  )
}
