(() => {
'use strict'
const $=s=>document.querySelector(s)
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const num=(n,d=2)=>Number.isFinite(n)?Number(n).toFixed(d):'—'
const pct=n=>Number.isFinite(n)?`${(Number(n)*100).toFixed(0)}%`:'—'
function panel(id,kicker,title,stats,popId){const s=document.createElement('section');s.className='section';s.id=id;s.innerHTML=`<div class="section-head"><div><div class="kicker">${kicker}</div><h2>${title}</h2></div><span class="pill" id="${id}-status">GENESIS</span></div><div class="card ak-grid">${stats.map(x=>`<div><span>${x[0]}</span><strong id="${x[1]}">${x[2]??'—'}</strong><small>${x[3]}</small></div>`).join('')}</div><div class="card lineage" id="${popId}" style="margin-top:12px"></div>`;return s}
function inject(){
  if($('#world-ecology'))return
  const scientist=$('#scientist-ecology')?.closest('section');if(!scientist)return
  const world=panel('world-ecology','WORLD ECOLOGY / α1.0','Challenge generators evolve against the scientists.',[
    ['World generation','we-generation','0','challenge-policy generation'],['World population','we-population','6','competing challenge lineages'],['World trials','we-trials','0','evaluated attacks'],['Selected world','we-selected','—','active generator genome'],['Last pressure reward','we-reward','—','blind-spot productivity'],['Judge access','we-judge','NONE','cannot edit certification']], 'world-population')
  scientist.after(world)
  const question=panel('question-ecology','QUESTION ECOLOGY / α1.1','The system evolves which unknown region is worth interrogating next.',[
    ['Question generation','qe-generation','0','question-scope generation'],['Question population','qe-population','6','competing question scopes'],['Question trials','qe-trials','0','questions actually asked'],['Selected question','qe-selected','—','active scope genome'],['Last reward','qe-reward','—','external discovery reward'],['Judge access','qe-judge','NONE','questions cannot change truth gates']], 'question-population')
  world.after(question)
  const strategy=panel('strategy-ecology','META-SCIENCE / α1.2','Strategies evolve for choosing which questions deserve compute.',[
    ['Strategy generation','se-generation','0','meta-science generation'],['Strategy population','se-population','5','allocation strategies'],['Strategy trials','se-trials','0','allocation decisions'],['Selected strategy','se-selected','—','active meta-policy'],['Selection mode','se-mode','—','how the next question was chosen'],['Judge access','se-judge','NONE','strategy cannot edit court']], 'strategy-population')
  question.after(strategy)
  const hero=$('.hero .kicker');if(hero)hero.textContent='ZERO-LLM ADVERSARIAL EPISTEMOLOGY / α 1.2'
  const h1=$('.hero h1 em');if(h1)h1.textContent='Scientists, challenges, questions, and research strategy evolve.'
  const road=[...document.querySelectorAll('.tests.card .test')]
  const w=road.find(x=>x.textContent.includes('WORLD ECOLOGY'));if(w){w.classList.add('pass');w.querySelector('b').textContent='ACTIVE · WORLD ECOLOGY'}
  const q=road.find(x=>x.textContent.includes('THEORY / QUESTION ECOLOGY'));if(q){q.classList.add('pass');q.querySelector('b').textContent='ACTIVE · QUESTION + META-SCIENCE';q.querySelector('span').textContent='Question scopes evolve, and a second ecology evolves strategies for deciding which questions deserve compute.'}
  const footer=document.querySelector('footer span:last-child');if(footer)footer.textContent='Reality Engine α1.2 · zero-LLM · immutable judge'
}
function renderWorld(e){if(!e)return;$('#we-generation').textContent=e.generation??0;$('#we-population').textContent=e.populationSize??e.population?.length??6;$('#we-trials').textContent=e.trialCount??0;$('#we-selected').textContent=e.selected||'—';$('#we-reward').textContent=num(e.reward);$('#world-ecology-status').textContent=`GEN ${e.generation??0}`;const host=$('#world-population');if(host)host.innerHTML=(e.population||[]).map(w=>`<div class="event"><b>${esc(w.id)}${w.id===e.selected?' · ACTIVE':''}</b><small>rotation ${w.rotation} · stride ${w.stride} · family phase ${w.phase} · trials ${w.trials} · mean pressure ${num(w.meanReward)}</small></div>`).join('')}
function renderQuestion(e){if(!e)return;$('#qe-generation').textContent=e.generation??0;$('#qe-population').textContent=e.populationSize??e.population?.length??6;$('#qe-trials').textContent=e.trialCount??0;$('#qe-selected').textContent=e.selected||'—';$('#qe-reward').textContent=num(e.reward);$('#question-ecology-status').textContent=`GEN ${e.generation??0}`;const host=$('#question-population');if(host)host.innerHTML=(e.population||[]).map(q=>`<div class="event"><b>${esc(q.id)}${q.id===e.selected?' · ACTIVE':''}</b><small>horizon ${q.horizon} · span ${q.span} · family ${q.familyFlip?'flip':'base'} · novelty ${pct(q.novelty)} · trials ${q.trials} · mean ${num(q.meanReward)}</small></div>`).join('')}
function renderStrategy(e,r){if(!e)return;$('#se-generation').textContent=e.generation??0;$('#se-population').textContent=e.populationSize??e.population?.length??5;$('#se-trials').textContent=e.trialCount??0;$('#se-selected').textContent=e.selected||'—';$('#se-mode').textContent=(r?.researchStrategyUsed?.mode||e.population?.find(x=>x.id===e.selected)?.mode||'—').toUpperCase();$('#strategy-ecology-status').textContent=`GEN ${e.generation??0}`;const host=$('#strategy-population');if(host)host.innerHTML=(e.population||[]).map(s=>`<div class="event"><b>${esc(s.id)}${s.id===e.selected?' · ACTIVE':''}</b><small>mode ${esc(String(s.mode).toUpperCase())} · exploration ${pct(s.exploration)} · trials ${s.trials} · mean reward ${num(s.meanReward)}</small></div>`).join('')}
function render(r){inject();renderWorld(r?.worldEcology);renderQuestion(r?.questionEcology);renderStrategy(r?.strategyEcology,r)}
function init(){inject();render(window.__REALITY_ENGINE_AUDIT__?.getState?.()?.last);window.addEventListener('reality:attack-result',e=>render(e.detail?.result))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init()
window.RealityWorldEcologyUI={render}
})()
