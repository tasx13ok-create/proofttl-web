import type { Metadata, Viewport } from 'next'
import ProofTTLAds from '../components/ProofTTLAds'
import ProofTTLChatBar from '../components/ProofTTLChatBar'
import ProofTTLSalesCTA from '../components/ProofTTLSalesCTA'
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

const trustLinkStyle = {
  color: '#a5f3fc',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>
        <div
          data-proofttl-network-banner="testnet"
          style={{
            position: 'relative',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            flexWrap: 'wrap',
            padding: '8px 16px',
            borderBottom: '1px solid rgba(251,191,36,.2)',
            background: 'rgba(30,22,6,.92)',
            color: '#fde68a',
            font: "10px 'IBM Plex Mono', ui-monospace, monospace",
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          <strong>TESTNET PREVIEW</strong>
          <span>Base Sepolia settlement · Mainnet disabled</span>
          <span aria-hidden="true">·</span>
          <a href="/verify-lease.html" style={trustLinkStyle}>Verify Lease</a>
          <a href="/lease-ops.html" style={trustLinkStyle}>Lease Ops</a>
          <a href="/methodology.html" style={trustLinkStyle}>Methodology</a>
          <a href="/status.html" style={trustLinkStyle}>Status</a>
        </div>
        {children}
        <ProofTTLAds />
        <ProofTTLSalesCTA />
        <ProofTTLChatBar />
      </body>
    </html>
  )
}
