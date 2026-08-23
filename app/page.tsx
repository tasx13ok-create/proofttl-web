import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
}

export default function Home() {
  return <HomeClient />
}
