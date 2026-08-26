(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports) module.exports=api;
  root.OntologyEngineV2=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const VERSION='0.4.0-alpha';
const FAMILIES=['particles','graph'];
const ACTIONS=['observe','pulse','vortex','cool','heat','well'];
const SOURCES=['x','y','vx','vy','m'];
const VUNARY=['id','abs','sq','sign'];
const VBINARY=['add','sub','mul'];
const AGG=['mean','var','absmean','q75','maxabs'];
const TIME=['mean','var','delta','slope','autocorr'];
const SEARCH_SEEDS=[101,173,211];
const FAST_ACTIONS=['observe','pulse','vortex'];
const AUDIT_ACTIONS=['observe','pulse','vortex','cool'];
const FORGE_VAL_SEEDS=[239,281];
const TWIN_AUDIT_SEEDS=[1009,1061,1123,1187];
const TRAIN_SEEDS=[307,353,401,457];
const VALID_SEEDS=[503,557,601,653];
const CERT_SEEDS=[2003,2069,2131,2203,2281,2347];
const PRED_TRAIN=[701,751,809,863];
const PRED_TEST=[907,953,997,1049];

const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const variance=a=>{if(a.length<2)return 0;const m=mean(a);return a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1)};
const stdev=a=>Math.sqrt(variance(a));
const finite=n=>Number.isFinite(n)?Math.max(-1e6,Math.min(1e6,n)):0;
const hashString=s=>{let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const hashHex=v=>hashString(typeof v==='string'?v:JSON.stringify(v)).toString(16).toUpperCase().padStart(8,'0');

class PRNG{
  constructor(seed){this.s=seed>>>0||1}
  next(){let a=this.s|0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;this.s=a>>>0;return((t^t>>>14)>>>0)/4294967296}
  range(a,b){return a+(b-a)*this.next()}
  int(n){return Math.floor(this.next()*n)}
  pick(a){return a[this.int(a.length)]}
  clone(){const r=new PRNG(1);r.s=this.s;return r}
}

function deriveSeeds(seed,salt,n){const r=new PRNG((seed^salt)>>>0),out=[];for(let i=0;i<n;i++)out.push(1000+r.int(900000));return out}

const PARTICLE_RANGES={center:.11,swirl:.13,cross:.09,anisotropy:.95,drag:.035,nonlin:.09,meanCoupling:.095,boundary:.48,noise:.016,phase:.07};
const GRAPH_RANGES={spring:.11,neighbor:.16,swirl:.13,drag:.035,nonlin:.09,boundary:.48,noise:.016,phase:.07,long:.12,anisotropy:.95};
function randomGenome(family,r){
  if(family==='graph') return {spring:r.range(-.045,.065),neighbor:r.range(-.08,.08),swirl:r.range(-.065,.065),drag:r.range(.963,.998),nonlin:r.range(-.035,.055),boundary:r.range(.52,1),noise:r.range(0,.016),phase:r.range(-.035,.035),long:r.range(-.06,.06),anisotropy:r.range(.58,1.53)};
  return {center:r.range(-.05,.06),swirl:r.range(-.065,.065),cross:r.range(-.045,.045),anisotropy:r.range(.58,1.53),drag:r.range(.963,.998),nonlin:r.range(-.035,.055),meanCoupling:r.range(-.048,.047),boundary:r.range(.52,1),noise:r.range(0,.016),phase:r.range(-.035,.035)};
}
function genomeKeys(f){return Object.keys(f==='graph'?GRAPH_RANGES:PARTICLE_RANGES)}
function rangesFor(f){return f==='graph'?GRAPH_RANGES:PARTICLE_RANGES}
function boundsFor(f,k){
  const b={
    particles:{center:[-.05,.06],swirl:[-.065,.065],cross:[-.045,.045],anisotropy:[.58,1.53],drag:[.963,.998],nonlin:[-.035,.055],meanCoupling:[-.048,.047],boundary:[.52,1],noise:[0,.016],phase:[-.035,.035]},
    graph:{spring:[-.045,.065],neighbor:[-.08,.08],swirl:[-.065,.065],drag:[.963,.998],nonlin:[-.035,.055],boundary:[.52,1],noise:[0,.016],phase:[-.035,.035],long:[-.06,.06],anisotropy:[.58,1.53]}
  };return b[f][k];
}
function mutateGenome(family,g,r,scale=.32){const out={...g},keys=genomeKeys(family),ranges=rangesFor(family);for(let i=0,n=1+r.int(4);i<n;i++){const k=r.pick(keys),span=ranges[k];out[k]+=r.range(-span*scale,span*scale);const [lo,hi]=boundsFor(family,k);out[k]=clamp(out[k],lo,hi)}return out}
function genomeDistance(family,a,b){const keys=genomeKeys(family),ranges=rangesFor(family);return Math.sqrt(mean(keys.map(k=>((a[k]-b[k])/ranges[k])**2)))}

function initState(seed,n=42){const r=new PRNG(seed),p=[];for(let i=0;i<n;i++){const ang=r.range(0,Math.PI*2),rad=Math.sqrt(r.next())*.66;p.push({x:Math.cos(ang)*rad,y:Math.sin(ang)*rad,vx:r.range(-.23,.23),vy:r.range(-.23,.23),m:r.range(.68,1.32)})}return{p,r,step:0}}
function applyAction(state,action,frame){for(const e of state.p){const d=Math.hypot(e.x,e.y)+1e-6;if(action==='pulse'&&frame<20){e.vx+=e.x/d*.013;e.vy+=e.y/d*.013}else if(action==='vortex'&&frame<22){e.vx-=e.y/d*.012;e.vy+=e.x/d*.012}else if(action==='cool'&&frame<28){e.vx*=.984;e.vy*=.984}else if(action==='heat'&&frame<26){e.vx+=(state.r.next()-.5)*.03;e.vy+=(state.r.next()-.5)*.03}else if(action==='well'&&frame<24){e.vx-=e.x/d*.012;e.vy-=e.y/d*.012}}}
function boundary(e,b){if(e.x<-1){e.x=-1;e.vx=Math.abs(e.vx)*b}else if(e.x>1){e.x=1;e.vx=-Math.abs(e.vx)*b}if(e.y<-1){e.y=-1;e.vy=Math.abs(e.vy)*b}else if(e.y>1){e.y=1;e.vy=-Math.abs(e.vy)*b}}
function stepParticles(s,g,action,frame){const p=s.p,n=p.length;let mx=0,my=0,mvx=0,mvy=0;for(const e of p){mx+=e.x;my+=e.y;mvx+=e.vx;mvy+=e.vy}mx/=n;my/=n;mvx/=n;mvy/=n;applyAction(s,action,frame);for(let i=0;i<n;i++){const e=p[i],dx=e.x-mx,dy=e.y-my,s2=e.vx*e.vx+e.vy*e.vy,parity=(i&1)?1:-1,ph=Math.sin(s.step*.113+i*.71);let ax=-dx*g.center-dy*g.swirl+g.cross*e.vy+g.meanCoupling*(mvx-e.vx)+parity*g.phase*ph;let ay=-dy*g.center*g.anisotropy+dx*g.swirl-g.cross*e.vx+g.meanCoupling*(mvy-e.vy)-parity*g.phase*ph*.7;ax+=e.vx*s2*g.nonlin+(s.r.next()-.5)*g.noise;ay+=e.vy*s2*g.nonlin+(s.r.next()-.5)*g.noise;e.vx=(e.vx+ax)*g.drag;e.vy=(e.vy+ay)*g.drag;e.x+=e.vx;e.y+=e.vy;boundary(e,g.boundary)}s.step++}
function stepGraph(s,g,action,frame){const p=s.p,n=p.length;applyAction(s,action,frame);const next=new Array(n);for(let i=0;i<n;i++){const e=p[i],l=p[(i+n-1)%n],r=p[(i+1)%n],far=p[(i+7)%n],ph=Math.sin(s.step*.091+i*.53);const nx=(l.x+r.x)/2,ny=(l.y+r.y)/2,nvx=(l.vx+r.vx)/2,nvy=(l.vy+r.vy)/2,s2=e.vx*e.vx+e.vy*e.vy;let ax=-(e.x-nx)*g.spring+(nvx-e.vx)*g.neighbor-g.swirl*e.y+g.long*(far.x-e.x)+g.phase*ph;let ay=-(e.y-ny)*g.spring*g.anisotropy+(nvy-e.vy)*g.neighbor+g.swirl*e.x+g.long*(far.y-e.y)-g.phase*ph*.8;ax+=e.vx*s2*g.nonlin+(s.r.next()-.5)*g.noise;ay+=e.vy*s2*g.nonlin+(s.r.next()-.5)*g.noise;next[i]={vx:(e.vx+ax)*g.drag,vy:(e.vy+ay)*g.drag}}for(let i=0;i<n;i++){p[i].vx=next[i].vx;p[i].vy=next[i].vy;p[i].x+=p[i].vx;p[i].y+=p[i].vy;boundary(p[i],g.boundary)}s.step++}
function snapshot(s){return{x:s.p.map(e=>e.x),y:s.p.map(e=>e.y),vx:s.p.map(e=>e.vx),vy:s.p.map(e=>e.vy),m:s.p.map(e=>e.m)}}
function trajectory(family,genome,seed,action='observe',steps=72,sampleEvery=3){const s=initState(seed),frames=[];for(let f=0;f<steps;f++){family==='graph'?stepGraph(s,genome,action,f):stepParticles(s,genome,action,f);if(f%sampleEvery===0)frames.push(snapshot(s))}return frames}
function splitTrajectory(frames){const cut=Math.max(6,Math.floor(frames.length*.72));return{observed:frames.slice(0,cut),future:frames.slice(cut)}}
function futureTarget(frames){if(!frames.length)return 0;return mean(frames.map(f=>mean(f.vx.map((v,i)=>Math.hypot(v,f.vy[i])))))}

function mapUnary(a,op){if(op==='id')return a;if(op==='abs')return a.map(Math.abs);if(op==='sq')return a.map(x=>x*x);return a.map(x=>x<0?-1:x>0?1:0)}
function mapBinary(a,b,op){const n=Math.min(a.length,b.length),o=new Array(n);for(let i=0;i<n;i++)o[i]=op==='add'?a[i]+b[i]:op==='sub'?a[i]-b[i]:a[i]*b[i];return o}
function aggregate(a,op){if(!a.length)return 0;if(op==='mean')return mean(a);if(op==='var')return variance(a);if(op==='absmean')return mean(a.map(Math.abs));if(op==='q75'){const b=[...a].sort((x,y)=>x-y);return b[Math.floor((b.length-1)*.75)]}return Math.max(...a.map(Math.abs))}
function frameExpr(frame,spec){let a=mapUnary(frame[spec.a],spec.ua);if(spec.b){const b=mapUnary(frame[spec.b],spec.ub);a=mapBinary(a,b,spec.bin)}return aggregate(a,spec.agg)}
function corr(a,b){const n=Math.min(a.length,b.length);if(n<3)return 0;const x=a.slice(0,n),y=b.slice(0,n),mx=mean(x),my=mean(y),sx=Math.sqrt(x.reduce((s,v)=>s+(v-mx)**2,0)),sy=Math.sqrt(y.reduce((s,v)=>s+(v-my)**2,0));if(sx*sy<1e-12)return 0;let c=0;for(let i=0;i<n;i++)c+=(x[i]-mx)*(y[i]-my);return c/(sx*sy)}
function autocorr(a,lag){if(a.length<=lag+1)return 0;return corr(a.slice(0,-lag),a.slice(lag))}
function timeReduce(a,op,lag=2){if(!a.length)return 0;if(op==='mean')return mean(a);if(op==='var')return variance(a);if(op==='delta')return a[a.length-1]-a[0];if(op==='slope'){const n=a.length,mx=(n-1)/2,my=mean(a);let num=0,den=0;for(let i=0;i<n;i++){num+=(i-mx)*(a[i]-my);den+=(i-mx)**2}return den?num/den:0}return autocorr(a,Math.min(lag,Math.max(1,a.length-2)))}
function evaluateInstrument(p,traj){const a=traj.map(f=>frameExpr(f,p.left));if(p.kind==='single')return finite(timeReduce(a,p.time,p.lag));const b=traj.map(f=>frameExpr(f,p.right));if(p.kind==='corr'){const lag=Math.min(p.lag,Math.max(1,a.length-2));return finite(corr(a.slice(0,-lag),b.slice(lag)))}return finite(timeReduce(a.map((v,i)=>v-(b[i]||0)),p.time,p.lag))}
function randomFrameExpr(r,complexity=2){const e={a:r.pick(SOURCES),ua:r.pick(VUNARY),agg:r.pick(AGG)};if(complexity>1&&r.next()<.62)Object.assign(e,{b:r.pick(SOURCES),ub:r.pick(VUNARY),bin:r.pick(VBINARY)});return e}
function randomInstrument(r,maxComplexity=3){const kind=r.next()<.64?'single':r.next()<.58?'diff':'corr',p={kind,left:randomFrameExpr(r,maxComplexity),time:r.pick(TIME),lag:1+r.int(5)};if(kind!=='single')p.right=randomFrameExpr(r,maxComplexity);return p}
function mutateInstrument(p,r){const q=JSON.parse(JSON.stringify(p)),c=r.int(11);if(c===0)q.kind=r.pick(['single','diff','corr']);else if(c===1)q.left.a=r.pick(SOURCES);else if(c===2)q.left.ua=r.pick(VUNARY);else if(c===3)q.left.agg=r.pick(AGG);else if(c===4)q.time=r.pick(TIME);else if(c===5)q.lag=1+r.int(5);else if(c===6){if(q.left.b)delete q.left.b;else Object.assign(q.left,{b:r.pick(SOURCES),ub:r.pick(VUNARY),bin:r.pick(VBINARY)})}else if(c===7&&q.left.b)q.left.bin=r.pick(VBINARY);else if(c===8)q.right=randomFrameExpr(r,3);else if(c===9&&q.right)q.right.agg=r.pick(AGG);else if(q.right)q.right.a=r.pick(SOURCES);if(q.kind!=='single'&&!q.right)q.right=randomFrameExpr(r,3);if(q.kind==='single')delete q.right;return q}
function programComplexity(p){return 3+(p.left.b?3:0)+(p.kind==='single'?0:3+(p.right?.b?3:0))+(p.kind==='corr'?1:0)}
function frameExprString(e){const l=`${e.ua==='id'?'':e.ua+'('}${e.a}${e.ua==='id'?'':')'}`;const v=e.b?`(${l} ${e.bin==='add'?'+':e.bin==='sub'?'-':'×'} ${e.ub==='id'?'':e.ub+'('}${e.b}${e.ub==='id'?'':')'})`:l;return`${e.agg}(${v})`}
function instrumentString(p){const l=frameExprString(p.left);if(p.kind==='corr')return`corr_t(${l}, ${frameExprString(p.right)}, lag=${p.lag})`;const base=p.kind==='diff'?`(${l} - ${frameExprString(p.right)})`:l;return`${p.time}_t(${base}${p.time==='autocorr'?`, lag=${p.lag}`:''})`}
function instrumentId(p){return'I-'+hashHex(instrumentString(p))}
function seedOntology(){return[
  {kind:'single',left:{a:'x',ua:'id',agg:'var'},time:'mean',lag:2},
  {kind:'single',left:{a:'y',ua:'id',agg:'var'},time:'mean',lag:2},
  {kind:'single',left:{a:'vx',ua:'abs',agg:'mean'},time:'mean',lag:2},
  {kind:'single',left:{a:'vy',ua:'abs',agg:'mean'},time:'mean',lag:2}
].map((p,i)=>({id:`S${i}`,program:p,label:instrumentString(p),certified:true,depth:0,tier:'seed'}))}
function shadowOntology(seed,count=8){const r=new PRNG(seed^0x51AD0),out=[];const seen=new Set();while(out.length<count){const p=randomInstrument(r,3),id=instrumentId(p);if(seen.has(id))continue;seen.add(id);out.push({id:`SH${out.length}`,program:p,label:instrumentString(p),shadow:true})}return out}

function samplesFor(family,genome,seeds,actions=AUDIT_ACTIONS){const out=[];for(const seed of seeds)for(const action of actions){const split=splitTrajectory(trajectory(family,genome,seed,action));out.push({seed,action,traj:split.observed,target:futureTarget(split.future)})}return out}
function features(samples,ontology){return samples.map(s=>ontology.map(i=>evaluateInstrument(i.program,s.traj)))}
function labelsPair(aRows,bRows){return{rows:aRows.concat(bRows),labels:Array(aRows.length).fill(0).concat(Array(bRows.length).fill(1))}}
function trainLDA(rows,labels){if(!rows.length)return null;const d=rows[0].length,n=rows.length,mu=Array(d).fill(0),sd=Array(d).fill(1);for(let j=0;j<d;j++){mu[j]=mean(rows.map(r=>r[j]));sd[j]=stdev(rows.map(r=>r[j]))||1}const z=rows.map(r=>r.map((v,j)=>(v-mu[j])/sd[j])),m0=Array(d).fill(0),m1=Array(d).fill(0);let n0=0,n1=0;for(let i=0;i<n;i++){const m=labels[i]?m1:m0;labels[i]?n1++:n0++;for(let j=0;j<d;j++)m[j]+=z[i][j]}for(let j=0;j<d;j++){m0[j]/=Math.max(1,n0);m1[j]/=Math.max(1,n1)}const w=m1.map((v,j)=>v-m0[j]),mid=m1.map((v,j)=>(v+m0[j])/2),b=-mid.reduce((s,v,j)=>s+v*w[j],0);return{mu,sd,w,b}}
function predictLDA(model,row){let s=model.b;for(let j=0;j<model.w.length;j++)s+=((row[j]-model.mu[j])/model.sd[j])*model.w[j];return s>=0?1:0}
function accuracy(model,rows,labels){if(!model||!rows.length)return .5;let ok=0;for(let i=0;i<rows.length;i++)if(predictLDA(model,rows[i])===labels[i])ok++;return ok/rows.length}
function maxStandardizedGap(aRows,bRows){if(!aRows.length||!bRows.length)return 0;const d=aRows[0].length;let mx=0;for(let j=0;j<d;j++){const a=aRows.map(r=>r[j]),b=bRows.map(r=>r[j]),den=.02+Math.sqrt((variance(a)+variance(b))/2);mx=Math.max(mx,Math.abs(mean(a)-mean(b))/den)}return mx}
function twinAudit(family,a,b,ontology,trainSeeds,auditSeeds){const ta=samplesFor(family,a,trainSeeds,FAST_ACTIONS),tb=samplesFor(family,b,trainSeeds,FAST_ACTIONS),aa=samplesFor(family,a,auditSeeds,AUDIT_ACTIONS),ab=samplesFor(family,b,auditSeeds,AUDIT_ACTIONS),tr=labelsPair(features(ta,ontology),features(tb,ontology)),te=labelsPair(features(aa,ontology),features(ab,ontology)),model=trainLDA(tr.rows,tr.labels),acc=accuracy(model,te.rows,te.labels),gap=maxStandardizedGap(te.rows.slice(0,aa.length),te.rows.slice(aa.length));return{accuracy:acc,gap,train:tr,test:te}}
function forgeTwin({family='particles',ontology=seedOntology(),seed=1,candidates=20,iterations=44,progress}={}){
  const master=new PRNG(seed),searchSeeds=deriveSeeds(seed,0x1111,3),forgeValSeeds=deriveSeeds(seed,0x2222,2),auditSeeds=deriveSeeds(seed,0x3333,4),targetHidden=.40,restarts=Math.min(3,1+Math.max(0,ontology.length-4));
  let globalBest=null;
  for(let restart=0;restart<restarts;restart++){
    const r=new PRNG((master.int(0x7fffffff)^((restart+1)*0x9E3779B9))>>>0),A=randomGenome(family,r),sa=samplesFor(family,A,searchSeeds,FAST_ACTIONS),fa=features(sa,ontology),sva=samplesFor(family,A,forgeValSeeds,FAST_ACTIONS),fva=features(sva,ontology);
    function evalG(g){const fb=features(samplesFor(family,g,searchSeeds,FAST_ACTIONS),ontology),fvb=features(samplesFor(family,g,forgeValSeeds,FAST_ACTIONS),ontology),pair=labelsPair(fa,fb),vpair=labelsPair(fva,fvb),model=trainLDA(pair.rows,pair.labels),acc=accuracy(model,pair.rows,pair.labels),vacc=accuracy(model,vpair.rows,vpair.labels),gap=maxStandardizedGap(fa,fb),vgap=maxStandardizedGap(fva,fvb),hidden=genomeDistance(family,A,g),blind=1-Math.abs(acc-.5)*2,vblind=1-Math.abs(vacc-.5)*2,fit=hidden*2.25+blind*.9+vblind*2.15-gap*.14-vgap*.32-Math.max(0,targetHidden-hidden)*2.4;return{g,hidden,acc,vacc,gap,vgap,fit}}
    let best=null;for(let i=0;i<candidates;i++){const x=evalG(randomGenome(family,r));if(!best||x.fit>best.fit)best=x}let B=best.g;
    for(let i=0;i<iterations;i++){const scale=.5*(1-i/iterations)+.05,x=evalG(mutateGenome(family,B,r,scale));if(x.fit>best.fit){best=x;B=x.g}if(progress&&i%8===0)progress({phase:'twin',family,restart:restart+1,restarts,generation:i,hidden:best.hidden,trainAccuracy:best.acc,validationAccuracy:best.vacc,gap:best.vgap,fitness:best.fit})}
    const candidate={A,best};if(!globalBest||best.fit>globalBest.best.fit)globalBest=candidate;
  }
  const A=globalBest.A,best=globalBest.best,audit=twinAudit(family,A,best.g,ontology,searchSeeds,auditSeeds),qualifies=best.hidden>=.36&&audit.accuracy<=.625&&audit.gap<=1.45;
  return{family,a:A,b:best.g,hashA:hashHex(A),hashB:hashHex(best.g),hiddenDistance:best.hidden,trainAccuracy:best.acc,forgeValidationAccuracy:best.vacc,auditAccuracy:audit.accuracy,auditGap:audit.gap,qualifies,score:best.fit,restarts,splitHashes:{search:hashHex(searchSeeds),forgeValidation:hashHex(forgeValSeeds),audit:hashHex(auditSeeds)}}
}

function candidateDataset(family,twin,seeds,ontology){const a=samplesFor(family,twin.a,seeds),b=samplesFor(family,twin.b,seeds),oa=features(a,ontology),ob=features(b,ontology);return{a,b,oa,ob}}
function candidateValues(p,data){return{a:data.a.map(s=>evaluateInstrument(p,s.traj)),b:data.b.map(s=>evaluateInstrument(p,s.traj))}}
function effectStats(av,bv){const ma=mean(av),mb=mean(bv),sd=Math.sqrt((variance(av)+variance(bv))/2)+1e-9,effect=Math.abs(mb-ma)/sd,dir=Math.sign(mb-ma)||1;let consistent=0,total=Math.min(av.length,bv.length);for(let i=0;i<total;i++)if(Math.sign(bv[i]-av[i])===dir)consistent++;return{effect,consistency:total?consistent/total:0,meanA:ma,meanB:mb,dir}}
function redundancy(valsA,valsB,data){const g=valsA.concat(valsB),all=data.oa.concat(data.ob);let mx=0;for(let j=0;j<(all[0]?.length||0);j++)mx=Math.max(mx,Math.abs(corr(g,all.map(r=>r[j]))));return mx}
function augmentedAccuracy(p,trainData,testData){const trv=candidateValues(p,trainData),tev=candidateValues(p,testData),trRows=trainData.oa.map((r,i)=>r.concat(trv.a[i])).concat(trainData.ob.map((r,i)=>r.concat(trv.b[i]))),trLab=Array(trainData.oa.length).fill(0).concat(Array(trainData.ob.length).fill(1)),teRows=testData.oa.map((r,i)=>r.concat(tev.a[i])).concat(testData.ob.map((r,i)=>r.concat(tev.b[i]))),teLab=Array(testData.oa.length).fill(0).concat(Array(testData.ob.length).fill(1)),baseTr=labelsPair(trainData.oa,trainData.ob),baseTe=labelsPair(testData.oa,testData.ob),base=accuracy(trainLDA(baseTr.rows,baseTr.labels),baseTe.rows,baseTe.labels),aug=accuracy(trainLDA(trRows,trLab),teRows,teLab);return{base,aug,gain:aug-base}}
function solveLinear(X,y,lambda=.03){if(!X.length)return[];const d=X[0].length+1,A=Array.from({length:d},()=>Array(d).fill(0)),b=Array(d).fill(0);for(let i=0;i<X.length;i++){const row=[1,...X[i]];for(let j=0;j<d;j++){b[j]+=row[j]*y[i];for(let k=0;k<d;k++)A[j][k]+=row[j]*row[k]}}for(let j=1;j<d;j++)A[j][j]+=lambda;for(let i=0;i<d;i++){let pivot=i;for(let j=i+1;j<d;j++)if(Math.abs(A[j][i])>Math.abs(A[pivot][i]))pivot=j;[A[i],A[pivot]]=[A[pivot],A[i]];[b[i],b[pivot]]=[b[pivot],b[i]];const den=A[i][i]||1e-9;for(let k=i;k<d;k++)A[i][k]/=den;b[i]/=den;for(let j=0;j<d;j++)if(j!==i){const f=A[j][i];for(let k=i;k<d;k++)A[j][k]-=f*A[i][k];b[j]-=f*b[i]}}return b}
function mseModel(beta,X,y){if(!y.length)return 0;return mean(y.map((v,i)=>{let p=beta[0];for(let j=0;j<X[i].length;j++)p+=beta[j+1]*X[i][j];return(v-p)**2}))}
function predictiveGainFromData(p,tr,te){const trv=candidateValues(p,tr),tev=candidateValues(p,te),Xtr=tr.oa.concat(tr.ob),Xte=te.oa.concat(te.ob),Ytr=tr.a.map(s=>s.target).concat(tr.b.map(s=>s.target)),Yte=te.a.map(s=>s.target).concat(te.b.map(s=>s.target)),base=mseModel(solveLinear(Xtr,Ytr),Xte,Yte),Xtr2=tr.oa.map((r,i)=>r.concat(trv.a[i])).concat(tr.ob.map((r,i)=>r.concat(trv.b[i]))),Xte2=te.oa.map((r,i)=>r.concat(tev.a[i])).concat(te.ob.map((r,i)=>r.concat(tev.b[i]))),aug=mseModel(solveLinear(Xtr2,Ytr),Xte2,Yte);return{base,aug,gain:base>1e-9?(base-aug)/base:0}}
function irreducibilityFromData(p,tr,te){const tv=candidateValues(p,tr),ev=candidateValues(p,te),Xtr=tr.oa.concat(tr.ob),Xte=te.oa.concat(te.ob),Ytr=tv.a.concat(tv.b),Yte=ev.a.concat(ev.b),beta=solveLinear(Xtr,Ytr,.06),mse=mseModel(beta,Xte,Yte),v=variance(Yte);return{residualFraction:v>1e-9?Math.min(4,mse/v):0,mse,variance:v}}
function erf(x){const sign=x<0?-1:1,a=Math.abs(x),t=1/(1+.3275911*a),y=1-(((((1.061405429*t-1.453152027)*t+1.421413741)*t-.284496736)*t+.254829592)*t)*Math.exp(-a*a);return sign*y}
function normalP(z){return Math.max(1e-12,2*(1-(.5*(1+erf(Math.abs(z)/Math.SQRT2)))))}
function significance(av,bv,multiplicity=12){const ma=mean(av),mb=mean(bv),va=variance(av),vb=variance(bv),se=Math.sqrt(va/Math.max(1,av.length)+vb/Math.max(1,bv.length))+1e-9,z=Math.abs(mb-ma)/se,p=normalP(z),padj=Math.min(1,p*multiplicity);return{z,p,padj}}
function scoreCandidate(p,trainData,valData){const tr=candidateValues(p,trainData),va=candidateValues(p,valData),st=effectStats(tr.a,tr.b),sv=effectStats(va.a,va.b),red=redundancy(va.a,va.b,valData),acc=augmentedAccuracy(p,trainData,valData),complexity=programComplexity(p);const score=sv.effect*1.25+sv.consistency*.7+Math.max(0,acc.gain)*1.8+(1-red)*.35-st.effect*.03-complexity*.035;return{program:p,score,train:st,validation:sv,redundancy:red,accuracy:acc,complexity}}
function evolveInstrument({family,twin,ontology,seed=1,population=72,generations=20,finalists=12,progress}={}){const r=new PRNG(seed),trainSeeds=deriveSeeds(seed,0x4444,4),validSeeds=deriveSeeds(seed,0x5555,4),train=candidateDataset(family,twin,trainSeeds,ontology),val=candidateDataset(family,twin,validSeeds,ontology);let pop=Array.from({length:population},()=>randomInstrument(r,3)),hall=new Map();for(let gen=0;gen<generations;gen++){const scored=pop.map(p=>scoreCandidate(p,train,val)).sort((a,b)=>b.score-a.score);for(const x of scored.slice(0,Math.min(20,scored.length))){const id=instrumentId(x.program),old=hall.get(id);if(!old||x.score>old.score)hall.set(id,x)}const elite=scored.slice(0,Math.max(8,Math.floor(population*.18)));pop=[];for(const e of elite.slice(0,8))pop.push(e.program);while(pop.length<population){const parent=elite[r.int(elite.length)].program;pop.push(r.next()<.15?randomInstrument(r,3):mutateInstrument(parent,r))}if(progress&&gen%4===0)progress({phase:'instrument',generation:gen,best:scored[0].score,formula:instrumentString(scored[0].program),effect:scored[0].validation.effect,accGain:scored[0].accuracy.gain})}const out=[...hall.values()].sort((a,b)=>b.score-a.score).slice(0,finalists);out.splitHashes={train:hashHex(trainSeeds),validation:hashHex(validSeeds)};return out}
function buildCertificationContext(primary,transfer,ontology,seed){
  const certSeeds=deriveSeeds(seed,0x6666,6),certTrainSeeds=deriveSeeds(seed,0x7777,4),predTrainSeeds=deriveSeeds(seed,0x8888,4),predTestSeeds=deriveSeeds(seed,0x9999,4),transferCertSeeds=deriveSeeds(seed,0xAAAA,6),transferTrainSeeds=deriveSeeds(seed,0xBBBB,4);
  return{certSeeds,predTestSeeds,transferCertSeeds,primaryCert:candidateDataset(primary.family,primary,certSeeds,ontology),primaryTrain:candidateDataset(primary.family,primary,certTrainSeeds,ontology),predTrain:candidateDataset(primary.family,primary,predTrainSeeds,ontology),predTest:candidateDataset(primary.family,primary,predTestSeeds,ontology),transferCert:candidateDataset(transfer.family,transfer,transferCertSeeds,ontology),transferTrain:candidateDataset(transfer.family,transfer,transferTrainSeeds,ontology)}
}
function certifyInstrument(p,{context,multiplicity=12}){
  const cert=context.primaryCert,vals=candidateValues(p,cert),stats=effectStats(vals.a,vals.b),sig=significance(vals.a,vals.b,multiplicity),red=redundancy(vals.a,vals.b,cert),acc=augmentedAccuracy(p,context.primaryTrain,cert),pred=predictiveGainFromData(p,context.predTrain,context.predTest),irr=irreducibilityFromData(p,context.primaryTrain,cert),trCert=context.transferCert,trVals=candidateValues(p,trCert),trStats=effectStats(trVals.a,trVals.b),trSig=significance(trVals.a,trVals.b,multiplicity),trAcc=augmentedAccuracy(p,context.transferTrain,trCert),trIrr=irreducibilityFromData(p,context.transferTrain,trCert);
  const localPass=stats.effect>=.75&&stats.consistency>=.72&&sig.padj<.05&&red<.96&&acc.gain>=.06&&irr.residualFraction>=.12;
  const transferPass=trStats.effect>=.50&&trStats.consistency>=.62&&trSig.padj<.10&&trAcc.gain>=.04&&trIrr.residualFraction>=.08;
  return{localPass,transferPass,certified:localPass&&transferPass,splitHashes:{cert:hashHex(context.certSeeds),prediction:hashHex(context.predTestSeeds),transfer:hashHex(context.transferCertSeeds)},effect:stats.effect,consistency:stats.consistency,padj:sig.padj,redundancy:red,accuracyGain:acc.gain,irreducibility:irr.residualFraction,predictiveGain:pred.gain,transferEffect:trStats.effect,transferConsistency:trStats.consistency,transferPadj:trSig.padj,transferAccuracyGain:trAcc.gain,transferIrreducibility:trIrr.residualFraction,complexity:programComplexity(p)}
}
function epistemicCycle({ontology=seedOntology(),depth=0,attack=0,seed=1,progress}={}){const primaryFamily=FAMILIES[attack%2],transferFamily=FAMILIES[(attack+1)%2];progress&&progress({phase:'start',primaryFamily,transferFamily});const forgeCandidates=20+Math.min(28,depth*10),forgeIterations=44+Math.min(44,depth*18),primary=forgeTwin({family:primaryFamily,ontology,seed:seed^0xA53A,candidates:forgeCandidates,iterations:forgeIterations,progress}),transfer=forgeTwin({family:transferFamily,ontology,seed:seed^0x7F4A,candidates:forgeCandidates,iterations:forgeIterations,progress});if(!primary.qualifies||!transfer.qualifies)return{ok:false,reason:'attack_resisted',primary,transfer,ontology:[...ontology],depth,attack:attack+1};const finalists=evolveInstrument({family:primaryFamily,twin:primary,ontology,seed:seed^0xC0FFEE,population:44,generations:14,finalists:12,progress});const certContext=buildCertificationContext(primary,transfer,ontology,seed^0xD00D),certified=finalists.map(x=>({...x,certificate:certifyInstrument(x.program,{context:certContext,multiplicity:finalists.length})})).sort((a,b)=>Number(b.certificate.certified)-Number(a.certificate.certified)||b.certificate.transferAccuracyGain-a.certificate.transferAccuracyGain||b.certificate.effect-a.certificate.effect);const br=new PRNG(seed^0xBADA55),randomBaseline=[];for(let i=0;i<32;i++){const program=randomInstrument(br,3),certificate=certifyInstrument(program,{context:certContext,multiplicity:32});randomBaseline.push({program,label:instrumentString(program),certificate})}randomBaseline.sort((a,b)=>(b.certificate.accuracyGain+b.certificate.transferAccuracyGain)-(a.certificate.accuracyGain+a.certificate.transferAccuracyGain));const baseline={count:randomBaseline.length,certified:randomBaseline.filter(x=>x.certificate.certified).length,best:randomBaseline[0]?{label:randomBaseline[0].label,accuracyGain:randomBaseline[0].certificate.accuracyGain,transferAccuracyGain:randomBaseline[0].certificate.transferAccuracyGain,effect:randomBaseline[0].certificate.effect,transferEffect:randomBaseline[0].certificate.transferEffect}:null};const winner=certified.find(x=>x.certificate.certified)||certified[0]||null;if(!winner||!winner.certificate.certified)return{ok:false,reason:'instrument_rejected',primary,transfer,finalists:certified,baseline,ontology:[...ontology],depth,attack:attack+1};const strictDepth=baseline.certified===0,nextDepth=depth+(strictDepth?1:0),prefix=strictDepth?'Ω':'D',instrument={id:`${prefix}${strictDepth?nextDepth:ontology.length-3}-${hashHex(instrumentString(winner.program)).slice(0,5)}`,program:winner.program,label:instrumentString(winner.program),certified:true,depth:nextDepth,tier:strictDepth?'epistemic-depth':'derived-dsl',certificate:winner.certificate,sourceFamily:primaryFamily,transferFamily,randomBaselinePasses:baseline.certified};const next=[...ontology,instrument];return{ok:true,reason:strictDepth?'epistemic_depth_increased':'derived_sense_added',strictDepth,primary,transfer,winner:{...winner,instrument},finalists:certified,baseline,nextOntology:next,ontology:next,depth:nextDepth,attack:attack+1,primaryFamily,transferFamily}}

function selfTest(){const tests=[];const t=(name,fn)=>{try{tests.push({name,pass:true,detail:String(fn()||'pass')})}catch(e){tests.push({name,pass:false,detail:String(e.message||e)})}};t('determinism',()=>{const g=randomGenome('particles',new PRNG(7)),a=trajectory('particles',g,77),b=trajectory('particles',g,77);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('particle replay diverged');return'particles exact'});t('family distinction',()=>{const r=new PRNG(9),a=randomGenome('particles',r),g=randomGenome('graph',r);const ap=trajectory('particles',a,33),bg=trajectory('graph',g,33);if(JSON.stringify(ap)===JSON.stringify(bg))throw Error('families collapsed');return'two independent mechanisms'});t('classifier sanity',()=>{const rows=[[0],[.1],[1],[1.1]],lab=[0,0,1,1],m=trainLDA(rows,lab);if(accuracy(m,rows,lab)<1)throw Error('classifier failed');return'LDA separates'});t('multiplicity correction',()=>{const s=significance([0,0,0,0,0,0],[1,1,1,1,1,1],12);if(!(s.padj<=1&&s.padj>=0))throw Error('bad p');return`p_adj ${s.padj.toExponential(1)}`});t('DSL stable',()=>{const p=randomInstrument(new PRNG(3));const s=instrumentString(p);if(!s||!Number.isFinite(programComplexity(p)))throw Error('DSL broken');return s});t('split isolation',()=>{const a=hashHex(deriveSeeds(11,0x3333,4)),b=hashHex(deriveSeeds(12,0x3333,4));if(a===b)throw Error('fresh attacks reused audit split');return `${a} != ${b}`});t('seed ontology',()=>{const o=seedOntology();if(o.length!==4||o.some(x=>!x.certified))throw Error('bad seed ontology');return'4 primitive senses'});return tests}

return{VERSION,FAMILIES,ACTIONS,seedOntology,shadowOntology,randomGenome,genomeDistance,trajectory,evaluateInstrument,instrumentString,instrumentId,programComplexity,forgeTwin,evolveInstrument,buildCertificationContext,certifyInstrument,epistemicCycle,selfTest};
});
