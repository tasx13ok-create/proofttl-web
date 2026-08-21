'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authClient, PROOFTTL_API_URL } from '../lib/proofttl-auth'

const PRIMARY = [
  { href: '/workspace/', label: 'Workspace' },
  { href: '/studio/', label: 'Studio' },
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

type SessionUser = {
  name?: string | null
  email?: string | null
  image?: string | null
}

type Quota = {
  plan?: string
  membership_status?: string
  limit?: number | null
  used?: number | null
  remaining?: number | null
  reset?: string
}

function active(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href)
}

function prettyPlan(value?: string) {
  if (!value) return 'Free'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function ProductNav() {
  const pathname = usePathname()
  const accountRef = useRef<HTMLDivElement | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [quota, setQuota] = useState<Quota | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountLoading, setAccountLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadAccount() {
      try {
        const result = await authClient.getSession()
        const nextUser = (result?.data?.user || null) as SessionUser | null
        if (cancelled) return
        setUser(nextUser)

        if (!nextUser) {
          setQuota(null)
          return
        }

        const response = await fetch(`${PROOFTTL_API_URL}/assistant/usage`, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        })
        if (!response.ok) return
        const data = await response.json() as { quota?: Quota }
        if (!cancelled) setQuota(data.quota || null)
      } catch {
        if (!cancelled) {
          setUser(null)
          setQuota(null)
        }
      } finally {
        if (!cancelled) setAccountLoading(false)
      }
    }

    void loadAccount()
    const onFocus = () => void loadAccount()
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [pathname])

  useEffect(() => {
    if (!accountOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [accountOpen])

  useEffect(() => setAccountOpen(false), [pathname])

  const username = useMemo(() => {
    if (!user) return ''
    const name = String(user.name || '').trim()
    if (name) return name
    const email = String(user.email || '').trim()
    return email ? email.split('@')[0] : 'Account'
  }, [user])

  const initial = useMemo(() => username.trim().charAt(0).toUpperCase() || 'P', [username])

  const usedPercent = useMemo(() => {
    const used = Number(quota?.used)
    const limit = Number(quota?.limit)
    if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return 0
    return Math.max(0, Math.min(100, Math.round((used / limit) * 100)))
  }, [quota])

  async function signOut() {
    await authClient.signOut()
    setUser(null)
    setQuota(null)
    setAccountOpen(false)
    window.location.assign('/')
  }

  return (
    <header className="product-nav" data-product-nav>
      <div className="product-nav-inner">
        <a href="/" className="product-brand" aria-label="ProofTTL home">
          <span className="product-brand-mark" aria-hidden="true">
            <img src="/proofttl-logo.png" alt="" width="34" height="34" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </span>
          <span className="product-brand-wordmark">ProofTTL</span>
        </a>

        <nav className="product-nav-primary" aria-label="Product">
          {PRIMARY.map((item) => <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>)}
        </nav>

        <div className="product-nav-actions">
          <div className="product-nav-more"><button type="button" aria-haspopup="true">More</button><div className="product-nav-menu">{SECONDARY.map((item) => <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>)}<a href="/how-proofttl-works/">How it works</a><a href="/status/">Status</a></div></div>

          {!accountLoading && user ? (
            <div className="product-account" ref={accountRef}>
              <button
                type="button"
                className="product-account-trigger"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className="product-account-name" title={user.email || username}>{username}</span>
                <span className="product-account-toggle" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>

              <div className={`product-account-menu${accountOpen ? ' is-open' : ''}`} role="menu" aria-hidden={!accountOpen}>
                <div className="product-account-head">
                  <span className="product-account-avatar">{initial}</span>
                  <div>
                    <strong>{username}</strong>
                    {user.email && <span>{user.email}</span>}
                  </div>
                  <span className="product-account-plan-pill">{prettyPlan(quota?.plan)}</span>
                </div>

                <div className="product-account-usage">
                  <div className="product-account-usage-top">
                    <span>Daily L.O.V.E. usage</span>
                    <strong>{usedPercent}%</strong>
                  </div>
                  <div className="product-account-meter" aria-label={`${usedPercent}% of daily limit used`}>
                    <span style={{ width: `${usedPercent}%` }} />
                  </div>
                  <div className="product-account-usage-bottom">
                    <span>{quota?.used ?? 0} used</span>
                    <span>{quota?.limit ?? '—'} daily limit</span>
                  </div>
                </div>

                <div className="product-account-grid">
                  <div><span>Remaining</span><strong>{quota?.remaining ?? '—'}</strong></div>
                  <div><span>Status</span><strong>{quota?.membership_status || 'active'}</strong></div>
                </div>

                <div className="product-account-links">
                  <a href="/console/" role="menuitem"><span>Account & security</span><b>↗</b></a>
                  <a href="/connections/" role="menuitem"><span>Connections</span><b>↗</b></a>
                  <button type="button" role="menuitem" onClick={() => void signOut()}><span>Sign out</span><b>→</b></button>
                </div>
              </div>
            </div>
          ) : !accountLoading ? (
            <a className="product-nav-signin" href="/login/">Sign in</a>
          ) : (
            <span className="product-account-loading" aria-hidden="true" />
          )}

          <a className="product-nav-workspace" href="/workspace/">Open Workspace <span>→</span></a>
        </div>
      </div>
    </header>
  )
}
