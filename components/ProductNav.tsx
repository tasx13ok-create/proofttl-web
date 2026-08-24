'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authClient, PROOFTTL_API_URL, signInHref } from '../lib/proofttl-auth'

const APP_PRIMARY = [
  { href: '/workspace/', label: 'Workspace' },
  { href: '/studio/', label: 'Studio' },
  { href: '/foundry/', label: 'Foundry', ownerOnly: true },
  { href: '/work/', label: 'Work' },
  { href: '/files/', label: 'Files' },
  { href: '/automations/', label: 'Automations' },
  { href: '/money/', label: 'Money' },
] as const

const APP_SECONDARY = [
  { href: '/audit/', label: 'Verification' },
  { href: '/services/', label: 'Services' },
  { href: '/about/', label: 'About' },
  { href: '/trust/', label: 'Trust' },
  { href: '/connections/', label: 'Connections' },
] as const

const PUBLIC_PRIMARY = [
  { href: '/audit/', label: 'Verification' },
  { href: '/services/', label: 'Services' },
  { href: '/audit/sample/', label: 'Sample' },
  { href: '/how-proofttl-works/', label: 'How it works' },
] as const

const PUBLIC_SECONDARY = [
  { href: '/ai-fact-checker/', label: 'AI Fact Checker' },
  { href: '/about/', label: 'About' },
  { href: '/trust/', label: 'Trust' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/privacy/', label: 'Privacy' },
  { href: '/terms/', label: 'Terms' },
  { href: '/status/', label: 'Status' },
] as const

const PUBLIC_PATH_PREFIXES = [
  '/',
  '/about/',
  '/audit/',
  '/services/',
  '/solutions/',
  '/faq/',
  '/machine-definition/',
  '/glossary/',
  '/trust/',
  '/how-proofttl-works/',
  '/docs/',
  '/privacy/',
  '/terms/',
  '/status/',
  '/support/',
  '/ai-fact-checker/',
  '/verify-lease.html',
] as const

type SessionUser = { name?: string | null; email?: string | null; image?: string | null }
type Quota = { plan?: string; membership_status?: string; limit?: number | null; used?: number | null; remaining?: number | null; reset?: string; unlimited?: boolean }

function active(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href)
}

function isPublicPath(pathname: string) {
  if (pathname === '/') return true
  return PUBLIC_PATH_PREFIXES.some((prefix) => prefix !== '/' && (pathname === prefix || pathname.startsWith(prefix)))
}

function prettyPlan(value?: string) {
  if (!value) return 'Free'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function ProductNav() {
  const pathname = usePathname()
  const publicMode = isPublicPath(pathname)
  const accountRef = useRef<HTMLDivElement | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [quota, setQuota] = useState<Quota | null>(null)
  const [foundryAllowed, setFoundryAllowed] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountLoading, setAccountLoading] = useState(true)
  const [signInTarget, setSignInTarget] = useState(pathname || '/')

  useEffect(() => {
    setSignInTarget(`${window.location.pathname}${window.location.search}${window.location.hash}`)
    let cancelled = false
    async function loadAccount() {
      try {
        const result = await authClient.getSession()
        const nextUser = (result?.data?.user || null) as SessionUser | null
        if (cancelled) return
        setUser(nextUser)
        if (!nextUser) { setQuota(null); setFoundryAllowed(false); return }

        const [usageResponse, foundryResponse] = await Promise.all([
          fetch(`${PROOFTTL_API_URL}/assistant/usage`, { method: 'GET', cache: 'no-store', credentials: 'include' }),
          fetch(`${PROOFTTL_API_URL}/foundry/runs`, { method: 'GET', cache: 'no-store', credentials: 'include' }),
        ])
        if (cancelled) return
        setFoundryAllowed(foundryResponse.ok)
        if (usageResponse.ok) {
          const data = await usageResponse.json() as { quota?: Quota }
          if (!cancelled) setQuota(data.quota || null)
        }
      } catch {
        if (!cancelled) { setUser(null); setQuota(null); setFoundryAllowed(false) }
      } finally {
        if (!cancelled) setAccountLoading(false)
      }
    }
    void loadAccount()
    const onFocus = () => void loadAccount()
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [pathname])

  useEffect(() => {
    if (!accountOpen) return
    const onPointerDown = (event: PointerEvent) => { if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false) }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setAccountOpen(false) }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown) }
  }, [accountOpen])

  useEffect(() => setAccountOpen(false), [pathname])

  const username = useMemo(() => {
    if (!user) return ''
    const name = String(user.name || '').trim()
    if (name) return name
    const email = String(user.email || '').trim()
    return email ? email.split('@')[0] : 'Account'
  }, [user])

  const visibleAppPrimary = useMemo(() => APP_PRIMARY.filter((item) => !('ownerOnly' in item) || !item.ownerOnly || foundryAllowed), [foundryAllowed])
  const primaryLinks = publicMode ? PUBLIC_PRIMARY : visibleAppPrimary
  const secondaryLinks = publicMode ? PUBLIC_SECONDARY : APP_SECONDARY
  const initial = useMemo(() => username.trim().charAt(0).toUpperCase() || 'A', [username])
  const unlimited = Boolean(quota?.unlimited)
  const usedPercent = useMemo(() => {
    if (quota?.unlimited) return 0
    const used = Number(quota?.used); const limit = Number(quota?.limit)
    if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return 0
    return Math.max(0, Math.min(100, Math.round((used / limit) * 100)))
  }, [quota])

  async function logOutOrSwitchAccount() {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`
    try { await authClient.signOut() } catch {}
    setUser(null)
    setQuota(null)
    setFoundryAllowed(false)
    setAccountOpen(false)
    window.location.assign(signInHref(returnTo))
  }

  return (
    <header className="product-nav" data-product-nav data-nav-mode={publicMode ? 'public' : 'app'}>
      <div className="product-nav-inner">
        <a href="/" className="product-brand product-brand-lockup" aria-label="ProofTTL home">
          <img className="product-brand-lockup-image" src="/proofttl-lockup.svg" alt="ProofTTL" />
        </a>

        <nav className="product-nav-primary" aria-label={publicMode ? 'ProofTTL services' : 'Product'}>
          {primaryLinks.map((item) => <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>)}
        </nav>

        <div className="product-nav-actions">
          <div className="product-nav-more"><button type="button" aria-haspopup="true">More</button><div className="product-nav-menu">{secondaryLinks.map((item) => <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>)}{!publicMode && <><a href="/how-proofttl-works/">How it works</a><a href="/faq/">FAQ</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/status/">Status</a></>}</div></div>

          {!accountLoading && user ? (
            <div className="product-account" ref={accountRef}>
              <button type="button" className="product-account-trigger" aria-label="Open account menu" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)}>
                <span className="product-account-name" title={user.email || username}>{username}</span>
                <span className="product-account-toggle" aria-hidden="true"><span /><span /><span /></span>
              </button>
              <div className={`product-account-menu${accountOpen ? ' is-open' : ''}`} role="menu" aria-hidden={!accountOpen}>
                <div className="product-account-head">
                  <span className="product-account-avatar">{initial}</span>
                  <div><strong>{username}</strong>{user.email && <span>{user.email}</span>}</div>
                  <span className="product-account-plan-pill">{prettyPlan(quota?.plan)}</span>
                </div>
                <div className="product-account-usage">
                  <div className="product-account-usage-top"><span>Daily L.O.V.E. usage</span><strong>{unlimited ? 'Unlimited' : `${usedPercent}%`}</strong></div>
                  <div className="product-account-meter" aria-label={unlimited ? 'Unlimited daily L.O.V.E. usage' : `${usedPercent}% of daily limit used`}><span style={{ width: `${usedPercent}%` }} /></div>
                  <div className="product-account-usage-bottom"><span>{quota?.used ?? 0} used</span><span>{unlimited ? 'Unlimited' : `${quota?.limit ?? '—'} daily limit`}</span></div>
                </div>
                <div className="product-account-grid"><div><span>Remaining</span><strong>{unlimited ? 'Unlimited' : (quota?.remaining ?? '—')}</strong></div><div><span>Status</span><strong>{quota?.membership_status || 'active'}</strong></div></div>
                <div className="product-account-links">
                  <a href="/console/" role="menuitem"><span>Account & security</span><b>↗</b></a>
                  <a href="/connections/" role="menuitem"><span>Connections</span><b>↗</b></a>
                  <button type="button" role="menuitem" onClick={() => void logOutOrSwitchAccount()}><span>Log out / Switch account</span><b>→</b></button>
                </div>
              </div>
            </div>
          ) : !accountLoading ? <a className="product-nav-signin" href={signInHref(signInTarget)}>Sign in</a> : <span className="product-account-loading" aria-hidden="true" />}

          {publicMode
            ? <a className="product-nav-workspace" href="/audit/#audit-intake">Start verification <span>→</span></a>
            : <a className="product-nav-workspace" href="/workspace/">Open Workspace <span>→</span></a>}
        </div>
      </div>
    </header>
  )
}
