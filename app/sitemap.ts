import type { MetadataRoute } from 'next'

const SITE_URL = 'https://proofttl-web.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/',
    '/workspace/',
    '/studio/',
    '/worlds/',
    '/cinematics/',
    '/audit/',
    '/audit/sample/',
    '/docs/',
    '/trust/',
    '/how-proofttl-works/',
    '/solutions/',
    '/get-started/',
    '/support/',
    '/status.html',
    '/methodology.html',
    '/verify-lease.html',
  ]

  return routes.map((route, index) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? 'daily' : 'weekly',
    priority: index === 0 ? 1 : route === '/workspace/' ? 0.9 : 0.7,
  }))
}
