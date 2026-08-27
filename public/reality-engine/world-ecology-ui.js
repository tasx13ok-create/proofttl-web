(() => {
'use strict'
const $=s=>document.querySelector(s)
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const num=(n,d=2)=>Number.isFinite(n)?Number(n).toFixed(d):'—'
function inject(){
  if($('#world-ecology'))return
  const scientist=$('#scientist-ecology')?.closest('section')
  if(!scientist)return
  const s=document.createElement('section')
  s.className='section';s.id='world-ecology'
  s.innerHTML=`<div class="section-head"><div><div class="kicker">WORLD ECOLOGY / α1.0</div><h2>Challenge generators evolve against the scientists.</h2></div><span class="pill" id="we-status">GENESIS</span></div><div class="card ak-grid"><div><span>World generation</span><strong id="we-generation">0</strong><small>challenge-policy generation</small></div><div><span>World population</span><strong id="we-population">6</strong><small>competing challenge lineages</small></div><div><span>World trials</span><strong id="we-trials">0</strong><small>evaluated attacks</small></div><div><span>Selected world</span><strong id="we-selected">—</strong><small>active generator genome</small></div><div><span>Last pressure reward</span><strong id="we-reward">—</strong><small>blind-spot productivity</small></div><div><span>Judge access</span><strong>NONE</strong><small>cannot edit certification</small></div></div><div class="card lineage" id="world-population" style="margin-top:12px"></div>`
  scientist.after(s)
  const hero=$('.hero .kicker');if(hero)hero.textContent='ZERO-LLM ADVERSARIAL EPISTEMOLOGY / α 1.0'
  const road=[...document.querySelectorAll('.test')].find(x=>x.textContent.includes('WORLD ECOLOGY'));if(road){road.classList.add('pass');road.querySelector('b').textContent='ACTIVE · WORLD ECOLOGY';road.querySelector('span').textContent='Six challenge-generator lineages compete to expose productive blind spots under the immutable judge.'}
  const footer=document.querySelector('footer span:last-child');if(footer)footer.textContent='Reality Engine α1.0 · zero-LLM · immutable judge'
}
function render(r){inject();const e=r?.worldEcology;if(!e)return;$('#we-generation').textContent=e.generation??0;$('#we-population').textContent=e.populationSize??e.population?.length??6;$('#we-trials').textContent=e.trialCount??0;$('#we-selected').textContent=e.selected||'—';$('#we-reward').textContent=num(e.reward);$('#we-status').textContent=`GEN ${e.generation??0}`;const host=$('#world-population');if(host)host.innerHTML=(e.population||[]).map(w=>`<div class="event"><b>${esc(w.id)}${w.id===e.selected?' · ACTIVE':''}</b><small>rotation ${w.rotation} · stride ${w.stride} · family phase ${w.phase} · trials ${w.trials} · mean pressure ${num(w.meanReward)}</small></div>`).join('')}
function init(){inject();render(window.__REALITY_ENGINE_AUDIT__?.getState?.()?.last);window.addEventListener('reality:attack-result',e=>render(e.detail?.result))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
window.RealityWorldEcologyUI={render}
})()
