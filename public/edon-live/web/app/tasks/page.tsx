'use client';

import { FormEvent, useEffect, useState } from 'react';
import styles from './tasks.module.css';

const API='/api/edon';
type Json=Record<string,any>;
async function api(path:string,init?:RequestInit){const r=await fetch(`${API}${path}`,{cache:'no-store',...init});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b?.message||b?.error||`${path} ${r.status}`);return b as Json}
function when(value?:string|null){if(!value)return 'No due date';const n=Date.parse(value);return Number.isFinite(n)?new Date(n).toLocaleString():String(value)}

export default function TasksPage(){
  const [tasks,setTasks]=useState<any[]>([]),[projects,setProjects]=useState<any[]>([]),[ready,setReady]=useState<any[]>([]),[notifications,setNotifications]=useState<any[]>([]);
  const [title,setTitle]=useState(''),[objective,setObjective]=useState(''),[due,setDue]=useState(''),[projectName,setProjectName]=useState('');
  const [working,setWorking]=useState(''),[error,setError]=useState('');
  async function refresh(){try{const [all,r,n]=await Promise.all([api('/tasks'),api('/tasks/ready'),api('/notifications')]);setTasks(Array.isArray(all.tasks)?all.tasks:[]);setProjects(Array.isArray(all.projects)?all.projects:[]);setReady(Array.isArray(r.tasks)?r.tasks:[]);setNotifications(Array.isArray(n.notifications)?n.notifications:[]);setError('')}catch(e){setError(e instanceof Error?e.message:String(e))}}
  useEffect(()=>{void refresh();const id=window.setInterval(()=>void refresh(),6000);return()=>window.clearInterval(id)},[]);

  async function createTask(event:FormEvent){event.preventDefault();if(!title.trim())return;setWorking('task');try{await api('/tasks',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:title.trim(),objective:objective.trim(),dueAt:due?new Date(due).toISOString():null,priority:.65})});setTitle('');setObjective('');setDue('');await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}
  async function createProject(event:FormEvent){event.preventDefault();if(!projectName.trim())return;setWorking('project');try{await api('/projects',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:projectName.trim()})});setProjectName('');await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}
  async function setTaskState(id:string,state:string){setWorking(id);try{await api(`/tasks/${id}`,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({state,progress:state==='done'?1:state==='active'?.25:0})});await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}
  async function acknowledge(id:string){setWorking(id);try{await api(`/notifications/${id}`,{method:'PATCH',headers:{'content-type':'application/json'},body:'{}'});await refresh()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setWorking('')}}

  return <main className={styles.shell}>
    <header className={styles.header}><div><p>PROJECTS · TASKS · REMINDERS</p><h1>Work that survives<br/>the conversation.</h1><span>Persistent tasks, dependencies, reminders, and notifications run in the same entity state as memory and background cognition.</span></div><div className={styles.headerStats}><span><b>{ready.length}</b> READY</span><span><b>{notifications.length}</b> NOTICES</span></div></header>
    <section className={styles.topGrid}>
      <article className={styles.panel}><div className={styles.panelHead}>QUICK TASK</div><form className={styles.form} onSubmit={createTask}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" maxLength={160}/><textarea value={objective} onChange={e=>setObjective(e.target.value)} placeholder="Objective / reminder text" maxLength={1200}/><label>Due <input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)}/></label><button disabled={!title.trim()||working==='task'}>{working==='task'?'CREATING…':'CREATE TASK'}</button></form></article>
      <article className={styles.panel}><div className={styles.panelHead}>PROJECTS</div><form className={styles.projectForm} onSubmit={createProject}><input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="New project" maxLength={160}/><button disabled={!projectName.trim()||working==='project'}>ADD</button></form><div className={styles.projects}>{projects.length?projects.map((p:any)=><div key={p.id}><b>{p.name}</b><span>{p.summary||p.state||'active'}</span></div>):<p>No projects yet.</p>}</div></article>
      <article className={styles.panel}><div className={styles.panelHead}>NOTIFICATIONS</div><div className={styles.notifications}>{notifications.length?notifications.map((n:any)=><div key={n.id}><b>{n.title}</b><p>{n.message}</p><small>{when(n.createdAt||n.created_at)}</small><button onClick={()=>void acknowledge(n.id)} disabled={working===n.id}>ACK</button></div>):<p>No pending notifications.</p>}</div></article>
    </section>
    <section className={styles.panel}><div className={styles.panelHead}>PERSISTENT TASK LEDGER</div><div className={styles.taskList}>{tasks.length?tasks.map((task:any)=>{
      const state=String(task.state||'open');return <article key={task.id} className={styles.task}><div className={styles.taskMain}><span className={styles[state]||''}>{state.toUpperCase()}</span><div><b>{task.title}</b><p>{task.objective||'No objective'}</p><small>{when(task.due_at||task.dueAt)} · priority {Number(task.priority||0).toFixed(2)} · progress {Math.round(Number(task.progress||0)*100)}%</small></div></div><div className={styles.taskActions}>{state!=='active'&&state!=='done'?<button onClick={()=>void setTaskState(task.id,'active')} disabled={working===task.id}>START</button>:null}{state!=='done'?<button onClick={()=>void setTaskState(task.id,'done')} disabled={working===task.id}>DONE</button>:<button onClick={()=>void setTaskState(task.id,'open')} disabled={working===task.id}>REOPEN</button>}</div></article>}):<p className={styles.empty}>No persistent tasks yet.</p>}</div></section>
    {error?<div className={styles.error}>{error}</div>:null}
  </main>;
}
