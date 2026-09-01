import type { Metadata, Viewport } from 'next'
import ProofTTLAds from '../components/ProofTTLAds'
import AppOnlyChatBar from '../components/AppOnlyChatBar'
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
import './premium-public.css'
import './centered-ui.css'
import './detail-pages.css'

const SITE_URL = 'https://proofttl-web.vercel.app'
const GITHUB_PROFILE = 'https://github.com/tasx13ok-create'
const GITHUB_CORE = 'https://github.com/tasx13ok-create/proofttl'
const GITHUB_WEB = 'https://github.com/tasx13ok-create/proofttl-web'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'ProofTTL',
  title: { default: 'ProofTTL — Adversarial Fact Audits for High-Consequence AI', template: '%s | ProofTTL' },
  description: 'ProofTTL runs $1,500 fixed-scope Fact Audits on up to 25 real AI outputs or factual claims, ranking consequence, checking authoritative evidence, preserving uncertainty, and requiring human approval before customer-facing findings.',
  keywords: ['ProofTTL','Proof TTL','Fact Audit','AI fact audit','AI claim verification','AI output fact checking','AI hallucination checking','source-backed verification','claim verification','fact checking service','adversarial verification','pre-publication fact checking','factual claim audit','high-consequence AI'],
  authors: [{ name: 'ProofTTL', url: SITE_URL }], creator: 'ProofTTL', publisher: 'ProofTTL', category: 'claim verification and fact checking', generator: 'ProofTTL v1.0.1',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  icons: { icon: '/proofttl-mark.svg', shortcut: '/proofttl-mark.svg', apple: '/proofttl-mark.svg' },
  openGraph: { title: 'ProofTTL — Adversarial Fact Audits for High-Consequence AI', description: 'Audit real AI outputs and high-stakes factual claims against authoritative evidence before customers find the expensive wrong answer.', url: '/', siteName: 'ProofTTL', type: 'website', images: [{ url: '/proofttl-lockup.svg', alt: 'ProofTTL adversarial Fact Audit' }] },
  twitter: { card: 'summary_large_image', title: 'ProofTTL — Adversarial Fact Audits', description: 'Fixed-scope audits of real AI outputs with authoritative evidence, explicit verdicts, consequence ranking, and human approval.', images: ['/proofttl-lockup.svg'] },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, colorScheme: 'dark', themeColor: '#071018' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = { '@context': 'https://schema.org', '@graph': [
    { '@type':'Brand','@id':`${SITE_URL}/#brand`,name:'ProofTTL',alternateName:['Proof TTL','ProofTTL Fact Audit'],url:SITE_URL,logo:`${SITE_URL}/proofttl-mark.svg`,description:'ProofTTL is the brand for adversarial, source-backed Fact Audits of high-consequence AI outputs and factual claims.' },
    { '@type':'Organization','@id':`${SITE_URL}/#organization`,name:'ProofTTL',alternateName:['Proof TTL','ProofTTL Fact Audit'],url:SITE_URL,logo:`${SITE_URL}/proofttl-mark.svg`,brand:{'@id':`${SITE_URL}/#brand`},sameAs:[GITHUB_PROFILE,GITHUB_CORE,GITHUB_WEB],subjectOf:[{'@type':'WebPage',url:`${SITE_URL}/about/`,name:'About ProofTTL'},{'@type':'WebPage',url:`${SITE_URL}/machine-definition/`,name:'ProofTTL Machine Definition'}],description:'ProofTTL audits real AI outputs and high-stakes factual claims against authoritative sources, ranks findings by consequence, and requires human approval before customer-facing publication.',knowsAbout:['claim verification','fact checking','AI claim verification','AI output fact checking','source-backed verification','adversarial verification','factual claim auditing'],makesOffer:[{'@id':`${SITE_URL}/audit/#fact-audit-offer`}] },
    { '@type':'WebSite','@id':`${SITE_URL}/#website`,url:SITE_URL,name:'ProofTTL',alternateName:['Proof TTL','ProofTTL Fact Audit'],description:'Official ProofTTL website for adversarial Fact Audits and source-backed verification.',publisher:{'@id':`${SITE_URL}/#organization`},about:{'@id':`${SITE_URL}/#brand`} },
    { '@type':'Service','@id':`${SITE_URL}/audit/#fact-audit-service`,name:'ProofTTL Fact Audit',serviceType:'Adversarial source-backed fact audit',url:`${SITE_URL}/audit/`,areaServed:'Worldwide',provider:{'@id':`${SITE_URL}/#organization`},description:'A fixed-scope audit of up to 25 real outputs or claims with consequence ranking, deep verification of highest-risk findings, authoritative evidence, human-approved proof artifacts, and seven days of monitoring on important findings.',offers:[{'@id':`${SITE_URL}/audit/#fact-audit-offer`}] },
    { '@type':'Offer','@id':`${SITE_URL}/audit/#fact-audit-offer`,name:'ProofTTL Fact Audit',url:`${SITE_URL}/audit/#audit-intake`,price:'1500',priceCurrency:'USD',availability:'https://schema.org/InStock',description:'One-time fixed-scope Fact Audit of up to 25 real outputs or claims, including consequence ranking, deep verification of highest-risk findings, authoritative FOR/AGAINST evidence, human-approved proof artifacts, and seven days of monitoring on important findings.',itemOffered:{'@id':`${SITE_URL}/audit/#fact-audit-service`} }
  ] }

  return <html lang="en" className="dark"><head><link rel="me" href={GITHUB_PROFILE}/><link rel="alternate" type="application/json" href="/.well-known/proofttl.json" title="ProofTTL service manifest"/><link rel="alternate" type="application/atom+xml" href="/feed.xml" title="ProofTTL updates"/><link rel="alternate" type="text/plain" href="/llms.txt" title="ProofTTL AI context"/><link rel="help" href="/faq/"/></head><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/><SmoothPageMotion/><AccountPreferenceBridge/><ProtocolNetworkStrip/><ProductNav/>{children}<ProofTTLAds/><AppOnlyChatBar/></body></html>
}
