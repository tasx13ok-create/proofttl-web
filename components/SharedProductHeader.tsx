'use client'

import { useEffect, useRef, useState } from 'react'

export default function SharedProductHeader() {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastY.current

      if (currentY < 48) {
        setHidden(false)
      } else if (delta > 7) {
        setHidden(true)
      } else if (delta < -7) {
        setHidden(false)
      }

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
      <a className="ptl-shared-audit-cta" href="/audit/#audit-intake">Start audit <b>↗</b></a>
    </div>
  </header>
}
