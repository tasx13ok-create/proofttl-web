'use client'

import { useMemo, useState } from 'react'

type Shot = { id: string; name: string; seconds: number; camera: string; note: string }

const STARTER_SHOTS: Shot[] = [
  { id: 'establish', name: 'Establishing', seconds: 4, camera: '24mm · slow push', note: 'Reveal the environment.' },
  { id: 'subject', name: 'Subject', seconds: 5, camera: '50mm · tracking', note: 'Follow the subject through frame.' },
  { id: 'detail', name: 'Detail', seconds: 3, camera: '85mm · locked', note: 'Close detail before the cut.' },
]

export default function CinematicsStudio() {
  const [title, setTitle] = useState('Untitled cinematic')
  const [prompt, setPrompt] = useState('A rainy neon alley at night. Slow cinematic camera movement, fog, reflections, a lone figure crossing frame.')
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
          <span className="cine-pill">CLOUD RENDER · LOCKED</span>
          <span className="cine-pill">WATERMARK · ON</span>
          <button type="button" onClick={exportPlan}>EXPORT PLAN</button>
        </div>
      </header>

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
            <div className="cine-watermark">PROOFTTL · PREVIEW</div>
            <div className="cine-stage-status"><span>LOCAL DIRECTOR PREVIEW</span><strong>{active?.name}</strong></div>
          </div>

          <div className="cine-prompt">
            <textarea aria-label="Describe the cinematic" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={2} maxLength={900} />
            <button type="button" disabled title="Connect a cloud cinematic provider first">GENERATE IN CLOUD</button>
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
          <div className="cine-provider-card"><span>RENDER PROVIDERS</span><strong>WORLD LABS / MARBLE</strong><small>World generation rail</small><strong>CINEMATIC VIDEO / GPU</strong><small>Not connected</small><a href="/connections/">OPEN CONNECTIONS →</a></div>
        </aside>
      </div>

      <footer className="cine-statusbar"><span>☁ Cloud-first pipeline</span><span>Local device: director UI only</span><span>Heavy generation: provider jobs</span><span>Export policy: watermarked preview</span></footer>
    </div>
  )
}
