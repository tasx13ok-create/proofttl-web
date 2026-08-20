'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import LocalCinematicPreview from './LocalCinematicPreview'
import {
  generateStoryboard,
  getCinematicsCapability,
  planCinematic,
  renderCinematicShot,
} from '../lib/proofttl-cinematics'
import type {
  CinematicCapability,
  CinematicPlanV3,
  CinematicShotV3,
  ShotGenerationState,
} from '../cinematics/ai/Types'

type RenderMode = 'ai-film' | 'previs'
type Resolution = '768P' | '1080P'

const DEFAULT_PROMPT = 'A tired martial artist enters a dim restaurant kitchen and gets surrounded by three attackers. One attacker swings a glass bottle. The hero catches the forearm and blocks the bottle, parries a punch from the second attacker, counters with a body strike, throws the first attacker across a stainless steel table, slips under a third attacker\'s hook, and ends with a spinning kick that lands cleanly. Keep the geography consistent and make every hit, block, miss, stumble, and impact physically readable.'

const STYLES = [
  'graphic grounded martial-arts cinema',
  'painterly neo-noir action film',
  'warm analog crime thriller',
  'high-contrast urban graphic novel',
]

function emptyGeneration(): ShotGenerationState {
  return { status: 'idle' }
}

function generationMap(plan: CinematicPlanV3 | null) {
  const next: Record<string, ShotGenerationState> = {}
  for (const shot of plan?.shots || []) next[shot.id] = emptyGeneration()
  return next
}

function humanError(error: unknown) {
  const value = error as Error & { status?: number; code?: string }
  if (value?.status === 401) return 'Sign in is required before paid AI video rendering. Planning and AI storyboards already work without it.'
  if (value?.code === 'explicit_cost_confirmation_required') return 'The render was stopped because paid generation was not explicitly confirmed.'
  return value?.message || 'Generation failed.'
}

export default function CinematicsStudio() {
  const [mode, setMode] = useState<RenderMode>('ai-film')
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [style, setStyle] = useState(STYLES[0])
  const [shotCount, setShotCount] = useState(4)
  const [duration, setDuration] = useState(22)
  const [resolution, setResolution] = useState<Resolution>('768P')
  const [plan, setPlan] = useState<CinematicPlanV3 | null>(null)
  const [selectedId, setSelectedId] = useState<string>('')
  const [generation, setGeneration] = useState<Record<string, ShotGenerationState>>({})
  const [capability, setCapability] = useState<CinematicCapability | null>(null)
  const [planning, setPlanning] = useState(false)
  const [storyboardingAll, setStoryboardingAll] = useState(false)
  const [renderingAll, setRenderingAll] = useState(false)
  const [status, setStatus] = useState('READY FOR A SCENE')
  const [reelIndex, setReelIndex] = useState<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    getCinematicsCapability().then(setCapability).catch(() => setCapability(null))
  }, [])

  const selected = useMemo(() => plan?.shots.find((shot) => shot.id === selectedId) || plan?.shots[0] || null, [plan, selectedId])
  const selectedGeneration = selected ? generation[selected.id] || emptyGeneration() : emptyGeneration()
  const renderedShots = useMemo(() => (plan?.shots || []).filter((shot) => generation[shot.id]?.video), [plan, generation])

  async function directScene() {
    if (!prompt.trim()) return
    setPlanning(true)
    setStatus('L.O.V.E. IS DIRECTING THE SCENE…')
    setReelIndex(null)
    try {
      const next = await planCinematic({
        prompt: prompt.trim(),
        shotCount,
        durationSeconds: duration,
        aspectRatio: '16:9',
        style,
      })
      setPlan(next)
      setSelectedId(next.shots[0]?.id || '')
      setGeneration(generationMap(next))
      setStatus(next.planning?.mode === 'ai' ? 'AI SCENE PLAN READY' : 'SCENE PLAN READY · LOCAL FALLBACK')
    } catch (error) {
      setStatus(humanError(error))
    } finally {
      setPlanning(false)
    }
  }

  function patchGeneration(id: string, patch: Partial<ShotGenerationState>) {
    setGeneration((current) => ({
      ...current,
      [id]: { ...(current[id] || emptyGeneration()), ...patch },
    }))
  }

  async function storyboardShot(shot: CinematicShotV3) {
    patchGeneration(shot.id, { status: 'storyboarding', error: undefined })
    setStatus(`GENERATING FRAME · ${shot.name.toUpperCase()}`)
    try {
      const result = await generateStoryboard({ prompt: shot.storyboard_prompt })
      patchGeneration(shot.id, {
        status: 'storyboard-ready',
        storyboard: result.image_data_url,
        storyboardModel: result.model,
      })
      setStatus(`FRAME READY · ${shot.name.toUpperCase()}`)
      return result.image_data_url
    } catch (error) {
      const message = humanError(error)
      patchGeneration(shot.id, { status: 'error', error: message })
      setStatus(message)
      return undefined
    }
  }

  async function storyboardScene() {
    if (!plan || storyboardingAll) return
    setStoryboardingAll(true)
    for (const shot of plan.shots) {
      if (!generation[shot.id]?.storyboard) await storyboardShot(shot)
    }
    setStoryboardingAll(false)
    setStatus('FULL STORYBOARD READY')
  }

  async function renderShot(shot: CinematicShotV3, allowCost = false) {
    if (!allowCost) {
      const ok = window.confirm(`Render “${shot.name}” with the paid AI video provider? This can incur Cloudflare AI provider charges.`)
      if (!ok) return undefined
    }
    patchGeneration(shot.id, { status: 'rendering', error: undefined })
    setStatus(`AI RENDERING · ${shot.name.toUpperCase()}`)
    try {
      let firstFrame = generation[shot.id]?.storyboard
      if (!firstFrame) firstFrame = await storyboardShot(shot)
      const result = await renderCinematicShot({
        prompt: shot.render_prompt,
        firstFrameImage: firstFrame,
        durationSeconds: shot.duration_seconds,
        resolution,
        confirmCost: true,
      })
      patchGeneration(shot.id, {
        status: 'video-ready',
        video: result.video_url,
        videoModel: result.model,
      })
      setStatus(`SHOT RENDERED · ${shot.name.toUpperCase()}`)
      return result.video_url
    } catch (error) {
      const message = humanError(error)
      patchGeneration(shot.id, { status: 'error', error: message })
      setStatus(message)
      return undefined
    }
  }

  async function renderScene() {
    if (!plan || renderingAll) return
    const ok = window.confirm(`Render all ${plan.shots.length} shots as AI video? Each shot is a paid provider generation. Continue?`)
    if (!ok) return
    setRenderingAll(true)
    setReelIndex(null)
    for (const shot of plan.shots) {
      if (!generation[shot.id]?.video) {
        const result = await renderShot(shot, true)
        if (!result) break
      }
    }
    setRenderingAll(false)
    setStatus('SCENE RENDER PASS COMPLETE')
  }

  function playReel() {
    if (!plan) return
    const first = plan.shots.findIndex((shot) => Boolean(generation[shot.id]?.video))
    if (first < 0) return
    setSelectedId(plan.shots[first].id)
    setReelIndex(first)
  }

  function advanceReel() {
    if (reelIndex === null || !plan) return
    let next = reelIndex + 1
    while (next < plan.shots.length && !generation[plan.shots[next].id]?.video) next += 1
    if (next >= plan.shots.length) {
      setReelIndex(null)
      setStatus('REEL COMPLETE')
      return
    }
    setReelIndex(next)
    setSelectedId(plan.shots[next].id)
  }

  useEffect(() => {
    if (reelIndex === null || !selectedGeneration.video) return
    const timer = window.setTimeout(() => videoRef.current?.play().catch(() => undefined), 80)
    return () => window.clearTimeout(timer)
  }, [reelIndex, selectedGeneration.video])

  function exportProject() {
    if (!plan) return
    const project = {
      ...plan,
      generated: generation,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(plan.title || 'cinematic').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.cinematic-v3.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (mode === 'previs') {
    return (
      <div className="cine-v3-shell">
        <header className="cine-v3-topbar">
          <a href="/" className="cine-v3-brand"><img src="/proofttl-logo-lockup.png" alt="ProofTTL" /></a>
          <div className="cine-v3-mode-switch"><button onClick={() => setMode('ai-film')}>AI FILM</button><button className="active">LOCAL PREVIS</button></div>
          <span className="cine-v3-status">LOCAL MOVIE · READY</span>
        </header>
        <div className="cine-v3-previs"><LocalCinematicPreview prompt={prompt} /></div>
      </div>
    )
  }

  return (
    <div className="cine-v3-shell" data-cinematic-version="3" data-ai-render-mode="true">
      <header className="cine-v3-topbar">
        <a href="/" className="cine-v3-brand"><img src="/proofttl-logo-lockup.png" alt="ProofTTL" /></a>
        <div className="cine-v3-mode-switch"><button className="active">AI FILM</button><button onClick={() => setMode('previs')}>LOCAL PREVIS</button></div>
        <div className="cine-v3-engine-state">
          <span className={capability?.ai_binding ? 'online' : 'offline'}>●</span>
          {capability?.ai_binding ? 'AI PIPELINE ONLINE' : 'AI STATUS CHECKING'}
        </div>
      </header>

      <div className="cine-v3-workspace">
        <aside className="cine-v3-director-panel">
          <div className="cine-v3-panel-title"><span>DIRECTOR</span><b>01</b></div>
          <label className="cine-v3-field">
            <span>SCENE</span>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={10} maxLength={1800} />
          </label>
          <label className="cine-v3-field">
            <span>VISUAL LANGUAGE</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>{STYLES.map((item) => <option key={item}>{item}</option>)}</select>
          </label>
          <div className="cine-v3-two">
            <label className="cine-v3-field"><span>SHOTS</span><input type="number" min={1} max={6} value={shotCount} onChange={(event) => setShotCount(Math.max(1, Math.min(6, Number(event.target.value) || 1)))} /></label>
            <label className="cine-v3-field"><span>LENGTH</span><input type="number" min={6} max={60} value={duration} onChange={(event) => setDuration(Math.max(6, Math.min(60, Number(event.target.value) || 6)))} /></label>
          </div>
          <label className="cine-v3-field"><span>FINAL QUALITY</span><select value={resolution} onChange={(event) => setResolution(event.target.value as Resolution)}><option value="768P">768P · iteration</option><option value="1080P">1080P · final</option></select></label>
          <button className="cine-v3-primary" type="button" disabled={planning} onClick={directScene}>{planning ? 'DIRECTING…' : 'DIRECT SCENE WITH AI'}</button>
          <div className="cine-v3-model-card">
            <span>PLANNER</span><strong>{capability?.planner_model || 'Workers AI'}</strong>
            <span>STORYBOARD</span><strong>{capability?.storyboard_model || 'FLUX'}</strong>
            <span>VIDEO</span><strong>{capability?.video_models?.image_to_video || 'AI video provider'}</strong>
          </div>
        </aside>

        <main className="cine-v3-stage-column">
          <section className="cine-v3-stage">
            {!selected ? (
              <div className="cine-v3-empty">
                <span>PROOFTTL CINEMATICS</span>
                <h2>Describe one scene.</h2>
                <p>The director will break it into continuous shots, generate keyframes, then render the selected shots as AI video.</p>
              </div>
            ) : selectedGeneration.video ? (
              <video ref={videoRef} key={selectedGeneration.video} src={selectedGeneration.video} controls playsInline onEnded={advanceReel} />
            ) : selectedGeneration.storyboard ? (
              <img src={selectedGeneration.storyboard} alt={`${selected.name} storyboard`} />
            ) : (
              <div className="cine-v3-shot-placeholder">
                <span>SHOT {String((plan?.shots.indexOf(selected) || 0) + 1).padStart(2, '0')}</span>
                <h2>{selected.name}</h2>
                <p>{selected.action}</p>
                <small>{selected.camera}</small>
              </div>
            )}
            {selected && <div className="cine-v3-stage-overlay"><span>{selected.name}</span><b>{selectedGeneration.status.replaceAll('-', ' ')}</b></div>}
          </section>

          <section className="cine-v3-commandbar">
            <div><span>STATUS</span><strong>{status}</strong></div>
            <div className="cine-v3-command-actions">
              <button disabled={!plan || storyboardingAll} onClick={storyboardScene}>{storyboardingAll ? 'STORYBOARDING…' : 'STORYBOARD ALL'}</button>
              <button disabled={!selected || selectedGeneration.status === 'rendering'} onClick={() => selected && renderShot(selected)}>RENDER SHOT</button>
              <button className="render-all" disabled={!plan || renderingAll} onClick={renderScene}>{renderingAll ? 'RENDERING SCENE…' : 'RENDER SCENE'}</button>
              <button disabled={!renderedShots.length} onClick={playReel}>PLAY REEL</button>
            </div>
          </section>

          <section className="cine-v3-timeline">
            <div className="cine-v3-timeline-head"><span>TIMELINE</span><b>{plan ? `${plan.shots.length} SHOTS · ${plan.shots.reduce((n, shot) => n + shot.duration_seconds, 0)}S` : 'NO SCENE YET'}</b></div>
            <div className="cine-v3-shots">
              {(plan?.shots || []).map((shot, index) => {
                const state = generation[shot.id] || emptyGeneration()
                return <button key={shot.id} className={shot.id === selected?.id ? 'active' : ''} onClick={() => { setSelectedId(shot.id); setReelIndex(null) }}>
                  {state.storyboard ? <img src={state.storyboard} alt="" /> : <i>{String(index + 1).padStart(2, '0')}</i>}
                  <span><strong>{shot.name}</strong><small>{shot.duration_seconds}s · {state.status}</small></span>
                  {state.video && <b>▶</b>}
                </button>
              })}
            </div>
          </section>
        </main>

        <aside className="cine-v3-shot-panel">
          <div className="cine-v3-panel-title"><span>SHOT</span><b>02</b></div>
          {selected ? <>
            <div className="cine-v3-shot-meta"><small>{selected.id}</small><h3>{selected.name}</h3><p>{selected.camera}</p></div>
            <div className="cine-v3-inspector-section"><span>ACTION</span><p>{selected.action}</p></div>
            <div className="cine-v3-inspector-section contact"><span>CONTACT</span><p>{selected.contact}</p></div>
            <div className="cine-v3-inspector-section"><span>CONTINUITY IN</span><p>{selected.continuity_in}</p></div>
            <div className="cine-v3-inspector-section"><span>CONTINUITY OUT</span><p>{selected.continuity_out}</p></div>
            {selectedGeneration.error && <div className="cine-v3-error">{selectedGeneration.error}</div>}
            <div className="cine-v3-shot-buttons">
              <button onClick={() => storyboardShot(selected)} disabled={selectedGeneration.status === 'storyboarding'}>GENERATE FRAME</button>
              <button onClick={() => renderShot(selected)} disabled={selectedGeneration.status === 'rendering'}>GENERATE VIDEO</button>
            </div>
          </> : <p className="cine-v3-muted">Direct a scene to create the shot plan.</p>}
          {plan && <div className="cine-v3-bible"><span>CONTINUITY BIBLE</span><p>{plan.character_bible}</p><p>{plan.continuity_bible}</p><button onClick={exportProject}>EXPORT V3 PROJECT</button><a href="/worlds/">IMPORT WORLD →</a></div>}
        </aside>
      </div>

      <footer className="cine-v3-footer"><span>AI DIRECTOR</span><span>KEYFRAME → IMAGE-TO-VIDEO</span><span>CONTINUITY-AWARE SHOTS</span><span>PAID VIDEO RENDER REQUIRES SIGN-IN</span></footer>
    </div>
  )
}
