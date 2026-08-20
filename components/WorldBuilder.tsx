'use client'

import { ChangeEvent, FormEvent, useMemo, useState } from 'react'

type SceneObject = { kind: 'box' | 'sphere' | 'cylinder' | 'cone'; x: number; y: number; z: number; sx: number; sy: number; sz: number; color: string; emissive?: string }
type SceneSpec = { schema?: 'proofttl-world-v1'; name: string; mood: string; background: string; fog: string; ground: string; camera: [number, number, number]; objects: SceneObject[]; marbleWorldUrl?: string }

const MARBLE_CREATE_URL = 'https://marble.worldlabs.ai/'
const PRESETS: Record<string, SceneSpec> = {
  cyberpunk: { name: 'Neon Alley', mood: 'cyberpunk / night', background: '#02030a', fog: '#070919', ground: '#0b1020', camera: [9, 6, 12], objects: [
    { kind: 'box', x: -4, y: 2.5, z: -2, sx: 3, sy: 5, sz: 3, color: '#111827', emissive: '#082f49' },
    { kind: 'box', x: 4, y: 3, z: -3, sx: 3, sy: 6, sz: 4, color: '#111827', emissive: '#3b0764' },
    { kind: 'box', x: -2.5, y: 1.1, z: 1, sx: 1.8, sy: 2.2, sz: 1.4, color: '#172554', emissive: '#0e7490' },
    { kind: 'cylinder', x: 2.4, y: 1.5, z: 0.5, sx: .35, sy: 3, sz: .35, color: '#164e63', emissive: '#22d3ee' },
    { kind: 'box', x: 0, y: 1.8, z: -5, sx: 4, sy: .35, sz: .25, color: '#701a75', emissive: '#e879f9' },
  ] },
  forest: { name: 'Fog Forest', mood: 'quiet / atmospheric', background: '#06100c', fog: '#0b1d16', ground: '#10261b', camera: [10, 7, 12], objects: [
    { kind: 'cylinder', x: -4, y: 2, z: -3, sx: .7, sy: 4, sz: .7, color: '#3f2b20' }, { kind: 'cone', x: -4, y: 5.3, z: -3, sx: 2.4, sy: 5, sz: 2.4, color: '#14532d' },
    { kind: 'cylinder', x: 3, y: 1.8, z: -2, sx: .6, sy: 3.6, sz: .6, color: '#3f2b20' }, { kind: 'cone', x: 3, y: 4.7, z: -2, sx: 2.1, sy: 4.4, sz: 2.1, color: '#166534' },
    { kind: 'cylinder', x: 0, y: 2.2, z: 2, sx: .75, sy: 4.4, sz: .75, color: '#422f21' }, { kind: 'cone', x: 0, y: 5.6, z: 2, sx: 2.7, sy: 5.2, sz: 2.7, color: '#14532d' },
    { kind: 'box', x: 5, y: 1.3, z: 3, sx: 3, sy: 2.6, sz: 3, color: '#4b3527' },
  ] },
  interior: { name: 'Warm Interior', mood: 'cozy / architectural', background: '#100c0a', fog: '#211511', ground: '#3b2b22', camera: [9, 5, 11], objects: [
    { kind: 'box', x: 0, y: 2.5, z: -5, sx: 10, sy: 5, sz: .3, color: '#5b4636' },
    { kind: 'box', x: -5, y: 2.5, z: 0, sx: .3, sy: 5, sz: 10, color: '#4b382c' },
    { kind: 'box', x: 0, y: .7, z: 0, sx: 4, sy: .3, sz: 2, color: '#78350f' },
    { kind: 'cylinder', x: -1.5, y: .35, z: 1.7, sx: .18, sy: .7, sz: .18, color: '#422006' },
    { kind: 'cylinder', x: 1.5, y: .35, z: 1.7, sx: .18, sy: .7, sz: .18, color: '#422006' },
    { kind: 'sphere', x: 3.5, y: 2.1, z: -4.5, sx: .35, sy: .35, sz: .35, color: '#f59e0b', emissive: '#f59e0b' },
  ] },
  desert: { name: 'Desert Outpost', mood: 'open / cinematic', background: '#2a160b', fog: '#5c351c', ground: '#8a522c', camera: [12, 7, 14], objects: [
    { kind: 'box', x: 0, y: 1.4, z: -2, sx: 5, sy: 2.8, sz: 4, color: '#8b5e3c' },
    { kind: 'cylinder', x: 4, y: 2.6, z: -3, sx: .8, sy: 5.2, sz: .8, color: '#6b4428' },
    { kind: 'box', x: -5, y: .6, z: 2, sx: 3, sy: 1.2, sz: 2, color: '#654321' },
    { kind: 'sphere', x: 7, y: 7, z: -8, sx: 1.8, sy: 1.8, sz: 1.8, color: '#fbbf24', emissive: '#f59e0b' },
  ] },
  space: { name: 'Orbital Platform', mood: 'sci-fi / void', background: '#010207', fog: '#050817', ground: '#111827', camera: [10, 7, 13], objects: [
    { kind: 'cylinder', x: 0, y: .7, z: 0, sx: 5, sy: 1.4, sz: 5, color: '#1f2937', emissive: '#082f49' },
    { kind: 'sphere', x: 0, y: 3.5, z: 0, sx: 2.2, sy: 2.2, sz: 2.2, color: '#334155', emissive: '#164e63' },
    { kind: 'cylinder', x: -4, y: 2.5, z: 0, sx: .25, sy: 5, sz: .25, color: '#475569', emissive: '#22d3ee' },
    { kind: 'cylinder', x: 4, y: 2.5, z: 0, sx: .25, sy: 5, sz: .25, color: '#475569', emissive: '#a855f7' },
  ] },
}

function hash(value: string) { let h = 2166136261; for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619); return h >>> 0 }
function rng(seed: number) { let x = seed || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296 } }

function sceneFromPrompt(prompt: string): SceneSpec {
  const q = prompt.toLowerCase()
  const key = /forest|trees?|woods?|cabin/.test(q) ? 'forest' : /room|interior|apartment|tavern|house|showroom/.test(q) ? 'interior' : /desert|dune|outpost|sand/.test(q) ? 'desert' : /space|orbital|station|moon|planet/.test(q) ? 'space' : 'cyberpunk'
  const base = PRESETS[key]
  const random = rng(hash(prompt))
  const extras: SceneObject[] = []
  const count = 3 + Math.floor(random() * 6)
  for (let i = 0; i < count; i += 1) {
    extras.push({
      kind: key === 'forest' ? (i % 2 ? 'cone' : 'cylinder') : key === 'space' ? (i % 2 ? 'sphere' : 'cylinder') : 'box',
      x: Math.round((random() * 18 - 9) * 10) / 10,
      y: key === 'forest' ? 1 + random() * 3 : .5 + random() * 2.5,
      z: Math.round((random() * 18 - 9) * 10) / 10,
      sx: .4 + random() * 2.5,
      sy: .8 + random() * 4,
      sz: .4 + random() * 2.5,
      color: key === 'forest' ? '#14532d' : key === 'desert' ? '#8b5e3c' : key === 'space' ? '#334155' : '#111827',
      emissive: key === 'cyberpunk' && random() > .55 ? (random() > .5 ? '#22d3ee' : '#e879f9') : undefined,
    })
  }
  return { schema: 'proofttl-world-v1', ...base, name: prompt.trim().slice(0, 64) || base.name, objects: [...base.objects.map((item) => ({ ...item })), ...extras] }
}

function sceneDocument(spec: SceneSpec) {
  const serialized = JSON.stringify(spec).replace(/</g, '\\u003c')
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body,#app{width:100%;height:100%;margin:0;overflow:hidden;background:${spec.background}}canvas{display:block}</style></head><body><div id="app"></div><script type="module">import * as THREE from 'https://esm.sh/three@0.179.1'; import { OrbitControls } from 'https://esm.sh/three@0.179.1/examples/jsm/controls/OrbitControls.js'; const spec=${serialized}; const scene=new THREE.Scene(); scene.background=new THREE.Color(spec.background); scene.fog=new THREE.FogExp2(spec.fog,.025); const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,1000); camera.position.set(...spec.camera); const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.querySelector('#app').appendChild(renderer.domElement); const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.target.set(0,1,0); const hemi=new THREE.HemisphereLight(0xbfefff,0x20140c,2.2); scene.add(hemi); const key=new THREE.DirectionalLight(0xffffff,2.8); key.position.set(6,10,6); key.castShadow=true; scene.add(key); const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:spec.ground,roughness:.92,metalness:.04})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor); for(const item of spec.objects){ let g; if(item.kind==='sphere')g=new THREE.SphereGeometry(1,32,20); else if(item.kind==='cylinder')g=new THREE.CylinderGeometry(1,1,1,24); else if(item.kind==='cone')g=new THREE.ConeGeometry(1,1,24); else g=new THREE.BoxGeometry(1,1,1); const m=new THREE.MeshStandardMaterial({color:item.color,roughness:.65,metalness:.15,emissive:item.emissive||0x000000,emissiveIntensity:item.emissive?1.25:0}); const mesh=new THREE.Mesh(g,m); mesh.position.set(item.x,item.y,item.z); mesh.scale.set(item.sx,item.sy,item.sz); mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh); if(item.emissive){const light=new THREE.PointLight(item.emissive,16,10); light.position.copy(mesh.position); scene.add(light);} } const grid=new THREE.GridHelper(40,40,0x164e63,0x111827); grid.material.transparent=true; grid.material.opacity=.18; scene.add(grid); function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)} addEventListener('resize',resize); function loop(){controls.update();renderer.render(scene,camera);requestAnimationFrame(loop)} loop();</script></body></html>`
}

function validMarbleWorldUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'marble.worldlabs.ai' && url.pathname.startsWith('/world/')
  } catch { return false }
}

export default function WorldBuilder() {
  const [prompt, setPrompt] = useState('A rainy neon cyberpunk alley with dark buildings, glowing signs, fog, and a cinematic night atmosphere')
  const [spec, setSpec] = useState<SceneSpec>(() => sceneFromPrompt(prompt))
  const [jsonOpen, setJsonOpen] = useState(false)
  const [status, setStatus] = useState('LOCAL WORLD READY')
  const [marbleUrl, setMarbleUrl] = useState('')
  const previewDocument = useMemo(() => sceneDocument(spec), [spec])

  function generate(event: FormEvent) { event.preventDefault(); if (!prompt.trim()) return; setSpec(sceneFromPrompt(prompt)); setStatus('GENERATED LOCALLY') }
  function exportJson() { const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'world'}.scene.json`; anchor.click(); URL.revokeObjectURL(url) }
  function saveLocal() { localStorage.setItem('proofttl:world:last', JSON.stringify(spec)); setStatus('SAVED IN THIS BROWSER') }
  function loadLocal() { const raw = localStorage.getItem('proofttl:world:last'); if (!raw) { setStatus('NO LOCAL WORLD FOUND'); return } try { const next = JSON.parse(raw) as SceneSpec; setSpec(next); setMarbleUrl(next.marbleWorldUrl || ''); setStatus('LOCAL WORLD RESTORED') } catch { setStatus('LOCAL WORLD INVALID') } }
  function sendToCinematics() { localStorage.setItem('proofttl:world:cinematics', JSON.stringify(spec)); window.location.href = '/cinematics/' }
  function importJson(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const next = JSON.parse(String(reader.result || '')) as SceneSpec; if (!next?.name || !Array.isArray(next.objects)) throw new Error('invalid'); setSpec(next); setMarbleUrl(next.marbleWorldUrl || ''); setStatus('WORLD JSON IMPORTED') } catch { setStatus('IMPORT FAILED') } }; reader.readAsText(file); event.target.value = '' }
  async function openMarbleFree() {
    const text = prompt.trim()
    if (!text) { setStatus('ADD A PROMPT FIRST'); return }
    try { await navigator.clipboard.writeText(text); setStatus('PROMPT COPIED · OPENING MARBLE FREE') }
    catch { setStatus('OPENING MARBLE FREE · COPY PROMPT MANUALLY') }
    window.open(MARBLE_CREATE_URL, '_blank', 'noopener,noreferrer')
  }
  function attachMarbleWorld() {
    const value = marbleUrl.trim()
    if (!validMarbleWorldUrl(value)) { setStatus('INVALID MARBLE WORLD LINK'); return }
    const next = { ...spec, marbleWorldUrl: value }
    setSpec(next)
    localStorage.setItem('proofttl:world:last', JSON.stringify(next))
    setStatus('MARBLE WORLD LINKED')
  }
  function openLinkedMarbleWorld() {
    const value = (spec.marbleWorldUrl || marbleUrl).trim()
    if (!validMarbleWorldUrl(value)) { setStatus('NO VALID MARBLE WORLD LINK'); return }
    window.open(value, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="world-builder">
      <section className="world-builder-command">
        <div><p className="app-kicker">WORLDS / 3D STUDIO</p><h1>Describe a world. Build it in the browser.</h1><p>Use ProofTTL's instant local world builder for free, or hand the same prompt to Marble's free web plan for a high-fidelity generated environment. Marble's API is paid, so ProofTTL does not pretend the free web credits are API credits.</p></div>
        <form onSubmit={generate}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} maxLength={500} aria-label="Describe a 3D world" /><div><button className="button button-primary">GENERATE LOCALLY →</button><button className="button button-secondary" type="button" onClick={() => void openMarbleFree()}>OPEN IN MARBLE FREE ↗</button><button className="button button-secondary" type="button" onClick={saveLocal}>SAVE</button><button className="button button-secondary" type="button" onClick={loadLocal}>LOAD</button><label className="button button-secondary">IMPORT JSON<input hidden type="file" accept="application/json,.json" onChange={importJson} /></label><button className="button button-secondary" type="button" onClick={() => setJsonOpen((value) => !value)}>{jsonOpen ? 'HIDE JSON' : 'VIEW JSON'}</button><button className="button button-secondary" type="button" onClick={exportJson}>EXPORT JSON</button><button className="button button-secondary" type="button" onClick={sendToCinematics}>SEND TO CINEMATICS</button></div></form>
        <div className="world-marble-link"><input value={marbleUrl} onChange={(event) => setMarbleUrl(event.target.value)} placeholder="Paste Marble share link after generation: https://marble.worldlabs.ai/world/..." aria-label="Marble world share link" /><button className="button button-secondary" type="button" onClick={attachMarbleWorld}>LINK MARBLE WORLD</button><button className="button button-secondary" type="button" onClick={openLinkedMarbleWorld}>OPEN LINKED WORLD ↗</button></div>
      </section>

      <section className="world-stage">
        <div className="world-stage-head"><div><span>LIVE WEBGL PREVIEW</span><strong>{spec.name}</strong></div><div><small>{spec.mood}</small><small>{spec.objects.length} OBJECTS</small><small>{status}</small><small>{spec.marbleWorldUrl ? 'MARBLE LINKED' : 'LOCAL ONLY'}</small><small>ORBIT / ZOOM ENABLED</small></div></div>
        <iframe title={`3D preview: ${spec.name}`} srcDoc={previewDocument} sandbox="allow-scripts" />
      </section>

      {jsonOpen && <section className="world-json"><div><p className="app-kicker">SCENE SPEC</p><h2>Portable by design.</h2><p>This scene is native ProofTTL data. A linked Marble share URL is stored with the project without pretending ProofTTL owns or downloads Marble's paid export assets.</p></div><pre>{JSON.stringify(spec, null, 2)}</pre></section>}

      <section className="world-capabilities">
        <article><span>WORKING NOW</span><strong>Prompt → procedural world</strong><p>Deterministic prompt-driven composition, lighting, fog, geometry, camera, orbit controls and live WebGL.</p></article>
        <article><span>FREE CLOUD BRIDGE</span><strong>Marble web generation</strong><p>Copy the current prompt, open Marble Free, generate with its free monthly web credits, then attach the share link back to this ProofTTL project.</p></article>
        <article><span>WORKING NOW</span><strong>Native projects</strong><p>Save and restore worlds locally, import/export portable scene JSON and keep the project independent from paid APIs.</p></article>
        <article><span>WORKING NOW</span><strong>Cinematics handoff</strong><p>A world can be handed directly into ProofTTL Cinematics as the basis for shot planning and future camera paths.</p></article>
      </section>
    </div>
  )
}
