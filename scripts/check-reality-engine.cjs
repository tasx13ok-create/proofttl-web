'use strict'
const fs=require('fs')
const path=require('path')
const vm=require('vm')
const root=path.resolve(__dirname,'..')
const files=[
  'public/reality-engine/ontology-engine-v2.js',
  'public/reality-engine/ontology-engine-v3.js',
  'public/reality-engine/ontology-engine-v4.js',
  'public/reality-engine/ontology-engine-v5.js',
  'public/reality-engine/ontology-engine-v6.js',
  'public/reality-engine/ontology-engine-v7b.js',
  'public/reality-engine/ontology-engine-v8.js'
]
const ctx={console,setTimeout,clearTimeout,Math,Date,JSON,Array,Object,Number,String,Boolean,Map,Set,Uint32Array}
ctx.globalThis=ctx
ctx.self=ctx
vm.createContext(ctx)
for(const rel of files){
  const file=path.join(root,rel)
  if(!fs.existsSync(file))throw new Error(`Reality Engine asset missing: ${rel}`)
  vm.runInContext(fs.readFileSync(file,'utf8'),ctx,{filename:rel,timeout:15000})
}
const E=ctx.OntologyEngineV8
if(!E)throw new Error('OntologyEngineV8 did not boot')
if(E.VERSION!=='0.9.0-alpha')throw new Error(`Unexpected Reality Engine version: ${E.VERSION}`)
const tests=E.selfTest()
const failed=tests.filter(t=>!t.pass)
for(const t of tests)console.log(`${t.pass?'PASS':'FAIL'} Reality Engine: ${t.name} — ${t.detail}`)
if(failed.length)throw new Error(`${failed.length} Reality Engine self-test(s) failed`)
if(!E.__v7||E.__v7.LANGUAGE_NULL_COUNT!==256)throw new Error('Language Court contract missing')
if(!E.__v8||E.__v8.POPULATION!==6)throw new Error('Scientist Ecology contract missing')
const seed=E.seedOntology()
if(seed.length!==4)throw new Error('Seed ontology contract changed unexpectedly')
console.log(`SUCCESS: Reality Engine ${E.VERSION} booted ${files.length} chained engine layers and passed ${tests.length} invariant tests.`)
