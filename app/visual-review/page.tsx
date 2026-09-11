'use client'
import { useEffect, useState } from 'react'
export default function VisualReview() {
  const [width, setWidth] = useState(390)
  const [html, setHtml] = useState('')
  const [error, setError] = useState('')
  const [path, setPath] = useState('/')
  useEffect(() => {
    let active = true
    fetch(path).then(response => {
      if (!response.ok) throw new Error('Page failed: ' + response.status)
      return response.text()
    }).then(value => { if(active) setHtml(value) }).catch(reason => setError(String(reason)))
    return () => { active = false }
  }, [path])
  return <main style={{padding:20,background:'#20232c',minHeight:'100vh'}}>
    <meta name="robots" content="noindex,nofollow"/>
    <h1 style={{fontSize:18,color:'white'}}>Temporary responsive layout review</h1>
    <div style={{display:'flex',gap:12,margin:'14px 0'}}>
      {[360,390,768,1200].map(value => <button style={{padding:12,background:width===value?'#bccdff':'#444',color:width===value?'#112':'white'}} onClick={()=>setWidth(value)} key={value}>{value}px</button>)}
      {['/','/audit/','/audit/sample/','/audit/status/'].map(value=><button style={{padding:12,background:'#444',color:'white'}} key={value} onClick={()=>setPath(value)}>{value==='/'?'Home':value}</button>)}
    </div>
    {error && <p>{error}</p>}
    {html && <iframe title="Responsive website preview" srcDoc={html} style={{width,height:780,background:'#07090f',border:0,display:'block',margin:'0 auto'}}/>}
  </main>
}
