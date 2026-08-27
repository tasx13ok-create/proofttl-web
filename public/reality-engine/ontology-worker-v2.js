'use strict'
importScripts('./ontology-engine-v2.js','./ontology-engine-v3.js','./ontology-engine-v4.js','./ontology-engine-v5.js','./ontology-engine-v6.js','./ontology-engine-v7b.js','./ontology-engine-v8.js','./ontology-engine-v9.js')
const E=self.OntologyEngineV9
let worldEcologyState=null
self.onmessage=e=>{
  const msg=e.data||{}
  try{
    if(msg.type==='selftest') return self.postMessage({type:'selftest',tests:E.selfTest()})
    if(msg.type==='cycle'){
      const embeddedWorld=msg.ecologyState?.worldEcology||worldEcologyState||null
      const result=E.epistemicCycle({
        ontology:Array.isArray(msg.ontology)&&msg.ontology.length?msg.ontology:E.seedOntology(),
        depth:Number(msg.depth)||0,
        attack:Number(msg.attack)||0,
        seed:Number(msg.seed)||1,
        lineageSeed:Number(msg.lineageSeed)||Number(msg.seed)||1,
        ecologyState:msg.ecologyState||null,
        worldEcologyState:embeddedWorld,
        progress:p=>self.postMessage({type:'progress',...p})
      })
      worldEcologyState=result?.worldEcology?.persistable||embeddedWorld
      if(result?.scientistEcology?.persistable&&worldEcologyState)result.scientistEcology.persistable.worldEcology=worldEcologyState
      self.postMessage({type:'cycle',result,requestId:msg.requestId})
    }
  }catch(error){self.postMessage({type:'error',message:String(error?.stack||error?.message||error),requestId:msg.requestId})}
}
