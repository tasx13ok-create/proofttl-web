'use strict'
importScripts('./ontology-engine-v2.js','./ontology-engine-v3.js','./ontology-engine-v4.js','./ontology-engine-v5.js','./ontology-engine-v6.js','./ontology-engine-v7b.js','./ontology-engine-v8.js','./ontology-engine-v9.js','./ontology-engine-v10.js','./ontology-engine-v11.js','./ontology-engine-v12.js','./ontology-engine-v13.js','./ontology-engine-v14.js','./ontology-engine-v15.js','./ontology-engine-v16.js','./ontology-engine-v17.js','./ontology-engine-v18.js','./ontology-engine-v19.js','./ontology-engine-v20.js','./ontology-engine-v21.js')
const E=self.OntologyEngineV21
let worldEcologyState=null,questionEcologyState=null,strategyEcologyState=null,theoryEcologyState=null,experimentState=null,barrierState=null,causalState=null,conceptState=null,sequentialState=null,macroState=null,theoryCourtState=null,methodCourtState=null
self.onmessage=e=>{
  const msg=e.data||{}
  try{
    if(msg.type==='selftest') return self.postMessage({type:'selftest',engineVersion:E.VERSION,engineLayer:'V21',tests:E.selfTest()})
    if(msg.type==='cycle'){
      const embeddedWorld=msg.ecologyState?.worldEcology||worldEcologyState||null
      const embeddedQuestion=msg.ecologyState?.questionEcology||questionEcologyState||null
      const embeddedStrategy=msg.ecologyState?.strategyEcology||strategyEcologyState||null
      const embeddedTheory=msg.ecologyState?.theoryEcology||theoryEcologyState||null
      const embeddedExperiment=msg.ecologyState?.experimentState||experimentState||null
      const embeddedBarrier=msg.ecologyState?.barrierState||barrierState||null
      const embeddedCausal=msg.ecologyState?.causalState||causalState||null
      const embeddedConcept=msg.ecologyState?.conceptState||conceptState||null
      const embeddedSequential=msg.ecologyState?.sequentialState||sequentialState||null
      const embeddedMacro=msg.ecologyState?.macroState||macroState||null
      const embeddedTheoryCourt=msg.ecologyState?.theoryCourtState||theoryCourtState||null
      const embeddedMethodCourt=msg.ecologyState?.methodCourtState||methodCourtState||null
      const cycle=E.epistemicCycle({ontology:Array.isArray(msg.ontology)&&msg.ontology.length?msg.ontology:E.seedOntology(),depth:Number(msg.depth)||0,attack:Number(msg.attack)||0,seed:Number(msg.seed)||1,lineageSeed:Number(msg.lineageSeed)||Number(msg.seed)||1,ecologyState:msg.ecologyState||null,worldEcologyState:embeddedWorld,questionEcologyState:embeddedQuestion,strategyEcologyState:embeddedStrategy,theoryEcologyState:embeddedTheory,experimentState:embeddedExperiment,barrierState:embeddedBarrier,causalState:embeddedCausal,conceptState:embeddedConcept,sequentialState:embeddedSequential,macroState:embeddedMacro,theoryCourtState:embeddedTheoryCourt,methodCourtState:embeddedMethodCourt,progress:p=>self.postMessage({type:'progress',engineVersion:E.VERSION,engineLayer:'V21',...p})})
      const result={...cycle,engineVersion:E.VERSION,engineLayer:'V21'}
      worldEcologyState=result?.worldEcology?.persistable||embeddedWorld
      questionEcologyState=result?.questionEcology?.persistable||embeddedQuestion
      strategyEcologyState=result?.strategyEcology?.persistable||embeddedStrategy
      theoryEcologyState=result?.theoryEcology?.persistable||embeddedTheory
      experimentState=result?.experimentForge?.persistable||embeddedExperiment
      barrierState=result?.barrier?.persistable||embeddedBarrier
      causalState=result?.causalProgramVM?.persistable||embeddedCausal
      conceptState=result?.conceptForge?.persistable||embeddedConcept
      sequentialState=result?.sequentialForge?.persistable||embeddedSequential
      macroState=result?.interventionLanguage?.persistable||embeddedMacro
      theoryCourtState=result?.matchedTheoryCourt?.persistable||embeddedTheoryCourt
      methodCourtState=result?.researchMethodCourt?.persistable||embeddedMethodCourt
      if(result?.scientistEcology?.persistable){
        const p=result.scientistEcology.persistable
        if(worldEcologyState)p.worldEcology=worldEcologyState
        if(questionEcologyState)p.questionEcology=questionEcologyState
        if(strategyEcologyState)p.strategyEcology=strategyEcologyState
        if(theoryEcologyState)p.theoryEcology=theoryEcologyState
        if(experimentState)p.experimentState=experimentState
        if(barrierState)p.barrierState=barrierState
        if(causalState)p.causalState=causalState
        if(conceptState)p.conceptState=conceptState
        if(sequentialState)p.sequentialState=sequentialState
        if(macroState)p.macroState=macroState
        if(theoryCourtState)p.theoryCourtState=theoryCourtState
        if(methodCourtState)p.methodCourtState=methodCourtState
      }
      self.postMessage({type:'cycle',engineVersion:E.VERSION,engineLayer:'V21',result,requestId:msg.requestId})
    }
  }catch(error){self.postMessage({type:'error',engineVersion:E.VERSION,engineLayer:'V21',message:String(error?.stack||error?.message||error),requestId:msg.requestId})}
}
