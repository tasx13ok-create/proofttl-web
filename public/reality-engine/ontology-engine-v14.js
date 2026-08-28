(function(root,factory){
  const api=factory(root.OntologyEngineV13);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV14=api;
  root.OntologyEngineV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(V13){
'use strict';
if(!V13) throw new Error('OntologyEngineV14 requires V13');
const VERSION='1.5.0-alpha';
const WINDOW=32;
const MIN_EVIDENCE=12;
const BONUS_EXPERIMENT_COOLDOWN=4;
const HISTORY_LIMIT=96;
function mix(x){x=x>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return x>>>0||1}
function classify(events){
  const xs=(events||[]).slice(-WINDOW),n=xs.length;
  if(n<MIN_EVIDENCE)return{kind:'insufficient',n,resisted:0,rejected:0,derived:0,language:0,depth:0,productive:0};
  const resisted=xs.filter(x=>x.reason==='attack_resisted').length;
  const rejected=xs.filter(x=>x.reason==='instrument_rejected').length;
  const derived=xs.filter(x=>x.reason==='derived_sense_added'&&!x.languageEvent&&!x.strictDepth).length;
  const language=xs.filter(x=>x.languageEvent).length;
  const depth=xs.filter(x=>x.strictDepth).length;
  const productive=derived+language+depth;
  const nonResisted=n-resisted;
  if(resisted/n>=.65)return{kind:'adversary',n,resisted,rejected,derived,language,depth,productive};
  if(derived>=4&&language===0&&depth===0)return{kind:'language',n,resisted,rejected,derived,language,depth,productive};
  if(nonResisted>=6&&rejected/nonResisted>=.65)return{kind:'instrument',n,resisted,rejected,derived,language,depth,productive};
  if(productive/n>=.15)return{kind:'productive',n,resisted,rejected,derived,language,depth,productive};
  return{kind:'mixed',n,resisted,rejected,derived,language,depth,productive};
}
function initialState(){return{version:'barrier-engine-v1',events:[],history:[],last:null,lastBonusExperimentAttack:-9999,interventions:{adversaryReroutes:0,instrumentBoosts:0,languageReroutes:0}}}
function sanitize(raw){if(!raw||raw.version!=='barrier-engine-v1')return initialState();return{version:'barrier-engine-v1',events:Array.isArray(raw.events)?raw.events.slice(-WINDOW):[],history:Array.isArray(raw.history)?raw.history.slice(-HISTORY_LIMIT):[],last:raw.last||null,lastBonusExperimentAttack:Number(raw.lastBonusExperimentAttack)||-9999,interventions:{adversaryReroutes:Number(raw.interventions?.adversaryReroutes)||0,instrumentBoosts:Number(raw.interventions?.instrumentBoosts)||0,languageReroutes:Number(raw.interventions?.languageReroutes)||0}}}
function actionFor(barrier,attack,state){
  if(barrier.kind==='adversary')return{kind:'reroute-world-search',seedSalt:mix(0xAD0E0001^Math.imul(attack+1,0x9E3779B1)),extraExperiment:false};
  if(barrier.kind==='instrument')return{kind:'boost-intervention-search',seedSalt:0,extraExperiment:attack-state.lastBonusExperimentAttack>=BONUS_EXPERIMENT_COOLDOWN};
  if(barrier.kind==='language')return{kind:'reroute-representation-search',seedSalt:mix(0x1A660001^Math.imul(attack+1,0x85EBCA6B)),extraExperiment:false};
  return{kind:'observe',seedSalt:0,extraExperiment:false};
}
function mergeBonusExperiment(result,state,opts,attack){
  const base=result?.experimentForge?.persistable||V13.__v13.initialState(),e=V13.__v13.sanitize(base),audit=V13.__v13.audit(result,result?.ontology||opts.ontology||[],mix((Number(opts.seed)||1)^attack^0xB0A5E111));
  e.attempts++;
  if(audit?.certified){const signature=`${audit.candidate.featureId}|${audit.candidate.actionA}|${audit.candidate.actionB}`;if(!e.events.some(x=>x.signature===signature)){e.depth++;e.events.push({id:`E${e.depth}-${mix(signature.length^attack^0xB0).toString(16).toUpperCase().slice(0,5)}`,signature,attack,label:audit.candidate.label,featureId:audit.candidate.featureId,actionA:audit.candidate.actionA,actionB:audit.candidate.actionB,holdout:audit.holdout,transfer:audit.transfer,source:'barrier-instrument-boost'})}}
  e.history.push({attack,certified:!!audit?.certified,reason:audit?.reason||null,candidate:audit?.candidate||null,holdout:audit?.holdout||null,transfer:audit?.transfer||null,source:'barrier-instrument-boost'});e.history=e.history.slice(-72);state.lastBonusExperimentAttack=attack;state.interventions.instrumentBoosts++;
  return{audit,experimentForge:{version:e.version,depth:e.depth,attempts:e.attempts,events:e.events.slice(-12),history:e.history.slice(-24),persistable:V13.__v13.persistable(e),immutableJudge:true,changesEpistemicDepth:false}};
}
function persistable(s){return JSON.parse(JSON.stringify({version:s.version,events:s.events.slice(-WINDOW),history:s.history.slice(-HISTORY_LIMIT),last:s.last,lastBonusExperimentAttack:s.lastBonusExperimentAttack,interventions:s.interventions}))}
function epistemicCycle(opts={}){
  const state=sanitize(opts.barrierState),attack=Number(opts.attack)||0,pre=classify(state.events),action=actionFor(pre,attack,state),rootSeed=Number(opts.seed)||1,seed=action.seedSalt?mix(rootSeed^action.seedSalt):rootSeed;
  opts.progress&&opts.progress({phase:'barrier',generation:pre.n,formula:`BARRIER ${pre.kind.toUpperCase()} · ${action.kind}`});let result=V13.epistemicCycle({...opts,seed});
  if(pre.kind==='adversary'&&action.seedSalt)state.interventions.adversaryReroutes++;if(pre.kind==='language'&&action.seedSalt)state.interventions.languageReroutes++;
  const publicAttack=Number(result?.attack)||attack+1;let bonus=null;
  if(pre.kind==='instrument'&&action.extraExperiment&&result?.reason==='instrument_rejected'&&!result?.experimentAudit){bonus=mergeBonusExperiment(result,state,{...opts,seed},publicAttack);result={...result,experimentAudit:bonus.audit,experimentForge:bonus.experimentForge,experimentDepth:bonus.experimentForge.depth}}
  const event={attack:publicAttack,reason:result?.reason||'unknown',strictDepth:!!result?.strictDepth,languageEvent:!!result?.languageEvent,ok:!!result?.ok,experimentCertified:!!result?.experimentAudit?.certified};state.events.push(event);state.events=state.events.slice(-WINDOW);
  const post=classify(state.events);state.last={before:pre,action,after:post,attack:publicAttack,bonusExperiment:!!bonus};state.history.push(state.last);state.history=state.history.slice(-HISTORY_LIMIT);
  return{...result,barrier:{version:state.version,before:pre,after:post,action,bonusExperiment:!!bonus,interventions:{...state.interventions},immutableJudge:true,persistable:persistable(state)}};
}
function selfTest(){const tests=[...(V13.selfTest?V13.selfTest():[])],add=(n,fn)=>{try{tests.push({name:n,pass:true,detail:String(fn()||'pass')})}catch(e){tests.push({name:n,pass:false,detail:String(e.message||e)})}};
add('V14 minimum evidence gate',()=>{const xs=Array.from({length:MIN_EVIDENCE-1},()=>({reason:'attack_resisted'}));if(classify(xs).kind!=='insufficient')throw Error('barrier classified too early');return`${MIN_EVIDENCE} events required`});
add('V14 adversary diagnosis',()=>{const xs=Array.from({length:20},(_,i)=>({reason:i<14?'attack_resisted':'instrument_rejected'}));if(classify(xs).kind!=='adversary')throw Error('adversary barrier missed');return'70% resisted → adversary barrier'});
add('V14 instrument diagnosis',()=>{const xs=[...Array.from({length:4},()=>({reason:'attack_resisted'})),...Array.from({length:12},()=>({reason:'instrument_rejected'}))];if(classify(xs).kind!=='instrument')throw Error('instrument barrier missed');return'qualified attacks dominated by instrument failure'});
add('V14 language diagnosis',()=>{const xs=[...Array.from({length:8},()=>({reason:'instrument_rejected'})),...Array.from({length:4},()=>({reason:'derived_sense_added'}))];if(classify(xs).kind!=='language')throw Error('language barrier missed');return'derived senses without K/Ω → language barrier overrides lower-level instrument pressure'});
add('V14 causal action isolation',()=>{const s=initialState(),a=actionFor({kind:'adversary'},20,s),i=actionFor({kind:'instrument'},20,s);if(!a.seedSalt||a.extraExperiment||i.seedSalt||!i.extraExperiment)throw Error('barrier actions crossed');return'adversary reroutes seed; instrument allocates bounded experiment compute'});
add('V14 judge immutability',()=>{const s=initialState();for(const x of ['pThreshold','effectThreshold','nullCount','judge','certificate','depth'])if(Object.prototype.hasOwnProperty.call(s,x))throw Error(`barrier state owns ${x}`);return'barrier diagnoses process, never truth'});return tests}
return{...V13,VERSION,epistemicCycle,selfTest,__v14:{WINDOW,MIN_EVIDENCE,BONUS_EXPERIMENT_COOLDOWN,classify,initialState,sanitize,actionFor,persistable}};
});
