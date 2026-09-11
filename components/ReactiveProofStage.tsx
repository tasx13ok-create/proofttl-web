'use client'

import { useEffect, useRef, useState } from 'react'

type Point3D = readonly [number, number, number]

const OUTER_POINTS: Point3D[] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
]

const INNER_POINTS: Point3D[] = [
  [0, -1.42, 0], [1.42, 0, 0], [0, 1.42, 0], [-1.42, 0, 0],
  [0, 0, -1.42], [0, 0, 1.42],
]

const EDGES: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
  [8, 9], [9, 10], [10, 11], [11, 8], [8, 12], [9, 12], [10, 12], [11, 12],
  [8, 13], [9, 13], [10, 13], [11, 13],
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function rotate([x, y, z]: Point3D, rx: number, ry: number, rz: number): Point3D {
  const cosX = Math.cos(rx)
  const sinX = Math.sin(rx)
  const cosY = Math.cos(ry)
  const sinY = Math.sin(ry)
  const cosZ = Math.cos(rz)
  const sinZ = Math.sin(rz)
  const y1 = y * cosX - z * sinX
  const z1 = y * sinX + z * cosX
  const x2 = x * cosY + z1 * sinY
  const z2 = -x * sinY + z1 * cosY
  return [x2 * cosZ - y1 * sinZ, x2 * sinZ + y1 * cosZ, z2]
}

export default function ReactiveProofStage() {
  const [paused, setPaused] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const cursor = cursorRef.current
    const cursorDots = cursor ? Array.from(cursor.querySelectorAll<HTMLElement>('i')) : []
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
    const trail = cursorDots.map(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))

    let width = 1
    let height = 1
    let pixelRatio = 1
    let frame = 0
    let visible = !document.hidden
    let inView = true
    let cursorUntil = 0
    let scrollProgress = 0
    let lastTime = performance.now()

    const schedule = () => {
      if (visible && !frame) frame = window.requestAnimationFrame(draw)
    }

    const resize = () => {
      const rect = stage.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      schedule()
    }

    const updateScroll = () => {
      if (reducedMotion.matches || paused) return
      const rect = stage.getBoundingClientRect()
      const travel = window.innerHeight + rect.height
      scrollProgress = clamp((window.innerHeight - rect.top) / Math.max(travel, 1), 0, 1)
      stage.style.setProperty('--proof-scroll', scrollProgress.toFixed(4))
    }

    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion.matches || paused) return
      const rect = stage.getBoundingClientRect()
      pointer.targetX = clamp(((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2, -1, 1)
      pointer.targetY = clamp(((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2, -1, 1)
      stage.style.setProperty('--proof-x', `${((pointer.targetX + 1) * 50).toFixed(2)}%`)
      stage.style.setProperty('--proof-y', `${((pointer.targetY + 1) * 50).toFixed(2)}%`)
      stage.style.setProperty('--proof-tilt-x', `${(-pointer.targetY * 1.4).toFixed(3)}deg`)
      stage.style.setProperty('--proof-tilt-y', `${(pointer.targetX * 1.8).toFixed(3)}deg`)
      stage.style.setProperty('--proof-grid-x', `${(-pointer.targetX * 8).toFixed(2)}px`)
    }

    const updateCursorTarget = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || paused || !cursor) return
      if (cursor.dataset.visible !== 'true') trail.forEach((point) => {
        point.x = event.clientX
        point.y = event.clientY
      })
      cursorUntil = performance.now() + 700
      schedule()
      trail[0].x = event.clientX
      trail[0].y = event.clientY
      cursor.dataset.visible = 'true'
      cursor.dataset.pressed = event.buttons ? 'true' : 'false'
    }

    const hideCursor = () => {
      if (cursor) cursor.dataset.visible = 'false'
    }

    const project = (point: Point3D, rx: number, ry: number, rz: number, scale: number) => {
      const [x, y, z] = rotate(point, rx, ry, rz)
      const perspective = 4.6 / (5.2 - z)
      return {
        x: width * 0.5 + x * scale * perspective,
        y: height * 0.47 + y * scale * perspective,
        z,
        perspective,
      }
    }

    const draw = (now: number) => {
      frame = 0
      const still = reducedMotion.matches || paused
      if (inView) {
      const delta = Math.min(48, now - lastTime)
      lastTime = now
      pointer.x += (pointer.targetX - pointer.x) * Math.min(1, delta * 0.0048)
      pointer.y += (pointer.targetY - pointer.y) * Math.min(1, delta * 0.0048)

      context.clearRect(0, 0, width, height)
      const t = still ? 0.55 : now * 0.00022
      const rx = -0.32 + (still ? 0 : pointer.y * 0.24 + scrollProgress * 0.5)
      const ry = 0.68 + t + (still ? 0 : pointer.x * 0.42 + scrollProgress * 1.2)
      const rz = 0.08 + Math.sin(t * 0.8) * 0.08
      const scale = Math.min(width, height) * 0.34
      const points = [...OUTER_POINTS, ...INNER_POINTS].map((point) => project(point, rx, ry, rz, scale))

      const glow = context.createRadialGradient(width * 0.52, height * 0.47, 10, width * 0.52, height * 0.47, scale * 1.65)
      glow.addColorStop(0, 'rgba(181,205,255,0.11)')
      glow.addColorStop(0.45, 'rgba(132,155,220,0.045)')
      glow.addColorStop(1, 'rgba(9,13,21,0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      context.save()
      context.globalCompositeOperation = 'lighter'
      EDGES.forEach(([a, b], index) => {
        const from = points[a]
        const to = points[b]
        const depth = clamp(((from.z + to.z) / 2 + 1.8) / 3.6, 0.15, 1)
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.lineTo(to.x, to.y)
        context.strokeStyle = index < 12
          ? `rgba(181,205,255,${0.12 + depth * 0.36})`
          : `rgba(226,232,255,${0.08 + depth * 0.26})`
        context.lineWidth = index < 12 ? 1 : 0.72
        context.stroke()
      })

      points.forEach((point, index) => {
        const radius = (index < 8 ? 2.2 : 1.7) * point.perspective
        context.beginPath()
        context.arc(point.x, point.y, radius + 3.2, 0, Math.PI * 2)
        context.fillStyle = 'rgba(181,205,255,0.035)'
        context.fill()
        context.beginPath()
        context.arc(point.x, point.y, Math.max(1.1, radius), 0, Math.PI * 2)
        context.fillStyle = point.z > 0 ? 'rgba(232,239,255,0.82)' : 'rgba(143,167,220,0.45)'
        context.fill()
      })

      for (let ring = 0; ring < 3; ring += 1) {
        const phase = t * (0.7 + ring * 0.16) + ring * 2.1
        const orbitRadius = scale * (0.82 + ring * 0.19)
        const ox = width * 0.5 + Math.cos(phase) * orbitRadius
        const oy = height * 0.47 + Math.sin(phase * 1.23) * orbitRadius * 0.34
        context.beginPath()
        context.arc(ox, oy, 1.9 + ring * 0.3, 0, Math.PI * 2)
        context.fillStyle = ring === 1 ? 'rgba(221,177,255,0.78)' : 'rgba(181,205,255,0.78)'
        context.shadowBlur = 16
        context.shadowColor = context.fillStyle
        context.fill()
      }
      context.restore()
      stage.dataset.canvasReady = 'true'
      }

      if (cursor && finePointer.matches && !still) {
        for (let index = 1; index < trail.length; index += 1) {
          const leader = trail[index - 1]
          const dot = trail[index]
          const ease = Math.max(0.08, 0.34 - index * 0.035)
          dot.x += (leader.x - dot.x) * ease
          dot.y += (leader.y - dot.y) * ease
        }
        cursorDots.forEach((dot, index) => {
          const position = trail[index]
          dot.style.transform = `translate3d(${position.x}px,${position.y}px,0) translate(-50%,-50%) scale(${1 - index * 0.1})`
        })
      }

      if (visible && !still && (inView || now < cursorUntil)) schedule()
    }

    const onVisibility = () => {
      visible = !document.hidden
      if (visible) {
        lastTime = performance.now()
        schedule()
      } else {
        window.cancelAnimationFrame(frame)
        frame = 0
        hideCursor()
      }
    }
    const onPreference = () => {
      hideCursor()
      schedule()
    }
    const resetPointer = () => {
      pointer.targetX = 0
      pointer.targetY = 0
      stage.style.setProperty('--proof-tilt-x', '0deg')
      stage.style.setProperty('--proof-tilt-y', '0deg')
    }
    const intersection = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      stage.dataset.inView = String(inView)
      if (inView) schedule()
    })
    intersection.observe(stage)
    reducedMotion.addEventListener('change', onPreference)
    finePointer.addEventListener('change', onPreference)
    stage.addEventListener('pointerleave', resetPointer)
    const observer = new ResizeObserver(resize)
    observer.observe(stage)
    resize()
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    stage.addEventListener('pointermove', updatePointer, { passive: true })
    window.addEventListener('pointermove', updateCursorTarget, { passive: true })
    document.documentElement.addEventListener('mouseleave', hideCursor)
    document.addEventListener('visibilitychange', onVisibility)
    schedule()

    return () => {
      observer.disconnect()
      intersection.disconnect()
      reducedMotion.removeEventListener('change', onPreference)
      finePointer.removeEventListener('change', onPreference)
      stage.removeEventListener('pointerleave', resetPointer)
      window.removeEventListener('scroll', updateScroll)
      stage.removeEventListener('pointermove', updatePointer)
      window.removeEventListener('pointermove', updateCursorTarget)
      document.documentElement.removeEventListener('mouseleave', hideCursor)
      document.removeEventListener('visibilitychange', onVisibility)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [paused])

  return (
    <>
      <div className="ptl-proof-stage" ref={stageRef} data-paused={paused} aria-label="Interactive claim, evidence, and verdict model">
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="ptl-proof-fallback" aria-hidden="true"><i /><i /><i /></div>
        <div className="ptl-proof-orbit ptl-proof-orbit-a" aria-hidden="true" />
        <div className="ptl-proof-orbit ptl-proof-orbit-b" aria-hidden="true" />
        <div className="ptl-proof-stage-head"><span>METHOD VISUALIZATION</span><button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Resume visual motion" : "Pause visual motion"}>{paused ? "PLAY ↗" : "PAUSE Ⅱ"}</button></div>
        <div className="ptl-proof-stage-labels" aria-hidden="true">
          <span>01 · CLAIM</span><span>02 · EVIDENCE</span><span>03 · VERDICT</span>
        </div>
        <div className="ptl-proof-stage-foot"><span>SUPPORTED</span><span>CONTRADICTED</span><span>UNKNOWN</span></div>
      </div>
      <div className="ptl-cursor-tracer" ref={cursorRef} data-visible="false" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => <i key={index} />)}
      </div>
    </>
  )
}
