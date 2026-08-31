(function(root,factory){
  const api=factory(root.OntologyEngineV20);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV21=api;
  root.OntologyEngineV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(V20){
'use strict';
if(!V20) throw new Error('OntologyEngineV21 requires V20');
const VERSION='3.0.0-alpha';
const MIN_PAIRS=16;
const DECISION_PAIRS=24;
const MAX_PAIRS=48;
const PRACTICAL_EDGE=.25;
const Z=1.96;
const DECIDED_PROBE_CADENCE=8;
const HISTORY_LIMIT=128;
const METHOD_KEYS={adversary:'reroute-world-search',instrument:'boost-intervention-search',language:'reroute-representation-search'};
function clone(x){return x==null?x:JSON.parse(JSON.stringify(x))}
function baseState(){return{version:'research-method-court-v1',records:{},history:[],last:null}}
function sanitize(raw){if(!raw||raw.version!=='research-method-court-v1')return baseState();const records={};for(const [k,r] of Object.entries(raw.records||{}))records[k]={key:k,kind:String(r.kind||k.split(':')[0]||'unknown'),method:String(r.method||k.split(':')[1]||'unknown'),pairs:Array.isArray(r.pairs)?r.pairs.slice(-MAX_PAIRS):[],status:String(r.status||'calibrating'),lastPairAttack:Number(r.lastPairAttack)||0,lastDecisionAttack:Number(r.lastDecisionAttack)||0};return{version:'research-method-court-v1',records,history:Array.isArray(raw.history)?raw.history.slice(-HISTORY_LIMIT):[],last:raw.last||null}}
function methodFor(kind){return METHOD_KEYS[kind]||null}
function recordFor(state,kind){const method=methodFor(kind),key=method?`${kind}:${method}`:null;if(!key)return null;if(!state.records[key])state.records[key]={key,kind,method,pairs:[],status:'calibrating',lastPairAttack:0,lastDecisionAttack:0};return state.records[key]}
function pairedStats(rec){const xs=rec?.pairs||[],n=xs.length;if(!n)return{n:0,mean:0,sd:0,se:Infinity,lower:-Infinity,upper:Infinity,wins:0,losses:0,ties:0,status:'calibrating'};const ds=xs.map(x=>Number(x.delta)||0),mean=ds.reduce((a,b)=>a+b,0)/n,variance=n>1?ds.reduce((s,d)=>s+(d-mean)*(d-mean),0)/(n-1):0,sd=Math.sqrt(Math.max(0,variance)),se=n>1?sd/Math.sqrt(n):Infinity,lower=n>1?mean-Z*se:-Infinity,upper=n>1?mean+Z*se:Infinity,wins=ds.filter(x=>x>0).length,losses=ds.filter(x=>x<0).length,ties=n-wins-losses;let status='calibrating';if(n>=MIN_PAIRS&&lower>PRACTICAL_EDGE)status='keep';else if(n>=DECISION_PAIRS&&upper<PRACTICAL_EDGE)status='kill';else if(n>=MAX_PAIRS)status=mean>=PRACTICAL_EDGE?'keep':'kill';return{n,mean,sd,se,lower,upper,wins,losses,ties,status}}
function depthOf(obj,path,def=0){let x=obj;for(const k of path){x=x?.[k]}return Number(x)||def}
function utility(result,start={}){
  let u=0;
  if(result?.strictDepth)u+=12;
  if(result?.languageEvent)u+=9;
  if(result?.reason==='derived_sense_added'&&!result?.strictDepth&&!result?.languageEvent)u+=6;
  if(result?.reason==='instrument_rejected')u+=1.5;
  const e0=depthOf(start,['experimentState','depth']),e1=depthOf(result,['experimentForge','depth']);if(e1>e0)u+=4*(e1-e0);
  const c0=depthOf(start,['causalState','depth']),c1=depthOf(result,['causalProgramVM','depth']);if(c1>c0)u+=5*(c1-c0);
  const p0=depthOf(start,['conceptState','depth']),p1=depthOf(result,['conceptForge','depth']);if(p1>p0)u+=6*(p1-p0);
  const s0=depthOf(start,['sequentialState','depth']),s1=depthOf(result,['sequentialForge','depth']);if(s1>s0)u+=5*(s1-s0);
  const m0=depthOf(start,['macroState','depth']),m1=depthOf(result,['interventionLanguage','depth']);if(m1>m0)u+=6*(m1-m0);
  return u;
}
function summarizeResult(r,start){return{reason:r?.reason||'unknown',strictDepth:!!r?.strictDepth,languageEvent:!!r?.languageEvent,experimentDepth:depthOf(r,['experimentForge','depth']),causalDepth:depthOf(r,['causalProgramVM','depth']),conceptDepth:depthOf(r,['conceptForge','depth']),sequentialDepth:depthOf(r,['sequentialForge','depth']),macroDepth:depthOf(r,['interventionLanguage','depth']),utility:utility(r,start)}}
function barrierKind(opts){try{const b=V20.__v14?.sanitize(opts.barrierState),c=V20.__v14?.classify(b?.events||[]);return c?.kind||'insufficient'}catch{return'insufficient'}}
function shouldPair(rec,attack){const s=pairedStats(rec);if(s.status==='calibrating')return true;return attack-rec.lastPairAttack>=DECIDED_PROBE_CADENCE}
function selectedArm(rec,trialRan){const s=pairedStats(rec);if(s.status==='keep')return'treatment';if(s.status==='kill')return'control';if(trialRan)return s.n%2===0?'treatment':'control';return'control'}
function runArm(opts,control){const copy={...opts,ontology:clone(opts.ontology),ecologyState:clone(opts.ecologyState),worldEcologyState:clone(opts.worldEcologyState),questionEcologyState:clone(opts.questionEcologyState),strategyEcologyState:clone(opts.strategyEcologyState),theoryEcologyState:clone(opts.theoryEcologyState),experimentState:clone(opts.experimentState),barrierState:clone(opts.barrierState),causalState:clone(opts.causalState),conceptState:clone(opts.conceptState),sequentialState:clone(opts.sequentialState),macroState:clone(opts.macroState),theoryCourtState:clone(opts.theoryCourtState),progress:null};if(control)copy.barrierActionOverride='control';else delete copy.barrierActionOverride;return V20.epistemicCycle(copy)}
function persistable(state){const records={};for(const [k,r] of Object.entries(state.records))records[k]={...r,pairs:r.pairs.slice(-MAX_PAIRS)};return clone({version:state.version,records,history:state.history.slice(-HISTORY_LIMIT),last:state.last})}
function courtSummary(state,currentKey,trial,selected){const rows=Object.values(state.records).map(r=>{const s=pairedStats(r);return{key:r.key,kind:r.kind,method:r.method,status:s.status,n:s.n,meanDelta:s.mean,ci95:[s.lower,s.upper],wins:s.wins,losses:s.losses,ties:s.ties,lastPairAttack:r.lastPairAttack}});return{version:state.version,currentMethod:currentKey||null,trial:trial||null,selectedArm:selected||null,minimumPairs:MIN_PAIRS,decisionPairs:DECISION_PAIRS,maxPairs:MAX_PAIRS,practicalEdge:PRACTICAL_EDGE,probeCadence:DECIDED_PROBE_CADENCE,records:rows,immutableJudge:true,changesOmegaK:false,meaning:'barrier interventions must beat a matched no-intervention control on future discovery utility; unproven methods are suppressed and periodically re-probed',persistable:persistable(state)}}
function epistemicCycle(opts={}){
  const state=sanitize(opts.methodCourtState),attack=Number(opts.attack)||0,kind=barrierKind(opts),rec=recordFor(state,kind),actionable=!!rec;
  if(!actionable){const result=V20.epistemicCycle(opts);state.last={attack:Number(result?.attack)||attack+1,kind,status:'inactive',trial:false,selected:'baseline'};state.history.push(state.last);state.history=state.history.slice(-HISTORY_LIMIT);return{...result,researchMethodCourt:courtSummary(state,null,null,'baseline')}}
  const statsBefore=pairedStats(rec),pair=shouldPair(rec,attack),start={experimentState:opts.experimentState,causalState:opts.causalState,conceptState:opts.conceptState,sequentialState:opts.sequentialState,macroState:opts.macroState};
  opts.progress&&opts.progress({phase:'method-court',generation:statsBefore.n,formula:`METHOD COURT ${kind.toUpperCase()} · ${rec.method} · ${statsBefore.status.toUpperCase()}`});
  let treatment=null,control=null,trial=null,result,selected;
  if(pair){
    treatment=runArm(opts,false);control=runArm(opts,true);const t=summarizeResult(treatment,start),c=summarizeResult(control,start),delta=t.utility-c.utility,publicAttack=Number(treatment?.attack)||Number(control?.attack)||attack+1;rec.pairs.push({attack:publicAttack,delta,treatment:t,control:c});rec.pairs=rec.pairs.slice(-MAX_PAIRS);rec.lastPairAttack=publicAttack;const after=pairedStats(rec);rec.status=after.status;if(after.status!==statsBefore.status)rec.lastDecisionAttack=publicAttack;trial={attack:publicAttack,delta,treatment:t,control:c,statusBefore:statsBefore.status,statusAfter:after.status};selected=selectedArm(rec,true);result=selected==='treatment'?treatment:control;
  }else{
    selected=selectedArm(rec,false);result=runArm(opts,selected==='control');rec.status=pairedStats(rec).status;
  }
  const publicAttack=Number(result?.attack)||attack+1;state.last={attack:publicAttack,kind,method:rec.method,status:rec.status,trial:!!trial,selected,delta:trial?.delta??null};state.history.push(state.last);state.history=state.history.slice(-HISTORY_LIMIT);
  return{...result,researchMethodCourt:courtSummary(state,rec.key,trial,selected)};
}
function selfTest(){const tests=[...(V20.selfTest?V20.selfTest():[])],add=(n,fn)=>{try{tests.push({name:n,pass:true,detail:String(fn()||'pass')})}catch(e){tests.push({name:n,pass:false,detail:String(e.message||e)})}};
add('V21 paired minimum evidence',()=>{const r={pairs:Array.from({length:MIN_PAIRS-1},()=>({delta:2}))};if(pairedStats(r).status!=='calibrating')throw Error('method decided before minimum pairs');return`${MIN_PAIRS} matched counterfactual pairs required before KEEP`});
add('V21 keeps a proven method',()=>{const r={pairs:Array.from({length:MIN_PAIRS},()=>({delta:1}))};const s=pairedStats(r);if(s.status!=='keep')throw Error('clear positive method was not kept');return'positive paired utility with confidence survives'});
add('V21 kills an unproven method',()=>{const r={pairs:Array.from({length:DECISION_PAIRS},()=>({delta:0}))};const s=pairedStats(r);if(s.status!=='kill')throw Error('zero-value method was not killed');return'unproven barrier intervention is suppressed'});
add('V21 rolling evidence can recover',()=>{const r={pairs:[...Array.from({length:24},()=>({delta:0})),...Array.from({length:48},()=>({delta:2}))]};r.pairs=r.pairs.slice(-MAX_PAIRS);if(pairedStats(r).status!=='keep')throw Error('rolling court could not recover a newly useful method');return'old method verdicts can reverse when the research ecology changes'});
add('V21 judge immutability',()=>{const s=baseState();for(const x of ['pThreshold','effectThreshold','nullCount','judge','certificate','omegaDepth','languageDepth'])if(Object.prototype.hasOwnProperty.call(s,x))throw Error(`method court owns ${x}`);return'method court governs research tactics, never scientific truth'});return tests}
return{...V20,VERSION,epistemicCycle,selfTest,__v21:{MIN_PAIRS,DECISION_PAIRS,MAX_PAIRS,PRACTICAL_EDGE,DECIDED_PROBE_CADENCE,METHOD_KEYS,baseState,sanitize,pairedStats,utility,methodFor,persistable}};
});
