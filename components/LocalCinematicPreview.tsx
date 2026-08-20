'use client'

import { useMemo, useState } from 'react'

function cinematicDocument(prompt: string, seed: number) {
  const safePrompt = JSON.stringify(String(prompt || '').slice(0, 900)).replace(/</g, '\\u003c')
  return `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#09090b;font-family:ui-monospace,Menlo,monospace;color:#fff}canvas{display:block;width:100%;height:100%}.hud{position:fixed;inset:0;pointer-events:none}.top{position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;font-size:10px;letter-spacing:.1em}.badge{padding:7px 9px;border:1px solid #ffffff26;background:#08080bcc;backdrop-filter:blur(8px)}.bottom{position:absolute;left:12px;right:12px;bottom:12px;display:flex;justify-content:space-between;align-items:end;gap:12px}.prompt{max-width:70%;padding:8px 10px;background:#08080bcc;border-left:2px solid #f2c94c;font:10px/1.4 ui-monospace,Menlo,monospace;color:#ddd}.record{pointer-events:auto;border:1px solid #ffffff35;background:#111318e8;color:#fff;padding:9px 11px;font:700 9px ui-monospace,Menlo,monospace;letter-spacing:.08em;cursor:pointer}.record:hover{background:#23262d}.record:disabled{opacity:.55;cursor:default}.flash{position:absolute;inset:0;background:white;opacity:0;mix-blend-mode:screen}
</style></head><body><div id="app"></div><div class="hud"><div class="top"><span class="badge">PROOFTTL · LOCAL CINEMATIC</span><span class="badge">GRAPHIC MARTIAL-ARTS PREVIEW</span></div><div class="flash" id="flash"></div><div class="bottom"><div class="prompt" id="prompt"></div><button class="record" id="record">RECORD 12S WEBM</button></div></div><script type="module">
import * as THREE from 'https://esm.sh/three@0.179.1';
const prompt=${safePrompt}; const seed=${seed}; document.querySelector('#prompt').textContent=prompt;
let s=seed||1; const rand=()=>((s=Math.imul(1664525,s)+1013904223|0)>>>0)/4294967296;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0b0b0d); scene.fog=new THREE.Fog(0x0b0b0d,10,34);
const camera=new THREE.PerspectiveCamera(46,innerWidth/innerHeight,.1,100); camera.position.set(8,4.6,11);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.75)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; document.querySelector('#app').appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xffe8c7,0x172033,2.4); scene.add(hemi); const key=new THREE.DirectionalLight(0xffd7a3,4); key.position.set(-5,10,5); key.castShadow=true; scene.add(key); const rim=new THREE.DirectionalLight(0x4f83ff,3.2); rim.position.set(7,5,-7); scene.add(rim);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshToonMaterial({color:0x26201d})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
for(let i=0;i<10;i++){const h=2+rand()*5;const w=1.2+rand()*2.4;const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,1.5+rand()*2),new THREE.MeshToonMaterial({color:i%2?0x322925:0x222832}));box.position.set(-13+i*2.8,h/2-0.02,-5-rand()*2);box.castShadow=true;box.receiveShadow=true;scene.add(box)}
for(let i=0;i<12;i++){const lantern=new THREE.Mesh(new THREE.BoxGeometry(.12,.35,.12),new THREE.MeshBasicMaterial({color:i%3===0?0xff455e:0xffc857}));lantern.position.set(-7+i*1.25,2.5+rand()*1.5,-3.7);scene.add(lantern);const light=new THREE.PointLight(lantern.material.color,4,4);light.position.copy(lantern.position);scene.add(light)}
function limb(w,h,d,color){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshToonMaterial({color}));m.castShadow=true;return m}
function fighter(color,skin){const root=new THREE.Group(); const torso=limb(.72,1.25,.42,color);torso.position.y=2.15;root.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.33,12,8),new THREE.MeshToonMaterial({color:skin}));head.position.y=3.02;head.castShadow=true;root.add(head);const hips=limb(.62,.42,.38,color);hips.position.y=1.43;root.add(hips);const leftArm=new THREE.Group(),rightArm=new THREE.Group(),leftLeg=new THREE.Group(),rightLeg=new THREE.Group();const armL=limb(.24,1.15,.24,skin),armR=limb(.24,1.15,.24,skin);armL.position.y=-.55;armR.position.y=-.55;leftArm.position.set(-.52,2.65,0);rightArm.position.set(.52,2.65,0);leftArm.add(armL);rightArm.add(armR);const legL=limb(.3,1.45,.32,color),legR=limb(.3,1.45,.32,color);legL.position.y=-.72;legR.position.y=-.72;leftLeg.position.set(-.23,1.24,0);rightLeg.position.set(.23,1.24,0);leftLeg.add(legL);rightLeg.add(legR);root.add(leftArm,rightArm,leftLeg,rightLeg);root.userData={torso,leftArm,rightArm,leftLeg,rightLeg};return root}
const hero=fighter(0xb73732,0xd9a37e);hero.position.set(-2.3,0,0);hero.rotation.y=.35;scene.add(hero);const foe=fighter(0x253b59,0xbd8a6d);foe.position.set(2.3,0,0);foe.rotation.y=-.35;scene.add(foe);
function ease(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2} function pulse(x,a,b){if(x<a||x>b)return 0;const n=(x-a)/(b-a);return Math.sin(Math.PI*n)}
const flash=document.querySelector('#flash'); const clock=new THREE.Clock(); const duration=12;
function animate(){const t=clock.getElapsedTime()%duration;const n=t/duration; hero.userData.leftArm.rotation.z=.35*Math.sin(t*2); hero.userData.rightArm.rotation.z=-.35*Math.sin(t*2); foe.userData.leftArm.rotation.z=.3*Math.sin(t*2+1); foe.userData.rightArm.rotation.z=-.3*Math.sin(t*2+1);
let p=pulse(t,1.1,2.15); hero.position.x=-2.3+2.1*ease(p); hero.userData.rightArm.rotation.x=-2.3*p; hero.userData.rightArm.rotation.z=-.8*p; foe.position.x=2.3+.35*p;
p=pulse(t,2.5,3.65); foe.position.x=2.3-1.7*ease(p); foe.userData.leftLeg.rotation.x=-1.55*p; foe.userData.leftLeg.rotation.z=.65*p; hero.rotation.z=-.14*p;
p=pulse(t,4.1,5.15); hero.position.x=-.2+1.15*p; hero.userData.leftArm.rotation.x=-1.7*p; hero.userData.leftArm.rotation.z=1.15*p; foe.rotation.z=-.3*p;
p=pulse(t,6.1,7.5); hero.userData.rightLeg.rotation.x=-1.7*p; hero.userData.rightLeg.rotation.z=-.55*p; hero.position.z=.5*p; foe.position.x=2.3+1.2*p; foe.rotation.z=-.45*p;
p=pulse(t,8.0,9.2); foe.userData.rightArm.rotation.x=-2.0*p; hero.position.x=-1.2-.55*p; hero.rotation.z=.18*p;
p=pulse(t,9.4,10.8); hero.position.x=-1.2+2.3*ease(p); hero.userData.rightArm.rotation.x=-2.5*p; hero.userData.leftArm.rotation.x=-1.3*p; foe.rotation.z=-.8*p; foe.position.x=3.1+1.2*p;
const hit=Math.max(pulse(t,2.0,2.12),pulse(t,5.02,5.13),pulse(t,7.3,7.42),pulse(t,10.55,10.7)); flash.style.opacity=String(hit*.28);
camera.position.x=7.5*Math.cos(n*Math.PI*.55)+Math.sin(t*.6)*.35; camera.position.z=10.5+Math.sin(n*Math.PI)*-3.2; camera.position.y=4.1+Math.sin(t*.8)*.2; camera.lookAt(.4,1.8,0); renderer.render(scene,camera); requestAnimationFrame(animate)} animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
const recordBtn=document.querySelector('#record'); recordBtn.onclick=()=>{if(!renderer.domElement.captureStream||!window.MediaRecorder){recordBtn.textContent='RECORDING UNSUPPORTED';return}const stream=renderer.domElement.captureStream(30);const chunks=[];let mime='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm';const rec=new MediaRecorder(stream,{mimeType:mime});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=()=>{const blob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='proofttl-martial-arts-local.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);recordBtn.disabled=false;recordBtn.textContent='RECORD 12S WEBM'};clock.start();rec.start();recordBtn.disabled=true;recordBtn.textContent='RECORDING…';setTimeout(()=>rec.stop(),12000)};
</script></body></html>`
}

export default function LocalCinematicPreview({ prompt }: { prompt: string }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2147483647))
  const srcDoc = useMemo(() => cinematicDocument(prompt, seed), [prompt, seed])
  return (
    <section className="cine-local-movie" data-local-cinematic="true">
      <div className="cine-local-head"><div><span>LOCAL MOVIE ENGINE</span><strong>Graphic martial-arts short</strong></div><button type="button" onClick={() => setSeed(Math.floor(Math.random() * 2147483647))}>NEW TAKE</button></div>
      <iframe title="Local stylized cinematic preview" srcDoc={srcDoc} sandbox="allow-scripts allow-downloads" />
      <small>Runs in your browser with procedural 3D choreography and camera motion. Use RECORD 12S WEBM inside the preview to save a real video without a paid generation provider.</small>
    </section>
  )
}
