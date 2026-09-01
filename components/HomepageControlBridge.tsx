'use client'

import { useEffect } from 'react'

export default function HomepageControlBridge() {
  useEffect(() => {
    if (window.location.pathname !== '/') return

    const root = document.querySelector<HTMLElement>('.ptl-ai-home')
    const controls = [
      document.querySelector<HTMLButtonElement>('button[aria-label="Attach evidence"]'),
      document.querySelector<HTMLButtonElement>('button[aria-label="Verification intake is available from the header"]'),
    ].filter(Boolean) as HTMLButtonElement[]

    const openPreflight = () => {
      window.location.assign('/stress-test/')
    }

    controls.forEach((control) => {
      control.addEventListener('click', openPreflight)
      control.setAttribute('title', 'Open Claim Preflight')
    })

    if (!root) {
      return () => controls.forEach((control) => control.removeEventListener('click', openPreflight))
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    const surfaces = Array.from(document.querySelectorAll<HTMLElement>([
      '.ptl-ai-composer',
      '.ptl-ai-workspace',
      '.ptl-ai-bento article',
      '.ptl-home-risk-grid article',
      '.ptl-home-verdict-grid article',
      '.ptl-home-delivery-card',
      '.ptl-ai-offer',
    ].join(',')))

    surfaces.forEach((surface) => surface.classList.add('ptl-motion-surface'))

    let frame = 0
    let pointerX = window.innerWidth * 0.5
    let pointerY = window.innerHeight * 0.24

    const paintPointer = () => {
      frame = 0
      const nx = ((pointerX / Math.max(window.innerWidth, 1)) - 0.5) * 2
      const ny = ((pointerY / Math.max(window.innerHeight, 1)) - 0.5) * 2
      root.style.setProperty('--ptl-pointer-x', `${pointerX}px`)
      root.style.setProperty('--ptl-pointer-y', `${pointerY}px`)
      root.style.setProperty('--ptl-pointer-nx', nx.toFixed(4))
      root.style.setProperty('--ptl-pointer-ny', ny.toFixed(4))
    }

    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion || coarsePointer) return
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(paintPointer)
    }

    const surfaceCleanups = surfaces.map((surface) => {
      const onMove = (event: PointerEvent) => {
        if (reduceMotion || coarsePointer) return
        const rect = surface.getBoundingClientRect()
        const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width)
        const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height)
        const px = rect.width ? (x / rect.width) * 100 : 50
        const py = rect.height ? (y / rect.height) * 100 : 50
        const tiltY = rect.width ? ((x / rect.width) - 0.5) * 2.2 : 0
        const tiltX = rect.height ? (((y / rect.height) - 0.5) * -1.7) : 0
        surface.style.setProperty('--ptl-local-x', `${px.toFixed(2)}%`)
        surface.style.setProperty('--ptl-local-y', `${py.toFixed(2)}%`)
        surface.style.setProperty('--ptl-tilt-x', `${tiltX.toFixed(3)}deg`)
        surface.style.setProperty('--ptl-tilt-y', `${tiltY.toFixed(3)}deg`)
      }
      const onLeave = () => {
        surface.style.setProperty('--ptl-tilt-x', '0deg')
        surface.style.setProperty('--ptl-tilt-y', '0deg')
      }
      surface.addEventListener('pointermove', onMove)
      surface.addEventListener('pointerleave', onLeave)
      return () => {
        surface.removeEventListener('pointermove', onMove)
        surface.removeEventListener('pointerleave', onLeave)
        surface.classList.remove('ptl-motion-surface')
      }
    })

    paintPointer()
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      controls.forEach((control) => control.removeEventListener('click', openPreflight))
      window.removeEventListener('pointermove', onPointerMove)
      surfaceCleanups.forEach((cleanup) => cleanup())
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
