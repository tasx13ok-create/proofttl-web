import type { MetadataRoute } from 'next'
import { SEARCH_INTENTS } from './solutions/search-intents'
import { SERVICE_INTENTS } from './services/service-intents'

const SITE_URL = 'https://proofttl-web.vercel.app'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const generatedAt = new Date()
  const coreRoutes = [
    '/',
    '/about/',
    '/audit/',
    '/audit/sample/',
    '/ai-fact-checker/',
    '/services/',
    '/faq/',
    '/machine-definition/',
    '/glossary/',
    '/solutions/',
    '/trust/',
    '/how-proofttl-works/',
    '/docs/',
    '/privacy/',
    '/terms/',
    '/verify-lease.html',
  ]

  const routes = [
    ...coreRoutes,
    ...SERVICE_INTENTS.map((intent) => `/services/${intent.slug}/`),
    ...SEARCH_INTENTS.map((intent) => `/solutions/${intent.slug}/`),
  ]

  return routes.map((route) => {
    const isHome = route === '/'
    const isIdentity = route === '/about/' || route === '/machine-definition/'
    const isCommercial = route === '/audit/' || route === '/ai-fact-checker/' || route === '/services/' || route.startsWith('/services/')
    const isTrust = route === '/faq/' || route === '/glossary/' || route === '/trust/' || route === '/how-proofttl-works/' || route === '/privacy/' || route === '/terms/'
    return {
      url: `${SITE_URL}${route}`,
      lastModified: generatedAt,
      changeFrequency: isHome || isCommercial ? 'daily' : 'weekly',
      priority: isHome ? 1 : isIdentity || isCommercial ? 0.95 : isTrust ? 0.85 : 0.7,
    }
  })
}
