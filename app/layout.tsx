import type { Metadata, Viewport } from 'next'
import ProofTTLAds from '../components/ProofTTLAds'
import ProofTTLChatBar from '../components/ProofTTLChatBar'
import AccountPreferenceBridge from '../components/AccountPreferenceBridge'
import ProductNav from '../components/ProductNav'
import ProtocolNetworkStrip from '../components/ProtocolNetworkStrip'
import './globals.css'
import './nav-glass.css'
import './app-ui.css'
import './audit-sales.css'
import './security-ui.css'
import './assistant-navigation.css'
import './assistant.css'
import './chat-bar.css'
import './chat-fullscreen.css'
import './glass-polish.css'
import './account-preferences.css'
import './product-nav.css'
import './brand-polish.css'
import './workspace-polish.css'
import './workspace-shell.css'
import './worlds.css'
import './cinematics.css'

const SITE_URL = 'https://proofttl-web.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'ProofTTL',
  title: {
    default: 'ProofTTL — Source-Backed Claim Verification & AI Workspace',
    template: '%s | ProofTTL',
  },
  description: 'ProofTTL pressure-tests high-stakes factual claims against public primary sources and returns source-backed verdicts, signed Fact Leases, and verification reports.',
  keywords: [
    'ProofTTL',
    'Proof TTL',
    'claim verification',
    'source-backed verification',
    'Fact Lease',
    'Fact Leases',
    'verification audit',
    'claim stress test',
    'AI workspace',
    'L.O.V.E. AI',
  ],
  authors: [{ name: 'ProofTTL' }],
  creator: 'ProofTTL',
  publisher: 'ProofTTL',
  category: 'technology',
  generator: 'ProofTTL v1.0.0',
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
  icons: { icon: '/proofttl-mark.svg', shortcut: '/proofttl-mark.svg', apple: '/proofttl-mark.svg' },
  openGraph: {
    title: 'ProofTTL — Source-Backed Claim Verification',
    description: 'Pressure-test high-stakes claims before they cost you money, corrections, or trust.',
    url: '/',
    siteName: 'ProofTTL',
    type: 'website',
    images: [{ url: '/proofttl-lockup.svg', alt: 'ProofTTL' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProofTTL — Source-Backed Claim Verification',
    description: 'Claim stress tests, verification audits, signed Fact Leases, and source-backed evidence.',
    images: ['/proofttl-lockup.svg'],
  },
}

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#070b13' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'ProofTTL',
        url: SITE_URL,
        logo: `${SITE_URL}/proofttl-mark.svg`,
        description: 'ProofTTL provides source-backed claim verification and signed Fact Leases.',
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
        '@type': 'ProfessionalService',
        name: 'ProofTTL Verification Services',
        url: `${SITE_URL}/audit/`,
        description: 'Claim stress tests and verification audits using public primary sources, explicit verdicts, evidence, and signed Fact Leases.',
        provider: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }

  return (
    <html lang="en" className="dark">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <AccountPreferenceBridge />
        <ProtocolNetworkStrip />
        <ProductNav />
        {children}
        <ProofTTLAds />
        <ProofTTLChatBar />
      </body>
    </html>
  )
}