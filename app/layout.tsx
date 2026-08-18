import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProofTTL — Truth with an expiry date',
  description: 'Expiring, source-backed Fact Leases for machines. Verify what a source supports now and monitor whether the evidence changes.',
  generator: 'ProofTTL',
  openGraph: {
    title: 'ProofTTL — Truth with an expiry date',
    description: 'Expiring, source-backed Fact Leases for machines.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0f14',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
