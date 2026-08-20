'use client'

import { FormEvent, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import {
  PROOFTTL_API_URL,
  askProofTTLByText,
  askProofTTLByVoice,
  assistantNavigationHref,
  fetchProofTTLAssistantUsage,
  loveSpeechDataUrl,
  type AssistantNavigationAction,
  type AssistantHistoryMessage,
} from '../lib/proofttl-assistant'
import { fetchRelevantVisuals, type LoveVisual } from '../lib/proofttl-visuals'
import AssistantRichText from './AssistantRichText'
import love from './LoveEntity.module.css'

type Message = { role: 'user' | 'assistant'; text: string; visuals?: LoveVisual[] }
type LeasePreview = {
  lease_id: string
  found: boolean
  claim?: string
  issued_status?: string
  current_status?: string
  lease_state?: string
  expires_at?: string
  last_checked_at?: string
  verifier?: string
}
type LoveState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'awake'
type VoicePhase = 'idle' | 'permission' | 'recording' | 'processing' | 'speaking' | 'error'

const MAX_RECORDING_MS = 12_000
const MAX_AUDIO_BYTES = 512 * 1024
const LEASE_ID_PATTERN = /\bftl_[a-f0-9]{16,64}\b/i
const MIME_PREFERENCES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

function preferredMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  return MIME_PREFERENCES.find((type) => MediaRecorder.isTypeSupported(type)) || ''
}

function SendIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M4 12 19 5l-4.5 14-3.1-5.9L4 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="m11.4 13.1 3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
}
function MicIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.7" /><path d="M6.5 11.5v.5a5.5 5.5 0 0 0 11 0v-.5M12 17.5V21M9.5 21h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
}

function LoveEntity({ state, offset, formation }: { state: LoveState; offset: { x: number; y: number }; formation: string }) {
  const label = state === 'thinking' ? 'Reasoning / verifying' : state === 'listening' ? 'Signal acquired' : state === 'speaking' ? 'Voice synthesis active' : state === 'awake' ? 'Context active' : 'Dormant / listening'
  const style = { '--love-x': `${offset.x}px`, '--love-y': `${offset.y}px` } as CSSProperties
  return (
    <div className={love.stage} data-state={state} style={style} aria-hidden="true">
      <div className={`${love.shard} ${love.shardA}`}>signal<strong>{state === 'listening' ? 'microphone live' : 'conversation online'}</strong></div>
      <div className={`${love.shard} ${love.shardB}`}>response model<strong>workspace router</strong></div>
      <div className={`${love.shard} ${love.shardC}`}>grounding<strong>{formation}</strong></div>
      <div className={`${love.shard} ${love.shardD}`}>improvement loop<strong>MIRA observing</strong></div>
      <div className={love.core}><div className={love.orbit} /><div className={love.orbit2} /><div className={love.orbit3} /><div className={love.smoke} /><div className={love.faceVoid} /><div className={love.eyes}><i className={love.eye} /><i className={love.eye} /></div></div>
      {state === 'speaking' && <div className={love.voiceWave}><i /><i /><i /><i /><i /></div>}
      <div className={love.stateLabel}>{label}</div>
    </div>
  )
}

function FactLeaseCard({ lease }: { lease: LeasePreview }) {
  const state = lease.found ? (lease.lease_state || 'UNKNOWN') : 'NOT FOUND'
  const verdict = lease.found ? (lease.current_status || lease.issued_status || 'UNKNOWN') : 'UNKNOWN'
  return (
    <aside data-love-fact-lease="materialized" style={{ margin: '10px 0 4px', padding: '13px 14px', border: '1px solid rgba(103,232,249,.22)', borderRadius: 12, background: 'linear-gradient(135deg, rgba(3,12,18,.92), rgba(10,30,38,.72))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><span style={{ fontSize: 10, letterSpacing: '.14em', color: '#67e8f9' }}>FACT LEASE / LIVE API</span><strong style={{ fontSize: 11, color: lease.found ? '#a5f3fc' : '#fbbf24' }}>{state} · {verdict}</strong></div>
      <code style={{ display: 'block', marginTop: 8, fontSize: 11, color: '#cbd5e1', overflowWrap: 'anywhere' }}>{lease.lease_id}</code>
      {lease.found && lease.claim && <p style={{ margin: '9px 0 0', fontSize: 13 }}>{lease.claim}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, marginTop: 10 }}>
        <small>ISSUED<br /><b>{lease.issued_status || '—'}</b></small><small>CURRENT<br /><b>{lease.current_status || '—'}</b></small><small>EXPIRES<br /><b>{lease.expires_at ? new Date(lease.expires_at).toLocaleString() : '—'}</b></small><small>LAST CHECK<br /><b>{lease.last_checked_at ? new Date(lease.last_checked_at).toLocaleString() : '—'}</b></small>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}><a href={`/verify-lease.html?id=${encodeURIComponent(lease.lease_id)}`} style={{ color: '#67e8f9', fontSize: 11 }}>VERIFY SIGNATURE →</a><a href={`/lease-ops.html?id=${encodeURIComponent(lease.lease_id)}`} style={{ color: '#94a3b8', fontSize: 11 }}>LEASE OPS →</a></div>
    </aside>
  )
}

function LoveVisualStrip({ visuals }: { visuals: LoveVisual[] }) {
  if (!visuals.length) return null
  return (
    <div data-love-visuals="grounded" style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 7 }}><span style={{ fontSize: 10, letterSpacing: '.12em', color: '#a5f3fc' }}>RELEVANT VISUALS</span><span style={{ fontSize: 9, color: '#64748b' }}>SOURCED · WIKIMEDIA COMMONS</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(135px,1fr))', gap: 8 }}>
        {visuals.map((visual, index) => <a key={`${visual.source_url}-${index}`} href={visual.source_url} target="_blank" rel="noreferrer noopener" style={{ display: 'block', minWidth: 0, border: '1px solid rgba(148,163,184,.14)', borderRadius: 10, overflow: 'hidden', textDecoration: 'none', background: 'rgba(2,8,14,.72)' }}><img src={visual.image_url} alt={visual.alt || visual.title} loading="lazy" decoding="async" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block', background: '#020617' }} /><span style={{ display: 'block', padding: '7px 8px 3px', color: '#dbeafe', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{visual.title}</span><span style={{ display: 'block', padding: '0 8px 7px', color: '#64748b', fontSize: 9 }}>{visual.license ? `${visual.source_name} · ${visual.license}` : visual.source_name}</span></a>)}
      </div>
    </div>
  )
}

async function inspectLeaseFromMessage(message: string, signal: AbortSignal): Promise<LeasePreview | null> {
  const match = message.match(LEASE_ID_PATTERN)
  if (!match) return null
  const leaseId = match[0].toLowerCase()
  try {
    const response = await fetch(`${PROOFTTL_API_URL}/lease/${encodeURIComponent(leaseId)}`, { cache: 'no-store', signal })
    if (!response.ok) return { lease_id: leaseId, found: false }
    const lease = await response.json() as Record<string, unknown>
    const revocation = lease.revocation && typeof lease.revocation === 'object' ? lease.revocation as Record<string, unknown> : null
    const lastCheck = lease.last_check && typeof lease.last_check === 'object' ? lease.last_check as Record<string, unknown> : null
    return {
      lease_id: typeof lease.lease_id === 'string' ? lease.lease_id : leaseId,
      found: true,
      claim: typeof lease.claim === 'string' ? lease.claim : undefined,
      issued_status: typeof lease.issued_status === 'string' ? lease.issued_status : typeof lease.status === 'string' ? lease.status : undefined,
      current_status: typeof lease.current_status === 'string' ? lease.current_status : typeof revocation?.current_status === 'string' ? revocation.current_status : typeof lastCheck?.status === 'string' ? lastCheck.status : typeof lease.status === 'string' ? lease.status : undefined,
      lease_state: typeof lease.lease_state === 'string' ? lease.lease_state : undefined,
      expires_at: typeof lease.expires_at === 'string' ? lease.expires_at : undefined,
      last_checked_at: typeof lease.last_checked_at === 'string' ? lease.last_checked_at : typeof lastCheck?.checked_at === 'string' ? lastCheck.checked_at : undefined,
      verifier: typeof lease.verifier === 'string' ? lease.verifier : undefined,
    }
  } catch {
    if (signal.aborted) return null
    return { lease_id: leaseId, found: false }
  }
}

async function visualsFromMessage(message: string, signal: AbortSignal): Promise<LoveVisual[]> {
  try { return (await fetchRelevantVisuals(message, signal))?.visuals || [] } catch { return [] }
}

export default function ProofTTLChatBar() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limit, setLimit] = useState(20)
  const [plan, setPlan] = useState('free')
  const [entityOffset, setEntityOffset] = useState({ x: 0, y: 0 })
  const [voicePhase, setVoicePhase] = useState<VoicePhase>('idle')
  const [voiceError, setVoiceError] = useState('')
  const [formation, setFormation] = useState('context active')
  const [leasePreview, setLeasePreview] = useState<LeasePreview | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordingTimerRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const voiceOperationRef = useRef(0)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchProofTTLAssistantUsage(controller.signal).then((quota) => {
      if (typeof quota?.limit === 'number') setLimit(quota.limit)
      if (typeof quota?.remaining === 'number') setRemaining(quota.remaining)
      if (typeof quota?.plan === 'string') setPlan(quota.plan)
    }).catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setFullscreen(false)
    document.body.classList.add('pttl-chat-fullscreen-open')
    window.addEventListener('keydown', onKeyDown)
    return () => { document.body.classList.remove('pttl-chat-fullscreen-open'); window.removeEventListener('keydown', onKeyDown) }
  }, [fullscreen])

  useEffect(() => {
    if (!expanded) return
    const frame = window.requestAnimationFrame(() => { endRef.current?.scrollIntoView({ block: 'end', behavior: messages.length > 1 ? 'smooth' : 'auto' }); if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight })
    return () => window.cancelAnimationFrame(frame)
  }, [expanded, fullscreen, messages, loading, voicePhase, leasePreview])

  useEffect(() => () => stopVoice(true), [])

  function updateQuota(quota: { limit?: number; remaining?: number | null; plan?: string } | undefined) {
    if (typeof quota?.limit === 'number') setLimit(quota.limit)
    if (typeof quota?.remaining === 'number') setRemaining(quota.remaining)
    if (typeof quota?.plan === 'string') setPlan(quota.plan)
  }
  function clearRecordingTimer() { if (recordingTimerRef.current !== null) { window.clearTimeout(recordingTimerRef.current); recordingTimerRef.current = null } }
  function stopTracks() { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null }
  function stopSpeech() { const audio = audioRef.current; audioRef.current = null; if (audio) { audio.pause(); audio.currentTime = 0 } }
  function stopVoice(silent = false) {
    voiceOperationRef.current += 1; clearRecordingTimer(); stopSpeech(); stopTracks()
    const recorder = recorderRef.current; recorderRef.current = null
    if (recorder && recorder.state !== 'inactive') { recorder.ondataavailable = null; recorder.onstop = null; recorder.onerror = null; recorder.stop() }
    chunksRef.current = []; if (!silent) setVoicePhase('idle')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = value.replace(/\s+/g, ' ').trim()
    if (!message || loading || remaining === 0 || voicePhase === 'processing') return
    const history: AssistantHistoryMessage[] = messages.slice(-6).map((item) => ({ role: item.role, content: item.text }))
    const hasLeaseId = LEASE_ID_PATTERN.test(message)
    setExpanded(true); if (hasLeaseId) setFullscreen(true); setValue(''); setMessages((current) => [...current, { role: 'user', text: message }]); setLoading(true)
    setFormation(hasLeaseId ? 'Fact Lease lock acquiring' : /verify|claim|source|lease/i.test(message) ? 'verification forming' : 'reasoning')
    abortRef.current?.abort(); const controller = new AbortController(); abortRef.current = controller
    try {
      const [result, inspectedLease, visuals] = await Promise.all([askProofTTLByText(message, history, controller.signal), inspectLeaseFromMessage(message, controller.signal), visualsFromMessage(message, controller.signal)])
      updateQuota(result.quota); if (inspectedLease) setLeasePreview(inspectedLease)
      setMessages((current) => [...current, { role: 'assistant', text: result.response || 'I missed that one. Try it again.', ...(visuals.length ? { visuals } : {}) }])
      if (result.context?.lease_grounding?.found || inspectedLease?.found) setFormation(`${inspectedLease?.lease_state || 'LEASE'} · ${inspectedLease?.current_status || inspectedLease?.issued_status || 'UNKNOWN'}`)
      else if (result.context?.lease_grounding?.requested) setFormation('Fact Lease not found')
      else if (visuals.length) setFormation('visual references sourced')
      else setFormation(result.action ? 'navigation resolved' : 'response ready')
      const action = result.action as AssistantNavigationAction | null
      if (action) { const href = assistantNavigationHref(action); if (href) window.setTimeout(() => window.location.assign(href), 700) }
    } catch (caught) {
      if (controller.signal.aborted) return
      const text = caught instanceof Error ? caught.message : 'L.O.V.E. is unavailable right now.'
      if (/AI limit/i.test(text)) setRemaining(0)
      setMessages((current) => [...current, { role: 'assistant', text }]); setFormation('signal interrupted')
    } finally { if (abortRef.current === controller) abortRef.current = null; setLoading(false) }
  }

  async function startVoice() {
    if (remaining === 0 || loading || voicePhase === 'processing' || voicePhase === 'speaking') return
    if (voicePhase === 'recording') { recorderRef.current?.stop(); return }
    stopVoice(); const operationId = voiceOperationRef.current; setExpanded(true); setFullscreen(true); setVoiceError(''); setVoicePhase('permission'); setFormation('voice channel opening')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setVoicePhase('error'); setVoiceError('This browser does not expose the microphone APIs L.O.V.E. needs.'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      if (operationId !== voiceOperationRef.current) { stream.getTracks().forEach((track) => track.stop()); return }
      streamRef.current = stream; const mimeType = preferredMimeType(); const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream); recorderRef.current = recorder; chunksRef.current = []
      recorder.ondataavailable = (event) => { if (operationId === voiceOperationRef.current && event.data.size > 0) chunksRef.current.push(event.data) }
      recorder.onerror = () => { if (operationId === voiceOperationRef.current) { stopTracks(); setVoicePhase('error'); setVoiceError('The microphone recorder stopped unexpectedly. Try again.'); setFormation('voice signal lost') } }
      recorder.onstop = () => void processVoice(recorder.mimeType || mimeType || 'audio/webm', operationId)
      recorder.start(); setVoicePhase('recording'); setFormation('microphone live'); clearRecordingTimer(); recordingTimerRef.current = window.setTimeout(() => { if (operationId === voiceOperationRef.current && recorder.state === 'recording') recorder.stop() }, MAX_RECORDING_MS)
    } catch (caught) {
      if (operationId !== voiceOperationRef.current) return
      stopTracks(); setVoicePhase('error'); setVoiceError(caught instanceof DOMException && caught.name === 'NotAllowedError' ? 'Microphone permission was denied.' : 'L.O.V.E. could not start the microphone.'); setFormation('microphone unavailable')
    }
  }

  async function processVoice(mimeType: string, operationId: number) {
    clearRecordingTimer(); stopTracks(); recorderRef.current = null; if (operationId !== voiceOperationRef.current) return
    const audio = new Blob(chunksRef.current, { type: mimeType }); chunksRef.current = []
    if (!audio.size || audio.size > MAX_AUDIO_BYTES) { setVoicePhase('error'); setVoiceError(!audio.size ? 'No microphone audio was captured.' : 'That recording was too large. Keep it short and try again.'); setFormation('voice sample rejected'); return }
    setVoicePhase('processing'); setFormation('transcribing + reasoning'); const controller = new AbortController(); abortRef.current?.abort(); abortRef.current = controller
    try {
      const result = await askProofTTLByVoice(audio, controller.signal)
      if (operationId !== voiceOperationRef.current) return
      updateQuota(result.quota); const visuals = result.transcript ? await visualsFromMessage(result.transcript, controller.signal) : []
      if (result.transcript) setMessages((current) => [...current, { role: 'user', text: result.transcript }])
      if (result.response) setMessages((current) => [...current, { role: 'assistant', text: result.response, ...(visuals.length ? { visuals } : {}) }])
      setFormation(result.action ? 'navigation resolved' : visuals.length ? 'visual references sourced' : 'voice response ready')
      const speechUrl = loveSpeechDataUrl(result.speech)
      if (speechUrl) {
        const playback = new Audio(speechUrl); audioRef.current = playback
        const finish = () => { if (operationId === voiceOperationRef.current) { setVoicePhase('idle'); setFormation('context active') }; if (audioRef.current === playback) audioRef.current = null }
        playback.onended = finish; playback.onerror = finish; setVoicePhase('speaking'); setFormation('voice synthesis active'); try { await playback.play() } catch { finish() }
      } else setVoicePhase('idle')
      if (result.action) { const href = assistantNavigationHref(result.action); if (href) window.setTimeout(() => window.location.assign(href), speechUrl ? 1400 : 650) }
    } catch (caught) {
      if (controller.signal.aborted || operationId !== voiceOperationRef.current) return
      setVoicePhase('error'); setVoiceError(caught instanceof Error ? caught.message : 'L.O.V.E. voice is unavailable right now.'); setFormation('voice request failed')
    } finally { if (abortRef.current === controller) abortRef.current = null }
  }

  const quotaLabel = remaining === null ? (plan === 'member' ? 'MEMBER ACCESS' : `${limit} FREE / DAY`) : remaining === 0 ? 'AI LIMIT REACHED' : plan === 'member' ? `${remaining} / ${limit}` : `${remaining} OF ${limit} LEFT`
  const loveState: LoveState = voicePhase === 'recording' || voicePhase === 'permission' ? 'listening' : voicePhase === 'processing' || loading ? 'thinking' : voicePhase === 'speaking' ? 'speaking' : value.trim() ? 'listening' : messages.length ? 'awake' : 'idle'
  const statusLabel = voicePhase === 'recording' ? 'Listening.' : voicePhase === 'processing' || loading ? 'Thinking.' : voicePhase === 'speaking' ? 'Speaking.' : leasePreview?.found ? 'Lease context locked.' : value.trim() ? 'Listening.' : 'Present.'

  function closeChat() { stopVoice(); setFullscreen(false); setExpanded(false); setEntityOffset({ x: 0, y: 0 }) }
  function trackEntity(event: PointerEvent<HTMLDivElement>) {
    if (!fullscreen) return
    const rect = event.currentTarget.getBoundingClientRect(); setEntityOffset({ x: ((event.clientX - rect.left) / rect.width - .5) * 18, y: ((event.clientY - rect.top) / rect.height - .5) * 12 })
  }

  return (
    <div className={`pttl-chat-dock ${expanded ? 'expanded' : ''} ${fullscreen ? 'fullscreen' : ''}`} onPointerMove={trackEntity} onPointerLeave={() => fullscreen && setEntityOffset({ x: 0, y: 0 })}>
      {fullscreen && <LoveEntity state={loveState} offset={entityOffset} formation={formation} />}
      {expanded && <div className="pttl-chat-transcript" aria-live="polite" style={fullscreen ? { position: 'relative', zIndex: 2 } : undefined}>
        <div className="pttl-chat-transcript-head"><div className="pttl-chat-identity"><span className="pttl-chat-kicker">L.O.V.E. / WORKSPACE AI</span><strong>L.O.V.E.</strong>{fullscreen && <small>{statusLabel}</small>}</div><div className="pttl-chat-window-actions"><small>{quotaLabel}</small><button type="button" onClick={() => setFullscreen((current) => !current)} aria-label={fullscreen ? 'Exit fullscreen chat' : 'Open fullscreen chat'}>{fullscreen ? '↙' : '↗'}</button><button type="button" onClick={closeChat} aria-label="Minimize chat">×</button></div></div>
        <div ref={messagesRef} className="pttl-chat-messages">
          {messages.length === 0 && <p className="pttl-chat-empty">Ask anything. Code, visuals, navigation and voice all live here.</p>}
          {leasePreview && <FactLeaseCard lease={leasePreview} />}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`pttl-chat-message ${message.role}`}><span>{message.role === 'user' ? 'YOU' : 'L.O.V.E.'}</span>{message.role === 'assistant' ? <AssistantRichText text={message.text} /> : <p>{message.text}</p>}{message.role === 'assistant' && message.visuals?.length ? <LoveVisualStrip visuals={message.visuals} /> : null}</div>)}
          {(loading || voicePhase === 'processing') && <div className="pttl-chat-thinking"><i /><i /><i /></div>}
          {voiceError && <div className="pttl-chat-voice-error" role="alert">{voiceError}</div>}
          <div ref={endRef} className="pttl-chat-end" aria-hidden="true" />
        </div>
      </div>}
      <form className="pttl-chat-bar" onSubmit={submit} style={fullscreen ? { position: 'relative', zIndex: 3 } : undefined}>
        <div className="pttl-chat-orb" aria-hidden="true"><span>{fullscreen ? 'L' : 'P'}</span></div>
        <input value={value} onChange={(event) => setValue(event.target.value)} onFocus={() => setExpanded(true)} placeholder={remaining === 0 ? 'AI limit reached' : voicePhase === 'recording' ? 'L.O.V.E. is listening…' : 'Message L.O.V.E.…'} maxLength={1200} aria-label="Message L.O.V.E." disabled={remaining === 0 || voicePhase === 'processing' || voicePhase === 'speaking'} />
        <button type="button" className={`pttl-chat-voice ${voicePhase === 'recording' ? 'recording' : ''} ${voicePhase === 'speaking' ? 'speaking' : ''}`} onClick={() => void startVoice()} disabled={remaining === 0 || loading || voicePhase === 'processing' || voicePhase === 'speaking'} aria-label={voicePhase === 'recording' ? 'Stop recording' : 'Talk to L.O.V.E.'}><MicIcon /></button>
        <button type="submit" className="pttl-chat-send" disabled={!value.trim() || loading || remaining === 0 || voicePhase === 'processing'} aria-label="Send to L.O.V.E."><SendIcon /></button>
      </form>
    </div>
  )
}
