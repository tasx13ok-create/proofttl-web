(() => {
'use strict'
const SCIENCE_KEY='reality-engine-representation-audit-v2'
const BACKUP_KEY='reality-engine-lineage-backup-v1'
let armUntil=0,armTimer=null
function download(name,payload){const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function normalizeAudit(audit){
  if(!audit||typeof audit!=='object')return audit
  const workerVersion=audit.last?.engineVersion||audit.engineVersion||null
  const workerLayer=audit.last?.engineLayer||audit.engineLayer||null
  if(!workerVersion)return audit
  return{...audit,uiVersion:audit.uiVersion||audit.version||null,version:workerVersion,engineVersion:workerVersion,engineLayer:workerLayer||null}
}
function auditState(){return normalizeAudit(window.__REALITY_ENGINE_AUDIT__?.getState?.()||null)}
function networkPayload(){return{product:'Reality Engine — Autogenic Kernel Evidence',version:window.RealityAutogenicKernel?.VERSION||null,exportedAt:new Date().toISOString(),audit:auditState(),network:window.RealityAutogenicKernel?.getState?.()||null,overnight:window.RealityAutogenicOvernight?.getState?.()||null}}
function syncVisibleEngineTruth(){
  const audit=auditState(),v=audit?.engineVersion,layer=audit?.engineLayer
  if(!v)return
  let pill=document.querySelector('#worker-version-pill')
  if(!pill){pill=document.createElement('span');pill.className='pill';pill.id='worker-version-pill';document.querySelector('.topbar .status')?.prepend(pill)}
  if(pill)pill.textContent=`${layer||'WORKER'} · ${v}`
  const footer=[...document.querySelectorAll('footer span')].at(-1);if(footer)footer.textContent=`Reality Engine ${v} · ${layer||'worker'} · zero-LLM · immutable judge`
}
function backupCurrent(reason='manual'){
  try{
    const snapshot=localStorage.getItem(SCIENCE_KEY)
    if(!snapshot)return false
    const parsed=JSON.parse(snapshot)
    localStorage.setItem(BACKUP_KEY,JSON.stringify({version:1,at:Date.now(),reason,lineageSeed:parsed.lineageSeed||null,depth:parsed.depth||0,attack:parsed.attack||0,snapshot}))
    refreshBackupButton()
    return true
  }catch{return false}
}
function historyFrom(result,ecologyState){
  const rows=result?.scientistEcology?.history||ecologyState?.history||[]
  return Array.isArray(rows)?rows.slice(-160).map(x=>({at:Number(x.at)||Date.now(),attack:Number(x.attack)||0,depth:Number(x.depth)||0,languageDepth:Number(x.languageDepth)||0,reason:x.reason||'recovered',scientist:x.scientist||null,scientistGeneration:null})):[]
}
function extractSnapshot(payload){
  const audit=payload?.audit&&typeof payload.audit==='object'?payload.audit:null
  const last=payload?.lastResult||audit?.last||payload?.last||null
  const ontology=Array.isArray(payload?.ontology)&&payload.ontology.length?payload.ontology:(Array.isArray(last?.ontology)&&last.ontology.length?last.ontology:null)
  const lineageSeed=Number(payload?.lineageSeed||audit?.lineageSeed)||0
  const depth=Number(payload?.depth??audit?.depth??last?.depth)||0
  const attack=Number(payload?.attack??audit?.attack??last?.attack)||0
  const ecologyState=payload?.scientistEcology||last?.scientistEcology?.persistable||null
  const lineage=Array.isArray(payload?.lineage)?payload.lineage.slice(-160):historyFrom(last,ecologyState)
  if(!lineageSeed)throw new Error('evidence_missing_lineage_seed')
  if(!ontology)throw new Error('evidence_missing_full_ontology')
  if(!last)throw new Error('evidence_missing_last_result')
  if(depth<0||attack<0)throw new Error('evidence_invalid_counters')
  return{ontology,depth,attack,attempt:attack,lineageSeed,lineage,last,ecologyState}
}
function restorePayload(payload){
  const snapshot=extractSnapshot(payload)
  backupCurrent('before-evidence-import')
  localStorage.setItem(SCIENCE_KEY,JSON.stringify(snapshot))
  sessionStorage.setItem('reality-engine-restore-note',JSON.stringify({lineageSeed:snapshot.lineageSeed,depth:snapshot.depth,attack:snapshot.attack,at:Date.now()}))
  location.reload()
}
function restoreBackup(){
  try{
    const b=JSON.parse(localStorage.getItem(BACKUP_KEY)||'null')
    if(!b?.snapshot)throw new Error('no_lineage_backup')
    localStorage.setItem(SCIENCE_KEY,b.snapshot)
    sessionStorage.setItem('reality-engine-restore-note',JSON.stringify({lineageSeed:b.lineageSeed,depth:b.depth,attack:b.attack,at:Date.now(),backup:true}))
    location.reload()
  }catch(e){alert(`Restore failed: ${e.message}`)}
}
function refreshBackupButton(){
  const b=document.querySelector('#restore-backup-btn')
  if(!b)return
  try{const x=JSON.parse(localStorage.getItem(BACKUP_KEY)||'null');b.hidden=!x?.snapshot;b.textContent=x?.snapshot?`Restore backup Ω${x.depth||0} · attack ${x.attack||0}`:'Restore backup'}catch{b.hidden=true}
}
function injectRecoveryControls(){
  const newBtn=document.querySelector('#new-btn')
  if(!newBtn||document.querySelector('#import-evidence-btn'))return
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.id='restore-evidence-file';input.hidden=true
  const importBtn=document.createElement('button');importBtn.className='btn';importBtn.id='import-evidence-btn';importBtn.textContent='Restore evidence'
  const backupBtn=document.createElement('button');backupBtn.className='btn';backupBtn.id='restore-backup-btn';backupBtn.textContent='Restore backup';backupBtn.hidden=true
  newBtn.after(backupBtn);newBtn.after(importBtn);newBtn.after(input)
  importBtn.onclick=()=>input.click()
  backupBtn.onclick=restoreBackup
  input.onchange=async()=>{
    const file=input.files?.[0];if(!file)return
    try{restorePayload(JSON.parse(await file.text()))}catch(e){alert(`Evidence restore failed: ${e.message}`);input.value=''}
  }
  refreshBackupButton()
}
function protectNewLineage(){
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('#new-btn');if(!b)return
    const now=Date.now()
    if(now>armUntil){
      backupCurrent('before-new-lineage')
      armUntil=now+5000
      e.preventDefault();e.stopImmediatePropagation()
      const original=b.dataset.originalText||b.textContent||'New lineage';b.dataset.originalText=original
      b.textContent='Click again to ERASE lineage';b.classList.add('danger')
      clearTimeout(armTimer);armTimer=setTimeout(()=>{armUntil=0;b.textContent=b.dataset.originalText||'New lineage';refreshBackupButton()},5100)
    }else{
      armUntil=0;clearTimeout(armTimer)
    }
  },true)
}
function showRestoreNote(){
  try{const x=JSON.parse(sessionStorage.getItem('reality-engine-restore-note')||'null');if(!x)return;sessionStorage.removeItem('reality-engine-restore-note');setTimeout(()=>{const host=document.querySelector('#trace');if(host){const d=document.createElement('div');d.innerHTML=`<time>${new Date().toLocaleTimeString()}</time>RECOVERY · restored lineage ${Number(x.lineageSeed).toString(16).toUpperCase()} · Ω${x.depth} · attack ${x.attack}`;host.prepend(d)}},250)}catch{}
}
function wrapAuditState(){
  const api=window.__REALITY_ENGINE_AUDIT__,original=api?.getState
  if(!api||typeof original!=='function'||original.__workerTruthWrapped)return
  const wrapped=()=>normalizeAudit(original())
  wrapped.__workerTruthWrapped=true
  api.getState=wrapped
}
function init(){
  wrapAuditState()
  const b=document.querySelector('#export-btn');if(b){b.textContent='Export evidence + network';b.addEventListener('click',()=>{setTimeout(()=>{try{const seed=auditState()?.lineageSeed||'network';download(`reality-engine-network-evidence-${seed}.json`,networkPayload())}catch(e){console.error('network evidence export failed',e)}},100)})}
  injectRecoveryControls();protectNewLineage();showRestoreNote();syncVisibleEngineTruth();setInterval(syncVisibleEngineTruth,1500)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
window.RealityEvidenceBridge={exportNetwork:()=>download('reality-engine-network-evidence.json',networkPayload()),restorePayload,backupCurrent,restoreBackup,normalizeAudit}
})()
