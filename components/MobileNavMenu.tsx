'use client'

import { useEffect, useId, useRef, useState } from 'react'

type NavLink = { href: string; label: string }

export default function MobileNavMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className="pttl-mnav" ref={rootRef}>
      <button
        type="button"
        className="pttl-mnav-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={`pttl-mnav-bar ${open ? 'is-open' : ''}`} />
        <span className={`pttl-mnav-bar ${open ? 'is-open' : ''}`} />
        <span className={`pttl-mnav-bar ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div id={panelId} className="pttl-mnav-panel" role="menu">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              className="pttl-mnav-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
