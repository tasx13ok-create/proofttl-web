import type { MetadataRoute } from 'next'
import { SEARCH_INTENTS } from './solutions/search-intents'
import { SERVICE_INTENTS } from './services/service-intents'

const SITE_URL = 'https://proofttl-web.vercel.app'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes = [
    '/',
    '/audit/',
    '/audit/sample/',
    '/services/',
    '/faq/',
    '/machine-definition/',
    '/glossary/',
    '/solutions/',
    '/trust/',
    '/how-proofttl-works/',
    '/docs/',
    '/get-started/',
    '/support/',
    '/workspace/',
    '/studio/',
    '/status.html',
    '/methodology.html',
    '/verify-lease.html',
  ]

  const routes = [
    ...coreRoutes,
    ...SERVICE_INTENTS.map((intent) => `/services/${intent.slug}/`),
    ...SEARCH_INTENTS.map((intent) => `/solutions/${intent.slug}/`),
  ]

  return routes.map((route) => {
    const isHome = route === '/'
    const isCommercial = route === '/audit/' || route === '/services/' || route.startsWith('/services/')
    const isTrust = route === '/faq/' || route === '/machine-definition/' || route === '/glossary/' || route === '/trust/' || route === '/how-proofttl-works/'
    return {
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: isHome || isCommercial ? 'daily' : 'weekly',
      priority: isHome ? 1 : isCommercial ? 0.95 : isTrust ? 0.85 : 0.7,
    }
  })
}
