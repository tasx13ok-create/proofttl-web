'use strict'
importScripts('./ontology-engine-v2.js','./ontology-engine-v3.js','./ontology-engine-v4.js','./ontology-engine-v5.js','./ontology-engine-v6.js','./ontology-engine-v7.js','./ontology-engine-v8.js')
const E=self.OntologyEngineV8
self.onmessage=e=>{
  const msg=e.data||{}
  try{
    if(msg.type==='selftest') return self.postMessage({type:'selftest',tests:E.selfTest()})
    if(msg.type==='cycle'){
      const result=E.epistemicCycle({
        ontology:Array.isArray(msg.ontology)&&msg.ontology.length?msg.ontology:E.seedOntology(),
        depth:Number(msg.depth)||0,
        attack:Number(msg.attack)||0,
        seed:Number(msg.seed)||1,
        lineageSeed:Number(msg.lineageSeed)||Number(msg.seed)||1,
        ecologyState:msg.ecologyState||null,
        progress:p=>self.postMessage({type:'progress',...p})
      })
      self.postMessage({type:'cycle',result,requestId:msg.requestId})
    }
  }catch(error){self.postMessage({type:'error',message:String(error?.stack||error?.message||error),requestId:msg.requestId})}
}
