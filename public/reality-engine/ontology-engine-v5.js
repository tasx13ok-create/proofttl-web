(function(root,factory){
  const previous=root.OntologyEngineV4;
  const api=factory(previous);
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV5=api;
  // Existing browser UI binds OntologyEngineV2. Promote the audited engine alias.
  root.OntologyEngineV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Prev){
'use strict';
if(!Prev) throw new Error('OntologyEngineV5 requires OntologyEngineV4');

const VERSION='0.6.0-alpha';
const NULL_BASELINE_COUNT=256;
const FRESH_CONFIRMATIONS=2;
const REPLICATION_TWIN_ATTEMPTS=4;

function mix32(x){
  x=x>>>0;
  x^=x>>>16; x=Math.imul(x,0x7feb352d);
  x^=x>>>15; x=Math.imul(x,0x846ca68b);
  x^=x>>>16;
  return x>>>0||1;
}
function seedFor(seed,salt,index=0){
  return mix32((Number(seed)||1)^salt^Math.imul(index+1,0x9E3779B1));
}
function compactCertificate(c){
  if(!c) return null;
  return {
    certified:!!c.certified,
    localPass:!!c.localPass,
    transferPass:!!c.transferPass,
    effect:c.effect,
    consistency:c.consistency,
    padj:c.padj,
    redundancy:c.redundancy,
    accuracyGain:c.accuracyGain,
    irreducibility:c.irreducibility,
    predictiveGain:c.predictiveGain,
    transferEffect:c.transferEffect,
    transferConsistency:c.transferConsistency,
    transferPadj:c.transferPadj,
    transferAccuracyGain:c.transferAccuracyGain,
    transferIrreducibility:c.transferIrreducibility,
    splitHashes:c.splitHashes
  };
}
function forgeReplicationTwin({family,ontology,depth,attack,seed}){
  const archive=[];
  const candidates=22+Math.min(24,Math.max(0,depth)*8);
  const iterations=48+Math.min(40,Math.max(0,depth)*14);
  let best=null;
  for(let i=0;i<REPLICATION_TWIN_ATTEMPTS;i++){
    const subSeed=seedFor(seed,family==='graph'?0x47525052:0x50525452,i+attack);
    const twin=Prev.forgeTwin({family,ontology,seed:subSeed,candidates,iterations});
    const deficit=(t)=>{
      if(!t) return 99;
      return Math.max(0,.36-(Number(t.hiddenDistance)||0))/.36+
        Math.max(0,(Number(t.auditAccuracy)||1)-.625)/.375+
        Math.max(0,(Number(t.auditGap)||99)-1.45)/1.45;
    };
    const item={
      attempt:i+1,seed:subSeed,qualifies:!!twin?.qualifies,deficit:deficit(twin),
      hiddenDistance:twin?.hiddenDistance,auditAccuracy:twin?.auditAccuracy,auditGap:twin?.auditGap,
      hashA:twin?.hashA,hashB:twin?.hashB,splitHashes:twin?.splitHashes
    };
    archive.push(item);
    if(!best||item.deficit<best.item.deficit) best={twin,item};
    if(twin?.qualifies) return {ok:true,twin,attemptsUsed:i+1,archive};
  }
  return {ok:false,twin:best?.twin||null,attemptsUsed:REPLICATION_TWIN_ATTEMPTS,archive};
}
function runNullBaseline(program,{primary,transfer,ontology,seed}){
  const context=Prev.buildCertificationContext(primary,transfer,ontology,seedFor(seed,0x4E554C4C));
  const probes=Prev.shadowOntology(seedFor(seed,0x52414E44),NULL_BASELINE_COUNT);
  let certified=0,best=null;
  for(const probe of probes){
    const certificate=Prev.certifyInstrument(probe.program,{context,multiplicity:NULL_BASELINE_COUNT});
    const score=(certificate.accuracyGain||0)+(certificate.transferAccuracyGain||0)+(certificate.effect||0)*.05+(certificate.transferEffect||0)*.05;
    if(certificate.certified) certified++;
    if(!best||score>best.score) best={score,label:probe.label||Prev.instrumentString(probe.program),certificate:compactCertificate(certificate)};
  }
  return {count:probes.length,certified,best,splitHashes:best?.certificate?.splitHashes||null};
}
function freshConfirmations(program,{primary,transfer,ontology,seed}){
  const results=[];
  for(let i=0;i<FRESH_CONFIRMATIONS;i++){
    const context=Prev.buildCertificationContext(primary,transfer,ontology,seedFor(seed,0x434F4E46,i));
    const certificate=Prev.certifyInstrument(program,{context,multiplicity:1});
    results.push(compactCertificate(certificate));
  }
  return results;
}
function replicationAudit(program,{primaryFamily,transferFamily,ontology,depth,attack,seed}){
  const p=forgeReplicationTwin({family:primaryFamily,ontology,depth,attack,seed:seedFor(seed,0x52505031)});
  const t=forgeReplicationTwin({family:transferFamily,ontology,depth,attack,seed:seedFor(seed,0x52505032)});
  if(!p.ok||!t.ok){
    return {
      twinsQualified:false,
      certified:false,
      primary:{ok:p.ok,attemptsUsed:p.attemptsUsed,archive:p.archive},
      transfer:{ok:t.ok,attemptsUsed:t.attemptsUsed,archive:t.archive},
      certificate:null
    };
  }
  const context=Prev.buildCertificationContext(p.twin,t.twin,ontology,seedFor(seed,0x52435054));
  const certificate=Prev.certifyInstrument(program,{context,multiplicity:1});
  return {
    twinsQualified:true,
    certified:!!certificate.certified,
    primary:{ok:true,attemptsUsed:p.attemptsUsed,hashA:p.twin.hashA,hashB:p.twin.hashB,hiddenDistance:p.twin.hiddenDistance,auditAccuracy:p.twin.auditAccuracy,auditGap:p.twin.auditGap,archive:p.archive},
    transfer:{ok:true,attemptsUsed:t.attemptsUsed,hashA:t.twin.hashA,hashB:t.twin.hashB,hiddenDistance:t.twin.hiddenDistance,auditAccuracy:t.twin.auditAccuracy,auditGap:t.twin.auditGap,archive:t.archive},
    certificate:compactCertificate(certificate)
  };
}
function courtPass(court){
  return !!court &&
    court.confirmations.length===FRESH_CONFIRMATIONS &&
    court.confirmations.every(x=>x?.certified) &&
    court.nullBaseline?.certified===0 &&
    court.replication?.twinsQualified===true &&
    court.replication?.certified===true;
}
function downgradeStrictResult(result,ontology,depth,court){
  const winner=result?.winner;
  const program=winner?.program||winner?.instrument?.program;
  const hash=(Prev.instrumentId(program)||'I-00000').replace(/^I-/,'').slice(0,5);
  const id=`D${Math.max(1,ontology.length-3)}-${hash}`;
  const instrument={
    ...(winner?.instrument||{}),
    id,
    program,
    label:Prev.instrumentString(program),
    certified:true,
    depth,
    tier:'derived-dsl',
    randomBaselinePasses:court?.nullBaseline?.certified??result?.baseline?.certified??null,
    depthCourtStatus:'downgraded',
    depthCourt:court
  };
  const next=[...ontology,instrument];
  return {
    ...result,
    ok:true,
    reason:'derived_sense_added',
    strictDepth:false,
    depth,
    ontology:next,
    nextOntology:next,
    winner:{...winner,instrument},
    baseline:{
      ...(result.baseline||{}),
      count:court?.nullBaseline?.count??result?.baseline?.count,
      certified:court?.nullBaseline?.certified??result?.baseline?.certified,
      best:court?.nullBaseline?.best??result?.baseline?.best
    },
    depthCourt:court,
    depthCourtDowngraded:true
  };
}
function epistemicCycle(opts={}){
  const ontology=Array.isArray(opts.ontology)&&opts.ontology.length?opts.ontology:Prev.seedOntology();
  const depth=Number(opts.depth)||0;
  const attack=Number(opts.attack)||0;
  const seed=Number(opts.seed)||1;
  const result=Prev.epistemicCycle(opts);

  if(!result?.ok||!result?.strictDepth||!result?.winner?.instrument){
    return {...result,depthCourt:null};
  }

  const program=result.winner.program||result.winner.instrument.program;
  const confirmations=freshConfirmations(program,{
    primary:result.primary,transfer:result.transfer,ontology,seed:seedFor(seed,0xC0A71001)
  });

  // Only spend the larger null/replication budget if the pre-registered candidate survives
  // two untouched recertifications on the original hard twins.
  let nullBaseline={count:0,certified:null,best:null,skipped:true};
  let replication={twinsQualified:false,certified:false,skipped:true,certificate:null};
  if(confirmations.every(x=>x?.certified)){
    nullBaseline=runNullBaseline(program,{
      primary:result.primary,transfer:result.transfer,ontology,seed:seedFor(seed,0xC0A71002)
    });
    if(nullBaseline.certified===0){
      replication=replicationAudit(program,{
        primaryFamily:result.primaryFamily||result.primary?.family,
        transferFamily:result.transferFamily||result.transfer?.family,
        ontology,depth,attack,seed:seedFor(seed,0xC0A71003)
      });
    }
  }

  const court={
    version:'depth-court-v1',
    candidate:Prev.instrumentString(program),
    requirements:{
      freshConfirmations:FRESH_CONFIRMATIONS,
      nullBaselinePrograms:NULL_BASELINE_COUNT,
      nullBaselineCertifiedRequired:0,
      independentTwinReplication:true
    },
    confirmations,
    nullBaseline,
    replication
  };
  court.status=courtPass(court)?'confirmed':'downgraded';

  if(court.status!=='confirmed') return downgradeStrictResult(result,ontology,depth,court);

  const confirmedInstrument={
    ...result.winner.instrument,
    depthCourtStatus:'confirmed',
    depthCourt:court
  };
  const confirmedOntology=[...ontology,confirmedInstrument];
  return {
    ...result,
    ontology:confirmedOntology,
    nextOntology:confirmedOntology,
    winner:{...result.winner,instrument:confirmedInstrument},
    depthCourt:court,
    depthCourtConfirmed:true,
    baseline:{
      ...(result.baseline||{}),
      originalCount:result.baseline?.count??null,
      originalCertified:result.baseline?.certified??null,
      count:nullBaseline.count,
      certified:nullBaseline.certified,
      best:nullBaseline.best,
      courtCount:nullBaseline.count,
      courtCertified:nullBaseline.certified
    }
  };
}
function selfTest(){
  const tests=[...(Prev.selfTest?Prev.selfTest():[])];
  const add=(name,fn)=>{try{tests.push({name,pass:true,detail:String(fn()||'pass')})}catch(e){tests.push({name,pass:false,detail:String(e.message||e)})}};
  add('V5 court seed isolation',()=>{
    const s=new Set();
    for(let i=0;i<8;i++)s.add(seedFor(12345,0xC0A71001,i));
    if(s.size!==8)throw Error('court seeds collided');
    return `${s.size} isolated court roots`;
  });
  add('V5 strict gate composition',()=>{
    const good={confirmations:Array.from({length:FRESH_CONFIRMATIONS},()=>({certified:true})),nullBaseline:{certified:0},replication:{twinsQualified:true,certified:true}};
    const badRandom={...good,nullBaseline:{certified:1}};
    const badReplication={...good,replication:{twinsQualified:true,certified:false}};
    if(!courtPass(good)||courtPass(badRandom)||courtPass(badReplication))throw Error('court gate composition invalid');
    return `${FRESH_CONFIRMATIONS} confirmations + 0/${NULL_BASELINE_COUNT} null + fresh twin replication`;
  });
  add('V5 conservative downgrade',()=>{
    const fake={confirmations:Array.from({length:FRESH_CONFIRMATIONS},()=>({certified:true})),nullBaseline:{certified:0},replication:{twinsQualified:false,certified:false}};
    if(courtPass(fake))throw Error('inconclusive replication promoted');
    return 'failed/inconclusive court cannot increase depth';
  });
  return tests;
}

return {
  ...Prev,
  VERSION,
  epistemicCycle,
  selfTest,
  __v5:{
    NULL_BASELINE_COUNT,FRESH_CONFIRMATIONS,REPLICATION_TWIN_ATTEMPTS,
    seedFor,courtPass,forgeReplicationTwin,freshConfirmations,runNullBaseline,replicationAudit
  }
};
});
