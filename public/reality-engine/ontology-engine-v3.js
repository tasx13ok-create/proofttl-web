(function(root,factory){
  const api=factory(root.OntologyEngineV2);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV3=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){
'use strict';
if(!Base) throw new Error('OntologyEngineV3 requires OntologyEngineV2');

const VERSION='0.4.1-alpha';
const MAX_TWIN_ATTEMPTS=6;

function mix32(x){
  x=x>>>0;
  x^=x>>>16; x=Math.imul(x,0x7feb352d);
  x^=x>>>15; x=Math.imul(x,0x846ca68b);
  x^=x>>>16;
  return x>>>0||1;
}
function attemptSeed(seed,attempt,attack){
  return mix32((seed>>>0)^Math.imul(attempt+1,0x9E3779B1)^Math.imul((attack||0)+1,0x85EBCA6B)^0x54C1F00D);
}
function twinDeficit(t){
  if(!t) return 99;
  const hidden=Math.max(0,.36-(Number(t.hiddenDistance)||0))/.36;
  const accuracy=Math.max(0,(Number(t.auditAccuracy)||1)-.625)/.375;
  const gap=Math.max(0,(Number(t.auditGap)||99)-1.45)/1.45;
  return hidden+accuracy+gap;
}
function resultDeficit(r){
  return twinDeficit(r?.primary)+twinDeficit(r?.transfer);
}
function summarizeFailure(r,metaAttempt,seed){
  return {
    metaAttempt,
    seed,
    deficit:resultDeficit(r),
    primary:r?.primary?{
      family:r.primary.family,
      qualifies:!!r.primary.qualifies,
      hiddenDistance:r.primary.hiddenDistance,
      auditAccuracy:r.primary.auditAccuracy,
      auditGap:r.primary.auditGap,
      hashA:r.primary.hashA,
      hashB:r.primary.hashB,
      splitHashes:r.primary.splitHashes
    }:null,
    transfer:r?.transfer?{
      family:r.transfer.family,
      qualifies:!!r.transfer.qualifies,
      hiddenDistance:r.transfer.hiddenDistance,
      auditAccuracy:r.transfer.auditAccuracy,
      auditGap:r.transfer.auditGap,
      hashA:r.transfer.hashA,
      hashB:r.transfer.hashB,
      splitHashes:r.transfer.splitHashes
    }:null
  };
}
function attemptsFor(ontology,depth){
  const extra=Math.floor(Math.max(0,(Array.isArray(ontology)?ontology.length:4)-4)/3)+Math.min(2,Number(depth)||0);
  return Math.min(MAX_TWIN_ATTEMPTS,4+extra);
}

function epistemicCycle(opts={}){
  const ontology=Array.isArray(opts.ontology)&&opts.ontology.length?opts.ontology:Base.seedOntology();
  const depth=Number(opts.depth)||0;
  const attack=Number(opts.attack)||0;
  const seed=Number(opts.seed)||1;
  const progress=typeof opts.progress==='function'?opts.progress:null;
  const maxAttempts=attemptsFor(ontology,depth);
  const archive=[];
  let bestFailure=null;

  for(let i=0;i<maxAttempts;i++){
    const subSeed=attemptSeed(seed,i,attack);
    progress&&progress({phase:'twin',family:'SEARCH',restart:i+1,restarts:maxAttempts,generation:0,metaAttempt:i+1,metaAttempts:maxAttempts});
    const result=Base.epistemicCycle({
      ontology,
      depth,
      attack,
      seed:subSeed,
      progress:p=>progress&&progress({...p,metaAttempt:i+1,metaAttempts:maxAttempts})
    });

    if(result?.ok || result?.reason!=='attack_resisted'){
      return {
        ...result,
        searchStats:{
          strategy:'locked-multi-start',
          requestedSeed:seed,
          attemptsUsed:i+1,
          attemptsAllowed:maxAttempts,
          successfulTwinAttempt:i+1,
          independentLockedSplits:true,
          archive
        }
      };
    }

    const failure=summarizeFailure(result,i+1,subSeed);
    archive.push(failure);
    if(!bestFailure || failure.deficit<bestFailure.deficit) bestFailure={...failure,result};
  }

  const chosen=bestFailure?.result||Base.epistemicCycle({ontology,depth,attack,seed:attemptSeed(seed,maxAttempts,attack)});
  return {
    ...chosen,
    reason:'attack_resisted',
    searchStats:{
      strategy:'locked-multi-start',
      requestedSeed:seed,
      attemptsUsed:maxAttempts,
      attemptsAllowed:maxAttempts,
      successfulTwinAttempt:null,
      independentLockedSplits:true,
      bestDeficit:bestFailure?.deficit??null,
      archive
    }
  };
}

function selfTest(){
  const tests=[...(Base.selfTest?Base.selfTest():[])];
  try{
    const seeds=new Set();
    for(let i=0;i<MAX_TWIN_ATTEMPTS;i++) seeds.add(attemptSeed(12345,i,2));
    if(seeds.size!==MAX_TWIN_ATTEMPTS) throw new Error('retry seeds collided');
    tests.push({name:'Twin Forge v3 split isolation',pass:true,detail:`${seeds.size} unique locked retry seeds`});
  }catch(e){tests.push({name:'Twin Forge v3 split isolation',pass:false,detail:String(e.message||e)})}
  try{
    const a=attemptsFor(Base.seedOntology(),0),b=attemptsFor([...Base.seedOntology(),...Base.seedOntology()],2);
    if(a<4||b<a||b>MAX_TWIN_ATTEMPTS) throw new Error('adaptive retry budget invalid');
    tests.push({name:'Twin Forge v3 adaptive budget',pass:true,detail:`depth0=${a}, stressed=${b}, max=${MAX_TWIN_ATTEMPTS}`});
  }catch(e){tests.push({name:'Twin Forge v3 adaptive budget',pass:false,detail:String(e.message||e)})}
  return tests;
}

return {
  ...Base,
  VERSION,
  epistemicCycle,
  selfTest,
  __v3:{attemptSeed,attemptsFor,twinDeficit,resultDeficit,MAX_TWIN_ATTEMPTS}
};
});
