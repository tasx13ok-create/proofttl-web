'use client'

import { useState } from 'react'
import styles from './AssistantRichText.module.css'

type Segment =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string; language: string }

function parseSegments(value: string): Segment[] {
  const source = String(value || '')
  const segments: Segment[] = []
  const fenced = /```([\w.+#-]*)\n?([\s\S]*?)```/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = fenced.exec(source))) {
    if (match.index > cursor) segments.push({ type: 'text', value: source.slice(cursor, match.index) })
    segments.push({ type: 'code', language: (match[1] || 'code').toLowerCase(), value: match[2].replace(/^\n|\n$/g, '') })
    cursor = match.index + match[0].length
  }

  if (cursor < source.length) segments.push({ type: 'text', value: source.slice(cursor) })
  return segments.length ? segments : [{ type: 'text', value: source }]
}

function InlineText({ value }: { value: string }) {
  const parts = value.split(/(`[^`\n]+`)/g)
  return (
    <>
      {parts.map((part, index) => part.startsWith('`') && part.endsWith('`')
        ? <code className={styles.inline} key={index}>{part.slice(1, -1)}</code>
        : <span key={index}>{part}</span>)}
    </>
  )
}

function CodeBlock({ value, language }: { value: string; language: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={styles.block} data-love-code-block="true">
      <header>
        <span>{language || 'code'}</span>
        <button type="button" onClick={() => void copy()}>{copied ? 'COPIED' : 'COPY'}</button>
      </header>
      <pre><code>{value}</code></pre>
    </section>
  )
}

export default function AssistantRichText({ text }: { text: string }) {
  const segments = parseSegments(text)
  return (
    <div className={styles.root}>
      {segments.map((segment, index) => segment.type === 'code'
        ? <CodeBlock key={index} value={segment.value} language={segment.language} />
        : segment.value.split(/\n{2,}/).map((paragraph, paragraphIndex) => paragraph.trim()
          ? <p key={`${index}-${paragraphIndex}`}><InlineText value={paragraph.trim()} /></p>
          : null))}
    </div>
  )
}
