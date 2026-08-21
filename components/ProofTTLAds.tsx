'use client'

import { useEffect } from 'react'

const ADSENSE_SCRIPT_ID = 'proofttl-adsense'
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || ''

const AD_ELIGIBLE_PREFIXES = ['/docs/', '/solutions/']

function normalizePath(pathname: string) {
  if (!pathname) return '/'
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function isAdEligiblePath(pathname: string) {
  const normalized = normalizePath(pathname)
  return AD_ELIGIBLE_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

function hasValidPublisherId(value: string) {
  return /^ca-pub-\d{10,}$/.test(value)
}

export default function ProofTTLAds() {
  useEffect(() => {
    if (!hasValidPublisherId(ADSENSE_CLIENT)) return
    if (!isAdEligiblePath(window.location.pathname)) return
    if (document.getElementById(ADSENSE_SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = ADSENSE_SCRIPT_ID
    script.async = true
    script.crossOrigin = 'anonymous'
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`
    script.dataset.proofttlPlacement = 'public-side-rails-only'
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  return null
}