(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const ACTIONS=['observe','pulse','vortex','cool','heat','well'];
const SOURCES=['x','y','vx','vy','m'];
const VUNARY=['id','abs','sq','sign'];
const VBINARY=['add','sub','mul'];
const AGG=['mean','var','absmean','q75','maxabs'];
const TIME=['mean','var','delta','slope','autocorr'];
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const variance=a=>{if(a.length<2)return 0;const m=mean(a);return a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1)};
const stdev=a=>Math.sqrt(variance(a));
const hashString=s=>{let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function hashHex(value){return hashString(typeof value==='string'?value:JSON.stringify(value)).toString(16).toUpperCase().padStart(8,'0')}
class PRNG{constructor(seed){this.s=seed>>>0||1}next(){let a=this.s|0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;this.s=a>>>0;return((t^t>>>14)>>>0)/4294967296}range(a,b){return a+(b-a)*this.next()}int(n){return Math.floor(this.next()*n)}pick(a){return a[this.int(a.length)]}clone(){const r=new PRNG(1);r.s=this.s;return r}}

function randomGenome(r){
  return {
    center:r.range(-0.042,0.052),
    swirl:r.range(-0.055,0.055),
    cross:r.range(-0.034,0.034),
    anisotropy:r.range(0.62,1.42),
    drag:r.range(0.965,0.998),
    nonlin:r.range(-0.028,0.04),
    meanCoupling:r.range(-0.038,0.038),
    boundary:r.range(0.56,0.98),
    noise:r.range(0,0.012),
    phase:r.range(-0.026,0.026)
  };
}
const GKEYS=['center','swirl','cross','anisotropy','drag','nonlin','meanCoupling','boundary','noise','phase'];
const RANGES={center:.094,swirl:.11,cross:.068,anisotropy:.8,drag:.033,nonlin:.068,meanCoupling:.076,boundary:.42,noise:.012,phase:.052};
function mutateGenome(g,r,scale=.35){const out={...g};const n=1+r.int(4);for(let i=0;i<n;i++){const k=r.pick(GKEYS),span=RANGES[k];out[k]+=r.range(-span*scale,span*scale);}
  out.center=clamp(out.center,-.042,.052);out.swirl=clamp(out.swirl,-.055,.055);out.cross=clamp(out.cross,-.034,.034);out.anisotropy=clamp(out.anisotropy,.62,1.42);out.drag=clamp(out.drag,.965,.998);out.nonlin=clamp(out.nonlin,-.028,.04);out.meanCoupling=clamp(out.meanCoupling,-.038,.038);out.boundary=clamp(out.boundary,.56,.98);out.noise=clamp(out.noise,0,.012);out.phase=clamp(out.phase,-.026,.026);return out}
function genomeDistance(a,b){let s=0;for(const k of GKEYS){const d=(a[k]-b[k])/RANGES[k];s+=d*d}return Math.sqrt(s/GKEYS.length)}

function initState(seed,n=44){const r=new PRNG(seed);const p=[];for(let i=0;i<n;i++){const ang=r.range(0,Math.PI*2),rad=Math.sqrt(r.next())*.68;p.push({x:Math.cos(ang)*rad,y:Math.sin(ang)*rad,vx:r.range(-.24,.24),vy:r.range(-.24,.24),m:r.range(.65,1.35)})}return {p,r,step:0}}
function cloneState(s){return {p:s.p.map(x=>({...x})),r:s.r.clone(),step:s.step}}
function applyAction(state,action,frame){const p=state.p;for(const e of p){const d=Math.hypot(e.x,e.y)+1e-6;if(action==='pulse'&&frame<20){e.vx+=e.x/d*.012;e.vy+=e.y/d*.012}else if(action==='vortex'&&frame<22){e.vx-=e.y/d*.011;e.vy+=e.x/d*.011}else if(action==='cool'&&frame<28){e.vx*=.985;e.vy*=.985}else if(action==='heat'&&frame<26){e.vx+=(state.r.next()-.5)*.028;e.vy+=(state.r.next()-.5)*.028}else if(action==='well'&&frame<24){e.vx-=e.x/d*.011;e.vy-=e.y/d*.011}}}
function stepState(state,g,action,frame){const p=state.p,n=p.length;let mx=0,my=0,mvx=0,mvy=0;for(const e of p){mx+=e.x;my+=e.y;mvx+=e.vx;mvy+=e.vy}mx/=n;my/=n;mvx/=n;mvy/=n;applyAction(state,action,frame);
  for(let i=0;i<n;i++){
    const e=p[i],dx=e.x-mx,dy=e.y-my,s2=e.vx*e.vx+e.vy*e.vy;
    const parity=((i&1)?1:-1),phase=Math.sin((state.step*.11)+(i*.77));
    let ax=-dx*g.center - dy*g.swirl + g.cross*e.vy + g.meanCoupling*(mvx-e.vx) + parity*g.phase*phase;
    let ay=-dy*g.center*g.anisotropy + dx*g.swirl - g.cross*e.vx + g.meanCoupling*(mvy-e.vy) - parity*g.phase*phase*.7;
    ax+=e.vx*s2*g.nonlin; ay+=e.vy*s2*g.nonlin;
    ax+=(state.r.next()-.5)*g.noise;ay+=(state.r.next()-.5)*g.noise;
    e.vx=(e.vx+ax)*g.drag;e.vy=(e.vy+ay)*g.drag;e.x+=e.vx;e.y+=e.vy;
    if(e.x<-1){e.x=-1;e.vx=Math.abs(e.vx)*g.boundary}else if(e.x>1){e.x=1;e.vx=-Math.abs(e.vx)*g.boundary}
    if(e.y<-1){e.y=-1;e.vy=Math.abs(e.vy)*g.boundary}else if(e.y>1){e.y=1;e.vy=-Math.abs(e.vy)*g.boundary}
  }
  state.step++;
}
function trajectory(genome,seed,action='observe',steps=72,sampleEvery=3){const s=initState(seed),frames=[];for(let f=0;f<steps;f++){stepState(s,genome,action,f);if(f%sampleEvery===0)frames.push(snapshot(s))}return frames}
function snapshot(state){return {x:state.p.map(e=>e.x),y:state.p.map(e=>e.y),vx:state.p.map(e=>e.vx),vy:state.p.map(e=>e.vy),m:state.p.map(e=>e.m)}}

function vecSource(frame,k){return frame[k]}
function mapUnary(a,op){if(op==='id')return a;if(op==='abs')return a.map(Math.abs);if(op==='sq')return a.map(x=>x*x);return a.map(x=>x<0?-1:x>0?1:0)}
function mapBinary(a,b,op){const n=Math.min(a.length,b.length),o=new Array(n);for(let i=0;i<n;i++){o[i]=op==='add'?a[i]+b[i]:op==='sub'?a[i]-b[i]:a[i]*b[i]}return o}
function aggregate(a,op){if(!a.length)return 0;if(op==='mean')return mean(a);if(op==='var')return variance(a);if(op==='absmean')return mean(a.map(Math.abs));if(op==='q75'){const b=[...a].sort((x,y)=>x-y);return b[Math.floor((b.length-1)*.75)]}return Math.max(...a.map(Math.abs))}
function frameExpr(frame,spec){let a=mapUnary(vecSource(frame,spec.a),spec.ua);if(spec.b){let b=mapUnary(vecSource(frame,spec.b),spec.ub);a=mapBinary(a,b,spec.bin)}return aggregate(a,spec.agg)}
function autocorr(a,lag){if(a.length<=lag+1)return 0;const x=a.slice(0,-lag),y=a.slice(lag);return corr(x,y)}
function corr(a,b){const n=Math.min(a.length,b.length);if(n<3)return 0;const x=a.slice(0,n),y=b.slice(0,n),mx=mean(x),my=mean(y),sx=Math.sqrt(x.reduce((s,v)=>s+(v-mx)**2,0)),sy=Math.sqrt(y.reduce((s,v)=>s+(v-my)**2,0));if(sx*sy<1e-12)return 0;let c=0;for(let i=0;i<n;i++)c+=(x[i]-mx)*(y[i]-my);return c/(sx*sy)}
function timeReduce(series,op,lag=2){if(!series.length)return 0;if(op==='mean')return mean(series);if(op==='var')return variance(series);if(op==='delta')return series[series.length-1]-series[0];if(op==='slope'){const n=series.length,mx=(n-1)/2,my=mean(series);let num=0,den=0;for(let i=0;i<n;i++){num+=(i-mx)*(series[i]-my);den+=(i-mx)**2}return den?num/den:0}return autocorr(series,Math.min(lag,Math.max(1,series.length-2)))}
function evaluateInstrument(program,traj){const a=traj.map(f=>frameExpr(f,program.left));if(program.kind==='single')return finite(timeReduce(a,program.time,program.lag));const b=traj.map(f=>frameExpr(f,program.right));if(program.kind==='corr')return finite(corr(a.slice(0,-program.lag||undefined),program.lag?b.slice(program.lag):b));const d=a.map((v,i)=>v-(b[i]||0));return finite(timeReduce(d,program.time,program.lag))}
function finite(v){return Number.isFinite(v)?Math.max(-1e6,Math.min(1e6,v)):0}
function randomFrameExpr(r,complexity=1){const a=r.pick(SOURCES),ua=r.pick(VUNARY),agg=r.pick(AGG);if(complexity>1&&r.next()<.58){return{a,ua,b:r.pick(SOURCES),ub:r.pick(VUNARY),bin:r.pick(VBINARY),agg}}return{a,ua,agg}}
function randomInstrument(r,maxComplexity=3){const kind=r.next()<.67?'single':r.next()<.55?'diff':'corr',left=randomFrameExpr(r,maxComplexity);const p={kind,left,time:r.pick(TIME),lag:1+r.int(5)};if(kind!=='single')p.right=randomFrameExpr(r,maxComplexity);return p}
function mutateInstrument(p,r){const q=JSON.parse(JSON.stringify(p)),choice=r.int(9);if(choice===0)q.kind=r.pick(['single','diff','corr']);else if(choice===1)q.left.a=r.pick(SOURCES);else if(choice===2)q.left.ua=r.pick(VUNARY);else if(choice===3)q.left.agg=r.pick(AGG);else if(choice===4)q.time=r.pick(TIME);else if(choice===5)q.lag=1+r.int(5);else if(choice===6){if(!q.left.b){q.left.b=r.pick(SOURCES);q.left.ub=r.pick(VUNARY);q.left.bin=r.pick(VBINARY)}else delete q.left.b}else if(choice===7){q.right=randomFrameExpr(r,3)}else if(q.right)q.right.agg=r.pick(AGG);if(q.kind!=='single'&&!q.right)q.right=randomFrameExpr(r,3);if(q.kind==='single')delete q.right;return q}
function programComplexity(p){let c=3+(p.left.b?3:0);if(p.kind!=='single')c+=3+(p.right?.b?3:0);if(p.kind==='corr')c+=1;return c}
function frameExprString(e){const left=`${e.ua==='id'?'':e.ua+'('}${e.a}${e.ua==='id'?'':')'}`;const v=e.b?`(${left} ${e.bin==='add'?'+':e.bin==='sub'?'-':'×'} ${e.ub==='id'?'':e.ub+'('}${e.b}${e.ub==='id'?'':')'})`:left;return`${e.agg}(${v})`}
function instrumentString(p){const l=frameExprString(p.left);if(p.kind==='corr')return`corr_t(${l}, ${frameExprString(p.right)}, lag=${p.lag})`;const base=p.kind==='diff'?`(${l} - ${frameExprString(p.right)})`:l;return`${p.time}_t(${base}${p.time==='autocorr'?`, lag=${p.lag}`:''})`}
function instrumentId(p){return'I-'+hashHex(instrumentString(p))}

function seedOntology(){return [
  {kind:'single',left:{a:'x',ua:'id',agg:'var'},time:'mean',lag:2},
  {kind:'single',left:{a:'y',ua:'id',agg:'var'},time:'mean',lag:2},
  {kind:'single',left:{a:'vx',ua:'abs',agg:'mean'},time:'mean',lag:2},
  {kind:'single',left:{a:'vy',ua:'abs',agg:'mean'},time:'mean',lag:2}
].map((p,i)=>({id:`S${i}`,program:p,label:instrumentString(p),certified:true,depth:0,score:0}))}

function buildSignature(genome,ontology,seeds=[101,202],actions=['observe','pulse','vortex','cool','heat','well']){const sig=[];for(const seed of seeds){for(const action of actions){const tr=trajectory(genome,seed,action);for(const inst of ontology)sig.push(evaluateInstrument(inst.program,tr))}}return sig}
function normalizedDistance(a,b){const n=Math.min(a.length,b.length);if(!n)return 0;let s=0;for(let i=0;i<n;i++){const scale=.03+Math.abs(a[i])*.25+Math.abs(b[i])*.25;s+=Math.min(16,((a[i]-b[i])/scale)**2)}return Math.sqrt(s/n)}
function forgeTwin({ontology,seed=1,candidates=14,iterations=35,progress}={}){const r=new PRNG(seed),A=randomGenome(r),sigA=buildSignature(A,ontology),targetHidden=.38;let B=randomGenome(r),best=null;
  function score(g){const sig=buildSignature(g,ontology),obs=normalizedDistance(sigA,sig),hidden=genomeDistance(A,g),fitness=hidden*1.9-obs*3.4-Math.max(0,targetHidden-hidden)*2.4;return{g,sig,obs,hidden,fitness}}
  for(let i=0;i<candidates;i++){const x=score(randomGenome(r));if(!best||x.fitness>best.fitness)best=x}
  B=best.g;
  for(let i=0;i<iterations;i++){const temp=.48*(1-i/iterations)+.06;const x=score(mutateGenome(B,r,temp));if(x.fitness>best.fitness||r.next()<.025){if(x.fitness>best.fitness)best=x;B=x.g}if(progress&&i%10===0)progress({phase:'twin',generation:i,obs:best.obs,hidden:best.hidden,fitness:best.fitness})}
  return{a:A,b:best.g,signatureA:sigA,signatureB:best.sig,observableDistance:best.obs,hiddenDistance:best.hidden,score:best.fitness,hashA:hashHex(A),hashB:hashHex(best.g)}
}

function instrumentVector(program,twin,seeds=[303,404,505,606],actions=['observe','pulse','vortex','cool','heat','well']){const a=[],b=[],diff=[];for(const seed of seeds){for(const action of actions){const va=evaluateInstrument(program,trajectory(twin.a,seed,action)),vb=evaluateInstrument(program,trajectory(twin.b,seed,action));a.push(va);b.push(vb);diff.push(va-vb)}}return{a,b,diff}}
function redundancyScore(program,twin,ontology){if(!ontology.length)return 0;const v=instrumentVector(program,twin,[707,808],['observe','pulse','heat','well']);let max=0;for(const inst of ontology){const o=instrumentVector(inst.program,twin,[707,808],['observe','pulse','heat','well']);max=Math.max(max,Math.abs(corr(v.a.concat(v.b),o.a.concat(o.b))))}return max}
function discriminationStats(v){const m=mean(v.diff),sd=stdev(v.diff),effect=Math.abs(m)/(sd+.012),consistency=Math.max(v.diff.filter(x=>x>=0).length,v.diff.filter(x=>x<0).length)/Math.max(1,v.diff.length),rawSep=mean(v.diff.map(Math.abs))/(stdev(v.a.concat(v.b))+.02);return{m,sd,effect,consistency,rawSep}}
function scoreInstrument(program,twin,ontology){
  const train=instrumentVector(program,twin,[303,404,505],ACTIONS),valid=instrumentVector(program,twin,[606,707],ACTIONS),ts=discriminationStats(train),vs=discriminationStats(valid),effect=Math.min(ts.effect,vs.effect),consistency=Math.min(ts.consistency,vs.consistency),rawSep=Math.min(ts.rawSep,vs.rawSep),redundancy=redundancyScore(program,twin,ontology),complexity=programComplexity(program),score=effect*1.35+rawSep*.9+consistency*.75+(1-redundancy)*.7-complexity*.038;
  return{score,effect,rawSep,consistency,redundancy,complexity,meanDiff:(ts.m+vs.m)/2,sdDiff:(ts.sd+vs.sd)/2,train:ts,validation:vs}
}
function forgeInstrument({twin,ontology,seed=2,population=48,generations=5,progress}={}){
  const r=new PRNG(seed);let pop=Array.from({length:population},()=>randomInstrument(r,3)),seen=new Set(),hall=[];
  for(let gen=0;gen<generations;gen++){
    const scored=[];
    for(const p of pop){const key=instrumentString(p);if(seen.has(key))continue;seen.add(key);const s=scoreInstrument(p,twin,ontology),item={program:p,...s};scored.push(item);hall.push(item)}
    hall.sort((a,b)=>b.score-a.score);hall=hall.slice(0,24);scored.sort((a,b)=>b.score-a.score);
    const elite=scored.slice(0,Math.max(8,Math.floor(population*.18)));
    const best=hall[0];if(progress)progress({phase:'instrument',generation:gen,best:best?.score||0,expression:best?instrumentString(best.program):''});
    pop=[];for(const e of elite)pop.push(e.program);while(pop.length<population){const parent=r.pick(elite)?.program||randomInstrument(r,3);pop.push(r.next()<.22?randomInstrument(r,3):mutateInstrument(parent,r))}
  }
  if(!hall.length)return null;
  return hall.slice(0,12).map(item=>{const p=item.program;return{...item,id:instrumentId(p),label:instrumentString(p),certified:item.effect>=1.0&&item.consistency>=.66&&item.rawSep>=.12&&item.redundancy<=.97}})
}
function certifyInstrument(candidate,twin){const v=instrumentVector(candidate.program,twin,[911,1021,1337,1777,2029],ACTIONS),s=discriminationStats(v);return{pass:s.effect>=1.05&&s.consistency>=.66&&s.rawSep>=.10,effect:s.effect,consistency:s.consistency,rawSep:s.rawSep,meanDiff:s.m,sdDiff:s.sd}}

function epistemicCycle({ontology,depth=0,seed=1,progress}={}){
  let twin=null,bestQ=-Infinity;
  for(let attempt=0;attempt<3;attempt++){const t=forgeTwin({ontology,seed:(seed^0xA11CE^(attempt*0x9E3779B9))>>>0,progress}),q=t.hiddenDistance*1.6-t.observableDistance*3.8;if(q>bestQ){bestQ=q;twin=t}if(t.hiddenDistance>=.30&&t.observableDistance<=.22){twin=t;break}}
  if(!twin||twin.hiddenDistance<.24||twin.observableDistance>.25)return{ok:false,twin,reason:'no_epistemic_twin',depth};
  const finalists=forgeInstrument({twin,ontology,seed:seed^0xBEEFF,progress});if(!finalists?.length)return{ok:false,twin,reason:'no_candidate',depth};
  let candidate=finalists[0],cert=certifyInstrument(candidate,twin),accepted=false;
  for(const c of finalists){const x=certifyInstrument(c,twin);if(c.certified&&x.pass){candidate=c;cert=x;accepted=true;break}if(x.effect>cert.effect){candidate=c;cert=x}}
  const instrument=accepted?{id:candidate.id,program:candidate.program,label:candidate.label,certified:true,depth:depth+1,score:candidate.score,certificate:cert,twin:{hashA:twin.hashA,hashB:twin.hashB}}:null;
  return{ok:accepted,twin,candidate,certificate:cert,instrument,depth:accepted?depth+1:depth,reason:accepted?'certified':'certificate_failed',finalists:finalists.length}
}

function selfTest(){const out=[];const t=(name,fn)=>{try{out.push({name,pass:true,detail:String(fn()||'pass')})}catch(e){out.push({name,pass:false,detail:e.message})}};
  t('deterministic universe',()=>{const g=randomGenome(new PRNG(5)),a=trajectory(g,99,'pulse'),b=trajectory(g,99,'pulse');if(JSON.stringify(a)!==JSON.stringify(b))throw Error('replay diverged');return'exact trajectory replay'});
  t('genome distance',()=>{const r=new PRNG(9),a=randomGenome(r),b=mutateGenome(a,r,.8);const d=genomeDistance(a,b);if(!(d>0))throw Error('distance zero');return d.toFixed(3)});
  t('instrument determinism',()=>{const r=new PRNG(12),g=randomGenome(r),p=randomInstrument(r),tr=trajectory(g,4,'heat'),a=evaluateInstrument(p,tr),b=evaluateInstrument(p,tr);if(a!==b)throw Error('instrument unstable');return instrumentString(p)});
  t('twin forge',()=>{const twin=forgeTwin({ontology:seedOntology(),seed:17,candidates:8,iterations:14});if(!(twin.hiddenDistance>.08))throw Error('hidden distance too small');return`hidden ${twin.hiddenDistance.toFixed(2)} / seen ${twin.observableDistance.toFixed(2)}`});
  t('instrument forge',()=>{const o=seedOntology(),twin=forgeTwin({ontology:o,seed:21,candidates:8,iterations:12}),cs=forgeInstrument({twin,ontology:o,seed:33,population:25,generations:3}),c=cs?.[0];if(!c||!Number.isFinite(c.score))throw Error('no candidate');return`${c.id} score ${c.score.toFixed(2)}`});
  return out;
}

return{ACTIONS,PRNG,randomGenome,mutateGenome,genomeDistance,trajectory,seedOntology,randomInstrument,mutateInstrument,instrumentString,instrumentId,evaluateInstrument,buildSignature,forgeTwin,forgeInstrument,certifyInstrument,epistemicCycle,selfTest,hashHex,normalizedDistance};
});
