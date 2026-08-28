'use strict'
importScripts('./ontology-engine-v2.js','./ontology-engine-v3.js','./ontology-engine-v4.js','./ontology-engine-v5.js','./ontology-engine-v6.js','./ontology-engine-v7b.js','./ontology-engine-v8.js','./ontology-engine-v9.js','./ontology-engine-v10.js','./ontology-engine-v11.js','./ontology-engine-v12.js')
const E=self.OntologyEngineV12
let worldEcologyState=null
let questionEcologyState=null
let strategyEcologyState=null
let theoryEcologyState=null
self.onmessage=e=>{
  const msg=e.data||{}
  try{
    if(msg.type==='selftest') return self.postMessage({type:'selftest',tests:E.selfTest()})
    if(msg.type==='cycle'){
      const embeddedWorld=msg.ecologyState?.worldEcology||worldEcologyState||null
      const embeddedQuestion=msg.ecologyState?.questionEcology||questionEcologyState||null
      const embeddedStrategy=msg.ecologyState?.strategyEcology||strategyEcologyState||null
      const embeddedTheory=msg.ecologyState?.theoryEcology||theoryEcologyState||null
      const result=E.epistemicCycle({
        ontology:Array.isArray(msg.ontology)&&msg.ontology.length?msg.ontology:E.seedOntology(),
        depth:Number(msg.depth)||0,
        attack:Number(msg.attack)||0,
        seed:Number(msg.seed)||1,
        lineageSeed:Number(msg.lineageSeed)||Number(msg.seed)||1,
        ecologyState:msg.ecologyState||null,
        worldEcologyState:embeddedWorld,
        questionEcologyState:embeddedQuestion,
        strategyEcologyState:embeddedStrategy,
        theoryEcologyState:embeddedTheory,
        progress:p=>self.postMessage({type:'progress',...p})
      })
      worldEcologyState=result?.worldEcology?.persistable||embeddedWorld
      questionEcologyState=result?.questionEcology?.persistable||embeddedQuestion
      strategyEcologyState=result?.strategyEcology?.persistable||embeddedStrategy
      theoryEcologyState=result?.theoryEcology?.persistable||embeddedTheory
      if(result?.scientistEcology?.persistable){
        if(worldEcologyState)result.scientistEcology.persistable.worldEcology=worldEcologyState
        if(questionEcologyState)result.scientistEcology.persistable.questionEcology=questionEcologyState
        if(strategyEcologyState)result.scientistEcology.persistable.strategyEcology=strategyEcologyState
        if(theoryEcologyState)result.scientistEcology.persistable.theoryEcology=theoryEcologyState
      }
      self.postMessage({type:'cycle',result,requestId:msg.requestId})
    }
  }catch(error){self.postMessage({type:'error',message:String(error?.stack||error?.message||error),requestId:msg.requestId})}
}
