'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './ar.module.css';

type HudEntity={id?:string;trackId?:string;label?:string;category?:string;confidence?:number;box?:{x:number;y:number;w:number;h:number}};
type Anchor={anchorId:string;entityId:string|null;label:string;position:{x:number;y:number;z:number};confidence:number;persistent:false};
type ScreenAnchor=Anchor&{x:number;y:number;visible:boolean;distance:number};
type SpatialState={poseMatrix:number[]|null;viewMatrix:number[]|null;projectionMatrix:number[]|null;viewport:{width:number;height:number}|null;tracking:'unavailable'|'limited'|'normal';depthAvailable:boolean;reticle:{x:number;y:number;z:number}|null};
type DisplayFlags={boxes:boolean;labels:boolean;distances:boolean;trackIds:boolean;anchors:boolean};
type Phase='loading'|'ready'|'requesting'|'tracking'|'relocalizing'|'fallback'|'error';

const emptySpatial:SpatialState={poseMatrix:null,viewMatrix:null,projectionMatrix:null,viewport:null,tracking:'unavailable',depthAvailable:false,reticle:null};
const classOrder=['person','vehicle','door','window','structure','unknown'];

export default function SpatialArPage(){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const sessionRef=useRef<any>(null);
  const refSpaceRef=useRef<any>(null);
  const hitSourceRef=useRef<any>(null);
  const spatialRef=useRef<SpatialState>(emptySpatial);
  const anchorsRef=useRef<Anchor[]>([]);
  const lastUiRef=useRef(0);
  const lastPushRef=useRef(0);
  const frameWindowRef=useRef<number[]>([]);
  const detectionWindowRef=useRef<number[]>([]);
  const [supported,setSupported]=useState<boolean|null>(null);
  const [running,setRunning]=useState(false);
  const [phase,setPhase]=useState<Phase>('loading');
  const [status,setStatus]=useState('LOADING PERCEPTION STACK');
  const [error,setError]=useState('');
  const [entities,setEntities]=useState<HudEntity[]>([]);
  const [feedAge,setFeedAge]=useState<number|null>(null);
  const [screens,setScreens]=useState<ScreenAnchor[]>([]);
  const [spatial,setSpatial]=useState<SpatialState>(emptySpatial);
  const [threshold,setThreshold]=useState(.55);
  const [display,setDisplay]=useState<DisplayFlags>({boxes:true,labels:true,distances:true,trackIds:true,anchors:true});
  const [legendOpen,setLegendOpen]=useState(false);
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [helpOpen,setHelpOpen]=useState(false);
  const [firstRun,setFirstRun]=useState(false);
  const [selected,setSelected]=useState<string|null>(null);
  const [locked,setLocked]=useState<string|null>(null);
  const [renderFps,setRenderFps]=useState(0);
  const [detectHz,setDetectHz]=useState(0);
  const [highContrast,setHighContrast]=useState(false);
  const [units,setUnits]=useState<'metric'|'imperial'>('metric');

  useEffect(()=>{
    setFirstRun(localStorage.getItem('edon-ar-onboarded')!=='1');
    const savedThreshold=Number(localStorage.getItem('edon-ar-threshold'));
    if(Number.isFinite(savedThreshold)&&savedThreshold>=.3&&savedThreshold<=.9)setThreshold(savedThreshold);
  },[]);

  useEffect(()=>{localStorage.setItem('edon-ar-threshold',String(threshold))},[threshold]);

  useEffect(()=>{
    let dead=false;
    void (async()=>{
      const xr=(navigator as Navigator&{xr?:any}).xr;
      if(!xr){if(!dead){setSupported(false);setPhase('fallback');setStatus('2D CAMERA HUD READY')}return}
      try{
        const ok=await xr.isSessionSupported('immersive-ar');
        if(!dead){setSupported(Boolean(ok));setPhase(ok?'ready':'fallback');setStatus(ok?'MODEL READY · WEBXR READY':'IMMERSIVE AR UNAVAILABLE · 2D HUD READY')}
      }catch{if(!dead){setSupported(false);setPhase('fallback');setStatus('WEBXR CHECK FAILED · 2D HUD READY')}}
    })();
    return()=>{dead=true};
  },[]);

  useEffect(()=>{
    let dead=false;
    const poll=async()=>{
      try{
        const response=await fetch('/api/vision/latest?sessionId=default',{cache:'no-store'});
        if(!response.ok)return;
        const body=await response.json();
        const frame=body?.frame;
        if(!frame||dead)return;
        setEntities(Array.isArray(frame?.hud?.entities)?frame.hud.entities:[]);
        const now=performance.now();
        detectionWindowRef.current=[...detectionWindowRef.current.filter(value=>now-value<3000),now].slice(-60);
        setDetectHz(Number((detectionWindowRef.current.length/3).toFixed(1)));
        const published=Date.parse(String(frame?.publishedAt||''));
        setFeedAge(Number.isFinite(published)?Math.max(0,Date.now()-published):null);
      }catch{}
    };
    void poll();
    const timer=setInterval(poll,650);
    return()=>{dead=true;clearInterval(timer)};
  },[]);

  const endSession=useCallback(async()=>{
    const session=sessionRef.current;
    sessionRef.current=null;hitSourceRef.current=null;refSpaceRef.current=null;
    if(session){try{await session.end()}catch{}}
    setRunning(false);setPhase(supported?'ready':'fallback');setStatus(supported?'MODEL READY · WEBXR READY':'2D CAMERA HUD READY');
  },[supported]);

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        if(settingsOpen)setSettingsOpen(false);
        else if(helpOpen)setHelpOpen(false);
        else if(running)void endSession();
      }
      if(event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement)return;
      if(event.key.toLowerCase()==='l')setDisplay(value=>({...value,labels:!value.labels}));
      if(event.key.toLowerCase()==='b')setDisplay(value=>({...value,boxes:!value.boxes}));
      if(event.key.toLowerCase()==='d')setDisplay(value=>({...value,distances:!value.distances}));
      if(event.key.toLowerCase()==='i')setDisplay(value=>({...value,trackIds:!value.trackIds}));
      if(event.key.toLowerCase()==='a')setDisplay(value=>({...value,anchors:!value.anchors}));
      if(event.key==='[')setThreshold(value=>Math.max(.3,Math.round((value-.05)*20)/20));
      if(event.key===']')setThreshold(value=>Math.min(.9,Math.round((value+.05)*20)/20));
    };
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[endSession,helpOpen,running,settingsOpen]);

  const filteredEntities=useMemo(()=>entities.filter(entity=>Number(entity.confidence||0)>=threshold).sort((a,b)=>Number(b.confidence||0)-Number(a.confidence||0)).slice(0,24),[entities,threshold]);
  const counts=useMemo(()=>{const output:Record<string,number>={};for(const entity of filteredEntities){const key=classKey(entity);output[key]=(output[key]||0)+1}return output},[filteredEntities]);

  const pushSpatial=useCallback(async(next:SpatialState)=>{
    if(!next.poseMatrix)return;
    const width=next.viewport?.width||innerWidth,height=next.viewport?.height||innerHeight;
    const projection=next.projectionMatrix||[];
    const fx=projection.length===16?Math.abs(Number(projection[0]||0))*width/2:0;
    const fy=projection.length===16?Math.abs(Number(projection[5]||0))*height/2:0;
    const cx=projection.length===16?(1-Number(projection[8]||0))*width/2:width/2;
    const cy=projection.length===16?(1+Number(projection[9]||0))*height/2:height/2;
    const body={camera:true,cameraState:'active',spatial:{mode:'world_anchored',source:'webxr',capturedAt:new Date().toISOString(),cameraPose:{matrix:next.poseMatrix,intrinsics:{fx,fy,cx,cy,width,height},tracking:next.tracking},depth:{available:next.depthAvailable,source:next.depthAvailable?'webxr':'none',confidence:next.depthAvailable?1:0},anchors:anchorsRef.current}};
    try{await fetch('/api/edon/sensory',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'})}catch{}
  },[]);

  const startAr=useCallback(async()=>{
    setError('');
    const xr=(navigator as Navigator&{xr?:any}).xr;
    if(!xr){window.location.assign('/vision');return}
    try{
      setPhase('requesting');setStatus('ALIGN DEVICE · REQUESTING AR');
      let session:any;
      try{session=await xr.requestSession('immersive-ar',{requiredFeatures:['hit-test'],optionalFeatures:['anchors','dom-overlay','depth-sensing','light-estimation','camera-access'],domOverlay:{root:document.body},depthSensing:{usagePreference:['cpu-optimized','gpu-optimized'],dataFormatPreference:['float32','luminance-alpha']}})}
      catch{session=await xr.requestSession('immersive-ar',{requiredFeatures:['hit-test'],optionalFeatures:['anchors','dom-overlay'],domOverlay:{root:document.body}})}
      sessionRef.current=session;
      const canvas=canvasRef.current;if(!canvas)throw new Error('AR canvas unavailable');
      const gl:any=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:false})||canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:false});
      if(!gl)throw new Error('WebGL unavailable');
      if(gl.makeXRCompatible)await gl.makeXRCompatible();
      const Layer=(window as any).XRWebGLLayer;if(!Layer)throw new Error('XRWebGLLayer unavailable');
      const baseLayer=new Layer(session,gl,{alpha:true,antialias:true});session.updateRenderState({baseLayer});
      const refSpace=await session.requestReferenceSpace('local');const viewerSpace=await session.requestReferenceSpace('viewer');
      refSpaceRef.current=refSpace;hitSourceRef.current=await session.requestHitTestSource({space:viewerSpace});
      session.addEventListener('end',()=>{sessionRef.current=null;setRunning(false);setPhase(supported?'ready':'fallback');setStatus(supported?'MODEL READY · WEBXR READY':'2D CAMERA HUD READY')},{once:true});
      setRunning(true);setPhase('tracking');setStatus('TRACKING · MODEL READY');
      const onFrame=(time:number,frame:any)=>{
        if(sessionRef.current!==session)return;
        session.requestAnimationFrame(onFrame);
        frameWindowRef.current=[...frameWindowRef.current.filter(value=>time-value<1000),time].slice(-120);
        const pose=frame.getViewerPose(refSpace);
        if(!pose?.views?.length){spatialRef.current={...spatialRef.current,tracking:'limited'};setPhase('relocalizing');setStatus('RELOCALIZING · MOVE SLOWLY');return}
        const recovered=spatialRef.current.tracking==='limited';
        const view=pose.views[0],viewport=baseLayer.getViewport(view);
        let depthAvailable=false;try{depthAvailable=typeof frame.getDepthInformation==='function'&&Boolean(frame.getDepthInformation(view))}catch{}
        let reticle:null|{x:number;y:number;z:number}=null;
        try{const hits=hitSourceRef.current?frame.getHitTestResults(hitSourceRef.current):[];const point=hits?.[0]?.getPose(refSpace)?.transform?.position;if(point)reticle={x:Number(point.x),y:Number(point.y),z:Number(point.z)}}catch{}
        const next:SpatialState={poseMatrix:Array.from(view.transform.matrix||[]).map(Number),viewMatrix:Array.from(view.transform.inverse.matrix||[]).map(Number),projectionMatrix:Array.from(view.projectionMatrix||[]).map(Number),viewport:viewport?{width:Number(viewport.width),height:Number(viewport.height)}:{width:innerWidth,height:innerHeight},tracking:'normal',depthAvailable,reticle};
        spatialRef.current=next;
        if(recovered){setPhase('tracking');setStatus('TRACKING · MODEL READY')}
        if(time-lastUiRef.current>90){lastUiRef.current=time;setSpatial(next);setScreens(projectAnchors(anchorsRef.current,next));setRenderFps(frameWindowRef.current.length)}
        if(time-lastPushRef.current>950){lastPushRef.current=time;void pushSpatial(next)}
      };
      session.requestAnimationFrame(onFrame);
    }catch(caught){const message=caught instanceof Error?caught.message:String(caught);setError(message);setRunning(false);setPhase('error');setStatus('AR UNAVAILABLE · 2D MODE READY')}
  },[pushSpatial,supported]);

  const pinTarget=useCallback(()=>{
    const hit=spatialRef.current.reticle;if(!hit){setError('No measured surface at the center cursor yet. Aim at a floor, wall, table, or other trackable surface.');return}
    const target=nearestCenterEntity(filteredEntities);const suggested=String(target?.label||target?.category||'SPATIAL ANCHOR').slice(0,80);const custom=window.prompt('Anchor label',suggested);if(custom===null)return;
    const anchor:Anchor={anchorId:`xr_${crypto.randomUUID().replaceAll('-','')}`.slice(0,64),entityId:String(target?.trackId||target?.id||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64)||null,label:(custom.trim()||suggested).slice(0,80),position:hit,confidence:target?.confidence??1,persistent:false};
    anchorsRef.current=[...anchorsRef.current,anchor].slice(-32);setScreens(projectAnchors(anchorsRef.current,spatialRef.current));setError('');navigator.vibrate?.(18);void pushSpatial(spatialRef.current);
  },[filteredEntities,pushSpatial]);

  const clearAnchors=useCallback(()=>{anchorsRef.current=[];setScreens([]);void pushSpatial(spatialRef.current)},[pushSpatial]);
  const selectEntity=useCallback((entity:HudEntity)=>{const id=entityKey(entity);setSelected(current=>current===id?null:id);navigator.vibrate?.(10)},[]);
  const toggleLock=useCallback((entity:HudEntity)=>{const id=entityKey(entity);setLocked(current=>current===id?null:id);setSelected(id);navigator.vibrate?.([10,20,10])},[]);
  const dismissPrimer=()=>{localStorage.setItem('edon-ar-onboarded','1');setFirstRun(false)};
  const selectedEntity=entities.find(entity=>entityKey(entity)===selected)||null;
  const lockedEntity=entities.find(entity=>entityKey(entity)===locked)||null;
  const visibleEntities=locked&&lockedEntity?[lockedEntity]:filteredEntities;
  const statusTone=phase==='tracking'?'good':phase==='relocalizing'||phase==='requesting'?'warn':phase==='error'?'bad':'idle';
  const feedState=feedAge===null?'OFFLINE':feedAge<4000?'LIVE':'STALE';

  return <main className={`${styles.page} ${highContrast?styles.highContrast:''}`}>
    <canvas ref={canvasRef} className={styles.xrCanvas} aria-hidden="true"/><div className={styles.chrome} aria-hidden="true"/><div className={styles.scan} aria-hidden="true"/>
    <section className={styles.statusCluster} aria-live="polite"><div className={styles.brandLine}>EDÔN // AR PERCEPTION</div><div className={styles.statusLine}><i className={`${styles.statusDot} ${styles[statusTone]}`}/><strong>{status}</strong></div><div className={styles.metricLine}><span>DETS</span><b>{filteredEntities.length}</b><span>REN</span><b>{renderFps||'—'}</b><span>DET</span><b>{detectHz||'—'}</b></div><div className={styles.metricLine}><span>DEPTH</span><b>{spatial.depthAvailable?'MEASURED':'—'}</b><span>FEED</span><b>{feedState}</b></div></section>

    <section className={styles.legendWrap}><button className={styles.chipButton} onClick={()=>setLegendOpen(value=>!value)} aria-expanded={legendOpen} aria-controls="ar-legend">LEGEND</button>{legendOpen&&<div id="ar-legend" className={styles.legendPanel}><div className={styles.legendCounts}>{classOrder.map(key=><div key={key}><i className={`${styles.swatch} ${styles[`class_${key}`]}`}/><span>{key.toUpperCase()}</span><b>{counts[key]||0}</b></div>)}</div><label className={styles.rangeLabel}><span>CONFIDENCE</span><b>{Math.round(threshold*100)}%</b><input aria-label="Confidence threshold" type="range" min=".3" max=".9" step=".05" value={threshold} onChange={event=>setThreshold(Number(event.target.value))}/></label><div className={styles.toggleGrid}>{([['boxes','BOXES'],['labels','LABELS'],['distances','DISTANCE'],['trackIds','TRACK IDS'],['anchors','ANCHORS']] as [keyof DisplayFlags,string][]).map(([key,label])=><button key={key} className={display[key]?styles.on:''} aria-pressed={display[key]} onClick={()=>setDisplay(value=>({...value,[key]:!value[key]}))}>{label}</button>)}</div></div>}</section>

    {running&&<div className={`${styles.surfaceCursor} ${spatial.reticle?styles.surfaceCursorLive:''}`} aria-hidden="true"><i/></div>}

    {display.boxes&&visibleEntities.map((entity,index)=>{const box=entity.box;if(!box)return null;const id=entityKey(entity)||String(index),active=id===selected,isLocked=id===locked,key=classKey(entity),confidence=Math.round(Number(entity.confidence||0)*100);return <button key={id} className={`${styles.detectBox} ${styles[`class_${key}`]} ${active?styles.selected:''} ${isLocked?styles.locked:''}`} style={{left:`${Number(box.x)*100}%`,top:`${Number(box.y)*100}%`,width:`${Number(box.w)*100}%`,height:`${Number(box.h)*100}%`}} onClick={()=>selectEntity(entity)} onDoubleClick={()=>toggleLock(entity)} aria-label={`${entityLabel(entity)} ${confidence}% confidence`}>{display.labels&&<span className={styles.objectLabel}>{entityLabel(entity)}{display.trackIds&&id?`  #${id.slice(-4).toUpperCase()}`:''}</span>}<span className={styles.confidenceBar}><i style={{width:`${confidence}%`}}/></span>{display.distances&&<small>{spatial.depthAvailable?'DEPTH AVAILABLE':'2D PERCEPTION'} · {confidence}%</small>}</button>})}

    {display.anchors&&screens.filter(anchor=>anchor.visible).map(anchor=><button key={anchor.anchorId} className={styles.anchor} style={{left:anchor.x,top:anchor.y}} onClick={()=>navigator.vibrate?.(8)}><strong>{anchor.label.toUpperCase()}</strong><span>{formatDistance(anchor.distance,units)} · WORLD ANCHOR</span></button>)}

    {selectedEntity&&<aside className={styles.selectionCard}><small>SELECTED PERCEPT</small><strong>{entityLabel(selectedEntity)}</strong><div><span>CONF</span><b>{Math.round(Number(selectedEntity.confidence||0)*100)}%</b></div><div><span>TRACK</span><b>{entityKey(selectedEntity)||'—'}</b></div><div><span>MODE</span><b>{spatial.depthAvailable?'DEPTH-AWARE':'SCREEN SPACE'}</b></div><button onClick={()=>toggleLock(selectedEntity)}>{locked===entityKey(selectedEntity)?'UNLOCK TRACK':'LOCK TRACK'}</button></aside>}

    {!running&&<section className={styles.preSession}><p>{supported===false?'Immersive WebXR is unavailable on this browser. Edôn can still run the full 2D camera perception HUD.':'Use measured WebXR tracking for spatial anchors. Detection overlays remain confidence-gated and never invent metric depth.'}</p><div><button className={styles.primaryAction} onClick={supported===false?()=>window.location.assign('/vision'):startAr}>{supported===false?'START 2D PERCEPTION':'START AR PERCEPTION'}</button>{supported!==false&&<a href="/vision">USE 2D CAMERA HUD</a>}</div></section>}

    {running&&<div className={styles.sessionControls}><button className={styles.pinButton} onClick={pinTarget} disabled={!spatial.reticle}>PLACE ANCHOR</button><button onClick={()=>setSettingsOpen(true)} aria-label="Open AR settings">SETTINGS</button><button className={styles.exitButton} onClick={endSession} aria-label="Exit AR">EXIT</button></div>}
    <button className={styles.helpButton} onClick={()=>setHelpOpen(true)} aria-label="Open AR help">?</button>{!running&&<button className={styles.settingsButton} onClick={()=>setSettingsOpen(true)} aria-label="Open AR settings">⚙</button>}

    {settingsOpen&&<div className={styles.drawerBackdrop} onClick={()=>setSettingsOpen(false)}><aside className={styles.drawer} onClick={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-label="AR settings"><header><div><small>AR SETTINGS</small><h2>Perception controls</h2></div><button onClick={()=>setSettingsOpen(false)} aria-label="Close settings">×</button></header><section><h3>Detection</h3><label className={styles.rangeLabel}><span>Confidence threshold</span><b>{Math.round(threshold*100)}%</b><input type="range" min=".3" max=".9" step=".05" value={threshold} onChange={event=>setThreshold(Number(event.target.value))}/></label><p>Only measured detector output above this threshold is shown.</p></section><section><h3>Display</h3><div className={styles.settingRows}><label><span>Units</span><select value={units} onChange={event=>setUnits(event.target.value as 'metric'|'imperial')}><option value="metric">Metric</option><option value="imperial">Imperial</option></select></label><label><span>High contrast</span><input type="checkbox" checked={highContrast} onChange={event=>setHighContrast(event.target.checked)}/></label></div></section><section><h3>Spatial system</h3><div className={styles.capabilities}><div><span>WEBXR</span><b>{supported?'READY':supported===false?'UNAVAILABLE':'CHECKING'}</b></div><div><span>TRACKING</span><b>{spatial.tracking.toUpperCase()}</b></div><div><span>DEPTH</span><b>{spatial.depthAvailable?'MEASURED':'UNAVAILABLE'}</b></div><div><span>ANCHORS</span><b>{anchorsRef.current.length}</b></div></div><button className={styles.dangerGhost} onClick={clearAnchors}>CLEAR SESSION ANCHORS</button></section><footer>Camera imagery is not treated as metric depth unless the browser exposes measured depth. World anchors are in-session unless a future platform persistence layer explicitly confirms persistence.</footer></aside></div>}

    {helpOpen&&<div className={styles.modalBackdrop} onClick={()=>setHelpOpen(false)}><section className={styles.helpModal} onClick={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-label="AR help"><button className={styles.modalClose} onClick={()=>setHelpOpen(false)} aria-label="Close help">×</button><small>AR PERCEPTION HELP</small><h2>Measured, calm, inspectable.</h2><ol><li><b>Start.</b> Grant camera/XR permission and move slowly while tracking initializes.</li><li><b>Read.</b> Boxes are confidence-gated detector output. Distance is only shown when it comes from a measured world anchor or depth-capable spatial path.</li><li><b>Place.</b> Aim the surface cursor at a real tracked surface, then place a labeled world anchor.</li></ol><p>Keyboard: B boxes · L labels · D distance metadata · I track IDs · A anchors · [ / ] confidence · Esc exit.</p></section></div>}

    {firstRun&&<div className={styles.primerBackdrop}><section className={styles.primer} role="dialog" aria-modal="true" aria-label="AR perception onboarding"><small>FIRST RUN · 01 / 03</small><h1>AR perception without fake measurements.</h1><div className={styles.primerGrid}><article><b>SEE</b><p>Detector boxes, class labels, track IDs and confidence stay readable without turning the screen into a game HUD.</p></article><article><b>PRIVACY</b><p>The browser only publishes through Edôn’s protected perception relay when you deliberately use the live perception tools.</p></article><article><b>CONTROL</b><p>Tap a detection to inspect it, double-tap to lock it, adjust confidence, and place measured world anchors on tracked surfaces.</p></article></div><button className={styles.primaryAction} onClick={dismissPrimer}>ENTER PERCEPTION</button></section></div>}

    {error&&<div className={styles.toast} role="alert"><b>PERCEPTION NOTICE</b><span>{error}</span><button onClick={()=>setError('')} aria-label="Dismiss notice">×</button></div>}
  </main>;
}

function entityKey(entity:HudEntity){return String(entity.trackId||entity.id||'')}
function entityLabel(entity:HudEntity){return String(entity.label||entity.category||'OBJECT').toUpperCase()}
function classKey(entity:HudEntity){const raw=String(entity.category||entity.label||'unknown').toLowerCase();if(raw.includes('person')||raw.includes('human'))return 'person';if(raw.includes('car')||raw.includes('truck')||raw.includes('vehicle')||raw.includes('bus'))return 'vehicle';if(raw.includes('door'))return 'door';if(raw.includes('window'))return 'window';if(raw.includes('wall')||raw.includes('structure')||raw.includes('hall')||raw.includes('stair'))return 'structure';return 'unknown'}
function nearestCenterEntity(entities:HudEntity[]){let best:HudEntity|undefined,score=Infinity;for(const entity of entities){const box=entity.box;if(!box)continue;const cx=Number(box.x)+Number(box.w)/2,cy=Number(box.y)+Number(box.h)/2,distance=Math.hypot(cx-.5,cy-.5);if(distance<score){score=distance;best=entity}}return best}
function projectAnchors(anchors:Anchor[],state:SpatialState):ScreenAnchor[]{if(!state.viewMatrix||!state.projectionMatrix)return anchors.map(anchor=>({...anchor,x:-999,y:-999,visible:false,distance:0}));const width=innerWidth,height=innerHeight;return anchors.map(anchor=>{const view=mul4v(state.viewMatrix!,[anchor.position.x,anchor.position.y,anchor.position.z,1]),clip=mul4v(state.projectionMatrix!,view),cw=clip[3];if(!Number.isFinite(cw)||cw<=0)return {...anchor,x:-999,y:-999,visible:false,distance:Math.hypot(view[0],view[1],view[2])};const nx=clip[0]/cw,ny=clip[1]/cw;return {...anchor,x:(nx*.5+.5)*width,y:(1-(ny*.5+.5))*height,visible:Math.abs(nx)<=1.2&&Math.abs(ny)<=1.2,distance:Math.hypot(view[0],view[1],view[2])}})}
function mul4v(matrix:number[],vector:number[]){return [matrix[0]*vector[0]+matrix[4]*vector[1]+matrix[8]*vector[2]+matrix[12]*vector[3],matrix[1]*vector[0]+matrix[5]*vector[1]+matrix[9]*vector[2]+matrix[13]*vector[3],matrix[2]*vector[0]+matrix[6]*vector[1]+matrix[10]*vector[2]+matrix[14]*vector[3],matrix[3]*vector[0]+matrix[7]*vector[1]+matrix[11]*vector[2]+matrix[15]*vector[3]]}
function formatDistance(meters:number,units:'metric'|'imperial'){if(units==='imperial'){const feet=meters*3.28084;return feet>=10?`${feet.toFixed(0)} ft`:`${feet.toFixed(1)} ft`}return meters>=10?`${meters.toFixed(0)} m`:`${meters.toFixed(1)} m`}
