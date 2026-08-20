'use client'

import { useState } from 'react'
import styles from './AssistantRichText.module.css'

const API_URL = (process.env.NEXT_PUBLIC_PROOFTTL_API_URL || 'https://proofttl.tasx13ok.workers.dev').replace(/\/$/, '')
const STUDIO_STORAGE_KEY = 'proofttl-studio-workspace-v2'

type Segment =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string; language: string }

type RunResult = {
  ok?: boolean
  error?: string
  message?: string
  job?: { id?: string; exit_code?: number | null; output?: string; truncated?: boolean }
  isolation?: { runtime?: string; network?: string }
}

type StudioFile = { id: string; name: string; language: string; content: string }
type StudioWorkspace = { name: string; files: StudioFile[]; activeFileId: string }

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

function runtimeForLanguage(language: string) {
  const value = language.toLowerCase()
  if (['js', 'javascript', 'node', 'nodejs', 'mjs', 'cjs'].includes(value)) return 'javascript'
  if (['py', 'python', 'python3'].includes(value)) return 'python'
  if (['bash', 'sh', 'shell'].includes(value)) return 'bash'
  return ''
}

function studioLanguage(language: string) {
  const runtime = runtimeForLanguage(language)
  return runtime || (language === 'ts' ? 'typescript' : language === 'md' ? 'markdown' : language || 'text')
}

function extensionForLanguage(language: string) {
  const runtime = runtimeForLanguage(language)
  if (runtime === 'javascript') return 'js'
  if (runtime === 'python') return 'py'
  if (runtime === 'bash') return 'sh'
  if (language === 'typescript' || language === 'ts') return 'ts'
  if (language === 'html') return 'html'
  if (language === 'css') return 'css'
  if (language === 'json') return 'json'
  if (language === 'markdown' || language === 'md') return 'md'
  return 'txt'
}

function safeId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function CodeBlock({ value, language }: { value: string; language: string }) {
  const [copied, setCopied] = useState(false)
  const [runState, setRunState] = useState<'idle' | 'running' | 'done'>('idle')
  const [result, setResult] = useState<RunResult | null>(null)
  const runtime = runtimeForLanguage(language)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  async function run() {
    if (!runtime || runState === 'running') return
    setRunState('running')
    setResult(null)
    try {
      const response = await fetch(`${API_URL}/studio/run`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ language: runtime, code: value }),
      })
      const body = await response.json().catch(() => ({})) as RunResult
      if (response.status === 401) {
        setResult({ error: 'authentication_required', message: 'Sign in to run code in an isolated ProofTTL environment.' })
      } else {
        setResult(body)
      }
    } catch {
      setResult({ error: 'runner_unreachable', message: 'The isolated execution environment could not be reached.' })
    } finally {
      setRunState('done')
    }
  }

  function openInStudio() {
    const ext = extensionForLanguage(language)
    const file: StudioFile = {
      id: safeId(),
      name: `love-snippet-${Date.now()}.${ext}`,
      language: studioLanguage(language),
      content: value,
    }

    let workspace: StudioWorkspace = { name: 'L.O.V.E. Coding Session', files: [file], activeFileId: file.id }
    try {
      const raw = window.localStorage.getItem(STUDIO_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StudioWorkspace
        if (Array.isArray(parsed?.files)) workspace = { ...parsed, files: [...parsed.files, file], activeFileId: file.id }
      }
    } catch {}

    window.localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(workspace))
    window.location.assign('/studio/')
  }

  return (
    <section className={styles.block} data-love-code-block="true">
      <header>
        <span>{language || 'code'}</span>
        <div className={styles.actions}>
          {runtime && <button type="button" onClick={() => void run()} disabled={runState === 'running'}>{runState === 'running' ? 'RUNNING…' : 'RUN'}</button>}
          <button type="button" onClick={openInStudio}>OPEN IN STUDIO</button>
          <button type="button" onClick={() => void copy()}>{copied ? 'COPIED' : 'COPY'}</button>
        </div>
      </header>
      <pre><code>{value}</code></pre>
      {result && <div className={styles.runResult} data-love-run-result={result.ok ? 'success' : 'error'}>
        <div className={styles.runMeta}>
          <span>{result.ok ? 'ISOLATED RUN COMPLETE' : result.error || 'RUN RESULT'}</span>
          {result.job && <span>EXIT {result.job.exit_code ?? '—'}{result.isolation?.runtime ? ` · ${result.isolation.runtime}` : ''}</span>}
        </div>
        {result.message && <p>{result.message}</p>}
        {result.job && <pre><code>{result.job.output || '(no stdout/stderr returned)'}</code></pre>}
        {result.error === 'authentication_required' && <a href="/login/">SIGN IN TO RUN →</a>}
      </div>}
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
