'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { authClient, signInHref } from '../lib/proofttl-auth'
import { date, deskRequest, DeskError, eventLabels, money, nextAction, stateLabels, timestamp, type AuditState, type AuditSummary, type DeskSection, type DeskTask, type Overview } from '../lib/owner-desk'
import DeskIcon, { DeskSculpture } from './OwnerDeskIcons'
import OwnerAuditDetail from './OwnerAuditDetail'

const sections: DeskSection[] = ['Overview', 'Requests', 'Payments', 'Delivery', 'Tasks', 'Settings']
const descriptions: Record<DeskSection, [string, string]> = {
  Overview: ['A little clarity. A lot of control.', 'Your requests, payments, and next moves. One private place.'],
  Requests: ['Every request. A clear next step.', 'Review the brief, agree the scope, and keep the work moving.'],
  Payments: ['From scope to paid.', 'Create checkout for an agreed scope. Stripe confirms the payment.'],
  Delivery: ['Finish with evidence.', 'Draft, review, publish. Keep an eye on the findings that matter.'],
  Tasks: ['Less in your head.', 'A simple, private list for the things you need to do next.'],
  Settings: ['Everything in its place.', 'Your access, connected services, and useful shortcuts.'],
}

export default function OwnerDesk() {
  const [gate, setGate] = useState<'loading' | 'locked' | 'forbidden' | 'error' | 'ready'>('loading')
  const [data, setData] = useState<Overview | null>(null)
  const [section, setSection] = useState<DeskSection>('Overview')
  const [selected, setSelected] = useState<string | null>(null)
  const [initialFilter, setInitialFilter] = useState<AuditState | 'all'>('all')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [updated, setUpdated] = useState<number | null>(null)
  const [version, setVersion] = useState(0)
  const [menu, setMenu] = useState(false)
  const latest = useRef(0)
  const session = useRef('')
  const taskBusy = useRef(false)
  const [busyTask, setBusyTask] = useState('')

  const authError = useCallback((e: DeskError) => {
    latest.current++; session.current = ''; setData(null); setSelected(null)
    setGate(e.status === 403 ? 'forbidden' : 'locked'); setError('')
  }, [])
  const refresh = useCallback(async () => {
    const seq = ++latest.current
    setRefreshing(true)
    try {
      const result = await deskRequest<Overview>('owner/overview')
      if (seq !== latest.current) return
      if (session.current && session.current !== result.owner.email) setSelected(null)
      session.current = result.owner.email
      setData(result); setGate('ready'); setError(''); setUpdated(Date.now()); setVersion(v => v + 1)
    } catch (e) {
      if (seq !== latest.current) return
      const issue = e instanceof DeskError ? e : new DeskError(503, 'service_unavailable')
      if (issue.status === 401 || issue.status === 403) authError(issue)
      else { setError(issue.message); setGate(g => g === 'ready' ? 'ready' : 'error') }
    } finally { if (seq === latest.current) setRefreshing(false) }
  }, [authError])
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('request')
    if (requested && /^ati_[a-f0-9]{32}$/.test(requested)) setSelected(requested)
    const savedSection = window.location.hash.slice(1)
    const match = sections.find(s => s.toLowerCase() === savedSection)
    if (match) setSection(match)
    void refresh()
    const focus = () => { if (document.visibilityState === 'visible') void refresh() }
    const interval = window.setInterval(focus, 60000)
    window.addEventListener('focus', focus)
    return () => { latest.current++; window.removeEventListener('focus', focus); window.clearInterval(interval) }
  }, [refresh])
  function navigate(target: DeskSection, filter: AuditState | 'all' = 'all') {
    setSection(target); setInitialFilter(filter); setMenu(false); setNotice('')
    window.history.replaceState(null, '', `/owner/#${target.toLowerCase()}`)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  async function signOut() {
    latest.current++; session.current = ''; setData(null); setSelected(null); setGate('locked'); setError('')
    try { const result = await authClient.signOut(); if (result?.error) throw new Error('sign_out_failed') }
    catch { setError('Sign-out could not be confirmed. Retry before leaving a shared device.') }
  }
  async function taskAction(id: string | null, body: unknown) {
    if (taskBusy.current) return
    taskBusy.current = true; setBusyTask(id || 'new'); setError('')
    try { await deskRequest(`owner/tasks${id ? '/'+id : ''}`, body); await refresh(); return true }
    catch (e) { if (e instanceof DeskError && [401,403].includes(e.status)) authError(e); else setError(e instanceof Error ? e.message : 'Could not save the task.'); return false }
    finally { taskBusy.current = false; setBusyTask('') }
  }
  async function share() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/audit/`); setNotice('Audit link copied. Share it with someone who needs their claims checked.') }
    catch { setNotice(`Your audit link: ${window.location.origin}/audit/`) }
  }
  if (gate !== 'ready' || !data) return <main className="owner-desk od-gate"><a className="od-gate-logo" href="/" aria-label="ProofTTL home"><img src="/proofttl-glass-logo.png" alt="ProofTTL" width="190" height="58" /></a><DeskSculpture /><section className="od-gate-card od-enter"><span className="od-eyebrow"><DeskIcon name="lock" /> Your private workspace</span><h1>{gate === 'loading' ? 'One moment.' : gate === 'forbidden' ? 'Your desk is private.' : gate === 'error' ? 'Let’s reconnect.' : 'Welcome to your desk.'}</h1><p>{gate === 'loading' ? 'Checking your owner access securely.' : gate === 'forbidden' ? 'Sign in with a verified ProofTTL owner account to open this workspace.' : gate === 'error' ? 'The owner service could not be reached. Your customer data has not been loaded.' : 'Requests. Payments. Delivery. Everything you need to run ProofTTL, in one place.'}</p>{gate === 'loading' ? <div className="od-loading"><span className="od-spinner" />Checking access…</div> : <div className="od-actions">{gate === 'error' ? <button className="od-button od-primary" onClick={() => { setGate('loading'); void refresh() }}>Try again<DeskIcon name="refresh" /></button> : <a className="od-button od-primary" href={signInHref('/owner/')}>Sign in to Owner Desk<DeskIcon name="arrow" /></a>}{gate === 'forbidden' && <button className="od-button" onClick={() => void signOut()}>Switch account</button>}</div>}{error && <div className="od-alert" role="alert">{error}{gate === 'locked' && <button onClick={() => void signOut()}>Retry sign-out</button>}</div>}<div className="od-gate-footer"><DeskIcon name="lock" /><span>Verified owner access · Private customer records</span></div></section><a className="od-gate-back" href="/">Return to ProofTTL <DeskIcon name="out" /></a></main>

  const needsYou = data.counts.received + data.counts.scoped + data.counts.paid
  const priority = data.counts.paid ? { title: 'Paid work is ready for you.', body: `${data.counts.paid} ${data.counts.paid === 1 ? 'audit needs' : 'audits need'} research, review, or delivery.`, section: 'Delivery' as DeskSection, filter: 'paid' as AuditState, action: 'Open paid audits' } : data.counts.received ? { title: 'A new brief. Your next move.', body: `${data.counts.received} ${data.counts.received === 1 ? 'request is' : 'requests are'} waiting for you to review the scope.`, section: 'Requests' as DeskSection, filter: 'received' as AuditState, action: 'Review new requests' } : data.counts.scoped ? { title: 'Turn an agreed scope into checkout.', body: `${data.counts.scoped} ${data.counts.scoped === 1 ? 'request is' : 'requests are'} ready for a payment link.`, section: 'Payments' as DeskSection, filter: 'scoped' as AuditState, action: 'Create checkout' } : data.counts.payment_ready ? { title: 'Your next audit is awaiting payment.', body: 'Open the request to copy the customer message or check its Stripe payment.', section: 'Payments' as DeskSection, filter: 'payment_ready' as AuditState, action: 'View awaiting payments' } : null
  return <div className={`owner-desk${menu ? ' od-menu-open' : ''}`}>
    <a className="od-skip" href="#owner-content">Skip to workspace</a>
    <aside className="od-rail"><a href="/" className="od-brand" aria-label="ProofTTL home"><img src="/proofttl-glass-logo.png" alt="ProofTTL" width="164" height="50" /></a><div className="od-rail-label"><DeskIcon name="lock" /> OWNER DESK</div><nav aria-label="Owner desk" id="od-navigation">{sections.map(s => <button key={s} className={section === s ? 'is-active' : ''} aria-current={section === s ? 'page' : undefined} onClick={() => navigate(s)}><DeskIcon name={s} /><span>{s}</span>{s === 'Requests' && data.counts.received > 0 && <b>{data.counts.received}</b>}{s === 'Tasks' && data.tasks.some(t => !t.done) && <b>{data.tasks.filter(t => !t.done).length}</b>}</button>)}</nav><div className="od-rail-bottom"><a href="/" target="_blank" rel="noopener noreferrer"><DeskIcon name="out" />View public site</a><div className="od-owner"><span>{data.owner.name.slice(0,1).toUpperCase()}</span><div><strong>{data.owner.name}</strong><small>Verified owner</small></div><button className="od-icon-button" onClick={() => void signOut()} aria-label="Sign out of Owner Desk"><DeskIcon name="out" /></button></div></div></aside>
    <header className="od-topbar"><span className="od-breadcrumb">ProofTTL <i>/</i> {section}</span><div><span className="od-sync"><i />{updated ? `Updated ${new Date(updated).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : 'Connected'}</span><button className="od-icon-button" disabled={refreshing} onClick={() => void refresh()} aria-label="Refresh owner data"><DeskIcon name="refresh" className={refreshing ? 'od-spinning' : ''} /></button><button className="od-menu-toggle od-icon-button" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="od-navigation" onClick={() => setMenu(!menu)}><span /><span /><span /></button></div></header>
    {menu && <button className="od-menu-scrim" aria-label="Close navigation" onClick={() => setMenu(false)} />}
    <main id="owner-content" className="od-main" tabIndex={-1}>
      <header className="od-page-heading"><div><span className="od-eyebrow">{section === 'Overview' ? `Welcome back, ${data.owner.name.split(' ')[0]}.` : `Your desk / ${section}`}</span><h1>{descriptions[section][0]}</h1><p>{descriptions[section][1]}</p></div><button className="od-button od-share-top" onClick={() => void share()}><DeskIcon name="copy" />Share audit link</button></header>
      {error && <div className="od-alert" role="alert">{error}<button onClick={() => void refresh()}>Refresh</button></div>}{notice && <div className="od-notice" role="status"><DeskIcon name="check" />{notice}<button aria-label="Dismiss message" onClick={() => setNotice('')}><DeskIcon name="close" /></button></div>}
      <div key={`${section}-${initialFilter}`} className="od-enter">
        {section === 'Overview' && <>
          <section className="od-priority od-surface"><div className="od-priority-copy"><span className="od-eyebrow"><i className="od-status-dot" />{needsYou ? `${needsYou} ${needsYou === 1 ? 'action' : 'actions'} waiting for you` : 'Your next move'}</span><h2>{priority?.title || 'Ready for the next opportunity.'}</h2><p>{priority?.body || 'No audits need action right now. Share your Fact Audit page, follow up on a real conversation, or plan your next task.'}</p><button className="od-button od-primary" onClick={() => priority ? navigate(priority.section, priority.filter) : void share()}>{priority?.action || 'Copy your audit link'}<DeskIcon name="arrow" /></button></div><DeskSculpture /></section>
          <div className="od-stats"><Stat label="Payments recorded" value={money(data.recorded_payments_usd)} note="Stripe-confirmed audit payments" onClick={() => navigate('Payments', 'paid')} /><Stat label="Needs scope" value={data.counts.received} note="New requests to review" onClick={() => navigate('Requests', 'received')} /><Stat label="In progress" value={data.counts.paid} note="Paid audits to finish" onClick={() => navigate('Delivery', 'paid')} /><Stat label="Active watches" value={data.active_watches} note="Within the seven-day window" onClick={() => navigate('Delivery', 'fulfilled')} /></div>
          <div className="od-overview-grid"><section className="od-surface"><div className="od-section-heading"><div><span className="od-eyebrow">The latest</span><h2>Recent requests</h2></div><button className="od-text-link" onClick={() => navigate('Requests')}>View all<DeskIcon name="arrow" /></button></div>{data.recent.length ? <RequestRows rows={data.recent} open={setSelected} /> : <Empty icon="Requests" title="Your first request will land here." text="Customers submit their brief on your Fact Audit page. Once it arrives, you can handle the entire workflow from this desk." action="Open the audit page" href="/audit/" />}</section><section className="od-surface"><div className="od-section-heading"><div><span className="od-eyebrow">A clear head</span><h2>Your next tasks</h2></div><button className="od-text-link" onClick={() => navigate('Tasks')}>View all<DeskIcon name="arrow" /></button></div><TaskList tasks={data.tasks.filter(t => !t.done).slice(0,4)} busy={busyTask} change={taskAction} /><button className="od-button od-wide" onClick={() => navigate('Tasks')}><DeskIcon name="plus" />Add a task</button></section></div>
          <section className="od-surface od-activity"><div className="od-section-heading"><h2>Recently handled</h2><span className="od-muted">Actions from Owner Desk</span></div>{data.activity.length ? <ol className="od-timeline">{data.activity.slice(0,5).map((e,i) => <li key={e.id || i}><DeskIcon name="check" /><div><strong>{eventLabels[e.action] || e.action}{e.company_or_project && ` · ${e.company_or_project}`}</strong><span>{timestamp(e.created_at_ms)}</span></div>{e.intake_id && <button className="od-icon-button" aria-label={`Open ${e.company_or_project || 'request'}`} onClick={() => setSelected(e.intake_id!)}><DeskIcon name="arrow" /></button>}</li>)}</ol> : <p className="od-muted">Your first saved scope, report review, or delivery will appear here.</p>}</section>
        </>}
        {['Requests','Payments','Delivery'].includes(section) && <>
          {section === 'Payments' && <div className="od-payment-banner od-surface"><div><span className="od-eyebrow">Payments recorded</span><strong>{money(data.recorded_payments_usd)} <small>USD</small></strong></div><p>This is the total recorded on paid audit requests. Check Stripe for available balance, fees, refunds, and payouts.</p><a className="od-button" href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener noreferrer">Open Stripe<DeskIcon name="out" /></a></div>}
          {section === 'Delivery' && <div className="od-watch-line"><DeskIcon name="Delivery" /><span><strong>{data.active_watches} active {data.active_watches === 1 ? 'watch' : 'watches'}</strong> · Review important findings through the seven-day window shown on each delivered request.</span></div>}
          <IntakeList key={`${section}-${initialFilter}`} section={section} initial={initialFilter} version={version} open={setSelected} onAuthError={authError} />
        </>}
        {section === 'Tasks' && <section className="od-surface od-task-surface"><TaskComposer busy={busyTask === 'new'} add={title => taskAction(null, { title })} /><div className="od-section-heading"><h2>To do <span className="od-count">{data.tasks.filter(t => !t.done).length}</span></h2><span className="od-muted">Saved privately to your account</span></div><TaskList tasks={data.tasks.filter(t => !t.done)} busy={busyTask} change={taskAction} />{data.tasks.some(t => t.done) && <details className="od-completed"><summary>Completed · {data.tasks.filter(t => t.done).length}</summary><TaskList tasks={data.tasks.filter(t => t.done)} busy={busyTask} change={taskAction} /></details>}</section>}
        {section === 'Settings' && <div className="od-settings-grid"><section className="od-surface"><span className="od-eyebrow">Your account</span><h2>Private by design.</h2><div className="od-settings-account"><img src="/proofttl-mark.svg" alt="" width="52" height="52" /><div><strong>{data.owner.name}</strong><span>{data.owner.email}</span></div></div><p>Owner access is checked on the server for every request. Your notes, tasks, customer records, and report drafts stay in this workspace.</p><div className="od-actions"><a className="od-button" href={signInHref('/owner/')}>Sign-in options<DeskIcon name="arrow" /></a><button className="od-button" onClick={() => void signOut()}>Sign out</button></div></section><section className="od-surface"><span className="od-eyebrow">Configuration</span><h2>The essentials.</h2><Service label="Owner authentication" enabled={data.services.auth} /><Service label="Private storage" enabled={data.services.database} /><Service label="Checkout controls" enabled={data.services.checkout} /><Service label="Stripe webhook secret" enabled={data.services.webhook} /><Service label="Owner actions" enabled={data.services.admin_controls} /><p className="od-muted">Stripe mode: <strong>{data.services.stripe_mode}</strong>. These show configuration, not a live transaction test.</p></section><section className="od-surface od-shortcuts"><span className="od-eyebrow">A few useful doors</span><h2>Open your tools.</h2>{[['Stripe dashboard','Payments, refunds, and payouts','https://dashboard.stripe.com/'],['ProofTTL email','Open Gmail and search for ProofTTL','https://mail.google.com/mail/u/0/#search/ProofTTL'],['Public Fact Audit','The page you share with customers','/audit/'],['Example report','The published ProofTTL sample','/audit/sample/'],['Website source','Your existing GitHub repository','https://github.com/tasx13ok-create/proofttl-web']].map(([label,description,href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer"><div><strong>{label}</strong><span>{description}</span></div><DeskIcon name="out" /></a>)}</section></div>}
      </div>
      <footer className="od-footer"><span><DeskIcon name="lock" />ProofTTL Owner Desk</span><span>Evidence before confidence.</span></footer>
    </main>
    {selected && <OwnerAuditDetail key={selected} id={selected} onClose={() => setSelected(null)} onUpdated={() => void refresh()} onAuthError={authError} />}
  </div>
}
function Stat({ label, value, note, onClick }: { label: string; value: string | number; note: string; onClick: () => void }) { return <button className="od-stat od-surface" onClick={onClick}><span>{label}<DeskIcon name="arrow" /></span><strong>{value}</strong><small>{note}</small></button> }
function Service({ label, enabled }: { label: string; enabled: boolean }) { return <div className="od-service"><span>{label}</span><span className={enabled ? 'is-configured' : 'is-missing'}><i />{enabled ? 'Configured' : 'Needs setup'}</span></div> }
function Empty({ icon, title, text, action, href }: { icon: 'Requests' | 'Tasks' | 'Payments' | 'Delivery'; title: string; text: string; action?: string; href?: string }) { return <div className="od-empty"><DeskIcon name={icon} /><h3>{title}</h3><p>{text}</p>{action && href && <a className="od-button" href={href} target="_blank" rel="noopener noreferrer">{action}<DeskIcon name="out" /></a>}</div> }
function RequestRows({ rows, open }: { rows: AuditSummary[]; open: (id: string) => void }) { return <ul className="od-request-rows">{rows.map(a => <li key={a.id}><button onClick={() => open(a.id)}><span className="od-request-avatar">{a.company_or_project.slice(0,1).toUpperCase()}</span><span className="od-request-name"><strong>{a.company_or_project}</strong><small>{a.email || date(a.created_at_ms)}{a.watch_ends_at_ms ? ` · Watch through ${date(a.watch_ends_at_ms)}` : ''}</small></span><span className={`od-badge is-${a.status}`}>{stateLabels[a.status]}</span><span className="od-row-action">{nextAction(a)}<DeskIcon name="arrow" /></span></button></li>)}</ul> }
function TaskList({ tasks, busy, change }: { tasks: DeskTask[]; busy: string; change: (id: string | null, body: unknown) => Promise<boolean | undefined> }) { return tasks.length ? <ul className="od-task-list">{tasks.map(t => <li key={t.id} className={t.done ? 'is-done' : ''}><label><input type="checkbox" checked={!!t.done} disabled={!!busy} onChange={() => void change(t.id, { done: !t.done })} /><span>{t.title}</span></label>{t.done && <button className="od-icon-button" aria-label={`Remove completed task: ${t.title}`} disabled={!!busy} onClick={() => void change(t.id, { remove: true })}><DeskIcon name="close" /></button>}</li>)}</ul> : <div className="od-task-empty"><DeskIcon name="check" /><p>A clear list. Add your next move when you’re ready.</p></div> }
function TaskComposer({ add, busy }: { add: (title: string) => Promise<boolean | undefined>; busy: boolean }) { const [title,setTitle] = useState(''); return <form className="od-task-composer" onSubmit={async e => { e.preventDefault(); if (await add(title)) setTitle('') }}><label className="od-field">What needs doing?<input value={title} onChange={e => setTitle(e.target.value)} maxLength={240} placeholder="Follow up, review a brief, or plan the next sale…" required /></label><button className="od-button od-primary" disabled={busy || !title.trim()}><DeskIcon name="plus" />{busy ? 'Adding…' : 'Add task'}</button></form> }
function IntakeList({ section, initial, version, open, onAuthError }: { section: DeskSection; initial: AuditState | 'all'; version: number; open: (id: string) => void; onAuthError: (e: DeskError) => void }) {
  const defaultFilter = initial !== 'all' ? initial : section === 'Payments' ? 'payment_ready' : section === 'Delivery' ? 'paid' : 'all'
  const [filter,setFilter] = useState<AuditState | 'all'>(defaultFilter)
  const [query,setQuery] = useState(''); const [search,setSearch] = useState(''); const [offset,setOffset] = useState(0)
  const [rows,setRows] = useState<AuditSummary[]>([]); const [more,setMore] = useState(false); const [loading,setLoading] = useState(true); const [error,setError] = useState(''); const [retry,setRetry] = useState(0)
  useEffect(() => { const timer = window.setTimeout(() => { setSearch(query); setOffset(0) },300); return () => window.clearTimeout(timer) },[query])
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('')
    void deskRequest<{ intakes: AuditSummary[]; has_more: boolean }>(`owner/intakes?status=${filter}&q=${encodeURIComponent(search)}&offset=${offset}`,undefined,controller.signal).then(result => { if (!controller.signal.aborted) { setRows(result.intakes); setMore(result.has_more) } }).catch(e => { if (controller.signal.aborted) return; if (e instanceof DeskError && [401,403].includes(e.status)) onAuthError(e); else { setRows([]); setError(e.message) } }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  },[filter,search,offset,version,retry,onAuthError])
  const filters: (AuditState | 'all')[] = section === 'Payments' ? ['payment_ready','scoped','paid','fulfilled'] : section === 'Delivery' ? ['paid','fulfilled'] : ['all','received','scoped','payment_ready','paid','fulfilled','cancelled']
  return <section className="od-surface od-list-surface"><div className="od-list-controls"><label className="od-search"><DeskIcon name="search" /><input aria-label="Search requests by company, email, or ID" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search company, email, or request ID" /></label><label className="od-filter"><span>Status</span><select value={filter} onChange={e => { setFilter(e.target.value as AuditState | 'all'); setOffset(0) }}>{filters.map(f => <option key={f} value={f}>{f === 'all' ? 'All requests' : stateLabels[f]}</option>)}</select></label></div>{loading ? <div className="od-loading" aria-live="polite"><span className="od-spinner" />Loading requests…</div> : error ? <div className="od-alert" role="alert">{error}<button onClick={() => setRetry(v => v+1)}>Try again</button></div> : rows.length ? <RequestRows rows={rows} open={open} /> : <Empty icon="Requests" title={query ? 'No matching requests.' : 'Nothing in this stage yet.'} text={query ? 'Try another company, email, or request ID.' : 'Requests will appear here as they move through scope, payment, and delivery.'} />}{!loading && !error && <div className="od-pagination"><span>{rows.length ? `Showing ${offset+1}–${offset+rows.length}` : '0 requests'}</span><div><button className="od-icon-button" aria-label="Previous page" disabled={!offset} onClick={() => setOffset(v => Math.max(0,v-50))}><DeskIcon name="back" /></button><button className="od-icon-button" aria-label="Next page" disabled={!more} onClick={() => setOffset(v => v+50)}><DeskIcon name="arrow" /></button></div></div>}</section>
}
