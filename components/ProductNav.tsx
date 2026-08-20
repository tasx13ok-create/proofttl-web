'use client'

import { usePathname } from 'next/navigation'

const PRIMARY = [
  { href: '/workspace/', label: 'Workspace' },
  { href: '/studio/', label: 'Studio' },
  { href: '/worlds/', label: 'Worlds' },
  { href: '/work/', label: 'Work' },
  { href: '/files/', label: 'Files' },
  { href: '/automations/', label: 'Automations' },
  { href: '/money/', label: 'Money' },
] as const

const SECONDARY = [
  { href: '/connections/', label: 'Connections' },
  { href: '/trust/', label: 'Trust' },
  { href: '/audit/', label: 'Verification' },
] as const

function active(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href)
}

export default function ProductNav() {
  const pathname = usePathname()

  return (
    <header className="product-nav" data-product-nav>
      <div className="product-nav-inner">
        <a href="/" className="product-brand" aria-label="ProofTTL home">
          <span className="product-brand-mark">P</span>
          <span>PROOF<b>TTL</b></span>
        </a>

        <nav className="product-nav-primary" aria-label="Product">
          {PRIMARY.map((item) => (
            <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>
          ))}
        </nav>

        <div className="product-nav-actions">
          <div className="product-nav-more">
            <button type="button" aria-haspopup="true">More</button>
            <div className="product-nav-menu">
              {SECONDARY.map((item) => (
                <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>
              ))}
              <a href="/how-proofttl-works/">How it works</a>
              <a href="/status.html">Status</a>
            </div>
          </div>
          <a className="product-nav-signin" href="/login/">Sign in</a>
          <a className="product-nav-workspace" href="/workspace/">Open Workspace <span>→</span></a>
        </div>
      </div>
    </header>
  )
}
