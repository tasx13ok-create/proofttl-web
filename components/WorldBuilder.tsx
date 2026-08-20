'use client'

import { FormEvent, useMemo, useState } from 'react'

type SceneObject = { kind: 'box' | 'sphere' | 'cylinder' | 'cone'; x: number; y: number; z: number; sx: number; sy: number; sz: number; color: string; emissive?: string }
type SceneSpec = { name: string; mood: string; background: string; fog: string; ground: string; camera: [number, number, number]; objects: SceneObject[] }

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

function sceneFromPrompt(prompt: string): SceneSpec {
  const q = prompt.toLowerCase()
  const key = /forest|trees?|woods?|cabin/.test(q) ? 'forest' : /room|interior|apartment|tavern|house|showroom/.test(q) ? 'interior' : /desert|dune|outpost|sand/.test(q) ? 'desert' : /space|orbital|station|moon|planet/.test(q) ? 'space' : 'cyberpunk'
  const base = PRESETS[key]
  return { ...base, name: prompt.trim().slice(0, 64) || base.name, objects: base.objects.map((item) => ({ ...item })) }
}

function sceneDocument(spec: SceneSpec) {
  const serialized = JSON.stringify(spec).replace(/</g, '\\u003c')
  return `<!doctype html><html><head><meta charset="utf-8"><style>html,body,#app{width:100%;height:100%;margin:0;overflow:hidden;background:${spec.background}}canvas{display:block}</style></head><body><div id="app"></div><script type="module">import * as THREE from 'https://esm.sh/three@0.179.1'; import { OrbitControls } from 'https://esm.sh/three@0.179.1/examples/jsm/controls/OrbitControls.js'; const spec=${serialized}; const scene=new THREE.Scene(); scene.background=new THREE.Color(spec.background); scene.fog=new THREE.FogExp2(spec.fog,.025); const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,1000); camera.position.set(...spec.camera); const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; document.querySelector('#app').appendChild(renderer.domElement); const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.target.set(0,1,0); const hemi=new THREE.HemisphereLight(0xbfefff,0x20140c,2.2); scene.add(hemi); const key=new THREE.DirectionalLight(0xffffff,2.8); key.position.set(6,10,6); key.castShadow=true; scene.add(key); const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:spec.ground,roughness:.92,metalness:.04})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor); for(const item of spec.objects){ let g; if(item.kind==='sphere')g=new THREE.SphereGeometry(1,32,20); else if(item.kind==='cylinder')g=new THREE.CylinderGeometry(1,1,1,24); else if(item.kind==='cone')g=new THREE.ConeGeometry(1,1,24); else g=new THREE.BoxGeometry(1,1,1); const m=new THREE.MeshStandardMaterial({color:item.color,roughness:.65,metalness:.15,emissive:item.emissive||0x000000,emissiveIntensity:item.emissive?1.25:0}); const mesh=new THREE.Mesh(g,m); mesh.position.set(item.x,item.y,item.z); mesh.scale.set(item.sx,item.sy,item.sz); mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh); if(item.emissive){const light=new THREE.PointLight(item.emissive,16,10); light.position.copy(mesh.position); scene.add(light);} } const grid=new THREE.GridHelper(40,40,0x164e63,0x111827); grid.material.transparent=true; grid.material.opacity=.18; scene.add(grid); function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)} addEventListener('resize',resize); function loop(){controls.update();renderer.render(scene,camera);requestAnimationFrame(loop)} loop();</script></body></html>`
}

export default function WorldBuilder() {
  const [prompt, setPrompt] = useState('A rainy neon cyberpunk alley with dark buildings, glowing signs, fog, and a cinematic night atmosphere')
  const [spec, setSpec] = useState<SceneSpec>(() => sceneFromPrompt(prompt))
  const [jsonOpen, setJsonOpen] = useState(false)
  const previewDocument = useMemo(() => sceneDocument(spec), [spec])

  function generate(event: FormEvent) {
    event.preventDefault()
    if (!prompt.trim()) return
    setSpec(sceneFromPrompt(prompt))
  }

  function exportJson() {
    if (typeof window === 'undefined') return
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = `${spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'world'}.scene.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="world-builder">
      <section className="world-builder-command">
        <div><p className="app-kicker">WORLDS / 3D STUDIO</p><h1>Describe a world. Build it in the browser.</h1><p>This first native renderer turns scene intent into a structured, inspectable scene and renders it live. It does not pretend a cloud model created assets when no 3D provider is connected.</p></div>
        <form onSubmit={generate}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} maxLength={500} aria-label="Describe a 3D world" /><div><button className="button button-primary">GENERATE WORLD →</button><button className="button button-secondary" type="button" onClick={() => setJsonOpen((value) => !value)}>{jsonOpen ? 'HIDE SCENE JSON' : 'VIEW SCENE JSON'}</button><button className="button button-secondary" type="button" onClick={exportJson}>EXPORT JSON</button></div></form>
      </section>

      <section className="world-stage">
        <div className="world-stage-head"><div><span>LIVE WEBGL PREVIEW</span><strong>{spec.name}</strong></div><div><small>{spec.mood}</small><small>{spec.objects.length} OBJECTS</small><small>ORBIT / ZOOM ENABLED</small></div></div>
        <iframe title={`3D preview: ${spec.name}`} srcDoc={previewDocument} sandbox="allow-scripts" />
      </section>

      {jsonOpen && <section className="world-json"><div><p className="app-kicker">SCENE SPEC</p><h2>Portable by design.</h2><p>The renderer consumes structured scene data rather than hiding the world inside model output. Cloud generation, game-engine export, asset generation and project save can build on the same contract.</p></div><pre>{JSON.stringify(spec, null, 2)}</pre></section>}

      <section className="world-capabilities">
        <article><span>NOW</span><strong>Procedural scene composition</strong><p>Prompt-selected world presets, lighting, fog, geometry, camera, orbit controls and scene JSON.</p></article>
        <article><span>NEXT ADAPTER</span><strong>L.O.V.E. scene planning</strong><p>A connected model can generate the same bounded scene schema instead of choosing from local presets.</p></article>
        <article><span>PROVIDER RAIL</span><strong>Generated assets</strong><p>Meshes, textures, image references and animation stay locked until a real generation provider is connected.</p></article>
        <article><span>EXPORT RAIL</span><strong>Games and projects</strong><p>The scene contract is designed to grow toward Three.js, Godot and other project/export adapters.</p></article>
      </section>
    </div>
  )
}
