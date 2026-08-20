'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authClient, PROOFTTL_API_URL } from '../lib/proofttl-auth'

const PRIMARY = [
  { href: '/workspace/', label: 'Workspace' },
  { href: '/studio/', label: 'Studio' },
  { href: '/worlds/', label: 'Worlds' },
  { href: '/cinematics/', label: 'Cinematics' },
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
  const [user, setUser] = useState<SessionUser | null>(null)
  const [quota, setQuota] = useState<Quota | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)

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

  const username = useMemo(() => {
    if (!user) return ''
    const name = String(user.name || '').trim()
    if (name) return name
    const email = String(user.email || '').trim()
    return email ? email.split('@')[0] : 'Account'
  }, [user])

  const usedPercent = useMemo(() => {
    const used = Number(quota?.used)
    const limit = Number(quota?.limit)
    if (!Number.isFinite(used) || !Number.isFinite(limit) || limit <= 0) return null
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
          <img src="/proofttl-logo-lockup.png" alt="ProofTTL" className="product-brand-logo" />
        </a>
        <nav className="product-nav-primary" aria-label="Product">{PRIMARY.map((item) => <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>)}</nav>
        <div className="product-nav-actions">
          <div className="product-nav-more"><button type="button" aria-haspopup="true">More</button><div className="product-nav-menu">{SECONDARY.map((item) => <a key={item.href} href={item.href} className={active(pathname, item.href) ? 'active' : ''}>{item.label}</a>)}<a href="/how-proofttl-works/">How it works</a><a href="/status/">Status</a></div></div>

          {user ? (
            <div className="product-account">
              <span className="product-account-name" title={user.email || username}>{username}</span>
              <button
                type="button"
                className="product-account-toggle"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span />
                <span />
                <span />
              </button>
              {accountOpen && (
                <div className="product-account-menu" role="menu">
                  <div className="product-account-head">
                    <strong>{username}</strong>
                    {user.email && <span>{user.email}</span>}
                  </div>
                  <div className="product-account-row"><span>Plan</span><strong>{prettyPlan(quota?.plan)}</strong></div>
                  <div className="product-account-row"><span>Daily limit</span><strong>{quota?.limit ?? '—'}</strong></div>
                  <div className="product-account-row"><span>Used today</span><strong>{quota?.used ?? '—'}{usedPercent !== null ? ` · ${usedPercent}%` : ''}</strong></div>
                  <div className="product-account-meter" aria-label={`${usedPercent ?? 0}% of daily limit used`}>
                    <span style={{ width: `${usedPercent ?? 0}%` }} />
                  </div>
                  <div className="product-account-row"><span>Remaining</span><strong>{quota?.remaining ?? '—'}</strong></div>
                  <div className="product-account-row"><span>Status</span><strong>{quota?.membership_status || 'active'}</strong></div>
                  <a href="/console/" role="menuitem">Account & security</a>
                  <a href="/connections/" role="menuitem">Connections</a>
                  <button type="button" role="menuitem" onClick={() => void signOut()}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <a className="product-nav-signin" href="/login/">Sign in</a>
          )}

          <a className="product-nav-workspace" href="/workspace/">Open Workspace <span>→</span></a>
        </div>
      </div>
    </header>
  )
}
