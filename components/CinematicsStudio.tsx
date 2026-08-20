'use client'

import { useMemo, useState } from 'react'
import LocalCinematicPreview from './LocalCinematicPreview'
import { parseCinematicPrompt } from '../cinematics/prompt/PromptParser'

type Shot = { id: string; name: string; seconds: number; camera: string; note: string }

const STARTER_SHOTS: Shot[] = [
  { id: 'establish', name: 'Establishing', seconds: 4, camera: '24mm · stable wide', note: 'Reveal the environment and cast.' },
  { id: 'pressure', name: 'Pressure', seconds: 4, camera: '35mm · side pressure', note: 'Bring the attackers into the frame without zoom creep.' },
  { id: 'counter', name: 'Counter', seconds: 4, camera: '50mm · counter angle', note: 'Cut on the parry and counter.' },
  { id: 'finish', name: 'Finish', seconds: 3, camera: '40mm · low finish', note: 'Give the final strike a clean silhouette.' },
]

const FILM_FIRST_CSS = `
.cine-shell-film-first{border-radius:10px}.cine-main-film-first{grid-template-columns:176px minmax(0,1fr) 208px;min-height:0}.cine-film-column{display:block;min-width:0}.cine-shell-film-first .cine-local-movie{padding:8px;background:#05070a;border-bottom:1px solid rgba(148,163,184,.1)}.cine-shell-film-first .cine-local-head{margin:0 0 7px}.cine-shell-film-first .cine-local-movie iframe{height:min(68vh,680px);min-height:520px;border-radius:5px;border-color:rgba(148,163,184,.16)}.cine-shell-film-first .cine-local-movie>small{display:none}.cine-brand-row{display:flex;align-items:center;gap:10px;min-width:0;flex:1}.cine-brand-link{display:inline-flex;align-items:center;flex:0 0 auto}.cine-brand-link img{display:block;width:128px;height:34px;object-fit:contain;object-position:left center}.cine-brand-row input{min-width:150px;max-width:420px;flex:1;border:0;border-left:1px solid rgba(148,163,184,.13);background:transparent;color:#e5e7eb;padding:5px 10px;outline:0;font:600 12px 'IBM Plex Sans',sans-serif}.cine-sidebar-plan{margin:8px 3px 0;padding:9px;border:1px solid rgba(148,163,184,.09);border-radius:6px;display:grid;gap:4px}.cine-sidebar-plan small{color:#64748b;font:8px 'IBM Plex Mono',monospace;letter-spacing:.1em}.cine-sidebar-plan strong{color:#e2e8f0;font:10px 'IBM Plex Sans',sans-serif;text-transform:capitalize}.cine-sidebar-plan span{color:#7f8da0;font:8px 'IBM Plex Mono',monospace}.cine-film-prompt{border-top:0}.cine-shell-film-first .cine-timeline{border-top:1px solid rgba(148,163,184,.08)}@media(max-width:1100px){.cine-main-film-first{grid-template-columns:150px minmax(0,1fr)}.cine-main-film-first .cine-inspector{grid-column:1/-1}.cine-shell-film-first .cine-local-movie iframe{height:560px}}@media(max-width:760px){.cine-main-film-first{display:block}.cine-shell-film-first .cine-local-movie iframe{height:58vh;min-height:390px}.cine-brand-link img{width:105px}.cine-pill{display:none}}
`

export default function CinematicsStudio() {
  const [title, setTitle] = useState('Kitchen fight test')
  const [prompt, setPrompt] = useState('A tired martial artist enters a dim restaurant kitchen and gets surrounded by three attackers. He blocks a bottle swing, parries a punch, throws one attacker into a metal table, dodges the next attack, then finishes with a spinning kick. Stable wide cinematic framing with clean impact cuts and no continuous zoom.')
  const [shots, setShots] = useState<Shot[]>(STARTER_SHOTS)
  const [activeId, setActiveId] = useState(STARTER_SHOTS[0].id)
  const totalSeconds = useMemo(() => shots.reduce((sum, shot) => sum + shot.seconds, 0), [shots])
  const active = shots.find((shot) => shot.id === activeId) || shots[0]
  const plan = useMemo(() => parseCinematicPrompt(prompt), [prompt])

  function updateActive(patch: Partial<Shot>) {
    setShots((current) => current.map((shot) => shot.id === activeId ? { ...shot, ...patch } : shot))
  }

  function addShot() {
    const id = `shot-${Date.now()}`
    const shot: Shot = { id, name: `Shot ${shots.length + 1}`, seconds: 4, camera: '35mm · static', note: '' }
    setShots((current) => [...current, shot])
    setActiveId(id)
  }

  function removeActive() {
    if (shots.length <= 1) return
    const next = shots.filter((shot) => shot.id !== activeId)
    setShots(next)
    setActiveId(next[0].id)
  }

  function exportPlan() {
    const blob = new Blob([JSON.stringify({ ...plan, schema: 'proofttl-cinematic-v2', title, shotPlan: shots, watermark: true }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cinematic'}.cinematic-v2.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="cine-shell cine-shell-film-first" data-cinematic-version="2">
      <style>{FILM_FIRST_CSS}</style>
      <header className="cine-toolbar">
        <div className="cine-brand-row">
          <a href="/" aria-label="ProofTTL home" className="cine-brand-link"><img src="/proofttl-logo-lockup.png" alt="ProofTTL" /></a>
          <input aria-label="Cinematic title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="cine-toolbar-actions">
          <span className="cine-pill">LOCAL MOVIE · READY</span>
          <span className="cine-pill">PROMPT PLANNER · V2</span>
          <span className="cine-pill">CLOUD AI · OPTIONAL</span>
          <button type="button" onClick={exportPlan}>EXPORT V2 PLAN</button>
        </div>
      </header>

      <div className="cine-main cine-main-film-first">
        <aside className="cine-sidebar">
          <div className="cine-side-head"><span>SHOTS</span><button type="button" onClick={addShot}>＋</button></div>
          {shots.map((shot, index) => <button key={shot.id} type="button" className={shot.id === activeId ? 'active' : ''} onClick={() => setActiveId(shot.id)}><small>{String(index + 1).padStart(2, '0')}</small><span>{shot.name}</span><b>{shot.seconds}s</b></button>)}
          <div className="cine-sidebar-plan"><small>PROMPT PLAN</small><strong>{plan.environment.replaceAll('_', ' ')}</strong><span>1 VS {plan.attackers}</span><span>{plan.actions.length} actions</span></div>
          <a href="/worlds/">IMPORT WORLD →</a>
        </aside>

        <section className="cine-stage-column cine-film-column">
          <LocalCinematicPreview prompt={prompt} />
          <div className="cine-prompt cine-film-prompt">
            <textarea aria-label="Describe the cinematic" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} maxLength={1200} />
            <button type="button" onClick={() => setPrompt((value) => value.trim())}>GENERATE LOCAL PLAN</button>
          </div>
          <div className="cine-timeline">
            <div className="cine-timeline-head"><span>TIMELINE / SHOT PLAN</span><strong>{totalSeconds}s · runtime {plan.duration.toFixed(1)}s</strong></div>
            <div className="cine-ruler">{shots.map((shot) => <button key={shot.id} type="button" onClick={() => setActiveId(shot.id)} className={shot.id === activeId ? 'active' : ''} style={{ flexGrow: Math.max(1, shot.seconds) }}><span>{shot.name}</span><small>{shot.seconds}s</small></button>)}</div>
            <div className="cine-track"><span>CAMERA</span><div>{shots.map((shot) => <i key={shot.id} style={{ flexGrow: Math.max(1, shot.seconds) }}>{shot.camera}</i>)}</div></div>
            <div className="cine-track"><span>ACTIONS</span><div className="cine-waveform">{plan.actions.map((action) => `${action.actorId}:${action.action}`).join(' · ')}</div></div>
          </div>
        </section>

        <aside className="cine-inspector">
          <div className="cine-inspector-head">DIRECTOR</div>
          <label>SHOT<input value={active?.name || ''} onChange={(event) => updateActive({ name: event.target.value })} /></label>
          <label>DURATION<input type="number" min="1" max="30" value={active?.seconds || 1} onChange={(event) => updateActive({ seconds: Math.max(1, Math.min(30, Number(event.target.value) || 1)) })} /></label>
          <label>CAMERA<input value={active?.camera || ''} onChange={(event) => updateActive({ camera: event.target.value })} /></label>
          <label>NOTE<textarea rows={4} value={active?.note || ''} onChange={(event) => updateActive({ note: event.target.value })} /></label>
          <button className="cine-danger" type="button" onClick={removeActive} disabled={shots.length <= 1}>REMOVE SHOT</button>
          <div className="cine-provider-card"><span>LOCAL ENGINE</span><strong>{plan.actors.length} ACTORS</strong><small>{plan.actions.length} choreographed events · {plan.style}</small><strong>NO PAID PROVIDER</strong><small>Humanoid preview + local WebM export</small><a href="/worlds/">OPEN WORLDS →</a></div>
        </aside>
      </div>

      <footer className="cine-statusbar"><span>◉ Cinematics v2</span><span>Prompt → plan → performance → camera → WebM</span><span>Cloud generation optional</span><span>Project JSON portable</span></footer>
    </div>
  )
}
