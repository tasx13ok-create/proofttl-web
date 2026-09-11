'use client'

import { useEffect, useRef, useState } from 'react'

const MODES = [
  { name: 'Claim', title: 'Start with the exact assertion.', copy: 'Preserve the words, context, and consequence of being wrong.' },
  { name: 'Evidence', title: 'Examine both sides.', copy: 'Keep supporting sources and contradicting evidence in the same view.' },
  { name: 'Verdict', title: 'Leave room for unknown.', copy: 'Supported, contradicted, or unknown. A human approves the finding.' },
]

// A real-time, procedurally modelled 3D sculpture. It illustrates the method;
// it does not display a live audit, a customer record, or product telemetry.
const VERTEX = `attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}`
const FRAGMENT = `precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float phase;
uniform float scroll;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float torus(vec3 p,float r,float tube){return length(vec2(length(p.xy)-r,p.z))-tube;}
vec2 scene(vec3 p){
  p.xz=rot(time*.17+pointer.x*.65+scroll*.7)*p.xz;
  p.yz=rot(-.3+pointer.y*.38+phase*.2)*p.yz;
  vec3 core=p;
  core.xy=rot(.6+time*.1)*core.xy;
  core.yz=rot(.5)*core.yz;
  float crystal=(abs(core.x)+abs(core.y)+abs(core.z)-.92)*.57735-.055;
  vec2 result=vec2(crystal,0.0);
  vec3 a=p;a.yz=rot(.62)*a.yz;
  float d=torus(a,1.08,.115);
  if(d<result.x)result=vec2(d,1.0);
  vec3 b=p;b.xz=rot(1.12+phase*.18)*b.xz;b.xy=rot(-.5)*b.xy;
  d=torus(b,1.32,.072);
  if(d<result.x)result=vec2(d,2.0);
  vec3 c=p;c.yz=rot(1.56)*c.yz;c.xz=rot(.52)*c.xz;
  d=torus(c,1.51,.036);
  if(d<result.x)result=vec2(d,3.0);
  return result;
}
vec3 normalAt(vec3 p){
  vec2 e=vec2(.0015,0.0);
  return normalize(vec3(scene(p+e.xyy).x-scene(p-e.xyy).x,scene(p+e.yxy).x-scene(p-e.yxy).x,scene(p+e.yyx).x-scene(p-e.yyx).x));
}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.0-resolution)/resolution.y;
  vec3 ro=vec3(0.,0.,4.8);
  vec3 rd=normalize(vec3(uv,-2.35));
  float travel=0.;vec2 hit=vec2(1.);bool found=false;
  for(int i=0;i<72;i++){
    hit=scene(ro+rd*travel);
    if(hit.x<.002){found=true;break;}
    travel+=hit.x*.85;
    if(travel>8.)break;
  }
  if(!found){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*travel;
  vec3 n=normalAt(p);
  vec3 light=normalize(vec3(-.7,1.1,1.6));
  vec3 fill=normalize(vec3(1.2,-.4,.6));
  float diffuse=max(dot(n,light),0.);
  float rim=pow(1.-max(dot(n,-rd),0.),2.4);
  vec3 reflected=reflect(rd,n);
  float studio=pow(max(dot(reflected,normalize(vec3(-.8,1.,1.5))),0.),20.);
  float stripe=pow(.5+.5*sin(reflected.y*8.+reflected.x*3.),8.);
  vec3 base=vec3(.48,.6,.91);
  if(hit.y>.5)base=vec3(.64,.58,.96);
  if(hit.y>1.5)base=vec3(.34,.81,.76);
  if(hit.y>2.5)base=vec3(.71,.78,.96);
  vec3 color=base*(.16+diffuse*.68+max(dot(n,fill),0.)*.3);
  color+=vec3(.85,.91,1.)*(studio*1.6+stripe*.35+rim*.5);
  color+=vec3(.2,.4,.75)*max(-n.y,0.)*.2;
  color=pow(color,vec3(.86));
  gl_FragColor=vec4(color,1.);
}`

export default function ReactiveProofStage() {
  const [paused, setPaused] = useState(false)
  const [mode, setMode] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const controls = useRef({ paused: false, mode: 0 })
  useEffect(() => { controls.current = { paused, mode } }, [paused, mode])

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const cursor = cursorRef.current
    if (!stage || !canvas) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const dots = cursor ? Array.from(cursor.querySelectorAll<HTMLElement>('i')) : []
    const trail = dots.map(() => ({ x: 0, y: 0 }))
    const aim = { x: 0, y: 0, tx: 0, ty: 0 }
    let inView = true
    let frame = 0
    let last = 0
    let clock = 0
    let phase = 0
    let travel = 0
    let cursorUntil = 0
    let dragging = false
    let dragX = 0
    let lastPaused = false
    let dirty = true
    let renderer: WebGLRenderingContext | null = null
    try { renderer = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' }) } catch { /* CSS sculpture remains visible. */ }
    const gl = renderer
    stage.dataset.renderer = gl ? 'initializing' : 'css-fallback'
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    const shaders: WebGLShader[] = []
    let uniforms: Record<string, WebGLUniformLocation | null> = {}

    if (gl) {
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type)
        if (!shader) return null
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        shaders.push(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          stage.dataset.renderer = 'css-fallback'
          stage.dataset.renderError = gl.getShaderInfoLog(shader) || 'Shader unavailable'
          return null
        }
        return shader
      }
      const vertex = compile(gl.VERTEX_SHADER, VERTEX)
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT)
      if (vertex && fragment) {
        program = gl.createProgram()
        if (program) {
          gl.attachShader(program, vertex)
          gl.attachShader(program, fragment)
          gl.linkProgram(program)
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program)
            program = null
          }
        }
      }
      if (program) {
        gl.useProgram(program)
        buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
        const position = gl.getAttribLocation(program, 'position')
        gl.enableVertexAttribArray(position)
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
        uniforms = Object.fromEntries(['resolution','pointer','time','phase','scroll'].map(name => [name, gl.getUniformLocation(program!, name)]))
      }
    }

    const hideCursor = () => { if (cursor) cursor.dataset.visible = 'false' }
    const schedule = () => { if (!document.hidden && !frame) frame = requestAnimationFrame(draw) }
    const resize = () => {
      // Capped drawing resolution keeps the shader inexpensive on phones.
      const box = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25, 760 / Math.max(box.width, box.height))
      canvas.width = Math.max(1, Math.round(box.width * ratio))
      canvas.height = Math.max(1, Math.round(box.height * ratio))
      gl?.viewport(0, 0, canvas.width, canvas.height)
      dirty = true
      schedule()
    }
    const onScroll = () => {
      if (reduced.matches || controls.current.paused) return
      const box = stage.getBoundingClientRect()
      travel = Math.max(-1, Math.min(1, -box.top / window.innerHeight))
      dirty = true
      schedule()
    }
    const onStageMove = (event: PointerEvent) => {
      if (reduced.matches || controls.current.paused) return
      const box = stage.getBoundingClientRect()
      if (event.pointerType === 'touch') {
        if (!dragging) return
        aim.tx += (event.clientX - dragX) / 150
        dragX = event.clientX
      } else {
        aim.tx = ((event.clientX - box.left) / box.width - .5) * 2
        aim.ty = ((event.clientY - box.top) / box.height - .5) * 2
      }
      stage.style.setProperty('--proof-x', `${(event.clientX - box.left) / box.width * 100}%`)
      stage.style.setProperty('--proof-y', `${(event.clientY - box.top) / box.height * 100}%`)
      dirty = true
      schedule()
    }
    const onDown = (event: PointerEvent) => { dragging = true; dragX = event.clientX }
    const onUp = () => { dragging = false }
    const onLeave = () => { dragging = false; aim.tx = 0; aim.ty = 0; schedule() }
    const onCursor = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || controls.current.paused || !cursor) { hideCursor(); return }
      if (cursor.dataset.visible !== 'true') trail.forEach(p => { p.x = event.clientX; p.y = event.clientY })
      trail[0] = { x: event.clientX, y: event.clientY }
      cursor.dataset.visible = 'true'
      cursor.dataset.active = String(Boolean((event.target as Element)?.closest('a,button')))
      cursorUntil = performance.now() + 650
      schedule()
    }
    function draw(now: number) {
      if (!stage || !canvas) return
      frame = 0
      if (document.hidden) return
      const still = reduced.matches || controls.current.paused
      const step = Math.min(now - (last || now), 50)
      if (step < 30 && last && !dirty) { schedule(); return }
      last = now
      if (!still) clock += step / 1000
      if (still !== lastPaused) { hideCursor(); dirty = true; lastPaused = still }
      const targetPhase = controls.current.mode
      phase = still ? targetPhase : phase + (targetPhase - phase) * .085
      if (!still) {
        aim.x += (aim.tx - aim.x) * .09
        aim.y += (aim.ty - aim.y) * .09
      }
      if (inView && (dirty || !still)) {
        if (gl && program && !gl.isContextLost()) {
          gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
          gl.uniform2f(uniforms.pointer, aim.x, aim.y)
          gl.uniform1f(uniforms.time, clock)
          gl.uniform1f(uniforms.phase, phase)
          gl.uniform1f(uniforms.scroll, reduced.matches ? 0 : travel)
          gl.drawArrays(gl.TRIANGLES, 0, 6)
          stage.dataset.renderer = 'webgl'
        }
        stage.style.setProperty('--proof-turn', `${aim.x * 18 + phase * 22 + (reduced.matches ? 0 : travel * 25)}deg`)
        stage.style.setProperty('--proof-orbit', `${clock * 7}deg`)
        dirty = false
      }
      if (cursor && fine.matches && !still && now < cursorUntil) {
        for (let i = 1; i < trail.length; i++) {
          trail[i].x += (trail[i - 1].x - trail[i].x) * .4
          trail[i].y += (trail[i - 1].y - trail[i].y) * .4
        }
        dots.forEach((dot, i) => { dot.style.transform = `translate3d(${trail[i].x}px,${trail[i].y}px,0) translate(-50%,-50%) scale(${1 - i * .12})` })
      } else hideCursor()
      if (inView && !still || now < cursorUntil || Math.abs(phase - targetPhase) > .002) schedule()
    }
    const onVisibility = () => {
      hideCursor()
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
      else { last = 0; dirty = true; schedule() }
    }
    const onPreference = () => { hideCursor(); dirty = true; schedule() }
    const onContextLost = (event: Event) => {
      event.preventDefault()
      stage.dataset.renderer = 'fallback'
    }
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      stage.dataset.inView = String(inView)
      if (inView) { dirty = true; schedule() }
    })
    const observer = new ResizeObserver(resize)
    // React controls can wake a paused/offscreen renderer without a polling loop.
    const mutations = new MutationObserver(() => { dirty = true; schedule() })
    mutations.observe(stage, { attributes: true, attributeFilter: ['data-paused','data-mode'] })
    intersection.observe(stage)
    observer.observe(stage)
    reduced.addEventListener('change', onPreference)
    fine.addEventListener('change', onPreference)
    stage.addEventListener('pointermove', onStageMove, { passive: true })
    stage.addEventListener('pointerdown', onDown, { passive: true })
    stage.addEventListener('pointerup', onUp)
    stage.addEventListener('pointercancel', onUp)
    stage.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('webglcontextlost', onContextLost)
    window.addEventListener('pointermove', onCursor, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('mouseleave', hideCursor)
    document.addEventListener('visibilitychange', onVisibility)
    resize()
    onScroll()
    return () => {
      cancelAnimationFrame(frame)
      hideCursor()
      intersection.disconnect()
      observer.disconnect()
      mutations.disconnect()
      reduced.removeEventListener('change', onPreference)
      fine.removeEventListener('change', onPreference)
      stage.removeEventListener('pointermove', onStageMove)
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointerup', onUp)
      stage.removeEventListener('pointercancel', onUp)
      stage.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      window.removeEventListener('pointermove', onCursor)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('mouseleave', hideCursor)
      document.removeEventListener('visibilitychange', onVisibility)
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer)
        if (program) gl.deleteProgram(program)
        shaders.forEach(shader => gl.deleteShader(shader))
      }
    }
  }, [])

  return <>
    <div className="ptl-proof-stage" ref={stageRef} data-paused={paused} data-mode={mode} aria-label="Interactive 3D illustration of the verification method">
      <div className="ptl-proof-aura" aria-hidden="true" />
      <div className="ptl-proof-sculpture" aria-hidden="true"><i/><i/><i/><b/></div>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="ptl-proof-stage-head"><span><i/> THE VERIFICATION METHOD</span><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? 'Resume visual motion' : 'Pause visual motion'}>{paused ? 'Play ↗' : 'Pause Ⅱ'}</button></div>
      <div className="ptl-proof-coordinate" aria-hidden="true"><span>CLAIM</span><span>EVIDENCE</span><span>HUMAN REVIEW</span></div>
      <div className="ptl-proof-stage-foot">
        <span className="ptl-proof-interaction-hint">Move to explore · swipe on touch</span>
        <div className="ptl-proof-mode-controls" role="group" aria-label="Explore the verification method">{MODES.map((item, index) => <button key={item.name} type="button" aria-pressed={mode === index} onClick={() => setMode(index)}><span>0{index + 1}</span>{item.name}</button>)}</div>
        <div className="ptl-proof-mode-copy" aria-live="polite" aria-atomic="true"><strong>{MODES[mode].title}</strong><p>{MODES[mode].copy}</p></div>
      </div>
    </div>
    <div className="ptl-cursor-tracer" ref={cursorRef} data-visible="false" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i}/>)}</div>
  </>
}
