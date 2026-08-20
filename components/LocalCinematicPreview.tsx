'use client'

import { useMemo, useState } from 'react'
import { parseCinematicPrompt } from '../cinematics/prompt/PromptParser'
import type { CinematicPlan } from '../cinematics/core/Types'

function cinematicDocument(plan: CinematicPlan) {
  const serialized = JSON.stringify(plan).replace(/</g, '\\u003c')
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script type="importmap">{"imports":{"three":"https://esm.sh/three@0.179.1"}}</script><style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#07090d;color:#fff;font-family:Inter,ui-sans-serif,system-ui,sans-serif}canvas{display:block;width:100%;height:100%}.hud{position:fixed;inset:0;pointer-events:none}.top{position:absolute;left:16px;right:16px;top:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.brand{height:34px;display:flex;align-items:center;gap:9px;padding:5px 9px;background:#05070bb8;border:1px solid #ffffff22;backdrop-filter:blur(12px)}.brand img{width:92px;height:24px;object-fit:contain;display:block}.brand span,.status{font:700 9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#dce6f5}.status{padding:9px 10px;background:#05070bb8;border:1px solid #ffffff22}.controls{pointer-events:auto;position:absolute;left:16px;top:58px;display:flex;gap:6px;flex-wrap:wrap}.controls button,.record{border:1px solid #ffffff2c;background:#0b0f16d9;color:#dce6f5;padding:7px 9px;font:700 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em;cursor:pointer}.controls button.active{border-color:#eab84a;color:#ffd56f}.letterbox:before,.letterbox:after{content:'';position:absolute;left:0;right:0;height:5.5%;background:#000;opacity:.92}.letterbox:before{top:0}.letterbox:after{bottom:0}.vignette{position:absolute;inset:0;background:radial-gradient(circle at center,transparent 52%,#0008 100%)}.flash{position:absolute;inset:0;background:#fff;opacity:0;mix-blend-mode:screen}.impact{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font:900 22px/1 ui-sans-serif,system-ui;letter-spacing:.2em;opacity:0;text-shadow:0 3px 24px #000}.loading{position:absolute;inset:0;display:grid;place-items:center;background:#080b10;z-index:10;transition:opacity .35s}.loading.hide{opacity:0;pointer-events:none}.loader-card{min-width:270px;padding:18px;border:1px solid #ffffff1f;background:#0a0e15}.loader-card strong{display:block;font-size:12px;letter-spacing:.12em}.loader-card small{display:block;margin-top:7px;color:#8391a5;font:9px ui-monospace,monospace}.bar{height:2px;background:#ffffff14;margin-top:14px;overflow:hidden}.bar i{display:block;width:42%;height:100%;background:#55d8ff;animation:load 1s ease-in-out infinite alternate}@keyframes load{to{transform:translateX(138%)}}.bottom{position:absolute;left:16px;right:16px;bottom:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end}.timeline{pointer-events:auto;background:#05070bc9;border:1px solid #ffffff1f;padding:9px 10px;backdrop-filter:blur(12px)}.prompt{font:9px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;color:#c8d0dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.timeline-row{display:flex;gap:9px;align-items:center;margin-top:7px}.timeline-row small{font:9px ui-monospace,monospace;color:#8793a5;white-space:nowrap}.timeline input{width:100%;accent-color:#eab84a}.record{pointer-events:auto;padding:10px 12px;background:#111723}.record:disabled{opacity:.55}.shot-label{position:absolute;right:16px;top:58px;padding:7px 9px;border:1px solid #ffffff1d;background:#05070bab;color:#9cabc0;font:700 8px ui-monospace,monospace;letter-spacing:.1em}
</style></head><body><div id="app"></div><div class="loading" id="loading"><div class="loader-card"><strong>BUILDING PERFORMANCE</strong><small>Loading humanoid cast · lighting · choreography</small><div class="bar"><i></i></div></div></div><div class="hud letterbox"><div class="top"><div class="brand"><img src="/proofttl-logo.png" alt="ProofTTL"><span>CINEMATICS</span></div><div class="status" id="status">LOCAL FILM · PREPARING</div></div><div class="controls"><button data-style="technical">TECHNICAL</button><button data-style="aggressive">AGGRESSIVE</button><button data-style="defensive">DEFENSIVE</button><button data-style="cinematic">CINEMATIC</button><button id="cameraBtn">CAMERA: DIRECTOR</button><button id="pauseBtn">PAUSE</button><button id="takeBtn">NEW TAKE</button></div><div class="shot-label" id="shotLabel">SHOT 01 · ESTABLISH</div><div class="vignette"></div><div class="flash" id="flash"></div><div class="impact" id="impact">IMPACT</div><div class="bottom"><div class="timeline"><div class="prompt" id="prompt"></div><div class="timeline-row"><small id="timeLabel">0.0s</small><input id="scrub" type="range" min="0" max="1000" value="0" aria-label="TIMELINE IS SCRUBBABLE"><small id="durationLabel"></small></div></div><button class="record" id="record">RECORD WEBM</button></div></div><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'https://esm.sh/three@0.179.1/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'https://esm.sh/three@0.179.1/examples/jsm/utils/SkeletonUtils.js';

const plan=${serialized};
const $=s=>document.querySelector(s); $('#prompt').textContent=plan.prompt; $('#durationLabel').textContent=plan.duration.toFixed(1)+'s';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)); const smooth=x=>x*x*(3-2*x); const pulse=(t,a,b)=>t<a||t>b?0:Math.sin(Math.PI*(t-a)/(b-a));
let rng=plan.seed||1; const rand=()=>((rng=Math.imul(1664525,rng)+1013904223|0)>>>0)/4294967296;

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x090b10); scene.fog=new THREE.FogExp2(0x090b10,.035);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100); camera.position.set(6,3.1,7.7);
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.18; $('#app').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x8ea8c8,0x140d0b,1.15));
const key=new THREE.SpotLight(0xffc28d,85,28,Math.PI/5,.55,1.5); key.position.set(-4,8,4); key.castShadow=true; key.shadow.mapSize.set(1024,1024); scene.add(key);
const rim=new THREE.SpotLight(0x4f79ff,65,24,Math.PI/4,.65,1.2); rim.position.set(7,5,-7); scene.add(rim);
const practical1=new THREE.PointLight(0xff7b3d,18,9,2); practical1.position.set(-3,3.6,-3); scene.add(practical1);
const practical2=new THREE.PointLight(0x3a78ff,14,10,2); practical2.position.set(4,2.6,2); scene.add(practical2);

function mat(color,rough=.78,metal=.05){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
function box(w,h,d,color,rough=.78,metal=.05){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,rough,metal));m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
const floor=box(20,.18,18,0x25282e,.95,.02); floor.position.y=-.11;
const back=box(20,5,.22,0x12161c,.9,.02); back.position.set(0,2.5,-7.5);
const side=box(.22,5,15,0x15191f,.9,.02); side.position.set(-8.2,2.5,-.3);
for(let i=0;i<5;i++){const c=box(2.15,.9,.9,0x404852,.38,.55);c.position.set(-5.5+i*2.65,.45,-5.6)}
const table=box(2.7,.12,1.45,0x50443a,.7,.15); table.position.set(.3,.95,.7); for(const sx of [-1,1])for(const sz of [-1,1]){const l=box(.12,.95,.12,0x26292e,.55,.5);l.position.set(.3+sx*1.05,.47,.7+sz*.5)}
for(let i=0;i<3;i++){const light=box(1.6,.08,.25,0xffd39a,.35,.15);light.position.set(-4+i*4,4.2,-2.4);const glow=new THREE.PointLight(0xffb76f,6,5,2);glow.position.copy(light.position);glow.position.y-=.2;scene.add(glow)}
for(let i=0;i<10;i++){const p=box(.25+rand()*.35,.25+rand()*.4,.25+rand()*.35,i%2?0x69737d:0x343b43,.5,.35);p.position.set(-5.2+i*1.08,.95,-5.45)}

const actors=[]; const basePos=[[-1.25,0,.15],[1.45,0,.15],[.2,0,-2.0],[.15,0,2.25],[-3.0,0,-.8],[3.1,0,-.9],[-2.5,0,2.3],[2.5,0,2.4]];
const boneNames=['Hips','Spine','Spine1','Spine2','Neck','Head','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot'];
function bonesFor(root){const map={};root.traverse(o=>{if(o.isBone){for(const n of boneNames)if(o.name===n||o.name.endsWith(n))map[n]=o}});return map}
function tint(root,index){root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;if(o.material){o.material=o.material.clone();o.material.roughness=.82;o.material.metalness=.02;if(o.material.color){if(index===0)o.material.color.multiply(new THREE.Color(1.25,.55,.48));else o.material.color.multiply(new THREE.Color(.62,.72,1.08))}}})}
function fallbackHuman(index){const g=new THREE.Group(); const skin=index===0?0xd89b73:0xb98467; const cloth=index===0?0xa52f2e:0x293b59; const unit=(geo,color)=>{const m=new THREE.Mesh(geo,new THREE.MeshToonMaterial({color}));m.castShadow=true;g.add(m);return m}; const torso=unit(new THREE.CapsuleGeometry(.32,.7,8,12),cloth);torso.position.y=1.25;const head=unit(new THREE.SphereGeometry(.24,18,14),skin);head.position.y=2.05;for(const s of [-1,1]){const arm=unit(new THREE.CapsuleGeometry(.09,.68,6,9),skin);arm.position.set(.48*s,1.36,0);arm.rotation.z=.18*s;const leg=unit(new THREE.CapsuleGeometry(.12,.78,6,9),cloth);leg.position.set(.2*s,.48,0)}return g}
function addActor(root,index,clips){const mixer=new THREE.AnimationMixer(root);const idle=clips.find(c=>/idle/i.test(c.name))||clips[0]; if(idle){const a=mixer.clipAction(idle);a.play()}const walk=clips.find(c=>/walk/i.test(c.name));const actor={root,mixer,idle,walk,bones:bonesFor(root),index,phase:rand()*6.28,base:new THREE.Vector3(...basePos[index%basePos.length])}; root.position.copy(actor.base);scene.add(root);actors.push(actor);return actor}

const loader=new GLTFLoader();
async function loadCast(){try{const gltf=await loader.loadAsync('https://threejs.org/examples/models/gltf/Soldier.glb');const count=Math.min(1+plan.attackers,8);for(let i=0;i<count;i++){const root=SkeletonUtils.clone(gltf.scene);root.scale.setScalar(.93+(i?rand()*.05:0));tint(root,i);addActor(root,i,gltf.animations)}$('#status').textContent='LOCAL FILM · HUMANOID CAST';}catch(err){console.warn('Humanoid model unavailable, using local fallback',err);const count=Math.min(1+plan.attackers,8);for(let i=0;i<count;i++)addActor(fallbackHuman(i),i,[]);$('#status').textContent='LOCAL FILM · FALLBACK CAST';}$('#loading').classList.add('hide');}
await loadCast();

function face(actor,target){const d=target.root.position.clone().sub(actor.root.position);actor.root.rotation.y=Math.atan2(d.x,d.z)}
function resetActor(a,t){a.root.position.lerp(a.base,.16);a.root.rotation.x=0;a.root.rotation.z=0;if(a.mixer&&a.idle)a.mixer.setTime((t+a.phase)%(a.idle.duration||2.5));const b=a.bones; if(b.Spine2)b.Spine2.rotation.z=Math.sin(t*.8+a.phase)*.035;if(b.Head)b.Head.rotation.y=Math.sin(t*.45+a.phase)*.08;}
function punch(a,p,right=true){const b=a.bones,arm=b[right?'RightArm':'LeftArm'],fore=b[right?'RightForeArm':'LeftForeArm'],spine=b.Spine2;if(arm){arm.rotation.x-=1.05*p;arm.rotation.z+=(right?-.35:.35)*p}if(fore)fore.rotation.x+=1.25*(1-p);if(spine)spine.rotation.y+=(right?.32:-.32)*p;a.root.position.z+=.12*p}
function kick(a,p,right=true,spin=false){const b=a.bones,thigh=b[right?'RightUpLeg':'LeftUpLeg'],leg=b[right?'RightLeg':'LeftLeg'],spine=b.Spine2;if(thigh){thigh.rotation.x-=1.2*p;thigh.rotation.z+=(right?-.22:.22)*p}if(leg)leg.rotation.x+=.7*p;if(spine)spine.rotation.z+=(right?.18:-.18)*p;if(spin)a.root.rotation.y+=smooth(p)*Math.PI*2}
function block(a,p,right=true){const b=a.bones,arm=b[right?'RightArm':'LeftArm'],fore=b[right?'RightForeArm':'LeftForeArm'];if(arm){arm.rotation.x-=.65*p;arm.rotation.z+=(right?-.8:.8)*p}if(fore)fore.rotation.x+=1.1*p}
function react(a,p,dir=1){const b=a.bones;if(b.Spine2)b.Spine2.rotation.x-=.35*p;if(b.Head)b.Head.rotation.x+=.25*p;a.root.position.x+=dir*.2*p;a.root.rotation.z-=dir*.1*p}
function actorById(id){if(id==='hero')return actors[0];const n=Number(String(id).split('-')[1]||1);return actors[clamp(n,1,actors.length-1)]}

let style=plan.style,paused=false,scrubbing=false,manualTime=0,last=0,microSeed=0,cameraMode='director';const flash=$('#flash'),impact=$('#impact'),scrub=$('#scrub'),timeLabel=$('#timeLabel'),shotLabel=$('#shotLabel'),status=$('#status');
function crowd(t){if(!actors.length)return;const hero=actors[0];for(let i=1;i<actors.length;i++){const a=actors[i];const angle=((i-1)/Math.max(1,actors.length-1))*Math.PI*2+.16*Math.sin(t*.28+i);const active=plan.actions.some(x=>x.actorId==='enemy-'+i&&t>x.start-.5&&t<x.start+x.duration+.45);const r=active?1.45:2.7+(i%2)*.35;const desired=new THREE.Vector3(Math.cos(angle)*r,0,Math.sin(angle)*r*.8);a.base.lerp(desired,.035);face(a,hero)}if(actors[1])face(hero,actors[1])}
function actions(t){let hit=0;for(const x of plan.actions){const local=t-x.start;if(local<-.25||local>x.duration+.35)continue;const a=actorById(x.actorId),target=x.targetId?actorById(x.targetId):null;if(!a)continue;if(target)face(a,target);const p=pulse(local,0,x.duration);if(x.action==='approach'&&target){const d=target.root.position.clone().sub(a.root.position);d.y=0;if(d.length()>1.25)a.root.position.add(d.normalize().multiplyScalar(.035*p))}else if(['jab','cross','hook'].includes(x.action))punch(a,p,x.action!=='jab');else if(x.action==='kick')kick(a,p,true,false);else if(x.action==='spinning_kick')kick(a,p,true,true);else if(x.action==='block'||x.action==='parry')block(a,p,x.action==='block');else if(x.action==='dodge'){a.root.position.x+=(a.index===0?-1:1)*.55*p;a.root.rotation.z+=(a.index===0?.12:-.12)*p}else if(x.action==='throw'&&target){block(a,p,true);const q=smooth(clamp(local/x.duration,0,1));target.root.position.lerp(new THREE.Vector3(.6,0,.7),.075*q);target.root.rotation.z=-.85*p}else if(x.action==='stagger')react(a,p,a.index===0?-1:1);if(x.outcome==='hit'||x.outcome==='throw_success'){const h=pulse(local,x.duration*.46,x.duration*.58);if(target)react(target,h,a.root.position.x<target.root.position.x?1:-1);hit=Math.max(hit,h*(x.cameraWeight||.65))}if(x.outcome==='blocked'){const h=pulse(local,x.duration*.43,x.duration*.54);if(target)block(target,h,true);hit=Math.max(hit,h*.4)}}return hit}

const shots=[
 {name:'ESTABLISH',start:0,end:.19,pos:[6.6,3.15,7.8],fov:42,focus:[0,1.25,0]},
 {name:'PRESSURE',start:.19,end:.42,pos:[-5.2,2.4,4.8],fov:46,focus:[0,1.4,0]},
 {name:'COUNTER',start:.42,end:.67,pos:[3.5,2.05,4.1],fov:48,focus:[.1,1.45,0]},
 {name:'IMPACT',start:.67,end:.84,pos:[-2.8,1.75,3.0],fov:52,focus:[.25,1.45,.25]},
 {name:'FINISH',start:.84,end:1.01,pos:[5.4,2.15,-2.9],fov:44,focus:[0,1.3,0]}
];
let currentShot=-1;
function cameraDirector(t,hit){const n=(t%plan.duration)/plan.duration;let idx=shots.findIndex(s=>n>=s.start&&n<s.end);if(idx<0)idx=shots.length-1;const s=shots[idx];if(currentShot!==idx){currentShot=idx;camera.position.set(...s.pos);camera.fov=s.fov;camera.updateProjectionMatrix();shotLabel.textContent='SHOT '+String(idx+1).padStart(2,'0')+' · '+s.name}const focus=new THREE.Vector3(...s.focus);if(cameraMode==='wide'){camera.position.set(6.8,3.35,8.2);camera.fov=44}else if(cameraMode==='side'){camera.position.set(6.7,2.35,.2);camera.fov=47}else if(cameraMode==='overhead'){camera.position.set(1.2,9.2,1.6);camera.fov=48}const shake=hit*(style==='aggressive'?.12:.07);camera.position.x+=Math.sin(t*83)*shake;camera.position.y+=Math.sin(t*67)*shake*.45;camera.lookAt(focus.x,focus.y,focus.z);flash.style.opacity=String(hit*.16);impact.style.opacity=String(hit>.72?(hit-.72)*2.4:0)}
function renderAt(t){for(const a of actors)resetActor(a,t);crowd(t);const hit=actions(t);cameraDirector(t,hit);renderer.render(scene,camera);timeLabel.textContent=t.toFixed(1)+'s';if(!scrubbing)scrub.value=String(Math.round(t/plan.duration*1000))}

const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const now=clock.getElapsedTime();if(!paused&&!scrubbing){const dt=clamp(now-last,0,.05);manualTime=(manualTime+dt)%plan.duration}last=now;renderAt(manualTime)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
document.querySelectorAll('[data-style]').forEach(btn=>{if(btn.dataset.style===style)btn.classList.add('active');btn.addEventListener('click',()=>{style=btn.dataset.style;document.querySelectorAll('[data-style]').forEach(b=>b.classList.toggle('active',b===btn));status.textContent='STYLE · '+style.toUpperCase()})});
const cameraBtn=$('#cameraBtn');cameraBtn.addEventListener('click',()=>{const modes=['director','wide','side','overhead'];cameraMode=modes[(modes.indexOf(cameraMode)+1)%modes.length];cameraBtn.textContent='CAMERA: '+cameraMode.toUpperCase();currentShot=-1});
const pauseBtn=$('#pauseBtn');pauseBtn.addEventListener('click',()=>{paused=!paused;pauseBtn.textContent=paused?'RESUME':'PAUSE'});
$('#takeBtn').addEventListener('click',()=>{microSeed++;rng=(plan.seed+microSeed*7919)|0;manualTime=0;currentShot=-1;status.textContent='TAKE '+(microSeed+2)+' · READY'});
scrub.addEventListener('pointerdown',()=>scrubbing=true);scrub.addEventListener('input',()=>{manualTime=Number(scrub.value)/1000*plan.duration;renderAt(manualTime)});scrub.addEventListener('change',()=>{scrubbing=false;last=clock.getElapsedTime()});
const recordBtn=$('#record');recordBtn.addEventListener('click',()=>{if(!renderer.domElement.captureStream||!window.MediaRecorder){recordBtn.textContent='UNSUPPORTED';return}const stream=renderer.domElement.captureStream(30),chunks=[];let mime='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm';const rec=new MediaRecorder(stream,{mimeType:mime});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onstop=()=>{const blob=new Blob(chunks,{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='proofttl-film.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),1600);recordBtn.disabled=false;recordBtn.textContent='RECORD WEBM';status.textContent='FILM · EXPORTED'};manualTime=0;currentShot=-1;paused=false;rec.start();recordBtn.disabled=true;recordBtn.textContent='RECORDING…';status.textContent='FILM · RECORDING';setTimeout(()=>rec.stop(),plan.duration*1000)});
</script></body></html>`
}

export default function LocalCinematicPreview({ prompt }: { prompt: string }) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2147483647))
  const plan = useMemo(() => parseCinematicPrompt(prompt, seed), [prompt, seed])
  const srcDoc = useMemo(() => cinematicDocument(plan), [plan])
  return (
    <section className="cine-local-movie" data-local-cinematic="true" data-cinematic-schema="proofttl-cinematic-v2">
      <div className="cine-local-head">
        <div><span>LOCAL FILM ENGINE · HUMANOID PREVIEW</span><strong>{plan.attackers > 1 ? `1 vs ${plan.attackers} · ` : ''}{plan.environment.replaceAll('_', ' ')} · {plan.style}</strong></div>
        <button type="button" onClick={() => setSeed(Math.floor(Math.random() * 2147483647))}>REGENERATE TAKE</button>
      </div>
      <iframe title="ProofTTL Cinematics local film runtime" srcDoc={srcDoc} sandbox="allow-scripts allow-downloads" />
      <small>TIMELINE IS SCRUBBABLE · Real-time humanoid cast, staged environment, discrete director shots, choreography, impact reactions, and local WebM export. No paid provider required.</small>
    </section>
  )
}
