'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

const API_URL = (process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev').replace(/\/$/, '')

type RunSummary = {
  run_id: string
  objective: string
  status: string
  stage: string
  rounds_completed: number
  max_rounds: number
  model_calls: number
  created_at: string
  updated_at: string
}

type Candidate = {
  candidate_id: string
  generation: number
  title: string
  customer?: string | null
  problem?: string | null
  business_model?: string | null
  asymmetry?: string | null
  why_now?: string | null
  revenue_math?: string | null
  risks?: string[]
  evidence_ids?: string[]
  red_team?: string | null
  score?: number | null
  evidence_confidence?: number | null
  status: string
}

type Evidence = {
  evidence_id: string
  source_type: string
  query_text: string
  title: string
  url: string
  excerpt?: string | null
  published_at?: string | null
  source_domain?: string | null
  created_at: string
}

type FoundryEvent = {
  event_id: string
  kind: string
  message: string
  created_at: string
}

type RunDetail = { run: RunSummary; candidates: Candidate[]; evidence?: Evidence[]; events: FoundryEvent[] }

const DEFAULT_OBJECTIVE = 'Find the strongest legal, realistically bootstrap-able business opportunity available in 2026 with a credible path to $1M+ annual revenue. Search broadly. Favor painful recurring problems, existing spend, strong distribution, high margins, automation potential, and a structural asymmetry that exists now. Do not assume ProofTTL is the answer.'

export default function FoundryWorkbench() {
  const [objective, setObjective] = useState(DEFAULT_OBJECTIVE)
  const [maxRounds, setMaxRounds] = useState(5)
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [detail, setDetail] = useState<RunDetail | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const loadRuns = useCallback(async () => {
    const response = await fetch(`${API_URL}/foundry/runs`, { credentials: 'include', cache: 'no-store' })
    if (response.status === 401) { setMessage('Sign in to ProofTTL to use Foundry.'); return }
    const body = await response.json().catch(() => ({})) as { runs?: RunSummary[]; error?: string }
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
    const next = Array.isArray(body.runs) ? body.runs : []
    setRuns(next)
    if (!selectedId && next[0]?.run_id) setSelectedId(next[0].run_id)
  }, [selectedId])

  const loadDetail = useCallback(async (runId: string) => {
    const response = await fetch(`${API_URL}/foundry/runs/${runId}`, { credentials: 'include', cache: 'no-store' })
    const body = await response.json().catch(() => ({})) as RunDetail & { error?: string }
    if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
    setDetail(body)
  }, [])

  useEffect(() => { void loadRuns().catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load Foundry.')) }, [loadRuns])
  useEffect(() => { if (selectedId) void loadDetail(selectedId).catch(() => {}) }, [selectedId, loadDetail])
  useEffect(() => {
    if (!selectedId) return
    const timer = window.setInterval(() => {
      void loadDetail(selectedId).catch(() => {})
      void loadRuns().catch(() => {})
    }, 5000)
    return () => window.clearInterval(timer)
  }, [selectedId, loadDetail, loadRuns])

  async function createRun(event: FormEvent) {
    event.preventDefault()
    if (!objective.trim() || busy) return
    setBusy(true); setMessage('Creating run…')
    try {
      const response = await fetch(`${API_URL}/foundry/runs`, {
        method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ objective: objective.trim(), max_rounds: maxRounds })
      })
      const body = await response.json().catch(() => ({})) as { run?: RunSummary; error?: string; message?: string }
      if (response.status === 401) { window.location.assign('/login/'); return }
      if (!response.ok || !body.run) throw new Error(body.message || body.error || `HTTP ${response.status}`)
      setSelectedId(body.run.run_id)
      setMessage('Run created. Live signal research runs first; the backend scheduler keeps advancing it automatically.')
      await loadRuns(); await loadDetail(body.run.run_id)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not create run.') }
    finally { setBusy(false) }
  }

  async function stepNow() {
    if (!selectedId || busy) return
    setBusy(true); setMessage('Running one Foundry stage…')
    try {
      const response = await fetch(`${API_URL}/foundry/runs/${selectedId}/step`, { method: 'POST', credentials: 'include' })
      const body = await response.json().catch(() => ({})) as RunDetail & { error?: string }
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`)
      setDetail(body); setMessage('Stage completed and persisted.'); await loadRuns()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Foundry stage failed.') }
    finally { setBusy(false) }
  }

  const evidence = detail?.evidence || []
  const leader = useMemo(() => detail?.candidates.find((candidate) => candidate.status === 'active' && candidate.score != null) || detail?.candidates.find((candidate) => candidate.status === 'active') || null, [detail])
  const active = detail?.candidates.filter((candidate) => candidate.status === 'active') || []
  const rejected = detail?.candidates.filter((candidate) => candidate.status !== 'active') || []
  const leaderEvidence = useMemo(() => {
    if (!leader?.evidence_ids?.length) return []
    const wanted = new Set(leader.evidence_ids)
    return evidence.filter((item) => wanted.has(item.evidence_id))
  }, [leader, evidence])

  return (
    <main className="foundry-shell">
      <header className="foundry-topbar">
        <a className="foundry-brand" href="/workspace/">PROOFTTL</a>
        <div><span>FOUNDRY</span><small>adversarial opportunity search</small></div>
        <a href="/workspace/">Workspace</a>
      </header>

      <section className="foundry-hero">
        <div>
          <p className="foundry-kicker">BUSINESS DISCOVERY ENGINE</p>
          <h1>Make ideas fight for survival.</h1>
          <p>Foundry collects live public market signals, generates independent candidates, attacks them, kills weak ones, and continuously spawns challengers. Evidence stays inspectable instead of being hidden behind a confidence score.</p>
        </div>
        <div className="foundry-live"><span className="foundry-dot" /> LIVE SIGNALS · PERSISTENT RUNS</div>
      </section>

      <section className="foundry-grid">
        <aside className="foundry-sidebar">
          <form onSubmit={createRun} className="foundry-card foundry-new-run">
            <div className="foundry-label">NEW RUN</div>
            <label>Objective<textarea value={objective} maxLength={2000} onChange={(event) => setObjective(event.target.value)} /></label>
            <label>Challenger rounds
              <select value={maxRounds} onChange={(event) => setMaxRounds(Number(event.target.value))}>
                {[3,5,8,12].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <button disabled={busy || !objective.trim()}>{busy ? 'WORKING…' : 'START DISCOVERY'}</button>
          </form>

          <div className="foundry-card">
            <div className="foundry-label">RUNS</div>
            <div className="foundry-run-list">
              {runs.length === 0 && <p className="foundry-muted">No runs yet.</p>}
              {runs.map((run) => <button key={run.run_id} className={selectedId === run.run_id ? 'selected' : ''} onClick={() => setSelectedId(run.run_id)}>
                <strong>{run.objective.slice(0, 58)}{run.objective.length > 58 ? '…' : ''}</strong>
                <span>{run.status} · {run.stage} · r{run.rounds_completed}/{run.max_rounds}</span>
              </button>)}
            </div>
          </div>
        </aside>

        <section className="foundry-main">
          {!detail && <div className="foundry-card foundry-empty"><h2>Create the first run.</h2><p>The database stays empty until real stages execute and persist their work.</p></div>}
          {detail && <>
            <div className="foundry-stats">
              <Stat label="STATUS" value={detail.run.status.toUpperCase()} />
              <Stat label="STAGE" value={detail.run.stage.toUpperCase()} />
              <Stat label="MODEL CALLS" value={String(detail.run.model_calls)} />
              <Stat label="LIVE SIGNALS" value={String(evidence.length)} />
              <Stat label="ACTIVE" value={String(active.length)} />
              <Stat label="REJECTED" value={String(rejected.length)} />
            </div>

            <div className="foundry-card foundry-objective">
              <div><span className="foundry-label">OBJECTIVE</span><p>{detail.run.objective}</p></div>
              {detail.run.status === 'running' && <button onClick={stepNow} disabled={busy}>STEP NOW</button>}
            </div>

            {leader && <article className="foundry-card foundry-leader">
              <div className="foundry-leader-head"><div><span className="foundry-label">CURRENT LEADER</span><h2>{leader.title}</h2></div><div className="foundry-score">{leader.score == null ? '—' : leader.score.toFixed(1)}</div></div>
              <div className="foundry-detail-grid">
                <Fact label="CUSTOMER" text={leader.customer} />
                <Fact label="PROBLEM" text={leader.problem} />
                <Fact label="MODEL" text={leader.business_model} />
                <Fact label="ASYMMETRY" text={leader.asymmetry} />
                <Fact label="WHY NOW" text={leader.why_now} />
                <Fact label="$1M MATH" text={leader.revenue_math} />
              </div>
              {leaderEvidence.length > 0 && <div className="foundry-linked-evidence">
                <div className="foundry-label">LINKED LIVE SIGNALS</div>
                <div className="foundry-evidence-grid">{leaderEvidence.slice(0, 6).map((item) => <EvidenceCard key={item.evidence_id} item={item} />)}</div>
              </div>}
              {leader.red_team && <div className="foundry-attack"><strong>RED TEAM</strong><p>{leader.red_team}</p></div>}
              <div className="foundry-confidence">Evidence confidence: {leader.evidence_confidence == null ? 'not judged yet' : `${leader.evidence_confidence.toFixed(0)}%`} · linked signals: {leader.evidence_ids?.length || 0}</div>
            </article>}

            <div className="foundry-columns">
              <div className="foundry-card">
                <div className="foundry-label">TOURNAMENT</div>
                <div className="foundry-candidates">
                  {detail.candidates.map((candidate) => <div key={candidate.candidate_id} className={`foundry-candidate ${candidate.status}`}>
                    <span>{candidate.score == null ? '—' : candidate.score.toFixed(0)}</span>
                    <div><strong>{candidate.title}</strong><small>gen {candidate.generation} · {candidate.status} · {candidate.evidence_ids?.length || 0} signals</small></div>
                  </div>)}
                </div>
              </div>
              <div className="foundry-card">
                <div className="foundry-label">ACTIVITY</div>
                <div className="foundry-events">
                  {detail.events.map((event) => <div key={event.event_id}><span>{event.kind.replaceAll('_', ' ')}</span><p>{event.message}</p></div>)}
                </div>
              </div>
            </div>

            <div className="foundry-card foundry-ledger">
              <div className="foundry-ledger-head"><div><div className="foundry-label">LIVE SIGNAL LEDGER</div><p>These are inputs, not automatic proof. Open the source before treating a signal as a market fact.</p></div><strong>{evidence.length}</strong></div>
              {evidence.length === 0 ? <p className="foundry-muted">No live signals have been persisted for this run yet.</p> : <div className="foundry-evidence-grid foundry-evidence-ledger">{evidence.map((item) => <EvidenceCard key={item.evidence_id} item={item} />)}</div>}
            </div>
          </>}
          {message && <div className="foundry-message">{message}</div>}
        </section>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="foundry-stat"><span>{label}</span><strong>{value}</strong></div> }
function Fact({ label, text }: { label: string; text?: string | null }) { return <div><span>{label}</span><p>{text || 'Not established yet.'}</p></div> }
function EvidenceCard({ item }: { item: Evidence }) {
  return <a className="foundry-evidence-item" href={item.url} target="_blank" rel="noreferrer">
    <div><span>{item.source_type.replaceAll('_', ' ')}</span><small>{item.source_domain || 'public source'}</small></div>
    <strong>{item.title}</strong>
    {item.excerpt && <p>{item.excerpt}</p>}
    <footer><code>{item.evidence_id.slice(0, 12)}…</code><b>OPEN SOURCE ↗</b></footer>
  </a>
}
