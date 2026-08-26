'use strict'
importScripts('./ontology-engine.js')
const E=self.OntologyEngine
self.onmessage=e=>{
  const msg=e.data||{}
  try{
    if(msg.type==='selftest'){
      self.postMessage({type:'selftest',tests:E.selfTest()})
      return
    }
    if(msg.type==='cycle'){
      const result=E.epistemicCycle({
        ontology:msg.ontology||E.seedOntology(),
        depth:Number(msg.depth)||0,
        seed:Number(msg.seed)||1,
        progress:p=>self.postMessage({type:'progress',...p})
      })
      self.postMessage({type:'cycle',result})
    }
  }catch(error){
    self.postMessage({type:'error',message:String(error?.stack||error?.message||error)})
  }
}
