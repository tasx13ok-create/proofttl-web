import { PROOFTTL_API_URL } from './proofttl-assistant'

export const ASSISTANT_VISUALS_ENDPOINT = `${PROOFTTL_API_URL}/assistant/visuals`

export type LoveVisual = {
  type: 'image'
  title: string
  alt: string
  image_url: string
  source_url: string
  source_name: string
  provider: string
  artist?: string
  license?: string
  license_url?: string
  width?: number
  height?: number
}

export type LoveVisualResult = {
  query: string
  provider: string
  visuals: LoveVisual[]
  count: number
  source_policy: string
}

const VISUAL_PATTERNS = [
  /^(?:please\s+)?(?:show|give)\s+me\s+(?:a|an|the|some)?\s*(?:picture|photo|image|visual|diagram)?\s*(?:of\s+)?(.+)$/i,
  /^(?:find|show)\s+(?:a|an|the|some)?\s*(?:picture|photo|image|visual|diagram)s?\s+(?:of|for)\s+(.+)$/i,
  /^(?:what\s+does|what\s+do)\s+(.+?)\s+look\s+like\??$/i,
  /^(?:picture|photo|image|visual|diagram)\s+(?:of|for)\s+(.+)$/i,
]

export function relevantVisualQuery(message: string) {
  const text = message.replace(/\s+/g, ' ').trim()
  if (!text || text.length > 500) return null
  for (const pattern of VISUAL_PATTERNS) {
    const match = text.match(pattern)
    if (!match?.[1]) continue
    const clean = match[1].replace(/[?.!]+$/, '').replace(/^(?:a|an|the)\s+/i, '').trim().slice(0, 120)
    if (clean) return clean
  }
  return null
}

export async function fetchRelevantVisuals(message: string, signal?: AbortSignal): Promise<LoveVisualResult | null> {
  const query = relevantVisualQuery(message)
  if (!query) return null

  const response = await fetch(`${ASSISTANT_VISUALS_ENDPOINT}?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  const body = await response.json().catch(() => ({})) as Partial<LoveVisualResult> & { error?: string; message?: string }
  if (!response.ok) throw new Error(body.message || body.error || `Visual search failed with HTTP ${response.status}.`)
  if (!Array.isArray(body.visuals)) return null

  const visuals = body.visuals
    .filter((item): item is LoveVisual => Boolean(
      item &&
      item.type === 'image' &&
      typeof item.image_url === 'string' && item.image_url.startsWith('https://') &&
      typeof item.source_url === 'string' && item.source_url.startsWith('https://')
    ))
    .slice(0, 4)

  return {
    query: typeof body.query === 'string' ? body.query : query,
    provider: typeof body.provider === 'string' ? body.provider : 'unknown',
    visuals,
    count: visuals.length,
    source_policy: typeof body.source_policy === 'string' ? body.source_policy : 'provider_returned_only',
  }
}
