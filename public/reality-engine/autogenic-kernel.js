(() => {
'use strict'

const VERSION='0.1.0-foundation'
const STORE='reality-engine-autogenic-kernel-v1'
const ENDPOINT='/api/reality-internet'
const CADENCE_MS=15000
const DOMAIN_COOLDOWN_MS=30000
const MAX_SESSION_FETCHES=60
const MAX_FRONTIER=220
const MAX_MEMORY=80
const MAX_DEPTH=3
const HASH_BINS=256
const SEEDS=[
  'https://en.wikipedia.org/wiki/Scientific_method',
  'https://en.wikipedia.org/wiki/Artificial_life',
  'https://arxiv.org/abs/2301.04104'
]

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n))
const now=()=>Date.now()
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))
const hash=s=>{let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const uid=(p='g')=>`${p}${Math.random().toString(36).slice(2,8)}${Date.now().toString(36).slice(-4)}`
const domainOf=u=>{try{return new URL(u).hostname.toLowerCase()}catch{return''}}

function freshGenome(generation=0,parent=null){
  const base=parent||{exploration:.45,crossDomain:.55,depthBias:.52,noveltyBias:.70}
  const jitter=(v,s=.16)=>clamp(v+(Math.random()*2-1)*s,.05,.95)
  return {
    id:uid('P'),generation,
    exploration:parent?jitter(base.exploration):base.exploration,
    crossDomain:parent?jitter(base.crossDomain):base.crossDomain,
    depthBias:parent?jitter(base.depthBias):base.depthBias,
    noveltyBias:parent?jitter(base.noveltyBias):base.noveltyBias,
    reward:0,trials:0,parent:parent?.id||null
  }
}

function initialState(){
  const frontier=SEEDS.map((url,i)=>({url,parent:null,depth:0,addedAt:now()+i,source:'seed'}))
  return {
    version:VERSION,enabled:false,generation:0,sessionFetches:0,
    experiences:[],frontier,visited:{},domainSeen:{},domainLast:{},trace:[],
    model:{bins:Array(HASH_BINS).fill(1),total:HASH_BINS,terms:{}},
    policies:[freshGenome(),freshGenome(),freshGenome(),freshGenome()],
    last:null,lastError:null
  }
}

let state=initialState()
let timer=null
let busy=false

function log(message){
  state.trace.unshift({at:now(),message:String(message)})
  state.trace=state.trace.slice(0,120)
  render()
}
function save(){
  try{
    const snapshot={...state,enabled:false,sessionFetches:0}
    localStorage.setItem(STORE,JSON.stringify(snapshot))
  }catch{}
}
function restore(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORE)||'null')
    if(!raw)return
    state={...initialState(),...raw,enabled:false,sessionFetches:0}
    if(!Array.isArray(state.policies)||state.policies.length<4)state.policies=[freshGenome(),freshGenome(),freshGenome(),freshGenome()]
    if(!state.model||!Array.isArray(state.model.bins)||state.model.bins.length!==HASH_BINS)state.model=initialState().model
    if(!Array.isArray(state.frontier))state.frontier=[]
    for(const url of SEEDS)if(!state.frontier.some(x=>x.url===url)&&!state.visited?.[url])state.frontier.push({url,parent:null,depth:0,addedAt:now(),source:'seed'})
  }catch{}
}

function tokens(text){
  const matches=String(text||'').toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g)||[]
  return matches.slice(0,5000)
}
function learnText(text){
  const list=tokens(text)
  if(!list.length)return{surprise:0,novelty:0,newTerms:0,tokenCount:0}
  let surprise=0,newTerms=0
  const seenBefore=state.model.terms||{}
  const unique=new Set()
  for(const token of list){
    const b=hash(token)%HASH_BINS
    const p=Math.max(1e-9,state.model.bins[b]/state.model.total)
    surprise+=-Math.log2(p)
    if(!seenBefore[token])newTerms++
    unique.add(token)
  }
  const novelty=newTerms/Math.max(1,list.length)
  for(const token of list){
    const b=hash(token)%HASH_BINS
    state.model.bins[b]++
    state.model.total++
    seenBefore[token]=(seenBefore[token]||0)+1
  }
  state.model.terms=seenBefore
  const entries=Object.entries(seenBefore)
  if(entries.length>1600){
    entries.sort((a,b)=>b[1]-a[1])
    state.model.terms=Object.fromEntries(entries.slice(0,1200))
  }
  return{surprise:surprise/list.length,novelty,newTerms,tokenCount:list.length,uniqueTerms:unique.size}
}

function policyAverage(p){return p.trials?p.reward/p.trials:0}
function selectPolicy(){
  const untried=state.policies.find(p=>p.trials===0)
  if(untried)return untried
  const total=Math.max(1,state.policies.reduce((s,p)=>s+p.trials,0))
  return [...state.policies].sort((a,b)=>{
    const ua=policyAverage(a)+.18*Math.sqrt(Math.log(total+1)/a.trials)
    const ub=policyAverage(b)+.18*Math.sqrt(Math.log(total+1)/b.trials)
    return ub-ua
  })[0]
}

function frontierScore(item,policy){
  const domain=domainOf(item.url)
  const unseenDomain=state.domainSeen[domain]?0:1
  const age=Math.min(1,(now()-item.addedAt)/120000)
  const depthValue=1-(item.depth/MAX_DEPTH)
  const parentDomain=item.parent?domainOf(item.parent):''
  const cross=parentDomain&&parentDomain!==domain?1:0
  const random=Math.random()
  return unseenDomain*policy.noveltyBias*2+cross*policy.crossDomain+depthValue*policy.depthBias+age*.2+random*policy.exploration
}

function chooseFrontier(policy){
  const eligible=state.frontier.filter(item=>{
    if(state.visited[item.url])return false
    const domain=domainOf(item.url)
    const last=state.domainLast[domain]||0
    return now()-last>=DOMAIN_COOLDOWN_MS
  })
  if(!eligible.length)return null
  eligible.sort((a,b)=>frontierScore(b,policy)-frontierScore(a,policy))
  return eligible[0]
}

function addLinks(links,parent,depth){
  if(depth>=MAX_DEPTH)return 0
  const parentDomain=domainOf(parent)
  const same=[],cross=[]
  for(const url of links||[]){
    if(state.visited[url]||state.frontier.some(x=>x.url===url))continue
    const item={url,parent,depth:depth+1,addedAt:now(),source:'crawl'}
    if(domainOf(url)===parentDomain)same.push(item);else cross.push(item)
  }
  const selected=[...cross.slice(0,6),...same.slice(0,8)]
  state.frontier.push(...selected)
  if(state.frontier.length>MAX_FRONTIER)state.frontier=state.frontier.slice(-MAX_FRONTIER)
  return selected.length
}

function rewardExperience({learning,linksAdded,url,parent}){
  const surpriseScore=clamp((learning.surprise-3)/8)
  const noveltyScore=clamp(learning.novelty*6)
  const linkScore=clamp(linksAdded/12)
  const cross=parent&&domainOf(parent)!==domainOf(url)?1:0
  return clamp(noveltyScore*.38+surpriseScore*.28+linkScore*.20+cross*.14)
}

function evolvePolicies(){
  if(state.experiences.length<8||state.experiences.length%8!==0)return
  const ranked=[...state.policies].sort((a,b)=>policyAverage(b)-policyAverage(a))
  const parents=ranked.slice(0,2)
  state.generation++
  state.policies=[
    {...parents[0],generation:state.generation,reward:0,trials:0},
    {...parents[1],generation:state.generation,reward:0,trials:0},
    freshGenome(state.generation,parents[0]),
    freshGenome(state.generation,parents[1])
  ]
  log(`EVOLUTION · network policy generation ${state.generation} · parents ${parents.map(p=>p.id).join(' + ')}`)
}

async function gatewayObserve(url){
  const response=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({url})})
  const data=await response.json().catch(()=>({}))
  if(response.status===410){const error=new Error(data.error||'legacy_route_retired');error.permanent=true;throw error}
  if(!response.ok)throw new Error(data.error||`internet_http_${response.status}`)
  return data
}

async function observe(url,{policy=null,parent=null,depth=0,source='manual'}={}){
  if(busy)throw new Error('kernel_busy')
  busy=true
  render()
  try{
    const data=await gatewayObserve(url)
    const learning=learnText(data.text)
    const linksAdded=addLinks(data.links,data.url,depth)
    const reward=rewardExperience({learning,linksAdded,url:data.url,parent})
    const p=policy||selectPolicy()
    if(p){p.reward+=reward;p.trials++}
    const domain=domainOf(data.url)
    state.visited[data.url]={at:now(),fingerprint:data.fingerprint}
    state.domainSeen[domain]=(state.domainSeen[domain]||0)+1
    state.domainLast[domain]=now()
    state.frontier=state.frontier.filter(x=>x.url!==data.url)
    const exp={
      at:now(),url:data.url,title:data.title||domain,domain,parent,depth,source,
      fingerprint:data.fingerprint,bytes:data.bytes,links:data.links?.length||0,linksAdded,
      surprise:learning.surprise,novelty:learning.novelty,newTerms:learning.newTerms,tokenCount:learning.tokenCount,
      reward,policyId:p?.id||null,policyGeneration:p?.generation??state.generation
    }
    state.experiences.push(exp)
    state.experiences=state.experiences.slice(-MAX_MEMORY)
    state.last=exp
    state.lastError=null
    state.sessionFetches++
    evolvePolicies()
    save()
    log(`EXPERIENCE · ${domain} · surprise ${learning.surprise.toFixed(2)}b/token · novelty ${(learning.novelty*100).toFixed(1)}% · reward ${reward.toFixed(2)}`)
    window.dispatchEvent(new CustomEvent('reality:internet-experience',{detail:{...exp,textSample:String(data.text||'').slice(0,1200)}}))
    return exp
  }catch(error){
    state.lastError=String(error?.message||error)
    if(error?.permanent){disable();log(`NETWORK PAUSED · gateway unavailable · ${state.lastError}`)}else log(`NETWORK REJECTED · ${state.lastError}`)
    throw error
  }finally{
    busy=false
    render()
  }
}

async function cycle(){
  if(!state.enabled||busy)return
  if(state.sessionFetches>=MAX_SESSION_FETCHES){disable();log(`NETWORK PAUSED · ${MAX_SESSION_FETCHES} observations reached this session`);return}
  const policy=selectPolicy()
  const item=chooseFrontier(policy)
  if(!item){
    log('NETWORK FRONTIER · no eligible public page yet; waiting for domain cooldown')
    schedule()
    return
  }
  try{await observe(item.url,{policy,parent:item.parent,depth:item.depth,source:'autogenic'})}catch{}
  schedule()
}
function schedule(){clearTimeout(timer);if(state.enabled)timer=setTimeout(cycle,CADENCE_MS)}
function enable(){state.enabled=true;log('NETWORK ORGAN · enabled · read-only public HTTPS');render();cycle()}
function disable(){state.enabled=false;clearTimeout(timer);timer=null;save();render()}
function addSeed(url){
  let normalized
  try{normalized=new URL(String(url||'').trim()).href}catch{throw new Error('invalid_url')}
  if(!/^https:/.test(normalized))throw new Error('https_required')
  if(!state.visited[normalized]&&!state.frontier.some(x=>x.url===normalized))state.frontier.unshift({url:normalized,parent:null,depth:0,addedAt:now(),source:'operator'})
  save();render();return normalized
}

function injectUI(){
  if(document.querySelector('#autogenic-kernel'))return
  const release=[...document.querySelectorAll('.section')].find(s=>s.textContent.includes('RELEASE HEALTH'))
  const section=document.createElement('section')
  section.className='section'
  section.id='autogenic-kernel'
  section.innerHTML=`
    <div class="section-head"><div><div class="kicker">AUTOGENIC KERNEL / WORLD BRIDGE</div><h2>The organism can now learn from the public internet.</h2></div><span class="pill warn" id="ak-status">NETWORK OFF</span></div>
    <div class="card ak-grid">
      <div><span>Experience memory</span><strong id="ak-exp">0</strong><small>sanitized public pages</small></div>
      <div><span>Policy generation</span><strong id="ak-gen">0</strong><small>fetch strategy evolution</small></div>
      <div><span>Frontier</span><strong id="ak-frontier">0</strong><small>unseen candidate pages</small></div>
      <div><span>Learned terms</span><strong id="ak-terms">0</strong><small>online compressor vocabulary</small></div>
      <div><span>Last surprise</span><strong id="ak-surprise">—</strong><small>bits per observed token</small></div>
      <div><span>Session observations</span><strong id="ak-session">0 / ${MAX_SESSION_FETCHES}</strong><small>one request every ${CADENCE_MS/1000}s max</small></div>
    </div>
    <div class="card ak-control">
      <div class="actions"><button class="btn primary" id="ak-toggle">Enable read-only internet</button><input id="ak-url" type="url" value="https://en.wikipedia.org/wiki/Scientific_method" aria-label="Public HTTPS URL"><button class="btn" id="ak-observe">Observe once</button></div>
      <p><b>IMMUTABLE NETWORK LAW:</b> public HTTPS GET only. No credentials, no POST/DELETE, no localhost/LAN, no file uploads, no purchases, no page scripts. Internet data becomes experience; it cannot award epistemic depth.</p>
    </div>
    <div class="trace card" id="ak-trace"></div>`
  if(release)release.before(section);else document.querySelector('main')?.appendChild(section)
  const style=document.createElement('style')
  style.textContent=`.ak-grid{display:grid;grid-template-columns:repeat(6,1fr)}.ak-grid>div{padding:16px;border-right:1px solid var(--line)}.ak-grid span{display:block;color:var(--muted);font-size:11px}.ak-grid strong{display:block;font-size:20px;margin:4px 0}.ak-grid small{color:#53727d}.ak-control{margin-top:12px;padding:16px}.ak-control p{margin:12px 0 0;color:#78939d;font-size:11px}.ak-control input{min-width:380px;flex:1;border:1px solid #28444e;background:#030a0e;color:#cbe6ee;border-radius:9px;padding:10px 12px;font:inherit}#ak-trace{margin-top:12px;height:190px}@media(max-width:950px){.ak-grid{grid-template-columns:1fr 1fr 1fr}}@media(max-width:600px){.ak-grid{grid-template-columns:1fr}.ak-control input{min-width:0;width:100%}}`
  document.head.appendChild(style)
  document.querySelector('#ak-toggle').onclick=()=>state.enabled?disable():enable()
  document.querySelector('#ak-observe').onclick=async()=>{
    const input=document.querySelector('#ak-url')
    try{const url=addSeed(input.value);await observe(url,{source:'manual'})}catch(error){log(`OPERATOR OBSERVE · ${error.message}`)}
  }
}

function render(){
  const q=s=>document.querySelector(s)
  if(!q('#autogenic-kernel'))return
  const terms=Object.keys(state.model.terms||{}).length
  q('#ak-exp').textContent=state.experiences.length
  q('#ak-gen').textContent=state.generation
  q('#ak-frontier').textContent=state.frontier.length
  q('#ak-terms').textContent=terms
  q('#ak-surprise').textContent=state.last?`${state.last.surprise.toFixed(2)} b`:'—'
  q('#ak-session').textContent=`${state.sessionFetches} / ${MAX_SESSION_FETCHES}`
  const status=q('#ak-status')
  status.textContent=busy?'OBSERVING':state.enabled?'NETWORK LEARNING':'NETWORK OFF'
  status.className=`pill ${busy?'warn':state.enabled?'good':'warn'}`
  const toggle=q('#ak-toggle')
  toggle.textContent=state.enabled?'Disable internet loop':'Enable read-only internet'
  toggle.className=`btn ${state.enabled?'danger':'primary'}`
  const trace=q('#ak-trace')
  trace.innerHTML=state.trace.map(x=>`<div><time>${new Date(x.at).toLocaleTimeString()}</time>${esc(x.message)}</div>`).join('')||'<div>Network sensory organ waiting.</div>'
}

function exportState(){
  return {
    version:VERSION,enabled:state.enabled,generation:state.generation,
    experiences:state.experiences,frontier:state.frontier.slice(0,80),policies:state.policies,
    model:{total:state.model.total,terms:Object.entries(state.model.terms||{}).sort((a,b)=>b[1]-a[1]).slice(0,200)},
    constraints:{readOnly:true,publicHttpsOnly:true,globalCadenceMs:CADENCE_MS,domainCooldownMs:DOMAIN_COOLDOWN_MS,maxSessionFetches:MAX_SESSION_FETCHES}
  }
}

function init(){restore();injectUI();render();log(`AUTOGENIC KERNEL ${VERSION} · network organ ready but disabled by default`)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()

window.RealityAutogenicKernel={
  VERSION,
  enable,disable,observe:(url)=>observe(url,{source:'operator-api'}),addSeed,
  getState:()=>exportState(),
  resetNetworkMemory:()=>{disable();localStorage.removeItem(STORE);state=initialState();render();log('NETWORK MEMORY · reset')}
}
})()