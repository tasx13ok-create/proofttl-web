import type { Metadata } from 'next'
import Foundry10Client from './Foundry10Client'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'FOUNDRY-10 — Autonomous Revenue Lab',
  description: 'Operator control room for the FOUNDRY-10 supervised autonomous revenue system.',
  robots: { index: false, follow: false },
}

export default function Foundry10Page() {
  return (
    <main className={styles.page}>
      <Foundry10Client />
    </main>
  )
}
