(() => {
'use strict'
function download(name,payload){const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function networkPayload(){return{product:'Reality Engine — Autogenic Kernel Evidence',version:window.RealityAutogenicKernel?.VERSION||null,exportedAt:new Date().toISOString(),audit:window.__REALITY_ENGINE_AUDIT__?.getState?.()||null,network:window.RealityAutogenicKernel?.getState?.()||null,overnight:window.RealityAutogenicOvernight?.getState?.()||null}}
function init(){const b=document.querySelector('#export-btn');if(!b)return;b.textContent='Export evidence + network';b.addEventListener('click',()=>{setTimeout(()=>{try{const seed=window.__REALITY_ENGINE_AUDIT__?.getState?.()?.lineageSeed||'network';download(`reality-engine-network-evidence-${seed}.json`,networkPayload())}catch(e){console.error('network evidence export failed',e)}},100)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
window.RealityEvidenceBridge={exportNetwork:()=>download('reality-engine-network-evidence.json',networkPayload())}
})()
