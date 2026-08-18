export const PROOFTTL_API_URL = (
  process.env.NEXT_PUBLIC_PROOFTTL_API_URL ||
  'https://proofttl.tasx13ok.workers.dev'
).replace(/\/$/, '')

export const ASSISTANT_VOICE_ENDPOINT = `${PROOFTTL_API_URL}/assistant/voice`

export type AssistantSection =
  | 'payments'
  | 'security'
  | 'fact-leases'
  | 'usage'
  | 'api'
  | 'account'
  | 'support'
  | 'get-started'
  | 'solutions'
  | 'login'
  | 'home'

export type AssistantNavigationAction = {
  type: 'navigate'
  route: string
  section: AssistantSection
}

export type AssistantVoiceResponse = {
  transcript?: string
  response?: string
  action?: AssistantNavigationAction | null
  error?: string
  message?: string
}

const ALLOWED_TARGETS: Readonly<Record<AssistantSection, string>> = Object.freeze({
  payments: '/console/',
  security: '/console/',
  'fact-leases': '/console/',
  usage: '/console/',
  api: '/console/',
  account: '/console/',
  support: '/support/',
  'get-started': '/get-started/',
  solutions: '/solutions/',
  login: '/login/',
  home: '/',
})

export async function askProofTTLByVoice(audio: Blob, signal?: AbortSignal) {
  if (!audio.type.toLowerCase().startsWith('audio/')) {
    throw new Error('Microphone recording must have an audio/* content type.')
  }

  const response = await fetch(ASSISTANT_VOICE_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': audio.type,
    },
    body: audio,
    signal,
  })

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => ({})) as AssistantVoiceResponse
    : {}

  if (!response.ok) {
    const message = body.message || body.error || `Assistant request failed with HTTP ${response.status}.`
    throw new Error(message)
  }

  return {
    transcript: typeof body.transcript === 'string' ? body.transcript : '',
    response: typeof body.response === 'string' ? body.response : '',
    action: validateAssistantAction(body.action),
  }
}

export function validateAssistantAction(value: unknown): AssistantNavigationAction | null {
  if (!value || typeof value !== 'object') return null

  const action = value as Partial<AssistantNavigationAction>
  if (action.type !== 'navigate' || typeof action.section !== 'string' || typeof action.route !== 'string') {
    return null
  }

  if (!Object.prototype.hasOwnProperty.call(ALLOWED_TARGETS, action.section)) {
    return null
  }

  const section = action.section as AssistantSection
  const allowedRoute = ALLOWED_TARGETS[section]
  if (action.route !== allowedRoute) return null

  return {
    type: 'navigate',
    route: allowedRoute,
    section,
  }
}

export function assistantNavigationHref(action: AssistantNavigationAction) {
  const safe = validateAssistantAction(action)
  if (!safe) return null

  if (safe.route === '/console/' && safe.section !== 'home') {
    return `${safe.route}#${encodeURIComponent(safe.section)}`
  }

  return safe.route
}
