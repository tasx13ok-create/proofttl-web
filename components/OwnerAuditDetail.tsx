'use client'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import DeskIcon from './OwnerDeskIcons'
import { customerStatusUrl, date, deskRequest, DeskError, eventLabels, money, safeHttps, stateLabels, timestamp, type DetailResponse } from '../lib/owner-desk'

type Props = { id: string; onClose: () => void; onUpdated: () => void; onAuthError: (e: DeskError) => void }
export default function OwnerAuditDetail({ id, onClose, onUpdated, onAuthError }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const inFlight = useRef(false)
  const alive = useRef(true)
  const [data, setData] = useState<DetailResponse | null>(null)
  const [tab, setTab] = useState<'brief' | 'report' | 'notes' | 'activity'>('brief')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')
  const [closing, setClosing] = useState(false)
  const [confirm, setConfirm] = useState<'cancel' | 'deliver' | 'discard' | null>(null)
  const [scope, setScope] = useState('')
  const [turnaround, setTurnaround] = useState('')
  const [reportText, setReportText] = useState('')
  const [reportMode, setReportMode] = useState<'edit' | 'read'>('edit')
  const [reviewed, setReviewed] = useState(false)
  const [note, setNote] = useState('')
  const a = data?.intake
  const reportDirty = !!data && reportText.trim() !== (data.report?.body || '')
  const scopeDirty = !!a && ['received', 'scoped'].includes(a.status) && (scope !== (a.scope_summary || '') || turnaround !== (a.scope_turnaround || ''))
  const dirty = reportDirty || scopeDirty || !!note.trim()

  function fail(e: unknown) {
    const issue = e instanceof DeskError ? e : new DeskError(503, 'service_unavailable')
    if (issue.status === 401 || issue.status === 403 && issue.code === 'owner_access_required') onAuthError(issue)
    else if (alive.current) setError(issue.message)
  }
  async function load(reset = false) {
    const next = await deskRequest<DetailResponse>(`owner/intakes/${id}`)
    if (!alive.current) return
    setData(next)
    if (reset) { setScope(next.intake.scope_summary || ''); setTurnaround(next.intake.scope_turnaround || ''); setReportText(next.report?.body || ''); setReviewed(false) }
    return next
  }
  useEffect(() => {
    alive.current = true
    dialog.current?.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    void load(true).catch(fail)
    return () => { alive.current = false; document.body.style.overflow = previous }
    // This component is remounted for each request; drafts stay local to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  useEffect(() => {
    if (!dirty) return
    const before = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', before)
    return () => window.removeEventListener('beforeunload', before)
  }, [dirty])
  function close() { if (inFlight.current) return; if (dirty) { setConfirm('discard'); return }; finishClose() }
  function finishClose() { setClosing(true); window.setTimeout(onClose, 220) }
  async function act(action: string, body: unknown, message: string, reset = false) {
    if (inFlight.current) return
    inFlight.current = true; setBusy(action); setError(''); setNotice(''); setConfirm(null)
    try {
      await deskRequest(`owner/intakes/${id}/${action}`, body)
      if (action === 'notes') setNote('')
      await load(reset)
      setNotice(message); onUpdated()
    } catch (e) { fail(e) }
    finally { inFlight.current = false; if (alive.current) setBusy('') }
  }
  async function copy(text: string, message: string) {
    try { await navigator.clipboard.writeText(text); setNotice(message) }
    catch { setError('Clipboard access is blocked. Select and copy the visible link instead.') }
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    if (!/\.(txt|md)$/i.test(file.name) || file.size > 480000) { setError('Choose a .txt or .md file smaller than 480 KB.'); return }
    const text = await file.text()
    if (text.includes('\0')) { setError('Choose a plain-text report.'); return }
    setReportText(text); setReportMode('edit'); setReviewed(false); setNotice('File loaded. Save the draft to keep it.')
  }
  const checkout = safeHttps(a?.payment_url)
  const published = safeHttps(a?.report_url)
  const statusLink = customerStatusUrl(id)
  const message = a ? `Hi,\n\n${a.status === 'fulfilled' ? `Your ProofTTL Fact Audit is ready. Sign in with ${a.email} to read your report:\n${published || statusLink}\n\nThe seven-day watch runs through ${date(a.watch_ends_at_ms)}.` : `The agreed scope for your ProofTTL Fact Audit is:\n${a.scope_summary || 'Scope is still being reviewed.'}\n\n${a.scope_summary ? `Fixed price: $1,500 USD. Turnaround: ${a.scope_turnaround}.\n\n` : ''}View your request${checkout ? ' and checkout' : ''} here:\n${statusLink}`}\n\nProofTTL` : ''
  return <dialog ref={dialog} className={`od-dialog${closing ? ' is-closing' : ''}`} aria-labelledby="od-audit-title" onCancel={e => { e.preventDefault(); close() }}>
    <button className="od-modal-close od-icon-button" aria-label="Close request" disabled={!!busy} onClick={close}><DeskIcon name="close" /></button>
    <div className="od-modal-panel">
      <header className="od-modal-header"><div><span className="od-eyebrow">Request / {id.slice(-8)}</span><h2 id="od-audit-title">{a?.company_or_project || 'Opening request…'}</h2>{a && <span className={`od-badge is-${a.status}`}>{stateLabels[a.status]}</span>}</div><span className="od-private"><DeskIcon name="lock" /> Private</span></header>
      {error && <div className="od-alert" role="alert">{error} {!data && <button onClick={() => { setError(''); void load(true).catch(fail) }}>Try again</button>}</div>}
      {notice && <div className="od-notice" role="status"><DeskIcon name="check" />{notice}</div>}
      {!data && !error && <div className="od-loading" aria-live="polite"><span className="od-spinner" /> Loading the request securely…</div>}
      {a && data && <>
        <div className="od-detail-tabs" aria-label="Request views">{(['brief', 'report', 'notes', 'activity'] as const).map(t => <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>{({ brief: 'Brief & scope', report: 'Report & delivery', notes: 'Private notes', activity: 'Activity' })[t]}{t === 'notes' && data.notes.length > 0 && <span>{data.notes.length}</span>}</button>)}</div>
        <div key={tab} className="od-detail-content od-enter">
          {tab === 'brief' && <>
            <div className="od-detail-facts"><div><span>Customer</span><a href={`mailto:${a.email}`}>{a.email}</a></div><div><span>Submitted</span><strong>{date(a.created_at_ms)}</strong></div><div><span>Claims / outputs</span><strong>{a.approximate_claims || 'Not provided'}</strong></div><div><span>Requested deadline</span><strong>{a.deadline || 'Not specified'}</strong></div></div>
            {safeHttps(a.website_url) && <a className="od-text-link" href={safeHttps(a.website_url)!} target="_blank" rel="noopener noreferrer">Customer website <DeskIcon name="out" /></a>}
            <Info label="What needs checking">{a.claim_scope}</Info><Info label="Why it matters">{a.why_it_matters}</Info>
            {['received', 'scoped'].includes(a.status) ? <form className="od-subpanel" onSubmit={(e: FormEvent) => { e.preventDefault(); void act('scope', { scope_summary: scope, scope_turnaround: turnaround }, 'Scope saved. You can now create the checkout link.', true) }}>
              <div className="od-section-heading"><div><span className="od-eyebrow">01 / Confirm together</span><h3>Set the scope.</h3></div><span className="od-price">$1,500 <small>USD</small></span></div>
              <p>Agree what you will verify with the customer before creating checkout. Up to 25 claims or outputs.</p>
              <label className="od-field">Agreed scope<textarea value={scope} onChange={e => setScope(e.target.value)} maxLength={5000} required rows={5} placeholder="List the agreed outputs, highest-risk claims, evidence to review, and what the report will include." /></label>
              <label className="od-field">Agreed turnaround<input value={turnaround} onChange={e => setTurnaround(e.target.value)} maxLength={180} required placeholder="Enter the turnaround you agreed with the customer" /></label>
              <div className="od-actions"><button className="od-button od-primary" disabled={!!busy || !scope.trim() || !turnaround.trim()}>{busy === 'scope' ? 'Saving scope…' : 'Confirm scope'}<DeskIcon name="check" /></button>{a.status === 'scoped' && <button type="button" className="od-button" disabled={!!busy || scopeDirty} onClick={() => void act('checkout', {}, 'Checkout is ready. Copy the customer message to share it.')}>Create checkout<DeskIcon name="arrow" /></button>}</div>
              {scopeDirty && <small>Unsaved scope changes</small>}
            </form> : a.scope_summary && <Info label="Confirmed scope">{a.scope_summary}<span className="od-scope-meta">{money(a.scoped_price_usd || 1500)} USD · {a.scope_turnaround}</span></Info>}
            {a.status === 'payment_ready' && <div className="od-subpanel"><span className="od-eyebrow">02 / Awaiting payment</span><h3>Checkout is ready.</h3><p>Share the customer status link below. Stripe confirms payment automatically; checking here can also recover a completed checkout.</p><button className="od-button" disabled={!!busy} onClick={() => void act('checkout', {}, 'Payment state refreshed.')}>{busy === 'checkout' ? 'Checking…' : 'Check payment / refresh checkout'}<DeskIcon name="refresh" /></button>{checkout && <a className="od-text-link" href={checkout} target="_blank" rel="noopener noreferrer">Open Stripe checkout <DeskIcon name="out" /></a>}</div>}
            {a.status === 'paid' && <div className="od-subpanel"><span className="od-eyebrow">03 / Ready to work</span><h3>Payment confirmed.</h3><p>Prepare your findings, review the saved report, then publish it to the customer’s private report page.</p><button className="od-button od-primary" onClick={() => setTab('report')}>Prepare the report<DeskIcon name="arrow" /></button></div>}
            {a.status !== 'cancelled' && <div className="od-share"><h3>Keep the customer in the loop.</h3><p>This link opens their private request. They sign in with the email they used for the audit.</p><input aria-label="Customer status link" readOnly value={statusLink} onFocus={e => e.target.select()} /><div className="od-actions"><button className="od-button" onClick={() => void copy(statusLink, 'Customer status link copied.')}><DeskIcon name="copy" />Copy link</button><button className="od-button" onClick={() => void copy(message, 'Customer message copied. Review it before sending.')}><DeskIcon name="mail" />Copy customer message</button></div><small>Copying a message does not send an email.</small></div>}
            {['received', 'scoped'].includes(a.status) && <button className="od-text-link od-danger" disabled={!!busy} onClick={() => setConfirm('cancel')}>Close this request</button>}
          </>}
          {tab === 'report' && <>
            {!['paid', 'fulfilled'].includes(a.status) ? <div className="od-empty"><DeskIcon name="Delivery" /><h3>Report work unlocks after payment.</h3><p>First confirm scope and create checkout. The report stays private until you explicitly publish it.</p><button className="od-button" onClick={() => setTab('brief')}>Back to scope<DeskIcon name="back" /></button></div> : <>
              <ol className="od-workflow"><li className={data.report ? 'is-done' : ''}><span>1</span>Save draft</li><li className={a.human_approved_at_ms ? 'is-done' : ''}><span>2</span>Human review</li><li className={a.report_delivered_at_ms ? 'is-done' : ''}><span>3</span>Publish</li></ol>
              {a.status === 'paid' && <><div className="od-section-heading"><div><span className="od-eyebrow">Your findings</span><h3>The report.</h3></div><div className="od-segment"><button aria-pressed={reportMode === 'edit'} onClick={() => setReportMode('edit')}>Write</button><button aria-pressed={reportMode === 'read'} onClick={() => setReportMode('read')}>Read</button></div></div><p>Add the verdicts, source URLs, evidence for and against, uncertainty, corrections, and the findings to watch.</p>
                {reportMode === 'edit' ? <label className="od-field"><span className="od-sr-only">Report text</span><textarea className="od-report-editor" rows={17} value={reportText} onChange={e => { setReportText(e.target.value); setReviewed(false) }} placeholder="Paste your reviewed research here, or import a .txt or .md report below." /></label> : <article className="od-report-preview">{reportText || 'Your report will appear here.'}</article>}
                <div className="od-actions"><button className="od-button od-primary" disabled={!!busy || !reportText.trim() || !reportDirty} onClick={() => void act('report', { body: reportText, expected_sha256: data.report?.sha256 || null }, 'Draft saved. Review this version before publishing.', true)}>{busy === 'report' ? 'Saving draft…' : 'Save draft'}<DeskIcon name="check" /></button><label className="od-button od-upload"><DeskIcon name="upload" />Import text<input type="file" accept=".txt,.md,text/plain,text/markdown" disabled={!!busy} onChange={e => void upload(e)} /></label><span className="od-muted">{reportDirty ? 'Unsaved changes' : data.report ? `Saved ${timestamp(data.report.updated_at_ms)}` : 'Plain text or Markdown · 480 KB max'}</span></div>
                {data.report && <section className="od-subpanel"><span className="od-eyebrow">Human approval</span><h3>{a.human_approved_at_ms ? 'This version is approved.' : 'Read it. Then approve it.'}</h3>{a.human_approved_at_ms ? <p>Approved by {a.human_approved_by} on {date(a.human_approved_at_ms)}. Saving a new draft clears this approval.</p> : <><p>Check every verdict and citation in the saved report. Publishing makes it available to this customer.</p><label className="od-check-label"><input type="checkbox" checked={reviewed} disabled={reportDirty || !!busy} onChange={e => setReviewed(e.target.checked)} /><span>I reviewed the saved report, checked its evidence, and approve its findings for this customer.</span></label><button className="od-button" disabled={!!busy || !reviewed || reportDirty} onClick={() => void act('approve', { reviewed: true, report_sha256: data.report!.sha256 }, 'Report approved. It is ready for your final publish action.')}><DeskIcon name="check" />Approve this version</button></>}
                  {a.human_approved_at_ms && <button className="od-button od-primary" disabled={!!busy || reportDirty} onClick={() => setConfirm('deliver')}>Publish to customer<DeskIcon name="arrow" /></button>}{reportDirty && <p className="od-muted">Save your changes and review the new version before proceeding.</p>}</section>}
              </>}
              {a.status === 'fulfilled' && <><div className="od-subpanel"><span className="od-eyebrow">Delivered / {date(a.report_delivered_at_ms)}</span><h3>The report is with the customer.</h3><p>{a.watch_ends_at_ms && a.watch_ends_at_ms > Date.now() ? 'The seven-day watch is active' : 'The seven-day watch period has ended'} · through {date(a.watch_ends_at_ms)}.</p><p>Review the important findings during the watch period and contact the customer if evidence changes.</p>{published && <div className="od-actions"><a className="od-button od-primary" href={published} target="_blank" rel="noopener noreferrer">Open private report<DeskIcon name="out" /></a><button className="od-button" onClick={() => void copy(message, 'Delivery message copied. Review it before sending.')}>Copy delivery message<DeskIcon name="mail" /></button></div>}<small>Publishing makes the report available. Send the copied message to notify the customer.</small></div>{data.report ? <article className="od-report-preview">{data.report.body}</article> : <p>This report was delivered outside Owner Desk. Use its existing report link above.</p>}</>}
            </>}
          </>}
          {tab === 'notes' && <><h3>Only for you.</h3><p>Keep scope decisions, follow-up reminders, and work notes here. Customers cannot see these notes.</p><form onSubmit={e => { e.preventDefault(); void act('notes', { body: note }, 'Private note saved.') }}><label className="od-field">Add a note<textarea value={note} onChange={e => setNote(e.target.value)} maxLength={5000} rows={4} required /></label><button className="od-button od-primary" disabled={!!busy || !note.trim()}>Save note<DeskIcon name="plus" /></button></form><div className="od-notes">{data.notes.map(n => <article key={n.id}><span>{timestamp(n.created_at_ms)} · {n.created_by}</span><p>{n.body}</p></article>)}{data.notes.length === 0 && <p className="od-muted">No notes yet.</p>}</div></>}
          {tab === 'activity' && <><h3>A clear record.</h3><p>Owner Desk actions are recorded here. Payment and delivery dates also appear in the request.</p><ol className="od-timeline">{a.paid_at_ms && <li><DeskIcon name="Payments" /><div><strong>Stripe payment recorded</strong><span>{timestamp(a.paid_at_ms)}</span></div></li>}{data.activity.map((e, i) => <li key={`${e.created_at_ms}-${i}`}><DeskIcon name="check" /><div><strong>{eventLabels[e.action] || e.action}</strong><span>{timestamp(e.created_at_ms)} · {e.actor}</span></div></li>)}<li><DeskIcon name="Requests" /><div><strong>Request received</strong><span>{timestamp(a.created_at_ms)}</span></div></li></ol></>}
        </div>
      </>}
      {confirm && <section className="od-confirm" role="alertdialog" aria-labelledby="od-confirm-title" aria-describedby="od-confirm-description"><h3 id="od-confirm-title">{confirm === 'discard' ? 'Leave without saving?' : confirm === 'deliver' ? 'Publish this exact report?' : 'Close this request?'}</h3><p id="od-confirm-description">{confirm === 'discard' ? 'Your unsaved text will be lost. Return to save it first.' : confirm === 'deliver' ? `This makes the approved report available to ${a?.email} and starts the seven-day watch. Published reports cannot be edited here. No email is sent automatically.` : 'This removes it from your active queue. Requests with a payment attempt cannot be closed here.'}</p><div className="od-actions"><button autoFocus className="od-button" onClick={() => setConfirm(null)}>Go back</button><button className={`od-button ${confirm === 'deliver' ? 'od-primary' : 'od-danger'}`} onClick={() => confirm === 'discard' ? finishClose() : void act(confirm, confirm === 'deliver' ? { report_sha256: data?.report?.sha256 } : {}, confirm === 'deliver' ? 'Report published. Copy the delivery message to notify your customer.' : 'Request closed.', true)}>{confirm === 'discard' ? 'Discard changes' : confirm === 'deliver' ? 'Publish report' : 'Close request'}</button></div></section>}
    </div>
  </dialog>
}
function Info({ label, children }: { label: string; children: ReactNode }) { return <section className="od-info"><h3>{label}</h3><div>{children}</div></section> }
