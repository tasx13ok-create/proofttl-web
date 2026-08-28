'use strict'
importScripts('./ontology-engine-v2.js','./ontology-engine-v3.js','./ontology-engine-v4.js','./ontology-engine-v5.js','./ontology-engine-v6.js','./ontology-engine-v7b.js','./ontology-engine-v8.js','./ontology-engine-v9.js','./ontology-engine-v10.js','./ontology-engine-v11.js','./ontology-engine-v12.js','./ontology-engine-v13.js','./ontology-engine-v14.js','./ontology-engine-v15.js','./ontology-engine-v16.js')
const E=self.OntologyEngineV16
let worldEcologyState=null,questionEcologyState=null,strategyEcologyState=null,theoryEcologyState=null,experimentState=null,barrierState=null,causalState=null,conceptState=null
self.onmessage=e=>{
  const msg=e.data||{}
  try{
    if(msg.type==='selftest') return self.postMessage({type:'selftest',tests:E.selfTest()})
    if(msg.type==='cycle'){
      const embeddedWorld=msg.ecologyState?.worldEcology||worldEcologyState||null,embeddedQuestion=msg.ecologyState?.questionEcology||questionEcologyState||null,embeddedStrategy=msg.ecologyState?.strategyEcology||strategyEcologyState||null,embeddedTheory=msg.ecologyState?.theoryEcology||theoryEcologyState||null,embeddedExperiment=msg.ecologyState?.experimentState||experimentState||null,embeddedBarrier=msg.ecologyState?.barrierState||barrierState||null,embeddedCausal=msg.ecologyState?.causalState||causalState||null,embeddedConcept=msg.ecologyState?.conceptState||conceptState||null
      const result=E.epistemicCycle({ontology:Array.isArray(msg.ontology)&&msg.ontology.length?msg.ontology:E.seedOntology(),depth:Number(msg.depth)||0,attack:Number(msg.attack)||0,seed:Number(msg.seed)||1,lineageSeed:Number(msg.lineageSeed)||Number(msg.seed)||1,ecologyState:msg.ecologyState||null,worldEcologyState:embeddedWorld,questionEcologyState:embeddedQuestion,strategyEcologyState:embeddedStrategy,theoryEcologyState:embeddedTheory,experimentState:embeddedExperiment,barrierState:embeddedBarrier,causalState:embeddedCausal,conceptState:embeddedConcept,progress:p=>self.postMessage({type:'progress',...p})})
      worldEcologyState=result?.worldEcology?.persistable||embeddedWorld;questionEcologyState=result?.questionEcology?.persistable||embeddedQuestion;strategyEcologyState=result?.strategyEcology?.persistable||embeddedStrategy;theoryEcologyState=result?.theoryEcology?.persistable||embeddedTheory;experimentState=result?.experimentForge?.persistable||embeddedExperiment;barrierState=result?.barrier?.persistable||embeddedBarrier;causalState=result?.causalProgramVM?.persistable||embeddedCausal;conceptState=result?.conceptForge?.persistable||embeddedConcept
      if(result?.scientistEcology?.persistable){const p=result.scientistEcology.persistable;if(worldEcologyState)p.worldEcology=worldEcologyState;if(questionEcologyState)p.questionEcology=questionEcologyState;if(strategyEcologyState)p.strategyEcology=strategyEcologyState;if(theoryEcologyState)p.theoryEcology=theoryEcologyState;if(experimentState)p.experimentState=experimentState;if(barrierState)p.barrierState=barrierState;if(causalState)p.causalState=causalState;if(conceptState)p.conceptState=conceptState}
      self.postMessage({type:'cycle',result,requestId:msg.requestId})
    }
  }catch(error){self.postMessage({type:'error',message:String(error?.stack||error?.message||error),requestId:msg.requestId})}
}
