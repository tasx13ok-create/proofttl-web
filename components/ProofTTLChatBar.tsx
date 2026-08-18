'use client'

import { FormEvent, useRef, useState } from 'react'
import {
  askProofTTLByText,
  assistantNavigationHref,
  type AssistantNavigationAction,
} from '../lib/proofttl-assistant'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M4 12 19 5l-4.5 14-3.1-5.9L4 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m11.4 13.1 3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export default function ProofTTLChatBar() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = value.replace(/\s+/g, ' ').trim()
    if (!message || loading) return

    setExpanded(true)
    setValue('')
    setMessages((current) => [...current, { role: 'user', text: message }])
    setLoading(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const result = await askProofTTLByText(message, controller.signal)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: result.response || 'I can help with ProofTTL, Fact Leases, x402, monitoring, and the API.',
        },
      ])

      const action = result.action as AssistantNavigationAction | null
      if (action) {
        const href = assistantNavigationHref(action)
        if (href) window.setTimeout(() => window.location.assign(href), 700)
      }
    } catch (caught) {
      if (controller.signal.aborted) return
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: caught instanceof Error ? caught.message : 'ProofTTL Assistant is unavailable right now.',
        },
      ])
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setLoading(false)
    }
  }

  return (
    <div className={`pttl-chat-dock ${expanded ? 'expanded' : ''}`}>
      {expanded && (
        <div className="pttl-chat-transcript" aria-live="polite">
          <div className="pttl-chat-transcript-head">
            <div>
              <span>PROOFTTL AI</span>
              <strong>Ask about the product.</strong>
            </div>
            <button type="button" onClick={() => setExpanded(false)} aria-label="Minimize chat">×</button>
          </div>
          <div className="pttl-chat-messages">
            {messages.length === 0 && (
              <p className="pttl-chat-empty">Ask about Fact Leases, x402, monitoring, pricing, security, or where to find something.</p>
            )}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`pttl-chat-message ${message.role}`}>
                <span>{message.role === 'user' ? 'YOU' : 'PROOFTTL'}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {loading && (
              <div className="pttl-chat-thinking"><i /><i /><i /></div>
            )}
          </div>
        </div>
      )}

      <form className="pttl-chat-bar" onSubmit={submit}>
        <div className="pttl-chat-orb" aria-hidden="true"><span>P</span></div>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Ask ProofTTL anything…"
          maxLength={1200}
          aria-label="Ask ProofTTL Assistant"
        />
        <div className="pttl-chat-shortcut" aria-hidden="true">AI</div>
        <button type="submit" className="pttl-chat-send" disabled={!value.trim() || loading} aria-label="Send to ProofTTL Assistant">
          <SendIcon />
        </button>
      </form>
    </div>
  )
}
