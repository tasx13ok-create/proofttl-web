(function(root,factory){
  const originalV2=root.OntologyEngineV2;
  const api=factory(root.OntologyEngineV3,originalV2);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV4=api;
  // Compatibility alias: the existing browser runtime binds OntologyEngineV2.
  // V4 captures the original V2 above, then safely promotes the public alias.
  root.OntologyEngineV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Prev,Base){
'use strict';
if(!Base) throw new Error('OntologyEngineV4 requires OntologyEngineV2');
if(!Prev) throw new Error('OntologyEngineV4 requires OntologyEngineV3');

const VERSION='0.5.0-alpha';
const MAX_FAMILY_ATTEMPTS=6;
const DUAL_FINALISTS_PER_FAMILY=16;
const DUAL_POPULATION=56;
const DUAL_GENERATIONS=18;

function mix32(x){
  x=x>>>0;
  x^=x>>>16; x=Math.imul(x,0x7feb352d);
  x^=x>>>15; x=Math.imul(x,0x846ca68b);
  x^=x>>>16;
  return x>>>0||1;
}
function familySalt(family){return family==='graph'?0x47524150:0x50415254}
function familyAttemptSeed(seed,family,attempt,attack){
  return mix32((seed>>>0)^familySalt(family)^Math.imul(attempt+1,0x9E3779B1)^Math.imul((attack||0)+1,0x85EBCA6B)^0xD3C0A11E);
}
function attemptsFor(ontology,depth){
  const inherited=Prev.__v3?.attemptsFor?Prev.__v3.attemptsFor(ontology,depth):4;
  return Math.min(MAX_FAMILY_ATTEMPTS,Math.max(4,inherited));
}
function twinDeficit(t){
  if(!t) return 99;
  const hidden=Math.max(0,.36-(Number(t.hiddenDistance)||0))/.36;
  const accuracy=Math.max(0,(Number(t.auditAccuracy)||1)-.625)/.375;
  const gap=Math.max(0,(Number(t.auditGap)||99)-1.45)/1.45;
  return hidden+accuracy+gap;
}
function summarizeTwin(t,attempt,seed){
  return {
    attempt,seed,qualifies:!!t?.qualifies,deficit:twinDeficit(t),
    hiddenDistance:t?.hiddenDistance,auditAccuracy:t?.auditAccuracy,auditGap:t?.auditGap,
    hashA:t?.hashA,hashB:t?.hashB,splitHashes:t?.splitHashes
  };
}
function forgeFamily({family,ontology,depth,attack,seed,progress}){
  const maxAttempts=attemptsFor(ontology,depth);
  const forgeCandidates=20+Math.min(28,depth*10);
  const forgeIterations=44+Math.min(44,depth*18);
  const archive=[];
  let best=null;
  for(let i=0;i<maxAttempts;i++){
    const subSeed=familyAttemptSeed(seed,family,i,attack);
    progress&&progress({phase:'twin',family,restart:i+1,restarts:maxAttempts,generation:0,familyAttempt:i+1,familyAttempts:maxAttempts});
    const twin=Base.forgeTwin({
      family,ontology,seed:subSeed,candidates:forgeCandidates,iterations:forgeIterations,
      progress:p=>progress&&progress({...p,familyAttempt:i+1,familyAttempts:maxAttempts})
    });
    const summary=summarizeTwin(twin,i+1,subSeed);
    archive.push(summary);
    if(!best||summary.deficit<best.summary.deficit) best={twin,summary};
    if(twin.qualifies){
      return {ok:true,twin,attemptsUsed:i+1,attemptsAllowed:maxAttempts,archive,seed:subSeed};
    }
  }
  return {ok:false,twin:best?.twin||null,attemptsUsed:maxAttempts,attemptsAllowed:maxAttempts,archive,bestDeficit:best?.summary.deficit??null};
}

function mergeCandidates(groups){
  const map=new Map();
  for(const group of groups){
    for(const x of group.items||[]){
      const id=Base.instrumentId(x.program);
      const prior=map.get(id);
      const item={...x,originFamily:group.family,originRun:group.run};
      if(!prior||Number(item.score)>Number(prior.score)) map.set(id,item);
    }
  }
  return [...map.values()];
}
function balanceScore(c){
  if(!c) return -1e9;
  const effect=Math.min((c.effect||0)/.75,(c.transferEffect||0)/.50);
  const consistency=Math.min((c.consistency||0)/.72,(c.transferConsistency||0)/.62);
  const accuracy=Math.min((c.accuracyGain||0)/.06,(c.transferAccuracyGain||0)/.04);
  const irreducibility=Math.min((c.irreducibility||0)/.12,(c.transferIrreducibility||0)/.08);
  const sig=(c.padj<.05?1:0)+(c.transferPadj<.10?1:0);
  return (c.certified?1000:0)+effect*2+consistency+accuracy*3+irreducibility*.25+sig-(c.complexity||0)*.015;
}
function dualFamilyForge({primary,transfer,ontology,seed,depth,progress}){
  const groups=[];
  const runsPerFamily=depth>=6?2:1;
  const families=[{family:primary.family,twin:primary,salt:0xC0FFEE},{family:transfer.family,twin:transfer,salt:0xFACEB00C}];
  for(const f of families){
    for(let run=0;run<runsPerFamily;run++){
      const runSeed=mix32(seed^f.salt^Math.imul(run+1,0x6D2B79F5));
      progress&&progress({phase:'instrument',generation:0,family:f.family,forgeRun:run+1,forgeRuns:runsPerFamily});
      const items=Base.evolveInstrument({
        family:f.family,twin:f.twin,ontology,seed:runSeed,
        population:DUAL_POPULATION,generations:DUAL_GENERATIONS,finalists:DUAL_FINALISTS_PER_FAMILY,
        progress:p=>progress&&progress({...p,family:f.family,forgeRun:run+1,forgeRuns:runsPerFamily})
      });
      groups.push({family:f.family,run:run+1,items,splitHashes:items.splitHashes});
    }
  }
  const pool=mergeCandidates(groups);
  const context=Base.buildCertificationContext(primary,transfer,ontology,mix32(seed^0xD00DCAFE));
  const multiplicity=Math.max(1,pool.length);
  const certified=pool.map(x=>{
    const certificate=Base.certifyInstrument(x.program,{context,multiplicity});
    return {...x,certificate,jointScore:balanceScore(certificate)};
  }).sort((a,b)=>b.jointScore-a.jointScore);

  // Fresh random programs from the unchanged DSL. These never participate in evolution.
  const randomPrograms=Base.shadowOntology(mix32(seed^0xBADA55),32);
  const randomBaseline=randomPrograms.map(x=>{
    const certificate=Base.certifyInstrument(x.program,{context,multiplicity:32});
    return {program:x.program,label:x.label,certificate,jointScore:balanceScore(certificate)};
  }).sort((a,b)=>b.jointScore-a.jointScore);
  const baseline={
    count:randomBaseline.length,
    certified:randomBaseline.filter(x=>x.certificate.certified).length,
    best:randomBaseline[0]?{
      label:randomBaseline[0].label,
      accuracyGain:randomBaseline[0].certificate.accuracyGain,
      transferAccuracyGain:randomBaseline[0].certificate.transferAccuracyGain,
      effect:randomBaseline[0].certificate.effect,
      transferEffect:randomBaseline[0].certificate.transferEffect
    }:null
  };
  return {groups,poolSize:pool.length,certified,baseline,context};
}

function epistemicCycle(opts={}){
  const ontology=Array.isArray(opts.ontology)&&opts.ontology.length?opts.ontology:Base.seedOntology();
  const depth=Number(opts.depth)||0;
  const attack=Number(opts.attack)||0;
  const seed=Number(opts.seed)||1;
  const progress=typeof opts.progress==='function'?opts.progress:null;
  const primaryFamily=Base.FAMILIES[attack%2];
  const transferFamily=Base.FAMILIES[(attack+1)%2];
  progress&&progress({phase:'start',primaryFamily,transferFamily,strategy:'decoupled-dual-family'});

  // Each simulator family now earns its epistemic twin independently.
  // There is no scientific reason both twins must happen to share one meta-seed.
  const primarySearch=forgeFamily({family:primaryFamily,ontology,depth,attack,seed:mix32(seed^0xA53A),progress});
  const transferSearch=forgeFamily({family:transferFamily,ontology,depth,attack,seed:mix32(seed^0x7F4A),progress});
  const primary=primarySearch.twin;
  const transfer=transferSearch.twin;
  const searchStats={
    strategy:'decoupled-family-locked-search',
    requestedSeed:seed,
    independentLockedSplits:true,
    primary:{family:primaryFamily,ok:primarySearch.ok,attemptsUsed:primarySearch.attemptsUsed,attemptsAllowed:primarySearch.attemptsAllowed,bestDeficit:primarySearch.bestDeficit??0,archive:primarySearch.archive},
    transfer:{family:transferFamily,ok:transferSearch.ok,attemptsUsed:transferSearch.attemptsUsed,attemptsAllowed:transferSearch.attemptsAllowed,bestDeficit:transferSearch.bestDeficit??0,archive:transferSearch.archive}
  };
  if(!primarySearch.ok||!transferSearch.ok){
    return {ok:false,reason:'attack_resisted',primary,transfer,ontology:[...ontology],depth,attack:attack+1,primaryFamily,transferFamily,searchStats};
  }

  const forge=dualFamilyForge({primary,transfer,ontology,seed:mix32(seed^0xC01DB10D),depth,progress});
  const finalists=forge.certified;
  const winner=finalists.find(x=>x.certificate.certified)||finalists[0]||null;
  if(!winner||!winner.certificate.certified){
    return {
      ok:false,reason:'instrument_rejected',primary,transfer,finalists,baseline:forge.baseline,
      ontology:[...ontology],depth,attack:attack+1,primaryFamily,transferFamily,searchStats,
      instrumentForgeStats:{strategy:'dual-family-candidate-pool',poolSize:forge.poolSize,groups:forge.groups.map(g=>({family:g.family,run:g.run,count:g.items.length,splitHashes:g.splitHashes}))}
    };
  }

  const strictDepth=forge.baseline.certified===0;
  const nextDepth=depth+(strictDepth?1:0);
  const prefix=strictDepth?'Ω':'D';
  const hash=Base.instrumentId(winner.program).replace(/^I-/,'').slice(0,5);
  const instrument={
    id:`${prefix}${strictDepth?nextDepth:ontology.length-3}-${hash}`,
    program:winner.program,label:Base.instrumentString(winner.program),certified:true,depth:nextDepth,
    tier:strictDepth?'epistemic-depth':'derived-dsl',certificate:winner.certificate,
    sourceFamily:primaryFamily,transferFamily,randomBaselinePasses:forge.baseline.certified,
    evolvedOnFamily:winner.originFamily,forgeStrategy:'dual-family-candidate-pool'
  };
  const next=[...ontology,instrument];
  return {
    ok:true,reason:strictDepth?'epistemic_depth_increased':'derived_sense_added',strictDepth,
    primary,transfer,winner:{...winner,instrument},finalists,baseline:forge.baseline,
    nextOntology:next,ontology:next,depth:nextDepth,attack:attack+1,primaryFamily,transferFamily,searchStats,
    instrumentForgeStats:{strategy:'dual-family-candidate-pool',poolSize:forge.poolSize,winningOrigin:winner.originFamily,groups:forge.groups.map(g=>({family:g.family,run:g.run,count:g.items.length,splitHashes:g.splitHashes}))}
  };
}

function selfTest(){
  const tests=[...(Prev.selfTest?Prev.selfTest():[])];
  const add=(name,fn)=>{try{tests.push({name,pass:true,detail:String(fn()||'pass')})}catch(e){tests.push({name,pass:false,detail:String(e.message||e)})}};
  add('V4 decoupled family seeds',()=>{
    const a=new Set(),b=new Set();
    for(let i=0;i<MAX_FAMILY_ATTEMPTS;i++){a.add(familyAttemptSeed(12345,'particles',i,2));b.add(familyAttemptSeed(12345,'graph',i,2))}
    if(a.size!==MAX_FAMILY_ATTEMPTS||b.size!==MAX_FAMILY_ATTEMPTS) throw Error('family retry collision');
    for(const x of a) if(b.has(x)) throw Error('particle/graph split collision');
    return `${a.size}+${b.size} isolated family roots`;
  });
  add('V4 random baseline isolation',()=>{
    const a=Base.shadowOntology(99117,32),b=Base.shadowOntology(99118,32);
    if(a.length!==32||b.length!==32) throw Error('baseline count wrong');
    const A=new Set(a.map(x=>Base.instrumentId(x.program))),B=new Set(b.map(x=>Base.instrumentId(x.program)));
    if(A.size<28||B.size<28) throw Error('baseline diversity collapsed');
    return `${A.size}/32 and ${B.size}/32 unique`;
  });
  add('V4 balanced transfer ranking',()=>{
    const good=balanceScore({certified:true,effect:1,transferEffect:1,consistency:.8,transferConsistency:.8,accuracyGain:.1,transferAccuracyGain:.08,irreducibility:.5,transferIrreducibility:.5,padj:.01,transferPadj:.01,complexity:5});
    const brittle=balanceScore({certified:false,effect:9,transferEffect:.01,consistency:1,transferConsistency:.1,accuracyGain:.8,transferAccuracyGain:0,irreducibility:2,transferIrreducibility:0,padj:1e-9,transferPadj:1,complexity:5});
    if(!(good>brittle)) throw Error('single-family specialist outranked balanced candidate');
    return 'balanced candidate wins';
  });
  return tests;
}

return {
  ...Base,
  VERSION,
  epistemicCycle,
  selfTest,
  __v4:{forgeFamily,dualFamilyForge,familyAttemptSeed,attemptsFor,balanceScore,MAX_FAMILY_ATTEMPTS}
};
});
