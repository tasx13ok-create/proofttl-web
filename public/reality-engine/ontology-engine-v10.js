(function(root,factory){
  const api=factory(root.OntologyEngineV9);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV10=api;
  root.OntologyEngineV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(V9){
'use strict';
if(!V9) throw new Error('OntologyEngineV10 requires V9');
const VERSION='1.1.0-alpha';
const POPULATION=6;
const GENERATION_TRIALS=12;
const HISTORY_LIMIT=96;
const HORIZONS=[1,2,3,5,8,13];
const SPANS=[0,1,3,5,8];
function mix(x){x=x>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);x^=x>>>16;return x>>>0||1}
class RNG{constructor(seed){this.s=seed>>>0||1}next(){let a=this.s|0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;this.s=a>>>0;return((t^t>>>14)>>>0)/4294967296}int(n){return Math.floor(this.next()*n)}pick(a){return a[this.int(a.length)]}range(a,b){return a+(b-a)*this.next()}}
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function questionId(g){return`Q${g.generation}-${mix(g.scopeSalt^Math.imul(g.horizon,0x9E3779B1)^Math.imul(g.span+1,0x85EBCA6B)^Math.round(g.novelty*1e6)^g.familyFlip).toString(16).toUpperCase().slice(0,6)}`}
function freshGenome(r,generation=0,parent=null){
  const jitter=(v,s)=>clamp(v+r.range(-s,s),.05,.95);
  const g={
    generation,parent:parent?.id||null,
    scopeSalt:parent?mix(parent.scopeSalt^mix(r.int(0x7fffffff))):mix(r.int(0x7fffffff)),
    horizon:parent?(r.next()<.42?r.pick(HORIZONS):parent.horizon):r.pick(HORIZONS),
    span:parent?(r.next()<.42?r.pick(SPANS):parent.span):r.pick(SPANS),
    familyFlip:parent?(r.next()<.24?1-parent.familyFlip:parent.familyFlip):r.int(2),
    novelty:parent?jitter(parent.novelty,.18):r.range(.18,.86),
    reward:0,trials:0,lifetimeReward:parent?.lifetimeReward||0,lifetimeTrials:parent?.lifetimeTrials||0
  };
  g.id=questionId(g);return g;
}
function initialState(lineageSeed){const seed=mix((Number(lineageSeed)||1)^0x51554553),r=new RNG(seed);return{version:'question-ecology-v1',seed,generation:0,trialCount:0,population:Array.from({length:POPULATION},()=>freshGenome(r,0)),history:[],lastEvolution:null}}
function sanitize(raw,lineageSeed){
  if(!raw||raw.version!=='question-ecology-v1'||!Array.isArray(raw.population)||raw.population.length!==POPULATION)return initialState(lineageSeed);
  return{version:'question-ecology-v1',seed:Number(raw.seed)||mix((Number(lineageSeed)||1)^0x51554553),generation:Number(raw.generation)||0,trialCount:Number(raw.trialCount)||0,population:raw.population.map(g=>({id:String(g.id||'Q'),generation:Number(g.generation)||0,parent:g.parent||null,scopeSalt:Number(g.scopeSalt)>>>0,horizon:HORIZONS.includes(Number(g.horizon))?Number(g.horizon):1,span:SPANS.includes(Number(g.span))?Number(g.span):0,familyFlip:Number(g.familyFlip)&1,novelty:clamp(Number(g.novelty)||.5,.05,.95),reward:Number(g.reward)||0,trials:Number(g.trials)||0,lifetimeReward:Number(g.lifetimeReward)||0,lifetimeTrials:Number(g.lifetimeTrials)||0})),history:Array.isArray(raw.history)?raw.history.slice(-HISTORY_LIMIT):[],lastEvolution:raw.lastEvolution||null};
}
const avg=g=>g.trials?g.reward/g.trials:0;
function select(state){const u=state.population.find(g=>g.trials===0);if(u)return u;const total=Math.max(1,state.population.reduce((s,g)=>s+g.trials,0));return[...state.population].sort((a,b)=>{const A=avg(a)+.32*Math.sqrt(Math.log(total+1)/Math.max(1,a.trials)),B=avg(b)+.32*Math.sqrt(Math.log(total+1)/Math.max(1,b.trials));return B-A})[0]}
function questionSeed(rootSeed,publicAttack,g){return mix((Number(rootSeed)||1)^g.scopeSalt^Math.imul((publicAttack+1)*g.horizon,0x9E3779B1)^Math.imul(Math.round(g.novelty*1000)+1,0x85EBCA6B))}
function questionAttack(publicAttack,g){return Math.max(0,(Number(publicAttack)||0)+g.span+g.familyFlip)}
function rewardResult(r){let x=0;if(r?.strictDepth)x+=10;if(r?.languageEvent)x+=8;if(r?.ok&&!r.strictDepth&&!r.languageEvent)x+=4;if(r?.reason==='instrument_rejected')x+=1.5;if(r?.reason==='attack_resisted')x+=.05;if(r?.languageForge?.attempted)x+=.25;const dc=r?.depthCourt;if(dc?.confirmations)x+=dc.confirmations.filter(c=>c?.certified).length*.15;if(dc?.replication?.twinsQualified)x+=.2;return x}
function evolve(state){if(!state.trialCount||state.trialCount%GENERATION_TRIALS!==0)return;const ranked=[...state.population].sort((a,b)=>avg(b)-avg(a)),parents=ranked.slice(0,2),r=new RNG(mix(state.seed^Math.imul(state.generation+1,0x9E3779B1)^state.trialCount));state.generation++;state.population=[{...parents[0],generation:state.generation,reward:0,trials:0},{...parents[1],generation:state.generation,reward:0,trials:0},freshGenome(r,state.generation,parents[0]),freshGenome(r,state.generation,parents[0]),freshGenome(r,state.generation,parents[1]),freshGenome(r,state.generation,parents[1])];state.lastEvolution={generation:state.generation,atTrial:state.trialCount,parents:parents.map(p=>({id:p.id,meanReward:avg(p),lifetimeTrials:p.lifetimeTrials}))}}
function persistable(s){return JSON.parse(JSON.stringify({version:s.version,seed:s.seed,generation:s.generation,trialCount:s.trialCount,population:s.population,history:s.history.slice(-HISTORY_LIMIT),lastEvolution:s.lastEvolution}))}
function normalizeNested(result,publicAttack){
  for(const key of ['scientistEcology','worldEcology']){
    const e=result?.[key];if(!e)continue;
    if(Array.isArray(e.history)&&e.history.length)e.history[e.history.length-1].attack=publicAttack;
    if(e.persistable?.history?.length)e.persistable.history[e.persistable.history.length-1].attack=publicAttack;
  }
}
function summary(s,q,reward){return{version:s.version,generation:s.generation,trialCount:s.trialCount,populationSize:s.population.length,selected:q.id,reward,immutableJudge:true,meaning:'bounded question-scope evolution; no semantic truth authority',population:s.population.map(g=>({id:g.id,generation:g.generation,parent:g.parent,horizon:g.horizon,span:g.span,familyFlip:g.familyFlip,novelty:g.novelty,trials:g.trials,meanReward:avg(g),lifetimeTrials:g.lifetimeTrials,lifetimeMean:g.lifetimeTrials?g.lifetimeReward/g.lifetimeTrials:0})),lastEvolution:s.lastEvolution,history:s.history.slice(-30),persistable:persistable(s)}}
function epistemicCycle(opts={}){
  const publicAttack=Number(opts.attack)||0,lineageSeed=Number(opts.lineageSeed)||Number(opts.seed)||1,state=sanitize(opts.questionEcologyState,lineageSeed),q=select(state),rootSeed=Number(opts.seed)||1,seed=questionSeed(rootSeed,publicAttack,q),internalAttack=questionAttack(publicAttack,q);
  opts.progress&&opts.progress({phase:'question',generation:state.generation,formula:`QUESTION ${q.id} · horizon ${q.horizon} · span ${q.span} · family ${q.familyFlip?'flip':'base'}`});
  const result=V9.epistemicCycle({...opts,attack:internalAttack,seed,lineageSeed});
  const reward=rewardResult(result);q.reward+=reward;q.trials++;q.lifetimeReward+=reward;q.lifetimeTrials++;state.trialCount++;
  const publicNext=publicAttack+1;normalizeNested(result,publicNext);
  state.history.push({trial:state.trialCount,attack:publicNext,question:q.id,reward,reason:result?.reason||'unknown',strictDepth:!!result?.strictDepth,languageEvent:!!result?.languageEvent,depth:Number(result?.depth)||Number(opts.depth)||0,languageDepth:Number(result?.languageDepth)||0,internalAttack,questionSeed:seed});state.history=state.history.slice(-HISTORY_LIMIT);evolve(state);
  return{...result,attack:publicNext,questionGenomeUsed:{id:q.id,generation:q.generation,scopeSalt:q.scopeSalt,horizon:q.horizon,span:q.span,familyFlip:q.familyFlip,novelty:q.novelty,questionSeed:seed,internalAttack},questionEcology:summary(state,q,reward)};
}
function selfTest(){const tests=[...(V9.selfTest?V9.selfTest():[])],add=(n,fn)=>{try{tests.push({name:n,pass:true,detail:String(fn()||'pass')})}catch(e){tests.push({name:n,pass:false,detail:String(e.message||e)})}};add('V10 question population',()=>{const s=initialState(17);if(s.population.length!==POPULATION||new Set(s.population.map(x=>x.id)).size<4)throw Error('question diversity collapsed');return`${POPULATION} bounded question-scope genomes`});add('V10 question determinism',()=>{const s=initialState(19),q=s.population[0],a=questionSeed(123,830,q),b=questionSeed(123,830,q);if(a!==b)throw Error('question seed drift');return`${a.toString(16).toUpperCase()} replay exact`});add('V10 judge immutability',()=>{const keys=Object.keys(initialState(1).population[0]);for(const x of ['pThreshold','effectThreshold','nullCount','judge','certificate','depth'])if(keys.includes(x))throw Error(`question genome can mutate ${x}`);return'question genomes cannot modify certification or depth'});add('V10 productive question reward',()=>{if(!(rewardResult({strictDepth:true})>rewardResult({reason:'instrument_rejected'})&&rewardResult({reason:'instrument_rejected'})>rewardResult({reason:'attack_resisted'})))throw Error('question reward inverted');return'breakthrough > hard question > unforgeable question'});return tests}
return{...V9,VERSION,epistemicCycle,selfTest,__v10:{POPULATION,GENERATION_TRIALS,initialState,sanitize,questionSeed,questionAttack,rewardResult,persistable}};
});
