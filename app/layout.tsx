import type { Metadata, Viewport } from 'next'
import ProofTTLAssistant from '../components/ProofTTLAssistant'
import ProofTTLAds from '../components/ProofTTLAds'
import ProofTTLChatBar from '../components/ProofTTLChatBar'
import './globals.css'
import './nav-glass.css'
import './app-ui.css'
import './security-ui.css'
import './assistant-navigation.css'
import './assistant.css'
import './chat-bar.css'
import './glass-polish.css'
import './mobile-nav.css'
import './specter.css'

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
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <ProofTTLAds />
        <ProofTTLChatBar />
        <ProofTTLAssistant />
      </body>
    </html>
  )
}
