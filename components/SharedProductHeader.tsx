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
      <img src="/proofttl-mark.svg" alt="" />
      <strong>ProofTTL</strong>
    </a>
    <div className="ptl-shared-header-actions">
      <span>Fact Audit</span>
      {cta || <a className="ptl-shared-audit-cta" href={auditHref} aria-label={auditAriaLabel}>{auditLabel} <b>↗</b></a>}
    </div>
  </header>
}
