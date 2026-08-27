(() => {
'use strict'
const VERSION='0.2.0-overnight'
const STORE='reality-engine-autogenic-overnight-v1'
const CADENCE_MS=60*1000
const DOMAIN_COOLDOWN_MS=3*60*1000
const DAILY_CAP=480
let timer=null,busy=false

const now=()=>Date.now()
const dayKey=()=>new Date().toISOString().slice(0,10)
const domainOf=u=>{try{return new URL(u).hostname.toLowerCase()}catch{return''}}
function load(){try{const x=JSON.parse(localStorage.getItem(STORE)||'null')||{};if(x.day!==dayKey())return{enabled:false,day:dayKey(),count:0,lastAt:0};return{enabled:!!x.enabled,day:x.day,count:Number(x.count)||0,lastAt:Number(x.lastAt)||0}}catch{return{enabled:false,day:dayKey(),count:0,lastAt:0}}}
let state=load()
function save(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}}
function topPolicy(s){return [...(s.policies||[])].sort((a,b)=>((b.trials?b.reward/b.trials:0)-(a.trials?a.reward/a.trials:0)))[0]||{exploration:.45,crossDomain:.55,depthBias:.52,noveltyBias:.7}}
function choose(s){
  const experiences=s.experiences||[],seenDomains=new Set(experiences.map(x=>x.domain)),lastByDomain={}
  for(const x of experiences)lastByDomain[x.domain]=Math.max(lastByDomain[x.domain]||0,x.at||0)
  const p=topPolicy(s),items=(s.frontier||[]).filter(x=>now()-(lastByDomain[domainOf(x.url)]||0)>=DOMAIN_COOLDOWN_MS)
  if(!items.length)return null
  const score=x=>{const d=domainOf(x.url),parent=x.parent?domainOf(x.parent):'',unseen=seenDomains.has(d)?0:1,cross=parent&&parent!==d?1:0,depth=1-Math.min(1,(x.depth||0)/3);return unseen*(p.noveltyBias||.7)*2+cross*(p.crossDomain||.5)+depth*(p.depthBias||.5)+Math.random()*(p.exploration||.4)}
  return [...items].sort((a,b)=>score(b)-score(a))[0]
}
function render(){
  const b=document.querySelector('#ak-overnight'),note=document.querySelector('#ak-overnight-note')
  if(b){b.textContent=`Overnight loop: ${state.enabled?'on':'off'}`;b.className=`btn ${state.enabled?'primary':''}`}
  if(note)note.textContent=`${state.count}/${DAILY_CAP} overnight observations today · ${CADENCE_MS/60000} min cadence`
}
function stop(reason='operator'){state.enabled=false;clearTimeout(timer);timer=null;save();render();if(reason!=='operator')console.log('Autogenic overnight stopped:',reason)}
async function tick(){
  clearTimeout(timer);timer=null
  if(!state.enabled||busy)return
  if(state.day!==dayKey()){state.day=dayKey();state.count=0}
  if(state.count>=DAILY_CAP){stop('daily_cap');return}
  const K=window.RealityAutogenicKernel
  if(!K){timer=setTimeout(tick,5000);return}
  K.disable()
  const s=K.getState(),item=choose(s)
  if(!item){timer=setTimeout(tick,CADENCE_MS);return}
  busy=true;render()
  try{await K.observe(item.url);state.count++;state.lastAt=now();save()}catch{}
  finally{busy=false;render();if(state.enabled)timer=setTimeout(tick,CADENCE_MS)}
}
function start(){
  state.enabled=true
  if(state.day!==dayKey()){state.day=dayKey();state.count=0}
  window.RealityAutogenicKernel?.disable()
  save();render();tick()
}
function inject(){
  const actions=document.querySelector('#autogenic-kernel .ak-control .actions')
  if(!actions||document.querySelector('#ak-overnight'))return false
  const b=document.createElement('button');b.className='btn';b.id='ak-overnight';b.onclick=()=>state.enabled?stop():start();actions.appendChild(b)
  const note=document.createElement('small');note.id='ak-overnight-note';note.style.cssText='display:block;margin-top:10px;color:#66858e';actions.parentElement.appendChild(note)
  render();return true
}
function init(){
  const wait=()=>{if(!inject())return setTimeout(wait,250);if(state.enabled)start()};wait()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
window.RealityAutogenicOvernight={VERSION,start,stop,getState:()=>({...state,cadenceMs:CADENCE_MS,dailyCap:DAILY_CAP,domainCooldownMs:DOMAIN_COOLDOWN_MS})}
})()
