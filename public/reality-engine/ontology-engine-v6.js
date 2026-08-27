(function(root,factory){
  const api=factory(root.OntologyEngineV5,root.OntologyEngineV4);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV6=api;
  root.OntologyEngineV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(V5,V4){
'use strict';
if(!V5||!V4) throw new Error('OntologyEngineV6 requires V5 + V4');

const VERSION='0.7.0-alpha';
const AUX_POPULATION=44;
const AUX_GENERATIONS=16;
const AUX_FINALISTS=14;

function mix32(x){
  x=x>>>0;
  x^=x>>>16; x=Math.imul(x,0x7feb352d);
  x^=x>>>15; x=Math.imul(x,0x846ca68b);
  x^=x>>>16;
  return x>>>0||1;
}
function seedFor(seed,salt,index=0){return mix32((Number(seed)||1)^salt^Math.imul(index+1,0x9E3779B1))}
function compactCertificate(c){
  if(!c)return null;
  return {certified:!!c.certified,localPass:!!c.localPass,transferPass:!!c.transferPass,effect:c.effect,consistency:c.consistency,padj:c.padj,redundancy:c.redundancy,accuracyGain:c.accuracyGain,irreducibility:c.irreducibility,predictiveGain:c.predictiveGain,transferEffect:c.transferEffect,transferConsistency:c.transferConsistency,transferPadj:c.transferPadj,transferAccuracyGain:c.transferAccuracyGain,transferIrreducibility:c.transferIrreducibility,splitHashes:c.splitHashes,complexity:c.complexity};
}
function mergePrograms(groups){
  const map=new Map();
  for(const g of groups){
    for(const x of g.items||[]){
      if(!x?.program)continue;
      const id=V4.instrumentId(x.program);
      if(!map.has(id))map.set(id,{program:x.program,origin:g.origin||x.originFamily||'unknown'});
    }
  }
  return [...map.values()];
}
function worstScore(a,b){
  const sa=V4.__v4.balanceScore(a),sb=V4.__v4.balanceScore(b);
  return Math.min(sa,sb)+0.08*(sa+sb);
}
function forgeAuxiliaryPair({ontology,depth,attack,seed,primaryFamily,transferFamily,progress}){
  const primary=V4.__v4.forgeFamily({family:primaryFamily,ontology,depth,attack:attack+100000,seed:seedFor(seed,0xA071A001),progress});
  const transfer=V4.__v4.forgeFamily({family:transferFamily,ontology,depth,attack:attack+200000,seed:seedFor(seed,0xA071A002),progress});
  return {ok:primary.ok&&transfer.ok,primary,transfer};
}
function generalizationForge({prelim,ontology,depth,attack,seed,progress}){
  const aux=forgeAuxiliaryPair({ontology,depth,attack,seed,primaryFamily:prelim.primaryFamily,transferFamily:prelim.transferFamily,progress});
  if(!aux.ok)return {ok:false,reason:'auxiliary_twins_resisted',aux};

  const groups=[{origin:'original-forge',items:prelim.finalists||[]}];
  for(const twin of [aux.primary.twin,aux.transfer.twin]){
    const items=V4.evolveInstrument({family:twin.family,twin,ontology,seed:seedFor(seed,twin.family==='graph'?0xA071B002:0xA071B001),population:AUX_POPULATION,generations:AUX_GENERATIONS,finalists:AUX_FINALISTS,progress});
    groups.push({origin:`aux-${twin.family}`,items});
  }
  const pool=mergePrograms(groups);
  const multiplicity=Math.max(1,pool.length);
  const originalContext=V4.buildCertificationContext(prelim.primary,prelim.transfer,ontology,seedFor(seed,0xA071C001));
  const auxContext=V4.buildCertificationContext(aux.primary.twin,aux.transfer.twin,ontology,seedFor(seed,0xA071C002));
  const scored=pool.map(x=>{
    const original=V4.certifyInstrument(x.program,{context:originalContext,multiplicity});
    const auxiliary=V4.certifyInstrument(x.program,{context:auxContext,multiplicity});
    return {...x,original,auxiliary,certified:!!original.certified&&!!auxiliary.certified,robustScore:worstScore(original,auxiliary)};
  }).sort((a,b)=>Number(b.certified)-Number(a.certified)||b.robustScore-a.robustScore);
  return {ok:true,aux,poolSize:pool.length,multiplicity,scored,winner:scored.find(x=>x.certified)||null};
}
function depthCourt(program,{prelim,ontology,depth,attack,seed}){
  const confirmations=V5.__v5.freshConfirmations(program,{primary:prelim.primary,transfer:prelim.transfer,ontology,seed:seedFor(seed,0xA071D001)});
  let nullBaseline={count:0,certified:null,best:null,skipped:true};
  let replication={twinsQualified:false,certified:false,skipped:true,certificate:null};
  if(confirmations.length===2&&confirmations.every(x=>x?.certified)){
    nullBaseline=V5.__v5.runNullBaseline(program,{primary:prelim.primary,transfer:prelim.transfer,ontology,seed:seedFor(seed,0xA071D002)});
    if(nullBaseline.certified===0){
      replication=V5.__v5.replicationAudit(program,{primaryFamily:prelim.primaryFamily,transferFamily:prelim.transferFamily,ontology,depth,attack,seed:seedFor(seed,0xA071D003)});
    }
  }
  const court={version:'depth-court-v2-generalization',candidate:V4.instrumentString(program),requirements:{freshConfirmations:2,nullBaselinePrograms:256,nullBaselineCertifiedRequired:0,independentTwinReplication:true,preCourtAuxiliaryTwinGeneralization:true},confirmations,nullBaseline,replication};
  court.status=V5.__v5.courtPass(court)?'confirmed':'downgraded';
  return court;
}
function makeInstrument({program,certificate,ontology,depth,strict,court,prelim,origin,generalization}){
  const nextDepth=depth+(strict?1:0);
  const hash=V4.instrumentId(program).replace(/^I-/,'').slice(0,5);
  return {id:`${strict?'Ω'+nextDepth:'D'+Math.max(1,ontology.length-3)}-${hash}`,program,label:V4.instrumentString(program),certified:true,depth:nextDepth,tier:strict?'epistemic-depth':'derived-dsl',certificate,sourceFamily:prelim.primaryFamily,transferFamily:prelim.transferFamily,randomBaselinePasses:court?.nullBaseline?.certified??prelim.baseline?.certified??null,evolvedOnFamily:origin||prelim.winner?.originFamily||prelim.winner?.evolvedOnFamily||'multi',forgeStrategy:'multi-twin-generalization-forge',depthCourtStatus:strict?'confirmed':'downgraded',depthCourt:court,generalizationAudit:generalization};
}
function epistemicCycle(opts={}){
  const ontology=Array.isArray(opts.ontology)&&opts.ontology.length?opts.ontology:V4.seedOntology();
  const depth=Number(opts.depth)||0,attack=Number(opts.attack)||0,seed=Number(opts.seed)||1;
  const progress=typeof opts.progress==='function'?opts.progress:null;
  const prelim=V4.epistemicCycle({...opts,ontology,depth,attack,seed,progress});
  if(!prelim?.ok||!prelim.strictDepth)return {...prelim,depthCourt:null,generalizationForge:null};

  progress&&progress({phase:'instrument',generation:0,formula:'GENERALIZATION FORGE · searching across independent twin pairs'});
  const gf=generalizationForge({prelim,ontology,depth,attack,seed:seedFor(seed,0xA0710001),progress});
  const chosen=gf.ok&&gf.winner?gf.winner:{program:prelim.winner.program,origin:'original-fallback',original:prelim.winner.certificate,auxiliary:null};
  const originalCertificate=chosen.original||prelim.winner.certificate;
  const court=depthCourt(chosen.program,{prelim,ontology,depth,attack,seed:seedFor(seed,0xA0710002)});
  const strict=court.status==='confirmed';
  const generalization={version:'generalization-forge-v1',auxiliaryTwinsQualified:!!gf.ok,poolSize:gf.poolSize||0,multiplicity:gf.multiplicity||0,robustCandidateFound:!!gf.winner,winningOrigin:chosen.origin,auxiliaryCertificate:compactCertificate(chosen.auxiliary),auxiliaryPrimary:gf.aux?.primary?.twin?{family:gf.aux.primary.twin.family,hashA:gf.aux.primary.twin.hashA,hashB:gf.aux.primary.twin.hashB,hiddenDistance:gf.aux.primary.twin.hiddenDistance,auditAccuracy:gf.aux.primary.twin.auditAccuracy,auditGap:gf.aux.primary.twin.auditGap}:null,auxiliaryTransfer:gf.aux?.transfer?.twin?{family:gf.aux.transfer.twin.family,hashA:gf.aux.transfer.twin.hashA,hashB:gf.aux.transfer.twin.hashB,hiddenDistance:gf.aux.transfer.twin.hiddenDistance,auditAccuracy:gf.aux.transfer.twin.auditAccuracy,auditGap:gf.aux.transfer.twin.auditGap}:null};
  const instrument=makeInstrument({program:chosen.program,certificate:originalCertificate,ontology,depth,strict,court,prelim,origin:chosen.origin,generalization});
  const next=[...ontology,instrument];
  return {...prelim,ok:true,reason:strict?'epistemic_depth_increased':'derived_sense_added',strictDepth:strict,depth:strict?depth+1:depth,ontology:next,nextOntology:next,winner:{...prelim.winner,program:chosen.program,certificate:originalCertificate,instrument},baseline:{...(prelim.baseline||{}),count:court.nullBaseline.count||prelim.baseline?.count||0,certified:court.nullBaseline.certified??prelim.baseline?.certified??null,best:court.nullBaseline.best??prelim.baseline?.best??null},depthCourt:court,depthCourtConfirmed:strict,depthCourtDowngraded:!strict,generalizationForge:generalization};
}
function selfTest(){
  const tests=[...(V5.selfTest?V5.selfTest():[])];
  const add=(name,fn)=>{try{tests.push({name,pass:true,detail:String(fn()||'pass')})}catch(e){tests.push({name,pass:false,detail:String(e.message||e)})}};
  add('V6 generalization seed isolation',()=>{const s=new Set();for(let i=0;i<8;i++)s.add(seedFor(33119,0xA0710001,i));if(s.size!==8)throw Error('generalization seeds collided');return `${s.size} isolated roots`});
  add('V6 robust ranking',()=>{const a={certified:true,effect:1,transferEffect:1,consistency:.8,transferConsistency:.8,accuracyGain:.1,transferAccuracyGain:.08,irreducibility:.5,transferIrreducibility:.5,padj:.01,transferPadj:.01,complexity:5};const b={...a,certified:false,transferEffect:.01,transferAccuracyGain:0,transferPadj:1};if(!(worstScore(a,a)>worstScore(a,b)))throw Error('brittle candidate not penalized');return 'worst-context candidate wins'});
  add('V6 court remains external',()=>{if(!V5.__v5||V5.__v5.NULL_BASELINE_COUNT!==256)throw Error('Depth Court contract missing');return '256-program null + independent replication preserved'});
  return tests;
}
return {...V4,VERSION,epistemicCycle,selfTest,__v6:{generalizationForge,forgeAuxiliaryPair,depthCourt,seedFor}};
});
