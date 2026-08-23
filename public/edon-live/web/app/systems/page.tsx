'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './systems.module.css';

const API='/api/edon';

type Json=Record<string,any>;
type Snapshot={
  health:Json|null;
  status:Json|null;
  controls:Json|null;
  computer:Json|null;
  cameras:Json|null;
  ready:Json|null;
  notifications:Json|null;
  checkedAt:string|null;
  errors:string[];
};

const empty:Snapshot={health:null,status:null,controls:null,computer:null,cameras:null,ready:null,notifications:null,checkedAt:null,errors:[]};

async function getJson(path:string){
  const response=await fetch(`${API}${path}`,{cache:'no-store'});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(`${path}: ${body?.error||response.status}`);
  return body as Json;
}

function ageMs(value?:string|null){const n=value?Date.parse(value):NaN;return Number.isFinite(n)?Math.max(0,Date.now()-n):Infinity}
function ageLabel(value?:string|null){const ms=ageMs(value);if(!Number.isFinite(ms))return 'never';if(ms<5000)return 'now';if(ms<60_000)return `${Math.round(ms/1000)}s ago`;if(ms<3_600_000)return `${Math.round(ms/60_000)}m ago`;return `${Math.round(ms/3_600_000)}h ago`}
function stateClass(state:string){return state==='LIVE'||state==='READY'?'live':state==='DEGRADED'?'warn':'off'}
function prettyProvider(value?:string|null){return String(value||'not used yet').replaceAll('-',' ').replaceAll('_',' ')}

export default function SystemsPage(){
  const [snap,setSnap]=useState<Snapshot>(empty);
  const [copyState,setCopyState]=useState('COPY PHONE VISION LINK');
  const [refreshing,setRefreshing]=useState(true);

  async function refresh(){
    setRefreshing(true);
    const jobs:[keyof Omit<Snapshot,'checkedAt'|'errors'>,string][]=[
      ['health','/cloud/health'],
      ['status','/status?conversationId=default'],
      ['controls','/controls'],
      ['computer','/computer/status?deviceId=primary-pc'],
      ['cameras','/cameras'],
      ['ready','/tasks/ready'],
      ['notifications','/notifications']
    ];
    const results=await Promise.allSettled(jobs.map(([,path])=>getJson(path)));
    const next:any={checkedAt:new Date().toISOString(),errors:[]};
    results.forEach((result,index)=>{
      const [key]=jobs[index];
      if(result.status==='fulfilled')next[key]=result.value;
      else {next[key]=null;next.errors.push(result.reason instanceof Error?result.reason.message:String(result.reason))}
    });
    setSnap(next as Snapshot);setRefreshing(false);
  }

  useEffect(()=>{let dead=false;const run=async()=>{if(!dead)await refresh()};void run();const id=window.setInterval(()=>{if(!dead)void refresh()},4000);return()=>{dead=true;window.clearInterval(id)}},[]);

  const heartbeat=snap.computer?.heartbeat||null;
  const pcOnline=Boolean(heartbeat&&ageMs(heartbeat.at)<75_000);
  const cameraList=Array.isArray(snap.cameras?.cameras)?snap.cameras!.cameras:[];
  const liveCameras=cameraList.filter((camera:any)=>camera?.online!==false&&!camera?.stale).length;
  const readyTasks=Array.isArray(snap.ready?.tasks)?snap.ready!.tasks:[];
  const notifications=Array.isArray(snap.notifications?.notifications)?snap.notifications!.notifications:[];
  const model=snap.health?.model||{};
  const routes=model?.routes||{};
  const configuredRoutes=Object.values(routes).filter((route:any)=>route?.state!=='MODEL_NOT_CONFIGURED').length;
  const connectedRoutes=Object.values(routes).filter((route:any)=>route?.connected===true).length;
  const runtimeLive=Boolean(snap.health?.ok);
  const entity=snap.status?.identity?.identity?.name||'Edon';
  const focus=snap.status?.identity?.attention?.primaryFocus||snap.status?.identity?.cognition?.workspace?.winner?.content||'No active global-workspace focus reported.';
  const autonomyPaused=Boolean(snap.controls?.safety?.autonomyPaused);
  const worldLocked=Boolean(snap.controls?.safety?.worldLocked);
  const backgroundEnabled=Boolean(snap.controls?.permissions?.backgroundModel);
  const cameraEnabled=Boolean(snap.controls?.permissions?.camera);
  const computerEnabled=Boolean(snap.controls?.permissions?.computer);
  const autonomyState=!autonomyPaused&&!worldLocked?'LIVE':autonomyPaused?'OFF':'DEGRADED';
  const providerState=runtimeLive&&configuredRoutes>0?(model.connected===false?'DEGRADED':'READY'):'OFF';
  const pcState=pcOnline?'LIVE':computerEnabled?'DEGRADED':'OFF';
  const cameraState=liveCameras>0?'LIVE':cameraEnabled?'READY':'OFF';
  const overall=useMemo(()=>{
    if(!runtimeLive)return 'OFFLINE';
    if(snap.errors.length||providerState==='DEGRADED'||pcState==='DEGRADED')return 'PARTIAL';
    return 'OPERATIONAL';
  },[runtimeLive,snap.errors.length,providerState,pcState]);

  async function shareVision(){
    const url=`${window.location.origin}/vision`;
    try{
      if(typeof navigator.share==='function'){await navigator.share({title:`${entity} Live Vision`,text:'Open the private Edon Vision / AR surface on the second phone.',url});setCopyState('SHARED')}
      else {await navigator.clipboard.writeText(url);setCopyState('COPIED — OPEN ON PHONE')}
    }catch{try{await navigator.clipboard.writeText(url);setCopyState('COPIED — OPEN ON PHONE')}catch{setCopyState(url)}}
    window.setTimeout(()=>setCopyState('COPY PHONE VISION LINK'),3500);
  }

  const cards=[
    {name:'Cloud runtime',state:runtimeLive?'LIVE':'OFF',detail:runtimeLive?`${snap.health?.runtime||'full engine'} · ${snap.health?.storage||'persistent storage'}`:'Cloud health is unreachable.'},
    {name:'Reasoning mesh',state:providerState,detail:`${configuredRoutes} configured route${configuredRoutes===1?'':'s'} · ${connectedRoutes} proven connected · active ${prettyProvider(model?.activeProvider)}`},
    {name:'Background cognition',state:backgroundEnabled&&!autonomyPaused?'LIVE':backgroundEnabled?'DEGRADED':'OFF',detail:backgroundEnabled?`initiative enabled · autonomy ${autonomyPaused?'paused':'running'}`:'Background model permission is disabled.'},
    {name:'Persistent embodiment',state:autonomyState,detail:`cycle ${snap.status?.world?.autonomy?.cycles??0} · ${snap.status?.world?.autonomy?.drive||'no drive reported'} · ${snap.status?.world?.objects?.length??0} world objects`},
    {name:'PC control',state:pcState,detail:pcOnline?`${heartbeat.hostname||'primary PC'} · agent ${heartbeat.agentVersion||'?'} · heartbeat ${ageLabel(heartbeat.at)}${heartbeat.elevated?' · elevated':''}`:computerEnabled?'Permission is on, but START-EDON-PC.cmd is not reporting a fresh heartbeat.':'Computer permission is disabled.'},
    {name:'Camera network',state:cameraState,detail:`${liveCameras} live / ${cameraList.length} known cameras${cameraEnabled?' · perception permission on':' · perception permission off'}`},
    {name:'Tasks + reminders',state:'READY',detail:`${readyTasks.length} ready task${readyTasks.length===1?'':'s'} · ${notifications.length} notification${notifications.length===1?'':'s'} in queue`},
    {name:'Voice + listening',state:snap.controls?.permissions?.microphone?'READY':'OFF',detail:snap.controls?.permissions?.microphone?'Microphone permission is enabled; provider STT/TTS are available through the console.':'Enable Always Listening from the Entity console to grant microphone permission.'}
  ];

  return <main className={styles.shell}>
    <header className={styles.header}>
      <div><p>UNIFIED ENTITY · LIVE SYSTEMS</p><h1>{entity} command center.</h1><span>Measured readiness only. A subsystem is never marked live just because its source code exists.</span></div>
      <div className={`${styles.overall} ${styles[overall.toLowerCase()]}`}><i/>{overall}</div>
    </header>

    <section className={styles.heroGrid}>
      <article className={styles.focusCard}><small>GLOBAL WORKSPACE FOCUS</small><strong>{focus}</strong><div><span>Identity</span><b>{snap.status?.identity?.identity?.status||'unknown'}</b><span>Strongest drive</span><b>{Object.entries(snap.status?.identity?.drives||{}).sort((a:any,b:any)=>Number(b[1])-Number(a[1]))[0]?.[0]||'unknown'}</b></div></article>
      <article className={styles.actionCard}><small>SECOND PHONE</small><strong>Give {entity} your live camera.</strong><p>Open the private Vision / AR surface on the phone you want to use as his eyes. It publishes measured frames and spatial metadata through the protected relay.</p><button onClick={()=>void shareVision()}>{copyState}</button><a href="/vision">OPEN VISION HERE ↗</a></article>
    </section>

    <section className={styles.matrix}>
      {cards.map(card=><article className={styles.systemCard} key={card.name}><div><span className={`${styles.dot} ${styles[stateClass(card.state)]}`}/><b>{card.name}</b><em className={styles[stateClass(card.state)]}>{card.state}</em></div><p>{card.detail}</p></article>)}
    </section>

    <section className={styles.bottomGrid}>
      <article className={styles.panel}><div className={styles.panelTitle}><span>PROVIDER ROUTES</span><button onClick={()=>void refresh()} disabled={refreshing}>{refreshing?'CHECKING':'REFRESH'}</button></div>{Object.entries(routes).length?Object.entries(routes).map(([name,route]:[string,any])=><div className={styles.row} key={name}><span>{name}</span><b>{route?.connected===true?'CONNECTED':route?.state==='MODEL_NOT_CONFIGURED'?'NOT CONFIGURED':route?.state||'CONFIGURED'}</b><small>{route?.model||'—'}</small></div>):<p className={styles.empty}>No provider route status returned.</p>}</article>
      <article className={styles.panel}><div className={styles.panelTitle}><span>LOCAL / PHYSICAL ACTIVATION</span></div><div className={styles.step}><b>PC control</b><p>Keep <code>START-EDON-PC.cmd</code> open on the Windows PC. It uses the production secrets already stored locally and reports a heartbeat here.</p></div><div className={styles.step}><b>Night Owl</b><p>Run <code>START-NIGHTOWL-BRIDGE.cmd</code> on the DVR LAN. DVR credentials stay on that PC; only frames and HUD metadata publish outward.</p></div><div className={styles.step}><b>Second phone</b><p>Use the Vision link above and grant camera/microphone permission in the browser. No native depth is fabricated when the browser cannot supply it.</p></div></article>
    </section>

    {snap.errors.length?<section className={styles.errors}><b>LIVE CHECK WARNINGS</b>{snap.errors.map((error,index)=><p key={index}>{error}</p>)}</section>:null}
    <footer className={styles.footer}><span>Last measured {snap.checkedAt?ageLabel(snap.checkedAt):'never'}</span><a href="/">RETURN TO ENTITY</a><a href="/cameras">CAMERA WALL</a></footer>
  </main>;
}
