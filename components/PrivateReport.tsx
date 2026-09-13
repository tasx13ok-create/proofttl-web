'use client'
import { useEffect, useState } from 'react'
import { authClient, signInHref } from '../lib/proofttl-auth'
import { deskRequest, DeskError, date } from '../lib/owner-desk'
import DeskIcon from './OwnerDeskIcons'
export default function PrivateReport() {
  const [state,setState]=useState<'loading'|'signed_out'|'missing'|'ready'|'error'>('loading')
  const [report,setReport]=useState<{id:string;company:string;body:string;delivered_at_ms:number;sha256:string}|null>(null)
  const [error,setError]=useState('')
  useEffect(()=>{
    const request=new URLSearchParams(window.location.search).get('request') || ''
    if(!/^ati_[a-f0-9]{32}$/.test(request)){setState('missing');return}
    let cancelled=false
    void authClient.getSession().then(async result=>{
      if(cancelled)return
      if(!result?.data?.user){setState('signed_out');return}
      try { const value=await deskRequest<{report:NonNullable<typeof report>}>(`audit/report/${request}`); if(!cancelled){setReport(value.report);setState('ready')} }
      catch(e){ if(cancelled)return; const issue=e instanceof DeskError ? e : new DeskError(503,'service_unavailable'); setError(issue.status===401?'Sign in to read this report.':issue.status===404?'This report is unavailable.':'The private report could not be loaded.'); setState(issue.status===404?'missing':'error') }
    }).catch(()=>{if(!cancelled){setError('The private report could not be loaded.');setState('error')}})
    return()=>{cancelled=true}
  },[])
  if(state==='loading')return <main className="private-report-shell"><Card><span className="od-eyebrow"><DeskIcon name="lock"/> Private ProofTTL report</span><h1>Opening your report.</h1><div className="od-loading"><span className="od-spinner"/>Checking your signed-in access…</div></Card></main>
  if(state==='signed_out')return <main className="private-report-shell"><Card><span className="od-eyebrow"><DeskIcon name="lock"/> Private ProofTTL report</span><h1>Sign in to read it.</h1><p>This report is available only to the customer who requested it and the ProofTTL owner. Use the same email you used for the audit.</p><a className="od-button od-primary" href={signInHref(window.location.href.replace(window.location.origin,''))}>Sign in<DeskIcon name="arrow"/></a></Card></main>
  if(state!=='ready'||!report)return <main className="private-report-shell"><Card><span className="od-eyebrow"><DeskIcon name="lock"/> Private ProofTTL report</span><h1>{state==='missing'?'Report unavailable.':'Could not open the report.'}</h1><p>{error||'The report link may be incomplete or the report is not published yet.'}</p><a className="od-button" href="/audit/status/">Check audit status<DeskIcon name="arrow"/></a></Card></main>
  return <main className="private-report-shell"><header className="private-report-header"><a href="/" aria-label="ProofTTL home"><img src="/proofttl-glass-logo.png" alt="ProofTTL" width="170" height="52"/></a><span><DeskIcon name="lock"/>Private report</span></header><article className="private-report-card"><div className="private-report-meta"><span className="od-eyebrow">ProofTTL Fact Audit</span><h1>{report.company}</h1><p>Delivered {date(report.delivered_at_ms)} · Seven-day watch begins on delivery.</p></div><div className="private-report-body">{report.body}</div><footer><span>Source-backed findings, human approved.</span><span>SHA-256 · <code>{report.sha256.slice(0,12)}…</code></span></footer></article></main>
}
function Card({children}:{children:React.ReactNode}){return <section className="private-report-card private-report-gate">{children}<a className="private-report-back" href="/">Return to ProofTTL <DeskIcon name="out"/></a></section>}
