'use client'

import { FormEvent, useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type Task = { task_id:string; title:string; notes?:string|null; priority:string; status:string; due_at?:string|null; updated_at?:string }

export default function WorkTaskCenter(){
  const [state,setState]=useState<'loading'|'signed-out'|'ready'|'error'>('loading')
  const [tasks,setTasks]=useState<Task[]>([])
  const [title,setTitle]=useState('')
  const [notes,setNotes]=useState('')
  const [priority,setPriority]=useState('normal')
  const [due,setDue]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  async function load(){
    try{
      const r=await fetch(`${PROOFTTL_API_URL}/account/tasks`,{credentials:'include',cache:'no-store'})
      if(r.status===401){setState('signed-out');return}
      if(!r.ok)throw new Error(`HTTP ${r.status}`)
      const b=await r.json() as {tasks?:Task[]}; setTasks(Array.isArray(b.tasks)?b.tasks:[]); setState('ready')
    }catch{setState('error')}
  }
  useEffect(()=>{void load()},[])

  async function create(e:FormEvent){
    e.preventDefault(); if(!title.trim()||busy)return; setBusy(true);setMessage('')
    try{
      const r=await fetch(`${PROOFTTL_API_URL}/account/tasks`,{method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({title,notes,priority,due_at:due?new Date(due).toISOString():null})})
      const b=await r.json().catch(()=>({})) as {error?:string}; if(!r.ok)throw new Error(b.error||`HTTP ${r.status}`)
      setTitle('');setNotes('');setDue('');setPriority('normal');setMessage('Task created.');await load()
    }catch(err){setMessage(err instanceof Error?err.message:'Could not create task.')}finally{setBusy(false)}
  }

  async function patch(task:Task,body:Record<string,unknown>){
    if(busy)return;setBusy(true);setMessage('')
    try{const r=await fetch(`${PROOFTTL_API_URL}/account/tasks/${task.task_id}`,{method:'PATCH',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify(body)});const b=await r.json().catch(()=>({})) as {error?:string};if(!r.ok)throw new Error(b.error||`HTTP ${r.status}`);await load()}catch(err){setMessage(err instanceof Error?err.message:'Could not update task.')}finally{setBusy(false)}
  }

  async function remove(task:Task){
    if(busy||!window.confirm(`Delete task “${task.title}”?`))return;setBusy(true);setMessage('')
    try{const r=await fetch(`${PROOFTTL_API_URL}/account/tasks/${task.task_id}`,{method:'DELETE',credentials:'include'});if(!r.ok)throw new Error(`HTTP ${r.status}`);setMessage('Task deleted.');await load()}catch(err){setMessage(err instanceof Error?err.message:'Could not delete task.')}finally{setBusy(false)}
  }

  if(state==='loading')return <div className="app-empty">Loading Work tasks…</div>
  if(state==='signed-out')return <div className="app-empty"><strong>Sign in to use account-owned Work tasks.</strong><a className="text-link" href="/login/">SIGN IN →</a></div>
  if(state==='error')return <div className="app-empty"><strong>Native Work tasks are not live on this deployment yet.</strong></div>

  const open=tasks.filter(t=>t.status==='open'),done=tasks.filter(t=>t.status==='done')
  return <div style={{display:'grid',gap:18}}>
    <div className="security-summary"><div><span>OPEN</span><strong>{open.length}</strong></div><div><span>DONE</span><strong>{done.length}</strong></div><div><span>SOURCE</span><strong>PROOFTTL NATIVE</strong></div></div>
    <form onSubmit={create} className="onboarding-card app-form native-control-form">
      <p className="app-kicker">NEW TASK</p>
      <label className="app-input-label">TASK<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="What needs to get done?" maxLength={220}/></label>
      <label className="app-input-label">NOTES<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optional)" rows={3}/></label>
      <div className="native-control-row">
        <label className="app-input-label">PRIORITY<select value={priority} onChange={e=>setPriority(e.target.value)}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
        <label className="app-input-label">DUE DATE<input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)}/></label>
      </div>
      <button className="button button-primary native-control-submit" disabled={busy||!title.trim()}>{busy?'ADDING…':'ADD TASK →'}</button>
    </form>
    <div className="app-table"><div className="app-table-head"><span>TASK</span><span>PRIORITY / DUE</span><span>ACTIONS</span></div>{tasks.map(t=><div className="app-table-head" key={t.task_id} style={{textTransform:'none',opacity:t.status==='done'?.6:1}}><span><strong>{t.title}</strong>{t.notes&&<small style={{display:'block'}}>{t.notes}</small>}</span><span>{t.priority}<small style={{display:'block'}}>{t.due_at?new Date(t.due_at).toLocaleString():'No due date'}</small></span><span style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type="button" className="text-link" onClick={()=>void patch(t,{status:t.status==='done'?'open':'done'})}>{t.status==='done'?'REOPEN':'DONE'}</button><button type="button" className="text-link" onClick={()=>void remove(t)}>DELETE</button></span></div>)}</div>
    {message&&<p className="app-note">{message}</p>}
  </div>
}
