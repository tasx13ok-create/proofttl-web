'use strict'
importScripts('./ontology-engine-v2.js','./ontology-engine-v3.js','./ontology-engine-v4.js','./ontology-engine-v5.js','./ontology-engine-v6.js','./ontology-engine-v7b.js','./ontology-engine-v8.js','./ontology-engine-v9.js','./ontology-engine-v10.js','./ontology-engine-v11.js','./ontology-engine-v12.js','./ontology-engine-v13.js','./ontology-engine-v14.js')
const E=self.OntologyEngineV14
let worldEcologyState=null
let questionEcologyState=null
let strategyEcologyState=null
let theoryEcologyState=null
let experimentState=null
let barrierState=null
self.onmessage=e=>{
  const msg=e.data||{}
  try{
    if(msg.type==='selftest') return self.postMessage({type:'selftest',tests:E.selfTest()})
    if(msg.type==='cycle'){
      const embeddedWorld=msg.ecologyState?.worldEcology||worldEcologyState||null
      const embeddedQuestion=msg.ecologyState?.questionEcology||questionEcologyState||null
      const embeddedStrategy=msg.ecologyState?.strategyEcology||strategyEcologyState||null
      const embeddedTheory=msg.ecologyState?.theoryEcology||theoryEcologyState||null
      const embeddedExperiment=msg.ecologyState?.experimentState||experimentState||null
      const embeddedBarrier=msg.ecologyState?.barrierState||barrierState||null
      const result=E.epistemicCycle({ontology:Array.isArray(msg.ontology)&&msg.ontology.length?msg.ontology:E.seedOntology(),depth:Number(msg.depth)||0,attack:Number(msg.attack)||0,seed:Number(msg.seed)||1,lineageSeed:Number(msg.lineageSeed)||Number(msg.seed)||1,ecologyState:msg.ecologyState||null,worldEcologyState:embeddedWorld,questionEcologyState:embeddedQuestion,strategyEcologyState:embeddedStrategy,theoryEcologyState:embeddedTheory,experimentState:embeddedExperiment,barrierState:embeddedBarrier,progress:p=>self.postMessage({type:'progress',...p})})
      worldEcologyState=result?.worldEcology?.persistable||embeddedWorld
      questionEcologyState=result?.questionEcology?.persistable||embeddedQuestion
      strategyEcologyState=result?.strategyEcology?.persistable||embeddedStrategy
      theoryEcologyState=result?.theoryEcology?.persistable||embeddedTheory
      experimentState=result?.experimentForge?.persistable||embeddedExperiment
      barrierState=result?.barrier?.persistable||embeddedBarrier
      if(result?.scientistEcology?.persistable){const p=result.scientistEcology.persistable;if(worldEcologyState)p.worldEcology=worldEcologyState;if(questionEcologyState)p.questionEcology=questionEcologyState;if(strategyEcologyState)p.strategyEcology=strategyEcologyState;if(theoryEcologyState)p.theoryEcology=theoryEcologyState;if(experimentState)p.experimentState=experimentState;if(barrierState)p.barrierState=barrierState}
      self.postMessage({type:'cycle',result,requestId:msg.requestId})
    }
  }catch(error){self.postMessage({type:'error',message:String(error?.stack||error?.message||error),requestId:msg.requestId})}
}
