'use client';

import { FormEvent, useEffect, useState } from 'react';
import styles from './memory.module.css';

const API='/api/edon';
type Json=Record<string,any>;

async function api(path:string,init?:RequestInit){const r=await fetch(`${API}${path}`,{cache:'no-store',...init});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b?.message||b?.error||`${path} ${r.status}`);return b as Json}
function when(value?:string){if(!value)return '—';const n=Date.parse(value);return Number.isFinite(n)?new Date(n).toLocaleString():String(value)}
function textOf(item:any){return String(item?.content||item?.summary||item?.text||item?.title||item?.label||item?.event_type||item?.type||'').trim()||'Untitled continuity event'}

export default function MemoryPage(){
  const [memories,setMemories]=useState<any[]>([]),[threads,setThreads]=useState<any[]>([]),[timeline,setTimeline]=useState<any[]>([]),[continuity,setContinuity]=useState<Json>({});
  const [frozen,setFrozen]=useState(false),[loading,setLoading]=useState(true),[working,setWorking]=useState('');
  const [label,setLabel]=useState(''),[content,setContent]=useState(''),[error,setError]=useState('');

  async function refresh(){try{const [m,t,c,ctrl]=await Promise.all([api('/memories'),api('/timeline?limit=220'),api('/continuity'),api('/controls')]);setMemories(Array.isArray(m.memories)?m.memories:[]);setThreads(Array.isArray(m.threads)?m.threads:[]);setTimeline(Array.isArray(t.timeline)?t.timeline:[]);setContinuity(c);setFrozen(Boolean(ctrl?.safety?.memoryFrozen));setError('')}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setLoading(false)}}
  useEffect(()=>{void refresh()},[]);

  async function addBookmark(event:FormEvent){event.preventDefault();if(!content.trim())return;setWorking('bookmark');try{await api('/bookmarks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({label:label.trim()||'Shared memory',content:content.trim(),sourceType:'manual-console'})});setLabel('');setContent('');await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}
  async function reflect(){setWorking('reflect');try{await api('/reflect',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({conversationId:'default'})});await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}
  async function consolidate(){setWorking('consolidate');try{await api('/memories/consolidate',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}
  async function toggleFreeze(){setWorking('freeze');try{const out=await api('/controls',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({safety:{memoryFrozen:!frozen}})});setFrozen(Boolean(out?.safety?.memoryFrozen));setError('')}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}

  const reflections=Array.isArray(continuity.reflections)?continuity.reflections:[],chapters=Array.isArray(continuity.chapters)?continuity.chapters:[],bookmarks=Array.isArray(continuity.bookmarks)?continuity.bookmarks:[];
  return <main className={styles.shell}>
    <header className={styles.header}><div><p>PERSISTENT CONTINUITY</p><h1>Memory is editable.<br/>Continuity is visible.</h1><span>What the entity remembers, what remains unresolved, and the autobiographical record are exposed here instead of hidden behind prompts.</span></div><button className={frozen?styles.frozen:styles.live} onClick={()=>void toggleFreeze()} disabled={working==='freeze'}>{frozen?'MEMORY FROZEN':'MEMORY WRITABLE'}</button></header>
    <section className={styles.stats}><div><span>Semantic memories</span><b>{memories.length}</b></div><div><span>Open threads</span><b>{threads.length}</b></div><div><span>Reflections</span><b>{reflections.length}</b></div><div><span>Chapters</span><b>{chapters.length}</b></div><div><span>Bookmarks</span><b>{bookmarks.length}</b></div></section>
    <section className={styles.grid}>
      <article className={styles.panel}><div className={styles.panelHead}><b>CONTINUITY TIMELINE</b><button onClick={()=>void refresh()}>{loading?'LOADING':'REFRESH'}</button></div><div className={styles.timeline}>{timeline.length?timeline.slice(0,120).map((item,i)=><div className={styles.event} key={item?.id||`${item?.created_at||item?.createdAt||''}-${i}`}><i/><div><small>{String(item?.kind||item?.type||item?.event_type||'memory').toUpperCase()} · {when(item?.created_at||item?.createdAt||item?.at)}</small><p>{textOf(item)}</p></div></div>):<p className={styles.empty}>No continuity events yet.</p>}</div></article>
      <aside className={styles.side}>
        <article className={styles.panel}><div className={styles.panelHead}><b>PIN A MEMORY</b></div><form className={styles.form} onSubmit={addBookmark}><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label (optional)" maxLength={160}/><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Something that should remain explicitly retrievable…" maxLength={4000}/><button disabled={!content.trim()||working==='bookmark'||frozen}>{working==='bookmark'?'SAVING…':'SAVE BOOKMARK'}</button></form></article>
        <article className={styles.panel}><div className={styles.panelHead}><b>CONTINUITY ACTIONS</b></div><div className={styles.actions}><button onClick={()=>void reflect()} disabled={Boolean(working)}>{working==='reflect'?'REFLECTING…':'GENERATE REFLECTION'}</button><button onClick={()=>void consolidate()} disabled={Boolean(working)||frozen}>{working==='consolidate'?'CONSOLIDATING…':'CONSOLIDATE DUPLICATES'}</button></div><p className={styles.note}>Reflection is model-backed and writes only when enough conversation context exists. Consolidation merges only highly similar same-kind records.</p></article>
        <article className={styles.panel}><div className={styles.panelHead}><b>OPEN THREADS</b></div><div className={styles.threadList}>{threads.length?threads.slice(0,16).map((item,i)=><div key={item?.id||i}><span>{textOf(item)}</span><small>{when(item?.updated_at||item?.updatedAt||item?.created_at||item?.createdAt)}</small></div>):<p className={styles.empty}>No unresolved threads reported.</p>}</div></article>
      </aside>
    </section>
    {error?<div className={styles.error}>{error}</div>:null}
  </main>;
}
