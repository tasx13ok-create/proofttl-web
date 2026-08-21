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

const SITE_URL = 'https://proofttl-web.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'ProofTTL',
  title: {
    default: 'ProofTTL — AI Workspace, Fact Leases, Coding, 3D Worlds & Cinematics',
    template: '%s | ProofTTL',
  },
  description: 'ProofTTL is an AI workspace built around L.O.V.E., source-backed Fact Leases, verification, coding, 3D world generation, cinematics, files, tasks, automations, and connected tools.',
  keywords: [
    'ProofTTL',
    'Proof TTL',
    'Fact Lease',
    'Fact Leases',
    'L.O.V.E. AI',
    'AI workspace',
    'claim verification',
    'source-backed verification',
    '3D world generation',
    'AI coding workspace',
    'AI cinematics',
  ],
  authors: [{ name: 'ProofTTL' }],
  creator: 'ProofTTL',
  publisher: 'ProofTTL',
  category: 'technology',
  generator: 'ProofTTL v1.0.0',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: { icon: '/proofttl-logo.png', apple: '/proofttl-logo.png' },
  openGraph: {
    title: 'ProofTTL — AI Workspace, Fact Leases, Coding, 3D Worlds & Cinematics',
    description: 'ProofTTL combines L.O.V.E., source-backed Fact Leases, coding, 3D worlds, cinematics, and connected workspace tools.',
    url: '/',
    siteName: 'ProofTTL',
    type: 'website',
    images: [{ url: '/proofttl-logo.png', alt: 'ProofTTL logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProofTTL — AI Workspace & Source-Backed Fact Leases',
    description: 'L.O.V.E., verification, coding, 3D worlds, cinematics, and connected workspace tools.',
    images: ['/proofttl-logo.png'],
  },
}

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#0b0f14' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'ProofTTL',
        url: SITE_URL,
        logo: `${SITE_URL}/proofttl-logo.png`,
        description: 'ProofTTL builds source-backed verification and AI workspace tools.',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'ProofTTL',
        alternateName: 'Proof TTL',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'ProofTTL',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        description: 'AI workspace with L.O.V.E., source-backed Fact Leases, coding, 3D worlds, cinematics, and connected tools.',
        creator: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }

  return (
    <html lang="en" className="dark">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
