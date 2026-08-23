'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './ar.module.css';

type HudEntity={id?:string;trackId?:string;label?:string;category?:string;confidence?:number;box?:{x:number;y:number;w:number;h:number}};
type Anchor={anchorId:string;entityId:string|null;label:string;position:{x:number;y:number;z:number};confidence:number;persistent:false};
type ScreenAnchor=Anchor&{x:number;y:number;visible:boolean;distance:number};
type SpatialState={poseMatrix:number[]|null;viewMatrix:number[]|null;projectionMatrix:number[]|null;viewport:{width:number;height:number}|null;tracking:string;depthAvailable:boolean;reticle:{x:number;y:number;z:number}|null};

const emptySpatial:SpatialState={poseMatrix:null,viewMatrix:null,projectionMatrix:null,viewport:null,tracking:'unavailable',depthAvailable:false,reticle:null};

export default function SpatialArPage(){
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const sessionRef=useRef<any>(null);
  const refSpaceRef=useRef<any>(null);
  const hitSourceRef=useRef<any>(null);
  const spatialRef=useRef<SpatialState>(emptySpatial);
  const anchorsRef=useRef<Anchor[]>([]);
  const lastUiRef=useRef(0);
  const lastPushRef=useRef(0);
  const [supported,setSupported]=useState<boolean|null>(null);
  const [running,setRunning]=useState(false);
  const [status,setStatus]=useState('CHECKING WEBXR');
  const [error,setError]=useState('');
  const [entities,setEntities]=useState<HudEntity[]>([]);
  const [feedAge,setFeedAge]=useState<number|null>(null);
  const [screens,setScreens]=useState<ScreenAnchor[]>([]);
  const [spatial,setSpatial]=useState<SpatialState>(emptySpatial);

  useEffect(()=>{
    let dead=false;
    void (async()=>{
      const xr=(navigator as Navigator&{xr?:any}).xr;
      if(!xr){if(!dead){setSupported(false);setStatus('WEBXR UNAVAILABLE · CAMERA HUD READY')}return}
      try{const ok=await xr.isSessionSupported('immersive-ar');if(!dead){setSupported(Boolean(ok));setStatus(ok?'WEBXR READY':'IMMERSIVE AR UNSUPPORTED · CAMERA HUD READY')}}catch{if(!dead){setSupported(false);setStatus('WEBXR CHECK FAILED · CAMERA HUD READY')}}
    })();
    return()=>{dead=true};
  },[]);

  useEffect(()=>{
    let dead=false;
    const poll=async()=>{
      try{
        const r=await fetch('/api/vision/latest?sessionId=default',{cache:'no-store'});
        if(!r.ok)return;
        const b=await r.json();const frame=b?.frame;if(!frame||dead)return;
        setEntities(Array.isArray(frame?.hud?.entities)?frame.hud.entities:[]);
        const at=Date.parse(String(frame?.publishedAt||''));setFeedAge(Number.isFinite(at)?Math.max(0,Date.now()-at):null);
      }catch{}
    };
    void poll();const timer=setInterval(poll,900);return()=>{dead=true;clearInterval(timer)};
  },[]);

  const pushSpatial=useCallback(async(next:SpatialState)=>{
    if(!next.poseMatrix)return;
    const width=next.viewport?.width||innerWidth,height=next.viewport?.height||innerHeight;
    const p=next.projectionMatrix||[];
    const fx=p.length===16?Math.abs(Number(p[0]||0))*width/2:0;
    const fy=p.length===16?Math.abs(Number(p[5]||0))*height/2:0;
    const cx=p.length===16?(1-Number(p[8]||0))*width/2:width/2;
    const cy=p.length===16?(1+Number(p[9]||0))*height/2:height/2;
    const body={
      camera:true,cameraState:'active',
      spatial:{
        mode:'world_anchored',source:'webxr',capturedAt:new Date().toISOString(),
        cameraPose:{matrix:next.poseMatrix,intrinsics:{fx,fy,cx,cy,width,height},tracking:next.tracking},
        depth:{available:next.depthAvailable,source:next.depthAvailable?'webxr':'none',confidence:next.depthAvailable?1:0},
        anchors:anchorsRef.current
      }
    };
    try{await fetch('/api/edon/sensory',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'})}catch{}
  },[]);

  const endSession=useCallback(async()=>{const s=sessionRef.current;sessionRef.current=null;hitSourceRef.current=null;refSpaceRef.current=null;if(s){try{await s.end()}catch{}}setRunning(false);setStatus(supported?'WEBXR READY':'CAMERA HUD READY')},[supported]);

  const startAr=useCallback(async()=>{
    setError('');
    const xr=(navigator as Navigator&{xr?:any}).xr;
    if(!xr){setError('This browser does not expose WebXR immersive AR. Use Camera HUD instead.');return}
    try{
      setStatus('REQUESTING IMMERSIVE AR');
      let session:any;
      try{
        session=await xr.requestSession('immersive-ar',{
          requiredFeatures:['hit-test'],
          optionalFeatures:['anchors','dom-overlay','depth-sensing','light-estimation','camera-access'],
          domOverlay:{root:document.body},
          depthSensing:{usagePreference:['cpu-optimized','gpu-optimized'],dataFormatPreference:['float32','luminance-alpha']}
        });
      }catch{
        session=await xr.requestSession('immersive-ar',{requiredFeatures:['hit-test'],optionalFeatures:['anchors','dom-overlay'],domOverlay:{root:document.body}});
      }
      sessionRef.current=session;
      const canvas=canvasRef.current;if(!canvas)throw new Error('AR canvas unavailable');
      const gl:any=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:false})||canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:false});
      if(!gl)throw new Error('WebGL unavailable');
      if(gl.makeXRCompatible)await gl.makeXRCompatible();
      const Layer=(window as any).XRWebGLLayer;if(!Layer)throw new Error('XRWebGLLayer unavailable');
      const baseLayer=new Layer(session,gl,{alpha:true,antialias:true});session.updateRenderState({baseLayer});
      const refSpace=await session.requestReferenceSpace('local');const viewerSpace=await session.requestReferenceSpace('viewer');
      refSpaceRef.current=refSpace;hitSourceRef.current=await session.requestHitTestSource({space:viewerSpace});
      session.addEventListener('end',()=>{sessionRef.current=null;setRunning(false);setStatus('AR SESSION ENDED')},{once:true});
      setRunning(true);setStatus('WORLD TRACKING');

      const onFrame=(time:number,frame:any)=>{
        if(sessionRef.current!==session)return;
        session.requestAnimationFrame(onFrame);
        const pose=frame.getViewerPose(refSpace);if(!pose?.views?.length){spatialRef.current={...spatialRef.current,tracking:'limited'};return}
        const view=pose.views[0];const viewport=baseLayer.getViewport(view);
        let depthAvailable=false;try{depthAvailable=typeof frame.getDepthInformation==='function'&&Boolean(frame.getDepthInformation(view))}catch{}
        let reticle:null|{x:number;y:number;z:number}=null;
        try{const hits=hitSourceRef.current?frame.getHitTestResults(hitSourceRef.current):[];const hp=hits?.[0]?.getPose(refSpace)?.transform?.position;if(hp)reticle={x:Number(hp.x),y:Number(hp.y),z:Number(hp.z)}}catch{}
        const next:SpatialState={
          poseMatrix:Array.from(view.transform.matrix||[]).map(Number),
          viewMatrix:Array.from(view.transform.inverse.matrix||[]).map(Number),
          projectionMatrix:Array.from(view.projectionMatrix||[]).map(Number),
          viewport:viewport?{width:Number(viewport.width),height:Number(viewport.height)}:{width:innerWidth,height:innerHeight},
          tracking:'normal',depthAvailable,reticle
        };
        spatialRef.current=next;
        if(time-lastUiRef.current>90){lastUiRef.current=time;setSpatial(next);setScreens(projectAnchors(anchorsRef.current,next));}
        if(time-lastPushRef.current>950){lastPushRef.current=time;void pushSpatial(next)}
      };
      session.requestAnimationFrame(onFrame);
    }catch(e){const m=e instanceof Error?e.message:String(e);setError(m);setRunning(false);setStatus('AR START FAILED · CAMERA HUD READY')}
  },[pushSpatial]);

  const pinTarget=useCallback(()=>{
    const hit=spatialRef.current.reticle;if(!hit){setError('No measured surface at the center reticle yet. Aim at a floor, wall, table, or other trackable surface.');return}
    const target=nearestCenterEntity(entities);
    const anchor:Anchor={anchorId:`xr_${crypto.randomUUID().replaceAll('-','')}`.slice(0,64),entityId:String(target?.trackId||target?.id||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64)||null,label:String(target?.label||target?.category||'SPATIAL ANCHOR').slice(0,80),position:hit,confidence:target?.confidence??1,persistent:false};
    anchorsRef.current=[...anchorsRef.current,anchor].slice(-32);setScreens(projectAnchors(anchorsRef.current,spatialRef.current));setError('');void pushSpatial(spatialRef.current);
  },[entities,pushSpatial]);

  const clearAnchors=useCallback(()=>{anchorsRef.current=[];setScreens([]);void pushSpatial(spatialRef.current)},[pushSpatial]);

  return <main className={styles.page}>
    <canvas ref={canvasRef} className={styles.xrCanvas}/>
    <div className={styles.chrome}/><div className={styles.scan}/>
    <header className={styles.top}><div><div className={styles.kicker}>EDÔN // SPATIAL PERCEPTION</div><h1>World-locked AR</h1></div><div className={`${styles.status} ${running?styles.live:''}`}>{status}</div></header>

    <section className={styles.telemetry}>
      <div><span>TRACKING</span><b>{spatial.tracking.toUpperCase()}</b></div>
      <div><span>DEPTH</span><b>{spatial.depthAvailable?'MEASURED':'UNAVAILABLE'}</b></div>
      <div><span>ANCHORS</span><b>{anchorsRef.current.length}</b></div>
      <div><span>VISION FEED</span><b>{feedAge===null?'OFFLINE':feedAge<4000?`LIVE ${Math.round(feedAge/1000)}s`:`STALE ${Math.round(feedAge/1000)}s`}</b></div>
    </section>

    {running&&<div className={`${styles.reticle} ${spatial.reticle?styles.reticleLive:''}`}><i/></div>}
    {screens.filter(a=>a.visible).map(a=><div key={a.anchorId} className={styles.anchor} style={{left:a.x,top:a.y}}><strong>{a.label.toUpperCase()}</strong><span>{a.distance.toFixed(1)}m · WORLD LOCK</span></div>)}

    <aside className={styles.panel}>
      <div className={styles.panelTitle}>Measured spatial layer</div>
      <p>This mode sends real WebXR pose, projection-derived camera intrinsics, depth availability, and in-session world anchors into Edôn. It never invents metric depth when the browser does not expose it.</p>
      <div className={styles.feedList}>{entities.slice(0,6).map((e,i)=><span key={String(e.trackId||e.id||i)}>{String(e.label||e.category||'object').toUpperCase()} {Math.round(Number(e.confidence||0)*100)}%</span>)}</div>
      {error&&<div className={styles.error}>{error}</div>}
    </aside>

    <div className={styles.controls}>
      {!running?<button className={styles.primary} disabled={supported===false} onClick={startAr}>START SPATIAL AR</button>:<><button className={styles.primary} onClick={pinTarget}>PIN CENTER TARGET</button><button onClick={clearAnchors}>CLEAR ANCHORS</button><button onClick={endSession}>END AR</button></>}
      <a href="/vision">CAMERA HUD / BROADCAST</a><a href="/cameras">CAMERA WALL</a>
    </div>
  </main>;
}

function nearestCenterEntity(entities:HudEntity[]){let best:HudEntity|undefined,score=Infinity;for(const e of entities){const b=e.box;if(!b)continue;const cx=Number(b.x)+Number(b.w)/2,cy=Number(b.y)+Number(b.h)/2,d=Math.hypot(cx-.5,cy-.5);if(d<score){score=d;best=e}}return best}
function projectAnchors(anchors:Anchor[],s:SpatialState):ScreenAnchor[]{if(!s.viewMatrix||!s.projectionMatrix)return anchors.map(a=>({...a,x:-999,y:-999,visible:false,distance:0}));const w=innerWidth,h=innerHeight;return anchors.map(a=>{const view=mul4v(s.viewMatrix!,[a.position.x,a.position.y,a.position.z,1]);const clip=mul4v(s.projectionMatrix!,view);const cw=clip[3];if(!Number.isFinite(cw)||cw<=0)return {...a,x:-999,y:-999,visible:false,distance:Math.hypot(view[0],view[1],view[2])};const nx=clip[0]/cw,ny=clip[1]/cw;return {...a,x:(nx*.5+.5)*w,y:(1-(ny*.5+.5))*h,visible:Math.abs(nx)<=1.2&&Math.abs(ny)<=1.2,distance:Math.hypot(view[0],view[1],view[2])}})}
function mul4v(m:number[],v:number[]){return [m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12]*v[3],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13]*v[3],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]*v[3],m[3]*v[0]+m[7]*v[1]+m[11]*v[2]+m[15]*v[3]]}
