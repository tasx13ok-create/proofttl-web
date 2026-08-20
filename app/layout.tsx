import type { Metadata, Viewport } from 'next'
import ProofTTLAds from '../components/ProofTTLAds'
import ProofTTLChatBar from '../components/ProofTTLChatBar'
import ProofTTLSalesCTA from '../components/ProofTTLSalesCTA'
import AccountPreferenceBridge from '../components/AccountPreferenceBridge'
import ProductNav from '../components/ProductNav'
import './globals.css'
import './nav-glass.css'
import './app-ui.css'
import './security-ui.css'
import './assistant-navigation.css'
import './assistant.css'
import './chat-bar.css'
import './chat-fullscreen.css'
import './glass-polish.css'
import './sales-cta.css'
import './account-preferences.css'
import './product-nav.css'
import './workspace-polish.css'
import './workspace-shell.css'
import './worlds.css'
import './cinematics.css'

export const metadata: Metadata = {
  title: 'ProofTTL v1.0.0 — Workspace intelligence, verification, and creation',
  description: 'L.O.V.E. is the intelligence and control layer across ProofTTL Workspace: verification, coding, 3D worlds, cinematics, files, tasks, automations, integrations, and connected tools.',
  generator: 'ProofTTL v1.0.0',
  openGraph: {
    title: 'ProofTTL v1.0.0 — Workspace intelligence, verification, and creation',
    description: 'One Workspace for L.O.V.E., verification, coding, 3D worlds, cinematics, files, tasks, automations, and connected tools.',
    type: 'website',
  },
}

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#0b0f14' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AccountPreferenceBridge />
        <div className="product-network-strip" data-proofttl-network-banner="testnet">
          <strong>PROOFTTL v1.0.0 · TESTNET PREVIEW</strong>
          <span>Protocol settlement: Base Sepolia · Mainnet disabled</span>
          <span aria-hidden="true">·</span>
          <a href="/trust/">Trust boundary</a>
        </div>
        <ProductNav />
        {children}
        <ProofTTLAds />
        <ProofTTLSalesCTA />
        <ProofTTLChatBar />
      </body>
    </html>
  )
}
