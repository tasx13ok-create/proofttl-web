import * as THREE from 'https://esm.sh/three@0.179.1';
import { GLTFLoader } from 'https://esm.sh/three@0.179.1/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'https://esm.sh/three@0.179.1/examples/jsm/utils/SkeletonUtils.js';

const plan = JSON.parse(document.querySelector('#cine-plan')?.textContent || '{}');
const $ = (selector) => document.querySelector(selector);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smooth = (x) => x * x * (3 - 2 * x);
const pulse = (t, a, b) => t < a || t > b ? 0 : Math.sin(Math.PI * (t - a) / (b - a));
const duration = Math.max(8, Number(plan.duration) || 14.8);

$('#prompt').textContent = plan.prompt || 'ProofTTL cinematic';
$('#durationLabel').textContent = `${duration.toFixed(1)}s`;

let randomState = Number(plan.seed) || 1;
const rand = () => ((randomState = Math.imul(1664525, randomState) + 1013904223 | 0) >>> 0) / 4294967296;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07090d);
scene.fog = new THREE.FogExp2(0x080b10, 0.032);

const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.1, 100);
camera.position.set(6.6, 3.15, 7.8);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
$('#app').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x7894b3, 0x130e0d, 1.2));
const key = new THREE.SpotLight(0xffb67c, 100, 30, Math.PI / 5.2, 0.56, 1.4);
key.position.set(-4.5, 8.2, 4.8);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const rim = new THREE.SpotLight(0x477cff, 70, 26, Math.PI / 4, 0.7, 1.35);
rim.position.set(7.5, 5.2, -6.5);
scene.add(rim);
const warm = new THREE.PointLight(0xff6d32, 18, 9, 2);
warm.position.set(-3.8, 3.3, -2.6);
scene.add(warm);
const cool = new THREE.PointLight(0x2968ff, 15, 10, 2);
cool.position.set(4.2, 2.5, 2.1);
scene.add(cool);

const standard = (color, roughness = 0.78, metalness = 0.03) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const addBox = (w, h, d, color, roughness = 0.78, metalness = 0.03) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), standard(color, roughness, metalness));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
};

// Cinematic restaurant-kitchen set.
const floor = addBox(20, 0.16, 18, 0x22262d, 0.95, 0.01);
floor.position.y = -0.09;
const backWall = addBox(20, 5, 0.2, 0x10141a, 0.9, 0.01);
backWall.position.set(0, 2.5, -7.5);
const sideWall = addBox(0.2, 5, 15, 0x12171d, 0.9, 0.01);
sideWall.position.set(-8.2, 2.5, -0.2);
for (let i = 0; i < 5; i++) {
  const counter = addBox(2.1, 0.88, 0.92, 0x414a54, 0.38, 0.54);
  counter.position.set(-5.45 + i * 2.62, 0.44, -5.65);
}
const table = addBox(2.6, 0.12, 1.42, 0x4d4037, 0.72, 0.12);
table.position.set(0.35, 0.96, 0.72);
for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
  const leg = addBox(0.11, 0.96, 0.11, 0x24272c, 0.56, 0.46);
  leg.position.set(0.35 + sx * 1.02, 0.47, 0.72 + sz * 0.49);
}
for (let i = 0; i < 3; i++) {
  const fixture = addBox(1.55, 0.07, 0.22, 0xd6ad73, 0.35, 0.18);
  fixture.position.set(-4 + i * 4, 4.18, -2.4);
  const practical = new THREE.PointLight(0xffb56b, 7.2, 5.5, 2);
  practical.position.copy(fixture.position);
  practical.position.y -= 0.18;
  scene.add(practical);
}
for (let i = 0; i < 10; i++) {
  const prop = addBox(0.22 + rand() * 0.35, 0.2 + rand() * 0.4, 0.22 + rand() * 0.33, i % 2 ? 0x66727d : 0x303841, 0.52, 0.3);
  prop.position.set(-5.2 + i * 1.07, 0.95, -5.4);
}
const bottles = [];
for (let i = 0; i < 5; i++) {
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.073, 0.34, 10), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x6f9784 : 0x74828f, roughness: 0.34, metalness: 0.08, transparent: true, opacity: 0.88 }));
  bottle.castShadow = true;
  bottle.position.set(-2.2 + i * 0.38, 1.13, -5.08);
  bottle.userData.home = bottle.position.clone();
  scene.add(bottle);
  bottles.push(bottle);
}

const CHARACTER_URL = 'https://raw.githubusercontent.com/Seyamalam/blood-league-kickoff/main/public/assets/vendor/quaternius/night-striker.glb';
const ANIMATION_URL = 'https://raw.githubusercontent.com/Seyamalam/blood-league-kickoff/main/public/assets/vendor/quaternius/universal-animation-library.glb';
const actors = [];
const startPositions = [
  [-1.15, 0, 0.15], [1.45, 0, 0.1], [0.15, 0, -2.25], [0.3, 0, 2.4],
  [-3.2, 0, -0.85], [3.15, 0, -0.95], [-2.65, 0, 2.35], [2.55, 0, 2.45],
];

function fallbackHuman(index) {
  const group = new THREE.Group();
  const skin = index === 0 ? 0xd39b73 : 0xb98264;
  const cloth = index === 0 ? 0xa72f2f : 0x263c59;
  const toon = (color) => new THREE.MeshToonMaterial({ color });
  const add = (geometry, material) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };
  const torso = add(new THREE.CapsuleGeometry(0.31, 0.72, 8, 12), toon(cloth));
  torso.position.y = 1.28;
  const head = add(new THREE.SphereGeometry(0.23, 18, 14), toon(skin));
  head.position.y = 2.04;
  for (const side of [-1, 1]) {
    const arm = add(new THREE.CapsuleGeometry(0.085, 0.69, 6, 10), toon(skin));
    arm.position.set(0.47 * side, 1.38, 0);
    arm.rotation.z = 0.19 * side;
    const leg = add(new THREE.CapsuleGeometry(0.115, 0.8, 6, 10), toon(cloth));
    leg.position.set(0.2 * side, 0.47, 0);
  }
  return group;
}

const clipNames = (clips) => clips.map((clip) => clip.name);
const findClip = (clips, patterns) => {
  for (const pattern of patterns) {
    const found = clips.find((clip) => pattern.test(clip.name));
    if (found) return found;
  }
  return undefined;
};

function makeActor(root, index, clips) {
  const ownedMaterials = [];
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const surfaces = Array.isArray(node.material) ? node.material : [node.material];
    const cloned = surfaces.map((surface) => {
      const copy = surface.clone();
      ownedMaterials.push(copy);
      if (copy.color) copy.color.multiply(index === 0 ? new THREE.Color(1.08, 0.72, 0.68) : new THREE.Color(0.68, 0.82, 1.04));
      if ('roughness' in copy) copy.roughness = index === 0 ? 0.68 : 0.74;
      return copy;
    });
    node.material = Array.isArray(node.material) ? cloned : cloned[0];
  });
  const mixer = new THREE.AnimationMixer(root);
  const library = {
    idle: findClip(clips, [/^Idle_Loop$/i, /idle.*loop/i, /^idle$/i]),
    jog: findClip(clips, [/Jog_Fwd_Loop/i, /jog.*fwd/i, /walk.*fwd/i, /walk/i]),
    sprint: findClip(clips, [/Sprint_Loop/i, /sprint/i, /run/i]),
    punch: findClip(clips, [/Punch_Cross/i, /punch.*cross/i, /punch/i]),
    kick: findClip(clips, [/kick.*round/i, /round.*kick/i, /kick/i]),
    hit: findClip(clips, [/^Hit_A$/i, /hit/i]),
    dodge: findClip(clips, [/roll/i, /dodge/i, /evade/i]),
  };
  const actions = {};
  for (const [name, clip] of Object.entries(library)) if (clip) actions[name] = mixer.clipAction(clip);
  const actor = {
    root, index, mixer, actions, active: '', phase: rand() * 6.28,
    home: new THREE.Vector3(...startPositions[index % startPositions.length]),
    lastActionKey: '', ownedMaterials,
  };
  root.position.copy(actor.home);
  root.rotation.y = Math.PI;
  root.scale.setScalar(index === 0 ? 1.02 : 0.97 + rand() * 0.035);
  scene.add(root);
  actors.push(actor);
  playClip(actor, 'idle', true, 0.01);
  return actor;
}

function playClip(actor, name, restart = false, fade = 0.09) {
  const next = actor.actions[name] || actor.actions.idle;
  if (!next) return;
  const previous = actor.actions[actor.active];
  if (previous !== next) {
    previous?.fadeOut(fade);
    next.reset().fadeIn(fade).play();
  } else if (restart) next.reset().play();
  if (name !== 'idle' && name !== 'jog' && name !== 'sprint') {
    next.setLoop(THREE.LoopOnce, 1);
    next.clampWhenFinished = true;
  } else {
    next.setLoop(THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = false;
  }
  actor.active = name;
}

async function loadCast() {
  const loader = new GLTFLoader();
  try {
    const [character, animationPack] = await Promise.all([loader.loadAsync(CHARACTER_URL), loader.loadAsync(ANIMATION_URL)]);
    const clips = animationPack.animations;
    console.info('ProofTTL animation library', clipNames(clips));
    const count = Math.min(1 + Number(plan.attackers || 3), 8);
    for (let index = 0; index < count; index++) makeActor(cloneSkinned(character.scene), index, clips);
    $('#status').textContent = `LOCAL FILM · ${count} SKINNED ACTORS`;
  } catch (error) {
    console.warn('CC0 humanoid cast unavailable, using fallback', error);
    const count = Math.min(1 + Number(plan.attackers || 3), 8);
    for (let index = 0; index < count; index++) makeActor(fallbackHuman(index), index, []);
    $('#status').textContent = 'LOCAL FILM · FALLBACK CAST';
  } finally {
    $('#loading').classList.add('hide');
  }
}

await loadCast();

const actorById = (id) => {
  if (id === 'hero') return actors[0];
  const index = Number(String(id || '').split('-')[1] || 1);
  return actors[clamp(index, 1, actors.length - 1)];
};
const face = (actor, target) => {
  if (!actor || !target) return;
  const delta = target.root.position.clone().sub(actor.root.position);
  actor.root.rotation.y = Math.atan2(delta.x, delta.z);
};

let style = plan.style || 'cinematic';
let paused = false;
let scrubbing = false;
let manualTime = 0;
let lastClock = 0;
let take = 1;
let cameraMode = 'director';
let currentShot = -1;
let lastAudioImpact = -10;
const scrub = $('#scrub');
const timeLabel = $('#timeLabel');
const shotLabel = $('#shotLabel');
const flash = $('#flash');
const impactLabel = $('#impact');

function resetPerformance(t) {
  for (const actor of actors) {
    actor.root.position.lerp(actor.home, 0.18);
    actor.root.rotation.x *= 0.65;
    actor.root.rotation.z *= 0.65;
    if (!actor.active || !actor.actions[actor.active]?.isRunning()) playClip(actor, 'idle', false, 0.12);
  }
  if (actors[1]) face(actors[0], actors[1]);
  for (let index = 1; index < actors.length; index++) face(actors[index], actors[0]);
}

function crowdPerformance(t) {
  if (actors.length < 2) return;
  const hero = actors[0];
  for (let index = 1; index < actors.length; index++) {
    const actor = actors[index];
    const relevant = (plan.actions || []).some((action) => action.actorId === `enemy-${index}` && t > action.start - 0.5 && t < action.start + action.duration + 0.5);
    const angle = ((index - 1) / Math.max(1, actors.length - 1)) * Math.PI * 2 + Math.sin(t * 0.28 + index) * 0.12;
    const radius = relevant ? 1.55 : 2.7 + (index % 2) * 0.28;
    actor.home.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius * 0.82);
    if (!relevant && actor.actions.idle && actor.active !== 'idle') playClip(actor, 'idle', false, 0.12);
    face(actor, hero);
  }
}

function desiredClip(action) {
  if (!action) return 'idle';
  if (action.action === 'approach') return 'jog';
  if (['jab', 'cross', 'hook'].includes(action.action)) return 'punch';
  if (action.action === 'kick' || action.action === 'spinning_kick') return 'kick';
  if (action.action === 'dodge') return 'dodge';
  if (action.action === 'stagger') return 'hit';
  if (action.action === 'throw') return 'punch';
  if (action.action === 'block' || action.action === 'parry') return 'idle';
  return 'idle';
}

function evaluateActions(t) {
  let strongestImpact = 0;
  for (let actionIndex = 0; actionIndex < (plan.actions || []).length; actionIndex++) {
    const action = plan.actions[actionIndex];
    const local = t - action.start;
    if (local < -0.28 || local > action.duration + 0.36) continue;
    const actor = actorById(action.actorId);
    const target = action.targetId ? actorById(action.targetId) : undefined;
    if (!actor) continue;
    if (target) face(actor, target);
    const progress = clamp(local / Math.max(0.001, action.duration), 0, 1);
    const envelope = pulse(local, 0, action.duration);
    const key = `${take}:${actionIndex}`;
    if (local >= 0 && actor.lastActionKey !== key) {
      const clip = desiredClip(action);
      playClip(actor, clip, true, 0.065);
      actor.lastActionKey = key;
    }
    if (action.action === 'approach' && target) {
      const delta = target.root.position.clone().sub(actor.root.position); delta.y = 0;
      if (delta.length() > 1.28) actor.root.position.add(delta.normalize().multiplyScalar(0.035 + envelope * 0.025));
    }
    if (action.action === 'dodge') {
      actor.root.position.x += (actor.index === 0 ? -1 : 1) * envelope * 0.045;
      actor.root.rotation.z += (actor.index === 0 ? 0.1 : -0.1) * envelope;
    }
    if (action.action === 'spinning_kick') actor.root.rotation.y += smooth(progress) * Math.PI * 2;
    if (action.action === 'throw' && target) {
      const q = smooth(progress);
      target.root.position.lerp(new THREE.Vector3(0.7, 0, 0.75), 0.08 * q);
      target.root.rotation.z = -0.92 * envelope;
    }
    if (action.outcome === 'hit' || action.outcome === 'throw_success') {
      const hit = pulse(local, action.duration * 0.46, action.duration * 0.59);
      strongestImpact = Math.max(strongestImpact, hit * (action.cameraWeight || 0.7));
      if (target && hit > 0.55 && target.lastActionKey !== `${key}:hit`) {
        playClip(target, 'hit', true, 0.035);
        target.lastActionKey = `${key}:hit`;
      }
      if (target) {
        const direction = actor.root.position.x < target.root.position.x ? 1 : -1;
        target.root.position.x += direction * hit * 0.018;
        target.root.rotation.z -= direction * hit * 0.07;
      }
    }
    if (action.outcome === 'blocked') strongestImpact = Math.max(strongestImpact, pulse(local, action.duration * 0.44, action.duration * 0.55) * 0.46);
  }
  return strongestImpact;
}

function propPerformance(t) {
  for (const bottle of bottles) {
    bottle.position.copy(bottle.userData.home);
    bottle.rotation.set(0, 0, 0);
  }
  table.rotation.set(0, 0, 0);
  table.position.y = 0.96;
  const blocked = (plan.actions || []).find((action) => action.outcome === 'blocked');
  if (blocked && bottles[0]) {
    const local = t - blocked.start;
    const q = clamp((local + 0.18) / (blocked.duration + 0.42), 0, 1);
    if (local > -0.18 && local < blocked.duration + 0.25) {
      const bottle = bottles[0];
      if (q < 0.5) bottle.position.lerpVectors(bottle.userData.home, new THREE.Vector3(-0.55, 1.55, 0.12), smooth(q / 0.5));
      else {
        const r = smooth((q - 0.5) / 0.5);
        bottle.position.lerpVectors(new THREE.Vector3(-0.55, 1.55, 0.12), new THREE.Vector3(-2.8, 0.25, 2.1), r);
        bottle.position.y += Math.sin(r * Math.PI) * 1.2;
      }
      bottle.rotation.x = q * 13;
      bottle.rotation.z = q * 8;
    }
  }
  const thrown = (plan.actions || []).find((action) => action.outcome === 'throw_success');
  if (thrown) {
    const hit = pulse(t - thrown.start, thrown.duration * 0.46, thrown.duration * 0.7);
    table.rotation.z = hit * 0.035;
    table.position.y = 0.96 + hit * 0.025;
  }
}

const shots = [
  { name: 'ESTABLISH', start: 0.00, end: 0.18, pos: [6.7, 3.2, 7.9], fov: 42, focus: [0, 1.2, 0] },
  { name: 'PRESSURE',  start: 0.18, end: 0.39, pos: [-5.4, 2.35, 4.6], fov: 46, focus: [0, 1.32, 0] },
  { name: 'COUNTER',   start: 0.39, end: 0.62, pos: [3.55, 2.02, 4.0], fov: 49, focus: [0.05, 1.4, 0] },
  { name: 'IMPACT',    start: 0.62, end: 0.80, pos: [-2.75, 1.78, 3.0], fov: 52, focus: [0.2, 1.36, 0.25] },
  { name: 'FINISH',    start: 0.80, end: 1.01, pos: [5.35, 2.12, -2.95], fov: 44, focus: [0, 1.28, 0] },
];

function cameraPerformance(t, impact) {
  const normalized = (t % duration) / duration;
  let index = shots.findIndex((shot) => normalized >= shot.start && normalized < shot.end);
  if (index < 0) index = shots.length - 1;
  const shot = shots[index];
  if (currentShot !== index) {
    currentShot = index;
    shotLabel.textContent = `SHOT ${String(index + 1).padStart(2, '0')} · ${shot.name}`;
  }
  if (cameraMode === 'wide') { camera.position.set(6.9, 3.35, 8.35); camera.fov = 44; }
  else if (cameraMode === 'side') { camera.position.set(6.7, 2.35, 0.2); camera.fov = 47; }
  else if (cameraMode === 'overhead') { camera.position.set(1.2, 9.2, 1.6); camera.fov = 48; }
  else { camera.position.set(...shot.pos); camera.fov = shot.fov; }
  camera.updateProjectionMatrix();
  const shake = impact * (style === 'aggressive' ? 0.13 : style === 'cinematic' ? 0.075 : 0.05);
  camera.position.x += Math.sin(t * 83) * shake;
  camera.position.y += Math.sin(t * 67) * shake * 0.45;
  camera.lookAt(...shot.focus);
  flash.style.opacity = String(impact * 0.14);
  impactLabel.style.opacity = String(impact > 0.76 ? (impact - 0.76) * 2.8 : 0);
}

function renderAt(t, dt = 0) {
  for (const actor of actors) actor.mixer.update(dt);
  resetPerformance(t);
  crowdPerformance(t);
  propPerformance(t);
  const hit = evaluateActions(t);
  cameraPerformance(t, hit);
  renderer.render(scene, camera);
  timeLabel.textContent = `${t.toFixed(1)}s`;
  if (!scrubbing) scrub.value = String(Math.round(t / duration * 1000));
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const now = clock.getElapsedTime();
  const dt = clamp(now - lastClock, 0, 0.05);
  if (!paused && !scrubbing) manualTime = (manualTime + dt) % duration;
  lastClock = now;
  renderAt(manualTime, dt);
}
animate();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

document.querySelectorAll('[data-style]').forEach((button) => {
  if (button.dataset.style === style) button.classList.add('active');
  button.addEventListener('click', () => {
    style = button.dataset.style;
    document.querySelectorAll('[data-style]').forEach((candidate) => candidate.classList.toggle('active', candidate === button));
    $('#status').textContent = `STYLE · ${style.toUpperCase()}`;
  });
});

$('#cameraBtn').addEventListener('click', () => {
  const modes = ['director', 'wide', 'side', 'overhead'];
  cameraMode = modes[(modes.indexOf(cameraMode) + 1) % modes.length];
  $('#cameraBtn').textContent = `CAMERA: ${cameraMode.toUpperCase()}`;
  currentShot = -1;
});
$('#pauseBtn').addEventListener('click', () => {
  paused = !paused;
  $('#pauseBtn').textContent = paused ? 'RESUME' : 'PAUSE';
});
$('#takeBtn').addEventListener('click', () => {
  take += 1;
  randomState = (Number(plan.seed) + take * 7919) | 0;
  manualTime = 0;
  currentShot = -1;
  for (const actor of actors) actor.lastActionKey = '';
  $('#status').textContent = `TAKE ${take} · READY`;
});
scrub.addEventListener('pointerdown', () => { scrubbing = true; });
scrub.addEventListener('input', () => {
  manualTime = Number(scrub.value) / 1000 * duration;
  renderAt(manualTime, 0);
});
scrub.addEventListener('change', () => { scrubbing = false; lastClock = clock.getElapsedTime(); });

$('#record').addEventListener('click', () => {
  const button = $('#record');
  if (!renderer.domElement.captureStream || !window.MediaRecorder) { button.textContent = 'UNSUPPORTED'; return; }
  const stream = renderer.domElement.captureStream(30);
  const chunks = [];
  let mime = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'proofttl-film.webm';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1600);
    button.disabled = false;
    button.textContent = 'RECORD WEBM';
    $('#status').textContent = 'FILM · EXPORTED';
  };
  manualTime = 0;
  currentShot = -1;
  for (const actor of actors) actor.lastActionKey = '';
  paused = false;
  recorder.start();
  button.disabled = true;
  button.textContent = 'RECORDING…';
  $('#status').textContent = 'FILM · RECORDING';
  setTimeout(() => recorder.stop(), duration * 1000);
});
