'use client'

import { FormEvent, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import {
  askProofTTLByText,
  assistantNavigationHref,
  fetchProofTTLAssistantUsage,
  type AssistantNavigationAction,
  type AssistantHistoryMessage,
} from '../lib/proofttl-assistant'
import love from './LoveEntity.module.css'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

type LoveState = 'idle' | 'listening' | 'thinking' | 'awake'

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M4 12 19 5l-4.5 14-3.1-5.9L4 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m11.4 13.1 3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function LoveEntity({ state, offset }: { state: LoveState; offset: { x: number; y: number } }) {
  const label = state === 'thinking'
    ? 'Reasoning / verifying'
    : state === 'listening'
      ? 'Signal acquired'
      : state === 'awake'
        ? 'Context active'
        : 'Dormant / listening'

  const style = {
    '--love-x': `${offset.x}px`,
    '--love-y': `${offset.y}px`,
  } as CSSProperties

  return (
    <div className={love.stage} data-state={state} style={style} aria-hidden="true">
      <div className={`${love.shard} ${love.shardA}`}>conversation<strong>context online</strong></div>
      <div className={`${love.shard} ${love.shardB}`}>response model<strong>granite micro</strong></div>
      <div className={`${love.shard} ${love.shardC}`}>truth layer<strong>ProofTTL grounded</strong></div>
      <div className={`${love.shard} ${love.shardD}`}>improvement loop<strong>MIRA observing</strong></div>
      <div className={love.core}>
        <div className={love.orbit} />
        <div className={love.orbit2} />
        <div className={love.orbit3} />
        <div className={love.smoke} />
        <div className={love.faceVoid} />
        <div className={love.eyes}>
          <i className={love.eye} />
          <i className={love.eye} />
        </div>
      </div>
      <div className={love.stateLabel}>{label}</div>
    </div>
  )
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
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchProofTTLAssistantUsage(controller.signal)
      .then((quota) => {
        if (typeof quota?.limit === 'number') setLimit(quota.limit)
        if (typeof quota?.remaining === 'number') setRemaining(quota.remaining)
        if (typeof quota?.plan === 'string') setPlan(quota.plan)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!fullscreen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false)
    }
    document.body.classList.add('pttl-chat-fullscreen-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('pttl-chat-fullscreen-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [fullscreen])

  useEffect(() => {
    if (!expanded) return
    const frame = window.requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ block: 'end', behavior: messages.length > 1 ? 'smooth' : 'auto' })
      const node = messagesRef.current
      if (node) node.scrollTop = node.scrollHeight
    })
    return () => window.cancelAnimationFrame(frame)
  }, [expanded, fullscreen, messages, loading])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = value.replace(/\s+/g, ' ').trim()
    if (!message || loading || remaining === 0) return

    const history: AssistantHistoryMessage[] = messages.slice(-6).map((item) => ({
      role: item.role,
      content: item.text,
    }))

    setExpanded(true)
    setValue('')
    setMessages((current) => [...current, { role: 'user', text: message }])
    setLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await askProofTTLByText(message, history, controller.signal)
      if (typeof result.quota?.limit === 'number') setLimit(result.quota.limit)
      if (typeof result.quota?.remaining === 'number') setRemaining(result.quota.remaining)
      if (typeof result.quota?.plan === 'string') setPlan(result.quota.plan)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: result.response || 'I missed that one. Try it again.',
        },
      ])

      const action = result.action as AssistantNavigationAction | null
      if (action) {
        const href = assistantNavigationHref(action)
        if (href) window.setTimeout(() => window.location.assign(href), 700)
      }
    } catch (caught) {
      if (controller.signal.aborted) return
      const text = caught instanceof Error ? caught.message : 'L.O.V.E. is unavailable right now.'
      if (/ProofTTL AI limit/i.test(text)) setRemaining(0)
      setMessages((current) => [...current, { role: 'assistant', text }])
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setLoading(false)
    }
  }

  const quotaLabel = remaining === null
    ? plan === 'member' ? 'MEMBER ACCESS' : `${limit} FREE / DAY`
    : remaining === 0
      ? 'AI LIMIT REACHED'
      : plan === 'member'
        ? `${remaining} / ${limit}`
        : `${remaining} OF ${limit} LEFT`

  const loveState: LoveState = loading
    ? 'thinking'
    : value.trim()
      ? 'listening'
      : messages.length
        ? 'awake'
        : 'idle'

  function closeChat() {
    setFullscreen(false)
    setExpanded(false)
    setEntityOffset({ x: 0, y: 0 })
  }

  function trackEntity(event: PointerEvent<HTMLDivElement>) {
    if (!fullscreen) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12
    setEntityOffset({ x, y })
  }

  return (
    <div
      className={`pttl-chat-dock ${expanded ? 'expanded' : ''} ${fullscreen ? 'fullscreen' : ''}`}
      onPointerMove={trackEntity}
      onPointerLeave={() => fullscreen && setEntityOffset({ x: 0, y: 0 })}
    >
      {fullscreen && <LoveEntity state={loveState} offset={entityOffset} />}
      {expanded && (
        <div className="pttl-chat-transcript" aria-live="polite" style={fullscreen ? { position: 'relative', zIndex: 2 } : undefined}>
          <div className="pttl-chat-transcript-head">
            <div className="pttl-chat-identity">
              <span className="pttl-chat-kicker">L.O.V.E. / PROOFTTL AI</span>
              <strong>{fullscreen ? 'L.O.V.E.' : 'L.O.V.E.'}</strong>
              {fullscreen && <small>{loading ? 'Thinking.' : value.trim() ? 'Listening.' : 'Present.'}</small>}
            </div>
            <div className="pttl-chat-window-actions">
              <small>{quotaLabel}</small>
              <button
                type="button"
                onClick={() => setFullscreen((current) => !current)}
                aria-label={fullscreen ? 'Exit fullscreen chat' : 'Open fullscreen chat'}
                title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {fullscreen ? '↙' : '↗'}
              </button>
              <button type="button" onClick={closeChat} aria-label="Minimize chat">×</button>
            </div>
          </div>
          <div ref={messagesRef} className="pttl-chat-messages">
            {messages.length === 0 && (
              <p className="pttl-chat-empty">Say hi, ask a question, or tell me what you&apos;re trying to do.</p>
            )}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`pttl-chat-message ${message.role}`}>
                <span>{message.role === 'user' ? 'YOU' : 'L.O.V.E.'}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {loading && <div className="pttl-chat-thinking"><i /><i /><i /></div>}
            <div ref={endRef} className="pttl-chat-end" aria-hidden="true" />
          </div>
        </div>
      )}

      <form className="pttl-chat-bar" onSubmit={submit} style={fullscreen ? { position: 'relative', zIndex: 3 } : undefined}>
        <div className="pttl-chat-orb" aria-hidden="true"><span>{fullscreen ? 'L' : 'P'}</span></div>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder={remaining === 0 ? 'AI limit reached' : 'Message L.O.V.E.…'}
          maxLength={1200}
          aria-label="Message L.O.V.E."
          disabled={remaining === 0}
        />
        <button type="submit" className="pttl-chat-send" disabled={!value.trim() || loading || remaining === 0} aria-label="Send to L.O.V.E.">
          <SendIcon />
        </button>
      </form>
    </div>
  )
}
