'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

const links = [
  ['The audit', '/audit/'], ['Sample report', '/audit/sample/'],
  ['Technology', '/how-proofttl-works/'], ['Audit status', '/audit/status/'],
  ['Log in', '/login/'], ['Workspace', '/workspace/'],
  ['Services', '/services/'], ['Guides', '/docs/'],
  ['Support', '/support/'], ['Privacy', '/privacy/'], ['Terms', '/terms/'],
] as const

export default function CinematicPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/'
  const home = pathname === '/'
  const [open, setOpen] = useState(false)
  const scene = useRef<HTMLIFrameElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    setOpen(false)
    if (home) return
    let frame = 0
    let pointer = { x: 0, y: 0 }
    const send = () => {
      frame = 0
      scene.current?.contentWindow?.postMessage({ type: 'proof-scene', ...pointer, scroll: window.scrollY }, window.location.origin)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(send) }
    const move = (e: PointerEvent) => {
      pointer = { x: e.clientX / window.innerWidth * 2 - 1, y: e.clientY / window.innerHeight * 2 - 1 }
      schedule()
    }
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus() } }
    const outside = (e: PointerEvent) => { if (!nav.current?.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', outside)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', schedule)
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', outside)
    }
  }, [pathname, home])

  if (home) return children
  return <div className="cinematic-page" data-page={pathname}>
    <iframe key={pathname} ref={scene} className="cinematic-page-scene" srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#070809}canvas{position:absolute;inset:0;width:100%;height:100%}#gpu{opacity:0;transition:opacity 1s}</style></head><body data-route="${encodeURIComponent(pathname)}"><canvas id="fallback"></canvas><canvas id="gpu"></canvas><script type="module" src="/page-scene.js"></script></body></html>`} title="Decorative silver sculpture" aria-hidden="true" tabIndex={-1} />
    <div className="cinematic-page-shade" aria-hidden="true" />
    <nav className="cinematic-island" aria-label="Primary navigation" ref={nav}>
      <a href="/" className="cinematic-wordmark" aria-label="ProofTTL home"><img src="/proofttl-glass-logo.png" alt="ProofTTL" width="145" height="44" /></a>
      <div className="cinematic-island-links"><a href="/how-proofttl-works/">The method</a><a href="/audit/sample/">The evidence</a><a href="/trust/">Human approval</a></div>
      <a className="cinematic-audit-link" href="/audit/#audit-intake">Fact Audit <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></a>
      <button ref={toggle} type="button" className="cinematic-menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="cinematic-page-menu" onClick={() => setOpen(!open)}><span /><span /><span /></button>
      <div id="cinematic-page-menu" className={`cinematic-page-menu${open ? ' is-open' : ''}`} inert={!open}>
        {links.map(([label, href]) => <a key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{label}<span aria-hidden="true">→</span></a>)}
      </div>
    </nav>
    <div className="cinematic-page-content">{children}</div>
    <footer className="cinematic-page-footer">
      <a href="/" aria-label="ProofTTL home"><img src="/proofttl-glass-logo.png" alt="ProofTTL" width="145" height="44" /></a>
      <p>Source-backed verification. Evidence before confidence.</p>
      <nav aria-label="Footer navigation">{links.filter(([, href]) => ['/audit/status/', '/how-proofttl-works/', '/support/', '/privacy/', '/terms/'].includes(href)).map(([label, href]) => <a href={href} key={href}>{label}</a>)}</nav>
    </footer>
  </div>
}
