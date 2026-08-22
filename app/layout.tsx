import type { Metadata, Viewport } from 'next'
import ProofTTLAds from '../components/ProofTTLAds'
import ProofTTLChatBar from '../components/ProofTTLChatBar'
import AccountPreferenceBridge from '../components/AccountPreferenceBridge'
import ProductNav from '../components/ProductNav'
import ProtocolNetworkStrip from '../components/ProtocolNetworkStrip'
import SmoothPageMotion from '../components/SmoothPageMotion'
import './globals.css'
import './nav-glass.css'
import './app-ui.css'
import './native-controls.css'
import './studio-vscode.css'
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
const GITHUB_PROFILE = 'https://github.com/tasx13ok-create'
const GITHUB_CORE = 'https://github.com/tasx13ok-create/proofttl'
const GITHUB_WEB = 'https://github.com/tasx13ok-create/proofttl-web'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'ProofTTL',
  title: {
    default: 'ProofTTL — Source-Backed Claim Verification & Fact-Checking Service',
    template: '%s | ProofTTL',
  },
  description: 'ProofTTL is the source-backed claim verification website and service for high-stakes factual claims, including AI-generated claims. It returns explicit verdicts, evidence, and signed Fact Leases. Paid verification starts at $129.',
  keywords: [
    'ProofTTL',
    'Proof TTL',
    'ProofTTL website',
    'ProofTTL claim verification',
    'claim verification',
    'claim verification service',
    'fact checking service',
    'fact-checking service',
    'source-backed verification',
    'source-backed fact checking',
    'AI claim verification',
    'AI fact checking',
    'AI output fact checking',
    'AI hallucination checking',
    'pre-publication fact checking',
    'factual claim audit',
    'marketing claim verification',
    'research claim verification',
    'website claim audit',
    'startup claim verification',
    'due diligence claim verification',
    'Fact Lease',
    'Fact Leases',
    'verification audit',
    'claim stress test',
  ],
  authors: [{ name: 'ProofTTL', url: SITE_URL }],
  creator: 'ProofTTL',
  publisher: 'ProofTTL',
  category: 'claim verification and fact checking',
  generator: 'ProofTTL v1.0.1',
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
    title: 'ProofTTL — Source-Backed Claim Verification & Fact Checking',
    description: 'ProofTTL verifies AI-generated and human-written factual claims against sources before you publish, sell, raise, launch, or rely on them.',
    url: '/',
    siteName: 'ProofTTL',
    type: 'website',
    images: [{ url: '/proofttl-lockup.svg', alt: 'ProofTTL source-backed claim verification' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProofTTL — Source-Backed Claim Verification',
    description: 'Claim stress tests and verification audits with source evidence, explicit verdicts, and signed Fact Leases.',
    images: ['/proofttl-lockup.svg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'dark',
  themeColor: '#070b13',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Brand',
        '@id': `${SITE_URL}/#brand`,
        name: 'ProofTTL',
        alternateName: ['Proof TTL', 'ProofTTL Claim Verification'],
        url: SITE_URL,
        logo: `${SITE_URL}/proofttl-mark.svg`,
        description: 'ProofTTL is the brand for a source-backed claim verification and fact-checking service.',
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'ProofTTL',
        alternateName: ['Proof TTL', 'ProofTTL Claim Verification'],
        url: SITE_URL,
        logo: `${SITE_URL}/proofttl-mark.svg`,
        brand: { '@id': `${SITE_URL}/#brand` },
        sameAs: [GITHUB_PROFILE, GITHUB_CORE, GITHUB_WEB],
        subjectOf: [
          { '@type': 'WebPage', url: `${SITE_URL}/about/`, name: 'About ProofTTL' },
          { '@type': 'WebPage', url: `${SITE_URL}/machine-definition/`, name: 'ProofTTL Machine Definition' },
        ],
        description: 'ProofTTL is the source-backed claim verification website and service at proofttl-web.vercel.app. It checks high-stakes factual claims, including AI-generated claims, against public sources.',
        knowsAbout: [
          'claim verification',
          'fact checking',
          'AI claim verification',
          'AI output fact checking',
          'source-backed verification',
          'pre-publication fact checking',
          'marketing claim verification',
          'research claim verification',
          'factual claim auditing',
          'Fact Leases',
        ],
        makesOffer: [
          { '@id': `${SITE_URL}/audit/#stress-test-offer` },
          { '@id': `${SITE_URL}/audit/#full-audit-offer` },
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'ProofTTL',
        alternateName: ['Proof TTL', 'ProofTTL Claim Verification'],
        description: 'Official ProofTTL website for source-backed claim verification, AI fact checking, verification audits, and Fact Lease infrastructure.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        about: { '@id': `${SITE_URL}/#brand` },
      },
      {
        '@type': 'Service',
        '@id': `${SITE_URL}/audit/#claim-verification-service`,
        name: 'ProofTTL Claim Verification & Fact-Checking Service',
        serviceType: 'Source-backed claim verification and fact checking',
        url: `${SITE_URL}/audit/`,
        areaServed: 'Worldwide',
        provider: { '@id': `${SITE_URL}/#organization` },
        description: 'ProofTTL checks scoped factual claims against public sources and returns SUPPORTED, CONTRADICTED, or UNKNOWN verdicts with evidence and signed Fact Leases.',
        offers: [
          { '@id': `${SITE_URL}/audit/#stress-test-offer` },
          { '@id': `${SITE_URL}/audit/#full-audit-offer` },
        ],
      },
      {
        '@type': 'Offer',
        '@id': `${SITE_URL}/audit/#stress-test-offer`,
        name: 'ProofTTL Claim Stress Test',
        url: `${SITE_URL}/audit/#audit-intake`,
        price: '129',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        description: 'One-time source-backed verification of 3–5 high-stakes factual claims with a target 48-hour turnaround after payment and scope confirmation.',
        itemOffered: { '@id': `${SITE_URL}/audit/#claim-verification-service` },
      },
      {
        '@type': 'Offer',
        '@id': `${SITE_URL}/audit/#full-audit-offer`,
        name: 'ProofTTL Full Verification Audit',
        url: `${SITE_URL}/audit/#audit-intake`,
        price: '500',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        description: 'One-time source-backed verification audit of 10–25 claims with a target 3–5 business-day turnaround and 7 days of monitoring after payment and scope confirmation.',
        itemOffered: { '@id': `${SITE_URL}/audit/#claim-verification-service` },
      },
    ],
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="me" href={GITHUB_PROFILE} />
        <link rel="alternate" type="application/json" href="/.well-known/proofttl.json" title="ProofTTL service manifest" />
        <link rel="alternate" type="application/atom+xml" href="/feed.xml" title="ProofTTL updates" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="ProofTTL AI context" />
        <link rel="help" href="/faq/" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <SmoothPageMotion />
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
