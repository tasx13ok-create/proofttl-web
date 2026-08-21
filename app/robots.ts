import type { MetadataRoute } from 'next'

const SITE_URL = 'https://proofttl-web.vercel.app'
const PRIVATE_PATHS = ['/api/', '/account/', '/console/']

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const discoveryBots = [
    'OAI-SearchBot',
    'ChatGPT-User',
    'GPTBot',
    'PerplexityBot',
    'ClaudeBot',
    'Googlebot',
    'Google-Extended',
    'bingbot',
    'CCBot',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      ...discoveryBots.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
