// Procedural route sculptures: no models, textures, images, or paid services.
const route = decodeURIComponent(location.hash.slice(1) || '/about/');
const seed = [...route].reduce((h, c) => ((h * 31 + c.charCodeAt(0)) >>> 0), 7);
const name = route.includes('privacy') || route.includes('trust') ? 'shield'
  : route.includes('login') || route.includes('two-factor') ? 'keyhole'
  : route.includes('status') || route.includes('lease') ? 'hourglass'
  : route.includes('sample') || route.includes('docs') || route.includes('terms') ? 'document'
  : route.includes('audit') || route.includes('stress') || route.includes('preflight') ? 'lens'
  : route.includes('connections') ? 'links' : 'orbit';
document.body.dataset.sculpture = name;
const fallback = document.querySelector('#fallback'), gpu = document.querySelector('#gpu');
const ctx = fallback.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio || 1, 1.5);
let time = 0, last = 0, raf = 0, tx = 0, ty = 0, px = 0, py = 0, scroll = 0, depth = 0, web;
let disposed = false;
// Every route gets its own number of layers, proportions, and orbital arrangement.
const variant = seed % 7, contours = [];
function loop(points, radius = .035) { contours.push({ points, radius }); }
function ellipse(rx, ry, z = 0, tilt = 0) {
  return Array.from({ length: 129 }, (_, i) => { const a = i / 128 * Math.PI * 2; return [Math.cos(a)*rx, Math.sin(a)*ry*Math.cos(tilt), z+Math.sin(a)*ry*Math.sin(tilt)] });
}
function outline(points, z) { return points.map(([x,y]) => [x,y,z]); }
for (let layer=0; layer<4; layer++) {
  const z = (layer-1.5)*(.13+variant*.009), scale=1-layer*.045;
  if(name==='shield') loop(outline([[-.88,.85],[0,1.08],[.88,.85],[.78,-.35],[.45,-.77],[0,-1.05],[-.45,-.77],[-.78,-.35],[-.88,.85]],z).map(([x,y,z])=>[x*scale,y*scale,z]),.045);
  else if(name==='document') loop(outline([[-.72,-1],[-.72,1],[.3,1],[.73,.58],[.73,-1],[-.72,-1]],z).map(([x,y,z])=>[x*scale,y*scale,z]),.04);
  else if(name==='keyhole') { loop(ellipse(.58*scale,.58*scale,z).map(([x,y,z])=>[x,y+.42,z]),.045); loop(outline([[-.23,0],[-.36,-.98],[.36,-.98],[.23,0]],z),.045); }
  else if(name==='hourglass') { loop(ellipse(.85*scale,.22,z).map(([x,y,z])=>[x,y+1,z])); loop(ellipse(.85*scale,.22,z).map(([x,y,z])=>[x,y-1,z])); loop(outline([[-.78,1],[.35,0],[-.78,-1]],z)); loop(outline([[.78,1],[-.35,0],[.78,-1]],z)); }
  else if(name==='lens') { loop(ellipse((.78+layer*.055),(.78+layer*.055),z),.055); loop(outline([[.6,-.6],[1.18,-1.18]],z),.06); }
  else if(name==='links') { loop(ellipse(.8,.45,z,.7).map(([x,y,z])=>[x-.35,y,z]),.06); loop(ellipse(.8,.45,z,-.7).map(([x,y,z])=>[x+.35,y,z]),.06); }
  else loop(ellipse(1.05+layer*.1,.76+layer*.07,z,(layer-1.5)*.55+variant*.12),.045);
}
if(name==='document') for(let j=0;j<4;j++) loop(outline([[-.43,.45-j*.3],[.36,.45-j*.3]],.3),.025);
if(name==='shield') loop(outline([[-.4,0],[-.08,-.3],[.45,.4]],.38),.055);
if(name==='orbit') loop(ellipse(.38,.38,0,1),.07);
const stars=Array.from({length:220},(_,i)=>({x:((i*16807+seed)%104729)/104729,y:((i*48271+seed)%130363)/130363,r:.3+(i%3)*.25}));
function size(){w=innerWidth;h=innerHeight;fallback.width=w*dpr;fallback.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(web){web.renderer.setSize(w,h,false);web.camera.aspect=w/h;web.camera.updateProjectionMatrix();}}
function drawFallback(){
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#070809';ctx.fillRect(0,0,w,h);
  const cx=w*(w<700?.65:.77),cy=h*.42,scale=Math.min(w*.3,h*.34);
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.8);glow.addColorStop(0,'#afcadd15');glow.addColorStop(1,'#07080900');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  for(const s of stars){ctx.fillStyle='#c8dbe44a';ctx.beginPath();ctx.arc(s.x*w,(s.y*h+time*2)%h,s.r,0,Math.PI*2);ctx.fill();}
  const yaw=Math.sin(time*.16)*.32+px*.2+depth*.00015,pitch=.15+py*.13;
  const project=([x,y,z])=>{const X=x*Math.cos(yaw)+z*Math.sin(yaw),Z=z*Math.cos(yaw)-x*Math.sin(yaw),Y=y*Math.cos(pitch)-Z*Math.sin(pitch),q=4/(4+Z);return[cx+X*scale*q,cy-Y*scale*q+Math.sin(time*.65)*8]};
  for(const c of contours){const pts=c.points.map(project);const grad=ctx.createLinearGradient(cx-scale,cy-scale,cx+scale,cy+scale);grad.addColorStop(0,'#f0f5f9');grad.addColorStop(.32,'#66747f');grad.addColorStop(.62,'#d6e2e9');grad.addColorStop(1,'#364149');ctx.strokeStyle=grad;ctx.lineWidth=c.radius*scale*1.7;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.strokeStyle='#eff7ff70';ctx.lineWidth=.7;ctx.stroke();}
}
async function start(){
  try {
    const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    if(disposed)return;
    const renderer=new THREE.WebGLRenderer({canvas:gpu,antialias:true,alpha:false,powerPreference:'low-power'});
    renderer.setPixelRatio(dpr);renderer.setSize(w,h,false);renderer.setClearColor(0x070809);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,w/h,.1,50),root=new THREE.Group();scene.add(root);
    const uniforms={uTime:{value:0}};
    const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec3 n;varying vec3 p;void main(){vec4 world=modelMatrix*vec4(position,1.);p=world.xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`,fragmentShader:`varying vec3 n;varying vec3 p;uniform float uTime;void main(){vec3 N=normalize(n+sin(p*7.+uTime*.2)*.012);vec3 V=normalize(cameraPosition-p);vec3 R=reflect(-V,N);float rim=pow(1.-max(dot(N,V),0.),3.);float key=pow(max(dot(R,normalize(vec3(-.5,1.,1.))),0.),22.);float strip=exp(-pow((R.y-.4)*13.,2.));vec3 c=vec3(.065,.085,.10)+vec3(.82,.90,1.)*(key*1.5+strip*.72+rim*.4);gl_FragColor=vec4(c,1.);}`});
    for(const c of contours){const curve=new THREE.CatmullRomCurve3(c.points.map(p=>new THREE.Vector3(...p)),false,'centripetal');root.add(new THREE.Mesh(new THREE.TubeGeometry(curve,128,c.radius,8,false),material));}
    const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars.flatMap(s=>[(s.x-.5)*20,(s.y-.5)*15,-3]),3));const starMaterial=new THREE.PointsMaterial({color:0xa7bccb,size:.012,transparent:true,opacity:.4});scene.add(new THREE.Points(starGeo,starMaterial));
    let shaderFailed=false;renderer.debug.onShaderError=()=>{shaderFailed=true};
    const dispose=()=>{root.traverse(o=>o.geometry?.dispose());material.dispose();starGeo.dispose();starMaterial.dispose();renderer.dispose()};
    web={renderer,camera,dispose,draw(){camera.position.z=6.8;camera.fov=38+Math.min(depth/1000,3);camera.updateProjectionMatrix();const viewH=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z;root.position.set(viewH*camera.aspect*(w<700?.15:.27),.42+Math.sin(time*.65)*.05,0);root.scale.setScalar(w<700?.8:1);root.rotation.set(.14+py*.12,Math.sin(time*.16)*.32+px*.22+depth*.00015,Math.sin(time*.22)*.035);uniforms.uTime.value=time;renderer.render(scene,camera)}};
    web.draw();if(shaderFailed)throw Error('Shader unavailable');gpu.style.opacity='1';document.body.dataset.renderer='webgl';
  }catch{web?.dispose();web=null;gpu.style.opacity='0';document.body.dataset.renderer='canvas';}
}
function frame(now){if(disposed||document.hidden)return;const dt=Math.min((now-(last||now))/1000,.05);last=now;if(!reduced.matches)time+=dt;px+=(tx-px)*.035;py+=(ty-py)*.035;depth+=(scroll-depth)*.035;if(web){try{web.draw()}catch{web.dispose();web=null;gpu.style.opacity='0'}}if(!web)drawFallback();raf=requestAnimationFrame(frame)}
addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='proof-scene')return;tx=Number(e.data.x)||0;ty=Number(e.data.y)||0;scroll=Number(e.data.scroll)||0});
addEventListener('resize',size);
gpu.addEventListener('webglcontextlost',e=>{e.preventDefault();web?.dispose();web=null;gpu.style.opacity='0'});
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);last=0;if(!document.hidden)raf=requestAnimationFrame(frame)});
addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(raf);web?.dispose()});
size();drawFallback();start();raf=requestAnimationFrame(frame);
