import {spawn} from 'node:child_process';

const cfg={
  backend:cleanUrl(process.env.EDON_BACKEND_URL),
  token:String(process.env.EDON_PC_DEVICE_TOKEN||'').trim(),
  host:String(process.env.EDON_DVR_IP||'').trim(),
  user:String(process.env.EDON_DVR_USERNAME||'admin').trim(),
  pass:String(process.env.EDON_DVR_PASSWORD||''),
  channels:clampInt(process.env.EDON_DVR_CHANNELS,1,32,8),
  port:clampInt(process.env.EDON_DVR_RTSP_PORT,1,65535,554),
  template:String(process.env.EDON_NIGHTOWL_RTSP_TEMPLATE||'').trim(),
  fps:Math.max(.25,Math.min(3,Number(process.env.EDON_CAMERA_WALL_FPS)||1)),
  analyzeEveryMs:Math.max(5_000,Math.min(120_000,Number(process.env.EDON_CAMERA_ANALYZE_MS)||15_000)),
  ffmpeg:String(process.env.EDON_FFMPEG||'ffmpeg').trim()||'ffmpeg'
};
if(!cfg.backend||!/^https:\/\//i.test(cfg.backend))fail('EDON_BACKEND_URL must be your production HTTPS Worker URL.');
if(!cfg.token)fail('EDON_PC_DEVICE_TOKEN is required.');
if(!cfg.host)fail('EDON_DVR_IP is required.');
if(!cfg.pass)fail('EDON_DVR_PASSWORD is required.');

console.log(`Unified camera bridge starting: ${cfg.host} · ${cfg.channels} channel(s) · ${cfg.fps} FPS wall refresh`);
console.log('DVR credentials remain local to this process. No inbound server and no port forwarding are used.');

const children=new Set();let stopping=false;
process.on('SIGINT',()=>shutdown(0));process.on('SIGTERM',()=>shutdown(0));

const streams=[];
for(let channel=1;channel<=cfg.channels;channel++){
  const found=await probeChannel(channel);
  if(found){streams.push({channel,url:found});console.log(`Channel ${channel}: RTSP stream found.`)}
  else console.warn(`Channel ${channel}: no supported RTSP layout responded. You can supply EDON_NIGHTOWL_RTSP_TEMPLATE later for this DVR series.`);
}
if(!streams.length)fail('No Night Owl RTSP channels were discovered. Confirm the DVR IP/login and model-specific RTSP support.');
streams.forEach((stream,index)=>startStream(stream,index));
await new Promise(()=>{});

async function probeChannel(channel){
  for(const url of candidateUrls(channel)){
    const ok=await snapshotProbe(url);if(ok)return url;
  }
  return null;
}
function candidateUrls(channel){
  const zero=String(channel-1).padStart(2,'0'),encUser=encodeURIComponent(cfg.user),encPass=encodeURIComponent(cfg.pass),base=`rtsp://${encUser}:${encPass}@${cfg.host}:${cfg.port}`;
  const custom=cfg.template?cfg.template.replaceAll('{channel}',String(channel)).replaceAll('{zero}',zero).replaceAll('{stream}','1').replaceAll('{host}',cfg.host).replaceAll('{port}',String(cfg.port)).replaceAll('{user}',encUser).replaceAll('{password}',encPass):null;
  return [...new Set([
    custom,
    `${base}/cam/realmonitor?channel=${channel}&subtype=1`,
    `${base}/cam/realmonitor?channel=${channel}&subtype=0`,
    `${base}/Streaming/Unicast/channels/${channel}01`,
    `${base}/Streaming/channels/${channel}01`,
    `${base}/ch${zero}/1`,
    `${base}/ch${zero}/0`,
    channel===1?base:null
  ].filter(Boolean))];
}
async function snapshotProbe(url){
  return await new Promise(resolve=>{
    const child=spawn(cfg.ffmpeg,['-hide_banner','-loglevel','error','-rtsp_transport','tcp','-i',url,'-frames:v','1','-vf','scale=480:-2','-an','-f','image2pipe','-vcodec','mjpeg','pipe:1'],{stdio:['ignore','pipe','ignore'],windowsHide:true});children.add(child);let bytes=0,settled=false;const done=ok=>{if(settled)return;settled=true;children.delete(child);try{child.kill()}catch{};resolve(ok)};child.stdout.on('data',d=>{bytes+=d.length;if(bytes>1400)done(true)});child.on('error',()=>done(false));child.on('exit',()=>done(bytes>1400));setTimeout(()=>done(false),6500).unref?.();
  });
}
function startStream(stream,index){
  if(stopping)return;const args=['-hide_banner','-loglevel','error','-rtsp_transport','tcp','-i',stream.url,'-vf',`fps=${cfg.fps},scale=960:-2`,'-an','-f','image2pipe','-vcodec','mjpeg','-q:v','5','pipe:1'];
  const child=spawn(cfg.ffmpeg,args,{stdio:['ignore','pipe','pipe'],windowsHide:true});children.add(child);let buffer=Buffer.alloc(0),lastAnalyze=Date.now()-cfg.analyzeEveryMs+(index*1700)%cfg.analyzeEveryMs,publishing=false,latest=null;
  child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);if(buffer.length>8_000_000)buffer=buffer.subarray(buffer.length-4_000_000);for(;;){const start=buffer.indexOf(Buffer.from([0xff,0xd8]));if(start<0){buffer=Buffer.alloc(0);break}const end=buffer.indexOf(Buffer.from([0xff,0xd9]),start+2);if(end<0){if(start>0)buffer=buffer.subarray(start);break}latest=buffer.subarray(start,end+2);buffer=buffer.subarray(end+2);if(!publishing)void publishLatest()}});
  child.stderr.on('data',()=>{});
  child.on('exit',()=>{children.delete(child);if(!stopping){console.warn(`Channel ${stream.channel}: RTSP stream interrupted; reconnecting.`);setTimeout(()=>startStream(stream,index),2500).unref?.()}});
  child.on('error',error=>{children.delete(child);if(!stopping)console.warn(`Channel ${stream.channel}: ffmpeg unavailable or failed (${error.code||'error'}).`)});
  async function publishLatest(){if(!latest||publishing)return;publishing=true;const frame=latest;latest=null;const now=Date.now(),analyze=now-lastAnalyze>=cfg.analyzeEveryMs;if(analyze)lastAnalyze=now;try{const response=await fetch(`${cfg.backend}/api/device/cameras/publish`,{method:'POST',headers:{authorization:`Bearer ${cfg.token}`,'content-type':'application/json'},body:JSON.stringify({cameraId:`nightowl-ch${String(stream.channel).padStart(2,'0')}`,label:`Night Owl ${stream.channel}`,location:`DVR channel ${stream.channel}`,source:'nightowl-rtsp',frameDataUrl:`data:image/jpeg;base64,${frame.toString('base64')}`,analyze})});if(!response.ok){const text=(await response.text()).slice(0,220);console.warn(`Channel ${stream.channel}: cloud publish ${response.status}${text?` · ${text}`:''}`)}}catch(error){console.warn(`Channel ${stream.channel}: cloud publish failed (${error.message||'network error'}).`)}finally{publishing=false;if(latest)setImmediate(publishLatest)}}
}
function shutdown(code){if(stopping)return;stopping=true;for(const c of children)try{c.kill()}catch{};setTimeout(()=>process.exit(code),200).unref?.()}
function cleanUrl(v){return String(v||'').trim().replace(/\/$/,'')}
function clampInt(v,min,max,fallback){const n=Number(v);return Number.isInteger(n)?Math.max(min,Math.min(max,n)):fallback}
function fail(message){console.error(message);process.exit(1)}
