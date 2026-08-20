'use client'

import { FormEvent, useEffect, useState } from 'react'
import { PROOFTTL_API_URL } from '../lib/proofttl-auth'

type FileMeta = {
  file_id: string
  name: string
  media_type: string
  size_bytes: number
  source: string
  created_at: string
  updated_at: string
}

type FullFile = FileMeta & { content_text: string }

const TYPES = [
  ['text/plain', 'TEXT'],
  ['text/markdown', 'MARKDOWN'],
  ['application/json', 'JSON'],
  ['text/javascript', 'JAVASCRIPT'],
  ['text/typescript', 'TYPESCRIPT'],
  ['text/x-python', 'PYTHON'],
  ['text/x-powershell', 'POWERSHELL'],
  ['text/x-shellscript', 'SHELL'],
  ['text/html', 'HTML'],
  ['text/css', 'CSS'],
] as const

export default function FilesCenter() {
  const [state, setState] = useState<'loading' | 'signed-out' | 'ready' | 'error'>('loading')
  const [files, setFiles] = useState<FileMeta[]>([])
  const [active, setActive] = useState<FullFile | null>(null)
  const [name, setName] = useState('notes.md')
  const [mediaType, setMediaType] = useState('text/markdown')
  const [content, setContent] = useState('# New ProofTTL file\n')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/files`, { credentials: 'include', cache: 'no-store' })
      if (response.status === 401) { setState('signed-out'); return }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const body = await response.json() as { files?: FileMeta[] }
      setFiles(Array.isArray(body.files) ? body.files : [])
      setState('ready')
    } catch { setState('error') }
  }

  useEffect(() => { void load() }, [])

  async function openFile(file: FileMeta) {
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/files/${file.file_id}`, { credentials: 'include', cache: 'no-store' })
      const body = await response.json().catch(() => ({})) as { file?: FullFile; error?: string }
      if (!response.ok || !body.file) throw new Error(body.error || `HTTP ${response.status}`)
      setActive(body.file); setName(body.file.name); setMediaType(body.file.media_type); setContent(body.file.content_text)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not open file.') }
    finally { setBusy(false) }
  }

  function newFile() {
    setActive(null); setName('untitled.md'); setMediaType('text/markdown'); setContent(''); setMessage('New native file.')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true); setMessage('')
    try {
      const url = active ? `${PROOFTTL_API_URL}/account/files/${active.file_id}` : `${PROOFTTL_API_URL}/account/files`
      const response = await fetch(url, {
        method: active ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, media_type: mediaType, content }),
      })
      const body = await response.json().catch(() => ({})) as { file?: FullFile; error?: string }
      if (!response.ok || !body.file) throw new Error(body.error || `HTTP ${response.status}`)
      setActive(body.file); setName(body.file.name); setMediaType(body.file.media_type); setContent(body.file.content_text)
      setMessage(active ? 'File updated.' : 'File created in your ProofTTL account.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save file.') }
    finally { setBusy(false) }
  }

  async function remove() {
    if (!active || busy || !window.confirm(`Delete “${active.name}” from your ProofTTL account?`)) return
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`${PROOFTTL_API_URL}/account/files/${active.file_id}`, { method: 'DELETE', credentials: 'include' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setActive(null); setName('untitled.md'); setMediaType('text/markdown'); setContent(''); setMessage('File deleted.')
      await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete file.') }
    finally { setBusy(false) }
  }

  if (state === 'loading') return <div className="app-empty">Loading your ProofTTL files…</div>
  if (state === 'signed-out') return <div className="app-empty"><strong>Sign in to use the native ProofTTL file library.</strong><a className="text-link" href="/login/">SIGN IN →</a></div>
  if (state === 'error') return <div className="app-empty"><strong>Native file storage is not live on this deployment yet.</strong></div>

  return <div style={{ display: 'grid', gridTemplateColumns: '250px minmax(0,1fr)', gap: 14 }}>
    <aside className="console-panel wide" style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div><p className="app-kicker">NATIVE FILES</p><strong>{files.length} / 100</strong></div><button className="text-link" type="button" onClick={newFile}>+ NEW</button></div>
      <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
        {files.map((file) => <button type="button" key={file.file_id} onClick={() => void openFile(file)} style={{ textAlign: 'left', padding: 10, borderRadius: 9, border: active?.file_id === file.file_id ? '1px solid rgba(103,232,249,.42)' : '1px solid rgba(148,163,184,.12)', background: 'rgba(255,255,255,.02)' }}><strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</strong><small>{file.media_type} · {file.size_bytes} B</small></button>)}
        {!files.length && <div className="app-empty"><strong>No native files yet.</strong>Create one here or later let L.O.V.E. and Studio save approved output into this account library.</div>}
      </div>
    </aside>

    <form onSubmit={save} className="console-panel wide" style={{ display: 'grid', gap: 10, minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="file.md" maxLength={160} />
        <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>{TYPES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} spellCheck={false} rows={24} style={{ width: '100%', font: '13px/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace' }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <small>PROOFTTL-NATIVE · TEXT/CODE ONLY · 200 KB MAX PER FILE</small>
        <div style={{ display: 'flex', gap: 8 }}>
          {active && <button type="button" className="button button-secondary" onClick={() => void remove()} disabled={busy}>DELETE</button>}
          <button className="button button-primary" disabled={busy || !name.trim()}>{busy ? 'SAVING…' : active ? 'SAVE CHANGES' : 'CREATE FILE'}</button>
        </div>
      </div>
      {message && <p className="app-note">{message}</p>}
    </form>
  </div>
}
