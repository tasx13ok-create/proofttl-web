'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

type Props = {
  auditHref?: string
  auditLabel?: string
  auditAriaLabel?: string
  cta?: ReactNode
}

export default function SharedProductHeader({
  auditHref = '/audit/#audit-intake',
  auditLabel = 'Start audit',
  auditAriaLabel = 'Start Fact Audit',
  cta,
}: Props) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastY.current

      if (currentY < 48) setHidden(false)
      else if (delta > 7) setHidden(true)
      else if (delta < -7) setHidden(false)

      lastY.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <header className={`ptl-shared-header${hidden ? ' is-hidden' : ''}`}>
    <a className="ptl-shared-brand" href="/" aria-label="ProofTTL home">
      <img src="/proofttl-glass-logo.png" alt="ProofTTL" />
      
    </a>
    <nav className="ptl-buyer-nav" aria-label="Buyer navigation">
      <a href="/audit/">The audit</a>
      <a href="/audit/sample/">Sample</a>
      <a href="/audit/status/">Your audit</a>
    </nav>
    <div className="ptl-shared-header-actions">
      <span>Fact Audit</span>
      {cta || <a className="ptl-shared-audit-cta" href={auditHref} aria-label={auditAriaLabel}>{auditLabel} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></a>}
    </div>
  </header>
}
