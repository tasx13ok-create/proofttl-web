'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'

const API = 'https://evrsofjaaudibnihjafb.supabase.co/functions/v1/foundry10-api'
const KEY_STORAGE = 'foundry10.operatorKey'

type Agent = {
  id:string; slug:string; name:string; role:string; objective:string; status:string;
  last_action?:string|null; revenue_influenced_cents:number; cost_used_cents:number;
  blocker?:string|null; confidence:number; current_task_id?:string|null
}
type Experiment = {
  id:string; slug:string; title:string; target_buyer:string; why_pay:string;
  monetization_method:string; status:string; score:number; compliance_risk:number;
  revenue_cents:number; cost_cents:number; clicks:number; conversions:number;
  price_cents?:number|null; kill_reason?:string|null
}
type Task = {
  id:string; experiment_id:string; title:string; task_type:string; state:string;
  priority:number; important:boolean; required_touches:number; touch_count:number;
  claimed_by?:string|null; reviewer_id?:string|null; output:any; blocker?:string|null
}
type Approval = {
  id:string; experiment_id?:string|null; task_id?:string|null; approval_type:string;
  status:string; request_payload:any; decision_note?:string|null; created_at:string
}
type Settings = {
  paused:boolean; spending_cap_cents:number; revenue_goal_cents:number; risk_tolerance:number;
  earned_revenue_cents:number; total_cost_cents:number; reinvestment_cap_cents:number
}
type State = {
  agents:Agent[]; experiments:Experiment[]; tasks:Task[]; approvals:Approval[];
  settings:Settings; recentEvents:any[]
}

function money(cents=0){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100) }
function pct(n:number,d:number){ return d ? (n/d*100).toFixed(1)+'%' : '0.0%' }

async function callApi(key:string,path:string,init?:RequestInit){
  const res = await fetch(API+path,{
    ...init,
    headers:{'content-type':'application/json','x-foundry-key':key,...(init?.headers||{})},
    cache:'no-store',
  })
  const data = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

function Office3D({agents,experiments}:{agents:Agent[];experiments:Experiment[]}){
  const srcDoc = useMemo(()=>{
    const safeAgents = JSON.stringify(agents.map(a=>({
      name:a.name,status:a.status,role:a.role,last:a.last_action||'',rev:a.revenue_influenced_cents,cost:a.cost_used_cents,blocker:a.blocker||''
    }))).replace(/</g,'\\u003c')
    const top = [...experiments].sort((a,b)=>b.score-a.score).slice(0,5)
    const safeExperiments = JSON.stringify(top.map(e=>({title:e.title,score:e.score,status:e.status,revenue:e.revenue_cents}))).replace(/</g,'\\u003c')
    return `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;height:100%;overflow:hidden;background:#07090d;font:12px Inter,system-ui;color:#fff}
      #hud{position:absolute;left:16px;top:14px;z-index:2;padding:10px 12px;border:1px solid #ffffff24;background:#05070acc;border-radius:10px;backdrop-filter:blur(8px)}
      #hud b{display:block;font-size:13px;letter-spacing:.12em} #hud span{color:#9aa4b2}
      canvas{display:block;width:100%;height:100%}
    </style></head><body><div id="hud"><b>FOUNDRY-10 OFFICE</b><span>drag to orbit · wheel to zoom</span></div>
    <script type="module">
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.181.1/examples/jsm/controls/OrbitControls.js';
    const agents=${safeAgents}; const experiments=${safeExperiments};
    const scene=new THREE.Scene(); scene.background=new THREE.Color(0x07090d); scene.fog=new THREE.Fog(0x07090d,18,42);
    const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100); camera.position.set(14,12,18);
    const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled=true;
    const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(0,1,0); controls.enableDamping=true; controls.maxPolarAngle=Math.PI*.48;
    scene.add(new THREE.HemisphereLight(0xbfd7ff,0x18130e,1.5));
    const key=new THREE.DirectionalLight(0xffffff,2.2); key.position.set(8,14,6); key.castShadow=true; scene.add(key);
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(28,20),new THREE.MeshStandardMaterial({color:0x11151b,roughness:.82,metalness:.08})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
    const grid=new THREE.GridHelper(28,28,0x2c394d,0x151b23); grid.position.y=.01; scene.add(grid);
    function box(w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.12}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
    function label(text,x,y,z,color='#ffffff'){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='rgba(5,8,12,.88)';g.fillRect(0,0,512,128);g.strokeStyle=color;g.lineWidth=4;g.strokeRect(3,3,506,122);g.fillStyle='#fff';g.font='700 30px system-ui';g.fillText(text.slice(0,28),22,48);g.fillStyle='#9aa4b2';g.font='20px system-ui';g.fillText(text.length>28?text.slice(28,62):'',22,82);const tex=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));s.scale.set(3.6,.9,1);s.position.set(x,y,z);scene.add(s)}
    const statusColor={busy:0xf0bd4f,blocked:0xef5b5b,paused:0x7e8794,idle:0x49a6ff};
    agents.forEach((a,i)=>{const col=i%5,row=Math.floor(i/5);const x=-9+col*4.5,z=-3.4+row*7;
      box(3.2,.18,1.7,0x242b35,x,.85,z); box(.16,.8,.16,0x171b22,x-1.3,.4,z-.55);box(.16,.8,.16,0x171b22,x+1.3,.4,z-.55);
      const monitor=box(1.7,1.05,.12,statusColor[a.status]||0x49a6ff,x,1.7,z-.35); monitor.material.emissive=new THREE.Color(statusColor[a.status]||0x49a6ff); monitor.material.emissiveIntensity=.45;
      box(.9,.12,.9,0x161a20,x,1.1,z+.85); box(.08,.8,.08,0x161a20,x,1.45,z+.85);
      label(a.name+' · '+a.status,x,2.8,z,a.status==='blocked'?'#ff6b6b':a.status==='busy'?'#ffd166':'#66b3ff');
    });
    box(7.5,3.3,.25,0x141922,0,2.3,-8.3); label('EARNINGS WALL',0,3.35,-8.1,'#59ffa4');
    experiments.forEach((e,i)=>label((i+1)+'. '+e.title+' · '+Math.round(e.score),0,2.85-i*.55,-8.05,e.status==='killed'?'#ff6666':'#59ffa4'));
    // finance corner + compliance desk
    box(3.6,.2,2.3,0x202631,9,.9,6); label('FINANCE / ROI',9,2.5,6,'#59ffa4');
    box(3.6,.2,2.3,0x202631,-9,.9,6); label('RISK / APPROVALS',-9,2.5,6,'#ffcc66');
    // meeting table
    const table=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,.35,32),new THREE.MeshStandardMaterial({color:0x282f39,roughness:.7})); table.position.set(0,.75,4);table.castShadow=true;scene.add(table);label('TOP EXPERIMENTS',0,2.25,4,'#8fd3ff');
    function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)} animate();
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
    </script></body></html>`
  },[agents,experiments])
  return <iframe className={styles.officeFrame} title="FOUNDRY-10 Three.js office" srcDoc={srcDoc} />
}

export default function Foundry10Client(){
  const [key,setKey]=useState('')
  const [input,setInput]=useState('')
  const [state,setState]=useState<State|null>(null)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [view,setView]=useState<'control'|'office'|'pipeline'|'audit'>('control')
  const [econExperiment,setEconExperiment]=useState('')
  const [econRevenue,setEconRevenue]=useState('')
  const [econCost,setEconCost]=useState('')
  const [econChannel,setEconChannel]=useState('operator')

  useEffect(()=>{const k=localStorage.getItem(KEY_STORAGE)||''; if(k){setKey(k); load(k)}},[])

  async function load(k=key){
    if(!k) return
    setBusy(true);setError('')
    try{setState(await callApi(k,'/state'))}catch(e:any){setError(e.message);setState(null)}finally{setBusy(false)}
  }
  async function login(){
    localStorage.setItem(KEY_STORAGE,input.trim());setKey(input.trim());setInput('');await load(input.trim())
  }
  function logout(){localStorage.removeItem(KEY_STORAGE);setKey('');setState(null)}
  async function action(path:string,body:any={}){
    setBusy(true);setError('')
    try{await callApi(key,path,{method:'POST',body:JSON.stringify(body)});await load()}catch(e:any){setError(e.message)}finally{setBusy(false)}
  }

  async function recordEconomics(){
    if(!econExperiment) return setError('Choose an experiment.')
    const revenue=Math.round(Number(econRevenue||0)*100)
    const cost=Math.round(Number(econCost||0)*100)
    if(!Number.isFinite(revenue)||!Number.isFinite(cost)||revenue<0||cost<0) return setError('Revenue and cost must be non-negative numbers.')
    await action('/revenue',{experiment_id:econExperiment,revenue_cents:revenue,cost_cents:cost,channel:econChannel||'operator'})
    setEconRevenue('');setEconCost('')
  }

  if(!key || !state){
    return <section className={styles.login}>
      <div className={styles.loginCard}>
        <span className={styles.eyebrow}>FOUNDRY-10 / OPERATOR AUTH</span>
        <h1>Enter operator key.</h1>
        <p>This control surface can pause agents, approve launches, kill experiments, and mutate live revenue state. The key stays in this browser.</p>
        <input type="password" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} placeholder="f10_…" />
        <button onClick={login} disabled={!input||busy}>{busy?'Checking…':'Unlock control room'}</button>
        {error&&<div className={styles.error}>{error}</div>}
      </div>
    </section>
  }

  const s=state.settings
  const active=state.experiments.filter(e=>!['killed'].includes(e.status)).length
  const launched=state.experiments.filter(e=>['launched','tracking','scaling'].includes(e.status)).length
  const killed=state.experiments.filter(e=>e.status==='killed').length
  const totalClicks=state.experiments.reduce((a,e)=>a+Number(e.clicks||0),0)
  const totalConv=state.experiments.reduce((a,e)=>a+Number(e.conversions||0),0)
  const pending=state.approvals.filter(a=>a.status==='pending')

  return <div className={styles.shell}>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>AUTONOMOUS REVENUE LAB</span><h1>FOUNDRY-10</h1></div>
      <div className={styles.headerActions}>
        <span className={s.paused?styles.badgeWarn:styles.badgeOk}>{s.paused?'PAUSED':'RUNNING'}</span>
        <button onClick={()=>action('/tick')} disabled={busy}>Run one cycle</button>
        <button onClick={()=>action('/controls',{paused:!s.paused})}>{s.paused?'Resume all':'Pause all'}</button>
        <button className={styles.ghost} onClick={logout}>Lock</button>
      </div>
    </header>

    {error&&<div className={styles.error}>{error}</div>}

    <nav className={styles.tabs}>
      {(['control','office','pipeline','audit'] as const).map(v=><button key={v} className={view===v?styles.tabActive:''} onClick={()=>setView(v)}>{v}</button>)}
    </nav>

    <section className={styles.metrics}>
      <div><span>Total revenue</span><strong>{money(s.earned_revenue_cents)}</strong></div>
      <div><span>Total cost</span><strong>{money(s.total_cost_cents)}</strong></div>
      <div><span>Net profit</span><strong>{money(s.earned_revenue_cents-s.total_cost_cents)}</strong></div>
      <div><span>Reinvestable</span><strong>{money(s.reinvestment_cap_cents)}</strong></div>
      <div><span>Active experiments</span><strong>{active}</strong></div>
      <div><span>Launched / killed</span><strong>{launched} / {killed}</strong></div>
      <div><span>Conversion</span><strong>{pct(totalConv,totalClicks)}</strong></div>
      <div><span>Approvals</span><strong>{pending.length}</strong></div>
    </section>

    {view==='office'&&<section className={styles.office}><Office3D agents={state.agents} experiments={state.experiments}/></section>}

    {view==='control'&&<>
      <section className={styles.twoCol}>
        <article className={styles.panel}>
          <div className={styles.panelHead}><h2>Agent control room</h2><span>{state.agents.filter(a=>a.status==='busy').length} busy</span></div>
          <div className={styles.agentGrid}>{state.agents.map(a=><div className={styles.agent} key={a.id}>
            <div className={styles.agentTop}><strong>{a.name}</strong><span data-status={a.status}>{a.status}</span></div>
            <small>{a.role}</small><p>{a.last_action||'No action yet.'}</p>
            <div className={styles.agentMeta}><span>rev {money(a.revenue_influenced_cents)}</span><span>cost {money(a.cost_used_cents)}</span><span>conf {(Number(a.confidence)*100).toFixed(0)}%</span></div>
            {a.blocker&&<em>{a.blocker}</em>}
          </div>)}</div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}><h2>Approval / risk queue</h2><span>{pending.length} pending</span></div>
          <div className={styles.list}>{pending.length===0?<p className={styles.empty}>No pending approvals.</p>:pending.map(a=><div className={styles.row} key={a.id}>
            <div><strong>{a.approval_type.replaceAll('_',' ')}</strong><small>{new Date(a.created_at).toLocaleString()}</small></div>
            <div className={styles.rowActions}><button onClick={()=>action('/approval/'+a.id,{status:'approved',note:'Approved by operator'})}>Approve</button><button className={styles.danger} onClick={()=>action('/approval/'+a.id,{status:'rejected',note:'Rejected by operator'})}>Reject</button></div>
          </div>)}</div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}><h2>Economic governor</h2><span>earned-revenue only</span></div>
        <div className={styles.governor}>
          <label>Spending cap<input type="number" value={s.spending_cap_cents/100} min="0" onChange={e=>action('/controls',{spending_cap_cents:Math.round(Number(e.target.value)*100)})}/></label>
          <label>Revenue goal<input type="number" value={s.revenue_goal_cents/100} min="0" onChange={e=>action('/controls',{revenue_goal_cents:Math.round(Number(e.target.value)*100)})}/></label>
          <label>Risk tolerance<input type="range" min="0" max="10" value={s.risk_tolerance} onChange={e=>action('/controls',{risk_tolerance:Number(e.target.value)})}/><b>{s.risk_tolerance}/10</b></label>
          <div><span>Hard rule</span><p>No paid expansion until actual revenue exists. Current reinvestment ceiling: <b>{money(s.reinvestment_cap_cents)}</b>.</p></div>
        </div>
        <div className={styles.economicsEntry}>
          <div>
            <span className={styles.eyebrow}>REALIZED ECONOMICS ENTRY</span>
            <p>Record only money that actually happened. This writes an immutable economics event and refreshes the reinvestment governor.</p>
          </div>
          <select value={econExperiment} onChange={e=>setEconExperiment(e.target.value)}>
            <option value="">Choose experiment…</option>
            {state.experiments.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <input inputMode="decimal" value={econRevenue} onChange={e=>setEconRevenue(e.target.value)} placeholder="Revenue $" />
          <input inputMode="decimal" value={econCost} onChange={e=>setEconCost(e.target.value)} placeholder="Cost $" />
          <input value={econChannel} onChange={e=>setEconChannel(e.target.value)} placeholder="Channel" />
          <button onClick={recordEconomics} disabled={busy||!econExperiment}>Record</button>
        </div>
      </section>
    </>}

    {view==='pipeline'&&<section className={styles.panel}>
      <div className={styles.panelHead}><h2>Ranked experiment pipeline</h2><span>weighted 0–100</span></div>
      <div className={styles.experiments}>{state.experiments.map(e=><article key={e.id}>
        <div className={styles.score}>{Number(e.score).toFixed(1)}</div>
        <div className={styles.expBody}><div className={styles.expTitle}><strong>{e.title}</strong><span data-status={e.status}>{e.status}</span></div>
          <p>{e.target_buyer}</p><small>{e.why_pay}</small>
          <div className={styles.expMeta}><span>{e.monetization_method}</span><span>{money(e.price_cents||0)}</span><span>risk {e.compliance_risk}/10</span><span>rev {money(e.revenue_cents)}</span></div>
        </div>
        <button className={styles.danger} onClick={()=>action('/experiment/'+e.id+'/kill',{reason:'Killed by operator from pipeline'})}>Kill</button>
      </article>)}</div>
    </section>}

    {view==='audit'&&<section className={styles.twoCol}>
      <article className={styles.panel}><div className={styles.panelHead}><h2>Task audit log</h2><span>{state.tasks.length} tasks</span></div>
        <div className={styles.list}>{state.tasks.map(t=><div className={styles.task} key={t.id}><div><strong>{t.title}</strong><small>{t.task_type} · priority {t.priority}</small></div><span data-status={t.state}>{t.state}</span><small>{t.touch_count}/{t.required_touches} touches</small></div>)}</div>
      </article>
      <article className={styles.panel}><div className={styles.panelHead}><h2>Agent-to-agent / event log</h2><span>{state.recentEvents.length} recent</span></div>
        <div className={styles.list}>{state.recentEvents.map((e:any)=><div className={styles.event} key={e.id}><strong>{e.event_type}</strong><small>{new Date(e.created_at).toLocaleString()}</small><code>{JSON.stringify(e.payload)}</code></div>)}</div>
      </article>
    </section>}

    <footer className={styles.footer}>
      <span>FOUNDRY-10 · supervised autonomy</span>
      <span>{busy?'working…':'idle'} · provider: deterministic-v1 · LLM adapters pending credentials</span>
    </footer>
  </div>
}
