'use client'

import { useEffect } from 'react'

export default function HomepageControlBridge() {
  useEffect(() => {
    if (window.location.pathname !== '/') return

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

    return () => controls.forEach((control) => control.removeEventListener('click', openPreflight))
  }, [])

  return null
}
