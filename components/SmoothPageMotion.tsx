'use client'

import { useEffect } from 'react'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hasIndependentScroll(target: EventTarget | null, direction: number) {
  let node = target instanceof HTMLElement ? target : null
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node)
    const overflowY = style.overflowY
    const canScroll = (overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 1
    if (canScroll) {
      if (direction < 0 && node.scrollTop > 0) return true
      if (direction > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true
    }
    node = node.parentElement
  }
  return false
}

export default function SmoothPageMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    if (reducedMotion.matches || coarsePointer.matches) return

    let targetY = window.scrollY
    let frame = 0
    let animating = false
    let internalScroll = false

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    const animate = () => {
      const current = window.scrollY
      const distance = targetY - current
      if (Math.abs(distance) < 0.55) {
        window.scrollTo(0, targetY)
        animating = false
        frame = 0
        return
      }
      internalScroll = true
      window.scrollTo(0, current + distance * 0.16)
      internalScroll = false
      frame = window.requestAnimationFrame(animate)
    }

    const start = () => {
      if (animating) return
      animating = true
      frame = window.requestAnimationFrame(animate)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
      if (hasIndependentScroll(event.target, event.deltaY)) return

      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 24 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1
      const delta = clamp(event.deltaY * multiplier, -180, 180)
      if (!delta) return

      event.preventDefault()
      targetY = clamp(targetY + delta * 0.92, 0, maxScroll())
      start()
    }

    const onScroll = () => {
      if (!internalScroll && !animating) targetY = window.scrollY
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (['Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
        if (frame) window.cancelAnimationFrame(frame)
        frame = 0
        animating = false
        targetY = window.scrollY
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return null
}