'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type Shape = 'box' | 'sphere' | 'cylinder' | 'cone'
type SceneObject = { kind: Shape; x: number; y: number; z: number; sx: number; sy: number; sz: number; color: string; emissive?: string }
type SceneSpec = { schema?: 'proofttl-world-v1'; name: string; mood: string; background: string; fog: string; ground: string; camera: [number, number, number]; objects: SceneObject[]; marbleWorldUrl?: string }
type PreviewMessage = { source?: string; type?: 'select' | 'hover' | 'add'; index?: number; point?: { x: number; y: number; z: number } }
type StudioFile = { id: string; name: string; language: string; content: string }
type StudioWorkspace = { name: string; files: StudioFile[]; activeFileId: string }

const MARBLE_CREATE_URL = 'https://marble.worldlabs.ai/'
const STUDIO_STORAGE_KEY = 'proofttl-studio-workspace-v2'

const PRESETS: Record<string, SceneSpec> = {
  cyberpunk: { name: 'Neon Alley', mood: 'cyberpunk / night', background: '#02030a', fog: '#070919', ground: '#0b1020', camera: [9, 6, 12], objects: [
    { kind: 'box', x: -4, y: 2.5, z: -2, sx: 3, sy: 5, sz: 3, color: '#111827', emissive: '#082f49' },
    { kind: 'box', x: 4, y: 3, z: -3, sx: 3, sy: 6, sz: 4, color: '#111827', emissive: '#3b0764' },
    { kind: 'box', x: -2.5, y: 1.1, z: 1, sx: 1.8, sy: 2.2, sz: 1.4, color: '#172554', emissive: '#0e7490' },
    { kind: 'cylinder', x: 2.4, y: 1.5, z: .5, sx: .35, sy: 3, sz: .35, color: '#164e63', emissive: '#22d3ee' },
    { kind: 'box', x: 0, y: 1.8, z: -5, sx: 4, sy: .35, sz: .25, color: '#701a75', emissive: '#e879f9' },
  ] },
  forest: { name: 'Fog Forest', mood: 'quiet / atmospheric', background: '#06100c', fog: '#0b1d16', ground: '#10261b', camera: [10, 7, 12], objects: [
    { kind: 'cylinder', x: -4, y: 2, z: -3, sx: .7, sy: 4, sz: .7, color: '#3f2b20' }, { kind: 'cone', x: -4, y: 5.3, z: -3, sx: 2.4, sy: 5, sz: 2.4, color: '#14532d' },
    { kind: 'cylinder', x: 3, y: 1.8, z: -2, sx: .6, sy: 3.6, sz: .6, color: '#3f2b20' }, { kind: 'cone', x: 3, y: 4.7, z: -2, sx: 2.1, sy: 4.4, sz: 2.1, color: '#166534' },
    { kind: 'box', x: 5, y: 1.3, z: 3, sx: 3, sy: 2.6, sz: 3, color: '#4b3527' },
  ] },
  interior: { name: 'Warm Interior', mood: 'cozy / architectural', background: '#100c0a', fog: '#211511', ground: '#3b2b22', camera: [9, 5, 11], objects: [
    { kind: 'box', x: 0, y: 2.5, z: -5, sx: 10, sy: 5, sz: .3, color: '#5b4636' },
    { kind: 'box', x: -5, y: 2.5, z: 0, sx: .3, sy: 5, sz: 10, color: '#4b382c' },
    { kind: 'box', x: 0, y: .7, z: 0, sx: 4, sy: .3, sz: 2, color: '#78350f' },
    { kind: 'sphere', x: 3.5, y: 2.1, z: -4.5, sx: .35, sy: .35, sz: .35, color: '#f59e0b', emissive: '#f59e0b' },
  ] },
  desert: { name: 'Desert Outpost', mood: 'open / cinematic', background: '#2a160b', fog: '#5c351c', ground: '#8a522c', camera: [12, 7, 14], objects: [
    { kind: 'box', x: 0, y: 1.4, z: -2, sx: 5, sy: 2.8, sz: 4, color: '#8b5e3c' },
    { kind: 'cylinder', x: 4, y: 2.6, z: -3, sx: .8, sy: 5.2, sz: .8, color: '#6b4428' },
    { kind: 'sphere', x: 7, y: 7, z: -8, sx: 1.8, sy: 1.8, sz: 1.8, color: '#fbbf24', emissive: '#f59e0b' },
  ] },
  space: { name: 'Orbital Platform', mood: 'sci-fi / void', background: '#010207', fog: '#050817', ground: '#111827', camera: [10, 7, 13], objects: [
    { kind: 'cylinder', x: 0, y: .7, z: 0, sx: 5, sy: 1.4, sz: 5, color: '#1f2937', emissive: '#082f49' },
    { kind: 'sphere', x: 0, y: 3.5, z: 0, sx: 2.2, sy: 2.2, sz: 2.2, color: '#334155', emissive: '#164e63' },
    { kind: 'cylinder', x: -4, y: 2.5, z: 0, sx: .25, sy: 5, sz: .25, color: '#475569', emissive: '#22d3ee' },
  ] },
}

function hash(value: string) { let h = 2166136261; for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619); return h >>> 0 }
function rng(seed: number) { let x = seed || 1; return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296 } }
function safeId() { return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}` }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }

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
      y: .5 + random() * 3,
      z: Math.round((random() * 18 - 9) * 10) / 10,
      sx: .4 + random() * 2.5,
      sy: .8 + random() * 4,
      sz: .4 + random() * 2.5,
      color: key === 'forest' ? '#14532d' : key === 'desert' ? '#8b5e3c' : key === 'space' ? '#334155' : '#111827',
      emissive: key === 'cyberpunk' && random() > .55 ? (random() > .5 ? '#22d3ee' : '#e879f9') : undefined,
    })
  }
  return { schema: 'proofttl-world-v1', ...clone(base), name: prompt.trim().slice(0, 64) || base.name, objects: [...clone(base.objects), ...extras] }
}

function sceneDocument(spec: SceneSpec, selectedIndex: number | null) {
  const serialized = JSON.stringify(spec).replace(/</g, '\\u003c')
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body,#app{width:100%;height:100%;margin:0;overflow:hidden;background:${spec.background}}canvas{display:block;cursor:crosshair}#hint{position:fixed;left:12px;bottom:10px;color:#94a3b8;background:rgba(2,6,12,.72);border:1px solid rgba(148,163,184,.14);border-radius:7px;padding:6px 8px;font:10px ui-monospace,monospace;pointer-events:none}</style></head><body><div id="app"></div><div id="hint">LEFT select · RIGHT add · hover highlight · drag orbit</div><script type="module">
import * as THREE from 'https://esm.sh/three@0.179.1';
import { OrbitControls } from 'https://esm.sh/three@0.179.1/examples/jsm/controls/OrbitControls.js';
const spec=${serialized}; let selected=${selectedIndex === null ? 'null' : selectedIndex};
const scene=new THREE.Scene(); scene.background=new THREE.Color(spec.background); scene.fog=new THREE.FogExp2(spec.fog,.025);
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,1000); camera.position.set(...spec.camera);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.querySelector('#app').appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight(0xbfefff,0x20140c,2.2)); const key=new THREE.DirectionalLight(0xffffff,2.8); key.position.set(6,10,6); key.castShadow=true; scene.add(key);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:spec.ground,roughness:.92,metalness:.04})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; floor.userData.floor=true; scene.add(floor);
const meshes=[];
for(let i=0;i<spec.objects.length;i++){ const item=spec.objects[i]; let g; if(item.kind==='sphere')g=new THREE.SphereGeometry(1,32,20); else if(item.kind==='cylinder')g=new THREE.CylinderGeometry(1,1,1,24); else if(item.kind==='cone')g=new THREE.ConeGeometry(1,1,24); else g=new THREE.BoxGeometry(1,1,1); const m=new THREE.MeshStandardMaterial({color:item.color,roughness:.65,metalness:.15,emissive:item.emissive||0x000000,emissiveIntensity:item.emissive?1.25:0}); const mesh=new THREE.Mesh(g,m); mesh.position.set(item.x,item.y,item.z); mesh.scale.set(item.sx,item.sy,item.sz); mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.index=i; mesh.userData.baseEmissive=m.emissive.clone(); mesh.userData.baseIntensity=m.emissiveIntensity; scene.add(mesh); meshes.push(mesh); if(item.emissive){const light=new THREE.PointLight(item.emissive,16,10); light.position.copy(mesh.position); scene.add(light);} }
const grid=new THREE.GridHelper(40,40,0x164e63,0x111827); grid.material.transparent=true; grid.material.opacity=.18; scene.add(grid);
const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(); let hovered=null;
function paint(){ for(const mesh of meshes){ const i=mesh.userData.index; const hot=i===hovered||i===selected; mesh.material.emissive.copy(hot?new THREE.Color(i===selected?0x22d3ee:0x67e8f9):mesh.userData.baseEmissive); mesh.material.emissiveIntensity=hot?1.7:mesh.userData.baseIntensity; } }
function hit(event, includeFloor=false){ const rect=renderer.domElement.getBoundingClientRect(); pointer.x=((event.clientX-rect.left)/rect.width)*2-1; pointer.y=-((event.clientY-rect.top)/rect.height)*2+1; raycaster.setFromCamera(pointer,camera); return raycaster.intersectObjects(includeFloor?[...meshes,floor]:meshes,false)[0]||null; }
renderer.domElement.addEventListener('pointermove',e=>{ const h=hit(e); const next=h?h.object.userData.index:null; if(next!==hovered){hovered=next;paint();parent.postMessage({source:'proofttl-world-preview',type:'hover',index:next},'*')} });
renderer.domElement.addEventListener('click',e=>{ if(e.button!==0)return; const h=hit(e); selected=h?h.object.userData.index:null; paint(); parent.postMessage({source:'proofttl-world-preview',type:'select',index:selected},'*') });
renderer.domElement.addEventListener('contextmenu',e=>{ e.preventDefault(); const h=hit(e,true); if(!h)return; parent.postMessage({source:'proofttl-world-preview',type:'add',point:{x:+h.point.x.toFixed(2),y:+Math.max(.5,h.point.y+.5).toFixed(2),z:+h.point.z.toFixed(2)}},'*') });
addEventListener('message',e=>{ if(e.data?.source==='proofttl-world-editor'&&e.data.type==='select'){selected=e.data.index;paint()} });
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)} addEventListener('resize',resize); paint(); (function loop(){controls.update();renderer.render(scene,camera);requestAnimationFrame(loop)})();
</script></body></html>`
}

function validMarbleWorldUrl(value: string) { try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'marble.worldlabs.ai' && url.pathname.startsWith('/world/') } catch { return false } }
function num(value: string, fallback: number) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback }

export default function WorldBuilder() {
  const [prompt, setPrompt] = useState('A rainy neon cyberpunk alley with dark buildings, glowing signs, fog, and a cinematic night atmosphere')
  const [spec, setSpec] = useState<SceneSpec>(() => sceneFromPrompt(prompt))
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [jsonOpen, setJsonOpen] = useState(false)
  const [status, setStatus] = useState('LOCAL WORLD READY')
  const [marbleUrl, setMarbleUrl] = useState('')
  const frame = useRef<HTMLIFrameElement | null>(null)
  const previewDocument = useMemo(() => sceneDocument(spec, selectedIndex), [spec, selectedIndex])
  const selected = selectedIndex === null ? null : spec.objects[selectedIndex] || null

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.data?.source !== 'proofttl-world-preview') return
      if (event.data.type === 'hover') setHoveredIndex(typeof event.data.index === 'number' ? event.data.index : null)
      if (event.data.type === 'select') setSelectedIndex(typeof event.data.index === 'number' ? event.data.index : null)
      if (event.data.type === 'add' && event.data.point) addObject(event.data.point)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [spec])

  function updateSelected(patch: Partial<SceneObject>) {
    if (selectedIndex === null) return
    setSpec(current => ({ ...current, objects: current.objects.map((object, index) => index === selectedIndex ? { ...object, ...patch } : object) }))
  }
  function addObject(point = { x: 0, y: .5, z: 0 }, kind: Shape = 'box') {
    setSpec(current => { const next = [...current.objects, { kind, x: point.x, y: point.y, z: point.z, sx: 1, sy: 1, sz: 1, color: '#334155' }]; setSelectedIndex(next.length - 1); return { ...current, objects: next } })
    setStatus('OBJECT ADDED')
  }
  function duplicateSelected() {
    if (!selected) return
    const copy = { ...selected, x: selected.x + 1, z: selected.z + 1 }
    setSpec(current => { const next = [...current.objects, copy]; setSelectedIndex(next.length - 1); return { ...current, objects: next } })
  }
  function deleteSelected() {
    if (selectedIndex === null) return
    setSpec(current => ({ ...current, objects: current.objects.filter((_, index) => index !== selectedIndex) }))
    setSelectedIndex(null)
    setStatus('OBJECT DELETED')
  }
  function generate(event: FormEvent) { event.preventDefault(); if (!prompt.trim()) return; const next = sceneFromPrompt(prompt); setSpec(next); setSelectedIndex(next.objects.length ? 0 : null); setStatus('GENERATED LOCALLY') }
  function exportJson() { const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'world'}.scene.json`; anchor.click(); URL.revokeObjectURL(url) }
  function saveLocal() { localStorage.setItem('proofttl:world:last', JSON.stringify(spec)); setStatus('SAVED IN THIS BROWSER') }
  function loadLocal() { const raw = localStorage.getItem('proofttl:world:last'); if (!raw) return void setStatus('NO LOCAL WORLD FOUND'); try { const next = JSON.parse(raw) as SceneSpec; setSpec(next); setSelectedIndex(next.objects.length ? 0 : null); setMarbleUrl(next.marbleWorldUrl || ''); setStatus('LOCAL WORLD RESTORED') } catch { setStatus('LOCAL WORLD INVALID') } }
  function sendToCinematics() { localStorage.setItem('proofttl:world:cinematics', JSON.stringify(spec)); window.location.href = '/cinematics/' }
  function importJson(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const next = JSON.parse(String(reader.result || '')) as SceneSpec; if (!next?.name || !Array.isArray(next.objects)) throw new Error('invalid'); setSpec(next); setSelectedIndex(next.objects.length ? 0 : null); setMarbleUrl(next.marbleWorldUrl || ''); setStatus('WORLD JSON IMPORTED') } catch { setStatus('IMPORT FAILED') } }; reader.readAsText(file); event.target.value = '' }
  async function openMarbleFree() { const text = prompt.trim(); if (!text) return void setStatus('ADD A PROMPT FIRST'); try { await navigator.clipboard.writeText(text); setStatus('PROMPT COPIED · OPENING MARBLE FREE') } catch { setStatus('OPENING MARBLE FREE · COPY PROMPT MANUALLY') } window.open(MARBLE_CREATE_URL, '_blank', 'noopener,noreferrer') }
  function attachMarbleWorld() { const value = marbleUrl.trim(); if (!validMarbleWorldUrl(value)) return void setStatus('INVALID MARBLE WORLD LINK'); setSpec(current => ({ ...current, marbleWorldUrl: value })); setStatus('MARBLE WORLD LINKED') }
  function openLinkedWorld() { const value = (spec.marbleWorldUrl || marbleUrl).trim(); if (!validMarbleWorldUrl(value)) return void setStatus('LINK A MARBLE WORLD FIRST'); window.open(value, '_blank', 'noopener,noreferrer') }
  function importIntoStudio() {
    const sceneJson = JSON.stringify(spec, null, 2)
    const loaderJs = `// ProofTTL World loader\n// Edit this however you want in Studio.\nexport const world = ${sceneJson};\n\nexport function listObjects() {\n  return world.objects.map((object, index) => ({ index, ...object }));\n}\n\nexport function findByKind(kind) {\n  return world.objects.filter((object) => object.kind === kind);\n}\n`
    const readme = `# ${spec.name}\n\nImported from ProofTTL Worlds.\n\nFiles:\n- world.scene.json — native editable scene data\n- world.js — starter loader/helpers\n\nUse this project for Three.js, Babylon.js, game logic, procedural generation, physics, exporters, server code, or any other coding workflow.\n`
    let workspace: StudioWorkspace = { name: `${spec.name} World`, files: [], activeFileId: '' }
    try { const existing = localStorage.getItem(STUDIO_STORAGE_KEY); if (existing) workspace = JSON.parse(existing) as StudioWorkspace } catch {}
    const baseFiles = Array.isArray(workspace.files) ? workspace.files.filter(file => !['world.scene.json', 'world.js', 'WORLD-README.md'].includes(file.name)) : []
    const sceneFile: StudioFile = { id: safeId(), name: 'world.scene.json', language: 'json', content: sceneJson }
    const files: StudioFile[] = [...baseFiles, sceneFile, { id: safeId(), name: 'world.js', language: 'javascript', content: loaderJs }, { id: safeId(), name: 'WORLD-README.md', language: 'markdown', content: readme }]
    const next: StudioWorkspace = { name: `${spec.name} World`, files, activeFileId: sceneFile.id }
    localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(next))
    localStorage.setItem('proofttl:world:studio-import', JSON.stringify({ importedAt: new Date().toISOString(), scene: spec }))
    setStatus('IMPORTED INTO STUDIO')
    window.location.href = '/studio/'
  }

  return (
    <div className="world-builder">
      <section className="world-builder-command">
        <div><p className="app-kicker">WORLDS / 3D STUDIO</p><h1>Generate it, then actually edit it.</h1><p>Hover highlights geometry. Left click selects. Right click adds an object at the hit point. The inspector edits shape, transform, material and emissive glow, and the entire native scene can be pushed into Studio as code.</p></div>
        <form onSubmit={generate}><textarea value={prompt} onChange={event => setPrompt(event.target.value)} rows={3} maxLength={500} aria-label="Describe a 3D world" /><div><button className="button button-primary">GENERATE LOCALLY →</button><button className="button button-secondary" type="button" onClick={openMarbleFree}>OPEN IN MARBLE FREE ↗</button><button className="button button-secondary" type="button" onClick={saveLocal}>SAVE</button><button className="button button-secondary" type="button" onClick={loadLocal}>LOAD</button><label className="button button-secondary">IMPORT JSON<input hidden type="file" accept="application/json,.json" onChange={importJson} /></label><button className="button button-secondary" type="button" onClick={() => setJsonOpen(value => !value)}>{jsonOpen ? 'HIDE JSON' : 'VIEW JSON'}</button><button className="button button-secondary" type="button" onClick={exportJson}>EXPORT JSON</button><button className="button button-secondary" type="button" onClick={importIntoStudio}>IMPORT INTO STUDIO</button><button className="button button-secondary" type="button" onClick={sendToCinematics}>SEND TO CINEMATICS</button></div></form>
        <div className="world-marble-link"><input placeholder="Paste Marble share link" aria-label="Marble world share link" value={marbleUrl} onChange={event => setMarbleUrl(event.target.value)} /><button className="button button-secondary" type="button" onClick={attachMarbleWorld}>LINK MARBLE WORLD</button><button className="button button-secondary" type="button" onClick={openLinkedWorld}>OPEN LINKED WORLD ↗</button></div>
      </section>

      <section className="world-editor-shell">
        <section className="world-stage">
          <div className="world-stage-head"><div><span>LIVE WEBGL PREVIEW</span><strong>{spec.name}</strong></div><div><small>{spec.mood}</small><small>{spec.objects.length} OBJECTS</small><small>{status}</small><small>{hoveredIndex === null ? 'HOVER NONE' : `HOVER #${hoveredIndex + 1}`}</small></div></div>
          <iframe ref={frame} title={`3D preview: ${spec.name}`} srcDoc={previewDocument} sandbox="allow-scripts" />
        </section>

        <aside className="world-inspector">
          <div className="world-inspector-head"><div><span>OBJECT INSPECTOR</span><strong>{selected ? `Object #${(selectedIndex || 0) + 1}` : 'Nothing selected'}</strong></div><button type="button" onClick={() => addObject()}>+ ADD</button></div>
          {selected ? <>
            <label>Shape<select value={selected.kind} onChange={event => updateSelected({ kind: event.target.value as Shape })}><option>box</option><option>sphere</option><option>cylinder</option><option>cone</option></select></label>
            <div className="world-inspector-group"><span>POSITION</span>{(['x','y','z'] as const).map(key => <label key={key}>{key.toUpperCase()}<input type="number" step="0.1" value={selected[key]} onChange={event => updateSelected({ [key]: num(event.target.value, selected[key]) })} /></label>)}</div>
            <div className="world-inspector-group"><span>SCALE</span>{(['sx','sy','sz'] as const).map(key => <label key={key}>{key.toUpperCase()}<input type="number" min="0.05" step="0.1" value={selected[key]} onChange={event => updateSelected({ [key]: Math.max(.05, num(event.target.value, selected[key])) })} /></label>)}</div>
            <div className="world-inspector-group materials"><span>MATERIAL</span><label>Color<input type="color" value={selected.color} onChange={event => updateSelected({ color: event.target.value })} /></label><label>Glow<input type="color" value={selected.emissive || '#000000'} onChange={event => updateSelected({ emissive: event.target.value === '#000000' ? undefined : event.target.value })} /></label></div>
            <div className="world-inspector-actions"><button type="button" onClick={duplicateSelected}>DUPLICATE</button><button type="button" onClick={() => updateSelected({ x: 0, y: .5, z: 0 })}>CENTER</button><button className="danger" type="button" onClick={deleteSelected}>DELETE</button></div>
          </> : <p className="world-inspector-empty">Left click an object in the viewport to select it. Right click anywhere on geometry or the ground to add a new box there.</p>}
          <div className="world-object-list"><span>SCENE OBJECTS</span>{spec.objects.map((object, index) => <button type="button" key={index} className={selectedIndex === index ? 'active' : ''} onClick={() => setSelectedIndex(index)}><b>#{index + 1}</b><span>{object.kind}</span><small>{object.x.toFixed(1)}, {object.y.toFixed(1)}, {object.z.toFixed(1)}</small></button>)}</div>
        </aside>
      </section>

      {jsonOpen && <section className="world-json"><div><p className="app-kicker">SCENE SPEC</p><h2>Portable by design.</h2><p>This exact scene JSON is what goes into Studio, so code can transform, render, simulate, export or generate from the world without a proprietary lock-in.</p></div><pre>{JSON.stringify(spec, null, 2)}</pre></section>}

      <section className="world-capabilities"><article><span>WORKING NOW</span><strong>Interactive object editing</strong><p>Hover highlight, left-click selection, right-click placement, transform/material editing, duplicate and delete.</p></article><article><span>WORKING NOW</span><strong>Studio code handoff</strong><p>One click imports world.scene.json, world.js and documentation into the actual Studio workspace for arbitrary coding.</p></article><article><span>FREE CLOUD BRIDGE</span><strong>Marble web generation</strong><p>Use Marble's free web credits for higher-fidelity world generation and keep its share URL attached to the project.</p></article><article><span>WORKING NOW</span><strong>Cinematics handoff</strong><p>The same world stays portable into ProofTTL Cinematics for shot planning and rendering workflows.</p></article></section>
    </div>
  )
}
