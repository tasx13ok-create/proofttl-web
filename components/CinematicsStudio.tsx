'use client'

import { useMemo, useState } from 'react'
import LocalCinematicPreview from './LocalCinematicPreview'

type Shot = { id: string; name: string; seconds: number; camera: string; note: string }

const STARTER_SHOTS: Shot[] = [
  { id: 'establish', name: 'Establishing', seconds: 4, camera: '24mm · slow push', note: 'Reveal the environment.' },
  { id: 'subject', name: 'Subject', seconds: 5, camera: '50mm · tracking', note: 'Follow the subject through frame.' },
  { id: 'detail', name: 'Detail', seconds: 3, camera: '85mm · locked', note: 'Close detail before the cut.' },
]

export default function CinematicsStudio() {
  const [title, setTitle] = useState('Untitled cinematic')
  const [prompt, setPrompt] = useState('A stylized martial-arts duel in a moody neon courtyard. Graphic shadows, painterly low-poly forms, fast hand-to-hand choreography, dramatic camera movement.')
  const [shots, setShots] = useState<Shot[]>(STARTER_SHOTS)
  const [activeId, setActiveId] = useState(STARTER_SHOTS[0].id)
  const totalSeconds = useMemo(() => shots.reduce((sum, shot) => sum + shot.seconds, 0), [shots])
  const active = shots.find((shot) => shot.id === activeId) || shots[0]

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
    const blob = new Blob([JSON.stringify({ schema: 'proofttl-cinematic-v1', title, prompt, watermark: true, shots }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cinematic'}.cinematic.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="cine-shell">
      <header className="cine-toolbar">
        <input aria-label="Cinematic title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <div className="cine-toolbar-actions">
          <span className="cine-pill">LOCAL MOVIE · READY</span>
          <span className="cine-pill">CLOUD AI · OPTIONAL</span>
          <button type="button" onClick={exportPlan}>EXPORT PLAN</button>
        </div>
      </header>

      <LocalCinematicPreview prompt={prompt} />

      <div className="cine-main">
        <aside className="cine-sidebar">
          <div className="cine-side-head"><span>SCENES</span><button type="button" onClick={addShot}>＋</button></div>
          {shots.map((shot, index) => <button key={shot.id} type="button" className={shot.id === activeId ? 'active' : ''} onClick={() => setActiveId(shot.id)}><small>{String(index + 1).padStart(2, '0')}</small><span>{shot.name}</span><b>{shot.seconds}s</b></button>)}
          <a href="/worlds/">IMPORT WORLD →</a>
        </aside>

        <section className="cine-stage-column">
          <div className="cine-stage">
            <div className="cine-preview-grid" />
            <div className="cine-preview-subject" />
            <div className="cine-frame-corners"><i /><i /><i /><i /></div>
            <div className="cine-watermark">PROOFTTL · DIRECTOR</div>
            <div className="cine-stage-status"><span>SHOT BLOCKING PREVIEW</span><strong>{active?.name}</strong></div>
          </div>

          <div className="cine-prompt">
            <textarea aria-label="Describe the cinematic" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={2} maxLength={900} />
            <button type="button" onClick={() => setPrompt((value) => value.trim())}>APPLY TO LOCAL TAKE</button>
          </div>

          <div className="cine-timeline">
            <div className="cine-timeline-head"><span>TIMELINE</span><strong>{totalSeconds}s</strong></div>
            <div className="cine-ruler">{shots.map((shot) => <button key={shot.id} type="button" onClick={() => setActiveId(shot.id)} className={shot.id === activeId ? 'active' : ''} style={{ flexGrow: Math.max(1, shot.seconds) }}><span>{shot.name}</span><small>{shot.seconds}s</small></button>)}</div>
            <div className="cine-track"><span>CAMERA</span><div>{shots.map((shot) => <i key={shot.id} style={{ flexGrow: Math.max(1, shot.seconds) }}>{shot.camera}</i>)}</div></div>
            <div className="cine-track"><span>AUDIO</span><div className="cine-waveform">▁▂▃▅▆▄▂▃▆▇▅▃▂▅▆▄▂▁▃▅▇▅▃▂▁</div></div>
          </div>
        </section>

        <aside className="cine-inspector">
          <div className="cine-inspector-head">SHOT INSPECTOR</div>
          <label>NAME<input value={active?.name || ''} onChange={(event) => updateActive({ name: event.target.value })} /></label>
          <label>DURATION<input type="number" min="1" max="30" value={active?.seconds || 1} onChange={(event) => updateActive({ seconds: Math.max(1, Math.min(30, Number(event.target.value) || 1)) })} /></label>
          <label>CAMERA<input value={active?.camera || ''} onChange={(event) => updateActive({ camera: event.target.value })} /></label>
          <label>DIRECTOR NOTE<textarea rows={5} value={active?.note || ''} onChange={(event) => updateActive({ note: event.target.value })} /></label>
          <button className="cine-danger" type="button" onClick={removeActive} disabled={shots.length <= 1}>REMOVE SHOT</button>
          <div className="cine-provider-card"><span>RENDER PATHS</span><strong>LOCAL PROCEDURAL ENGINE</strong><small>Ready now · no paid provider</small><strong>CLOUD VIDEO / GPU</strong><small>Optional later</small><a href="/worlds/">OPEN WORLDS →</a></div>
        </aside>
      </div>

      <footer className="cine-statusbar"><span>◉ Local movie engine ready</span><span>Browser-rendered WebM export</span><span>Cloud generation optional</span><span>Stylized 3D pipeline</span></footer>
    </div>
  )
}
