'use client'

import { useMemo, useState } from 'react'

type Candidate = {
  id: string
  text: string
  score: number
  materiality: 'HIGH' | 'MEDIUM' | 'LOW'
  signals: string[]
}

const AUDIT_DRAFT_KEY = 'proofttl:audit-draft-v1'

function splitSentences(input: string) {
  return input
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'])/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function scoreSentence(text: string): Candidate | null {
  if (text.length < 24 || text.length > 420) return null

  let score = 0
  const signals: string[] = []
  const lower = text.toLowerCase()

  const add = (points: number, label: string) => {
    score += points
    if (!signals.includes(label)) signals.push(label)
  }

  if (/\b\d+(?:\.\d+)?%?\b/.test(text)) add(3, 'NUMBER / QUANTITY')
  if (/[$€£]\s?\d|\b(?:million|billion|trillion|percent|percentage|revenue|growth|market share|users|customers)\b/i.test(text)) add(2, 'COMMERCIAL METRIC')
  if (/\b(?:19|20)\d{2}\b|\b(?:today|currently|now|this year|last year|as of|since|before|after)\b/i.test(text)) add(2, 'TIME-SENSITIVE')
  if (/\b(?:certified|compliant|soc 2|iso 27001|hipaa|gdpr|approved|licensed|regulated|security|encryption)\b/i.test(text)) add(3, 'COMPLIANCE / TRUST')
  if (/\b(?:supports|includes|offers|provides|integrates|requires|costs|charges|available|launched|founded|acquired|located|headquartered)\b/i.test(text)) add(2, 'PRODUCT / COMPANY FACT')
  if (/\b(?:study|report|research|survey|according to|data show|data shows|found that|published|citation|source)\b/i.test(text)) add(2, 'RESEARCH CLAIM')
  if (/\b(?:is|are|was|were|has|have|will|can|does|did)\b/i.test(text)) add(1, 'ASSERTIVE STATEMENT')
  if (/\b[A-Z][a-zA-Z0-9&.-]+(?:\s+[A-Z][a-zA-Z0-9&.-]+){0,3}\b/.test(text)) add(1, 'NAMED ENTITY')

  if (/\b(?:i think|i believe|in my opinion|probably|maybe|might feel|seems like|should be beautiful|best ever)\b/i.test(lower)) score -= 3
  if (text.endsWith('?')) score -= 2

  if (score < 2) return null

  const materiality: Candidate['materiality'] = score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW'
  return {
    id: `${Math.abs(hash(text))}`,
    text,
    score,
    materiality,
    signals: signals.slice(0, 4),
  }
}

function hash(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = Math.imul(31, h) + value.charCodeAt(i) | 0
  return h
}

export default function ClaimStressTestClient() {
  const [input, setInput] = useState('')
  const [analyzed, setAnalyzed] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const candidates = useMemo(() => {
    if (!analyzed) return []
    return splitSentences(input)
      .map(scoreSentence)
      .filter((item): item is Candidate => Boolean(item))
      .sort((a, b) => b.score - a.score)
      .slice(0, 25)
  }, [input, analyzed])

  const selectedClaims = candidates.filter((item) => selected.includes(item.id))
  const highCount = candidates.filter((item) => item.materiality === 'HIGH').length

  function runPreflight() {
    setSelected([])
    setAnalyzed(true)
  }

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length >= 25) return current
      return [...current, id]
    })
  }

  function sendToAudit() {
    if (selectedClaims.length === 0) return
    const claimScope = selectedClaims.map((item, index) => `${index + 1}. ${item.text}`).join('\n')
    try {
      localStorage.setItem(AUDIT_DRAFT_KEY, JSON.stringify({
        offer_type: 'full_audit',
        email: '',
        company_or_project: '',
        website_url: '',
        claim_scope: claimScope,
        approximate_claims: selectedClaims.length <= 15 ? '10-15' : '16-25',
        why_it_matters: 'Selected from the ProofTTL claim preflight. These are the outputs or claims I want reviewed and ranked for source-backed verification before I rely on them.',
        deadline: '',
      }))
    } catch {}
    window.location.assign('/audit/#audit-intake')
  }

  return (
    <section style={{ display: 'grid', gap: 18 }}>
      <div style={{ border: '1px solid rgba(148,163,184,.14)', borderRadius: 16, padding: 20, background: 'rgba(255,255,255,.018)' }}>
        <label htmlFor="stress-input" className="app-kicker" style={{ display: 'block', marginBottom: 10 }}>PASTE AI OUTPUT, RESEARCH, OR A REPORT</label>
        <textarea
          id="stress-input"
          value={input}
          onChange={(event) => { setInput(event.target.value); setAnalyzed(false); setSelected([]) }}
          rows={10}
          maxLength={18000}
          placeholder="Paste the text you are about to publish, send, pitch, buy from, or rely on..."
          style={{ width: '100%', resize: 'vertical', borderRadius: 12, border: '1px solid rgba(148,163,184,.16)', background: 'rgba(2,6,23,.45)', color: 'inherit', padding: 16, font: 'inherit', lineHeight: 1.55 }}
        />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
          <button className="button button-primary" type="button" onClick={runPreflight} disabled={input.trim().length < 24}>FIND CLAIMS WORTH REVIEWING →</button>
          <span className="app-note" style={{ margin: 0 }}>{input.length.toLocaleString()} / 18,000 characters</span>
        </div>
        <p className="app-note" style={{ margin: '12px 0 0' }}><strong>Preflight only:</strong> this step identifies candidate factual claims locally in your browser. It does not issue verification verdicts or pretend a claim is true or false. Source-backed verification begins after scope review.</p>
      </div>

      {analyzed && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(170px,100%),1fr))', gap: 10 }}>
            <div style={{ padding: 16, border: '1px solid rgba(148,163,184,.12)', borderRadius: 12 }}><span className="app-kicker">CANDIDATES</span><strong style={{ display: 'block', fontSize: 28, marginTop: 6 }}>{candidates.length}</strong></div>
            <div style={{ padding: 16, border: '1px solid rgba(148,163,184,.12)', borderRadius: 12 }}><span className="app-kicker">HIGH MATERIALITY</span><strong style={{ display: 'block', fontSize: 28, marginTop: 6 }}>{highCount}</strong></div>
            <div style={{ padding: 16, border: '1px solid rgba(148,163,184,.12)', borderRadius: 12 }}><span className="app-kicker">SELECTED</span><strong style={{ display: 'block', fontSize: 28, marginTop: 6 }}>{selected.length}/25</strong></div>
          </div>

          {candidates.length === 0 ? (
            <div className="app-note">No strong factual candidates were detected. Try a longer passage with concrete claims, dates, quantities, product capabilities, citations, certifications, or company facts.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {candidates.map((candidate, index) => {
                const active = selected.includes(candidate.id)
                return (
                  <button
                    type="button"
                    key={`${candidate.id}-${index}`}
                    onClick={() => toggle(candidate.id)}
                    aria-pressed={active}
                    style={{ textAlign: 'left', color: 'inherit', width: '100%', borderRadius: 12, border: active ? '1px solid rgba(34,211,238,.7)' : '1px solid rgba(148,163,184,.12)', background: active ? 'rgba(34,211,238,.07)' : 'rgba(255,255,255,.012)', padding: 16, cursor: 'pointer', overflowWrap: 'anywhere' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span className="app-kicker">CLAIM {String(index + 1).padStart(2, '0')} · {candidate.materiality}</span>
                      <span style={{ fontSize: 11, opacity: .72 }}>{active ? 'SELECTED FOR AUDIT' : selected.length >= 25 ? '25 CLAIM LIMIT REACHED' : 'SELECT'}</span>
                    </div>
                    <strong style={{ display: 'block', lineHeight: 1.45, fontSize: 15 }}>{candidate.text}</strong>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                      {candidate.signals.map((signal) => <span key={signal} style={{ fontSize: 9, letterSpacing: '.06em', padding: '5px 7px', border: '1px solid rgba(148,163,184,.12)', borderRadius: 999, opacity: .74 }}>{signal}</span>)}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {selectedClaims.length > 0 && (
            <div style={{ padding: 18, border: '1px solid rgba(34,211,238,.24)', borderRadius: 14, background: 'linear-gradient(180deg,rgba(34,211,238,.04),rgba(255,255,255,.01))' }}>
              <p className="app-kicker">NEXT: FACT AUDIT SCOPE REVIEW</p>
              <h2 style={{ margin: '8px 0 8px' }}>{selectedClaims.length < 10 ? 'Select at least 10 outputs or claims for the Fact Audit intake.' : `${selectedClaims.length} claims ready for scope review.`}</h2>
              <p className="app-copy" style={{ marginTop: 0 }}>ProofTTL will carry these exact claims into the $1,500 Fact Audit intake, rank them by consequence, and concentrate deep verification on the highest-risk findings. No verdict is implied by the preflight ranking.</p>
              <button className="button button-primary" type="button" disabled={selectedClaims.length < 10} onClick={sendToAudit}>START FACT AUDIT WITH {selectedClaims.length} CLAIMS — $1,500 →</button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
