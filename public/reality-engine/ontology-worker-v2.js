'use strict'
importScripts('./ontology-engine-v2.js')
const E=self.OntologyEngineV2
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
        progress:p=>self.postMessage({type:'progress',...p})
      })
      self.postMessage({type:'cycle',result,requestId:msg.requestId})
    }
  }catch(error){self.postMessage({type:'error',message:String(error?.stack||error?.message||error),requestId:msg.requestId})}
}
