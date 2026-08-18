export const PROOFTTL_API_URL = (
  process.env.NEXT_PUBLIC_PROOFTTL_API_URL ||
  'https://proofttl.tasx13ok.workers.dev'
).replace(/\/$/, '')

export const ASSISTANT_VOICE_ENDPOINT = `${PROOFTTL_API_URL}/assistant/voice`
export const ASSISTANT_TEXT_ENDPOINT = `${PROOFTTL_API_URL}/assistant/text`
export const ASSISTANT_USAGE_ENDPOINT = `${PROOFTTL_API_URL}/assistant/usage`

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

export type AssistantQuota = {
  allowed?: boolean
  authenticated?: boolean
  plan?: string
  membership_status?: string
  limit?: number
  used?: number | null
  remaining?: number | null
  reset?: string
  retry_after_seconds?: number
  accounting_backend?: string
}

export type LoveCapability = {
  persona?: string
  expansion?: string
  voice_mode?: boolean
  member_only?: boolean
  preview_enabled?: boolean
  plan?: string
  speaker?: string
}

export type LoveSpeech = {
  available?: boolean
  reason?: string
  mime_type?: string
  audio_base64?: string
  model?: string
  speaker?: string
}

export type AssistantHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantLeaseGrounding = {
  requested?: boolean
  found?: boolean
  lease_id?: string
}

export type AssistantContext = {
  history_messages_used?: number
  max_history_messages?: number
  lease_grounding?: AssistantLeaseGrounding | null
}

export type AssistantInference = {
  response_model?: string | null
  deterministic_route?: boolean
  empty_response_retry?: boolean
  improvement_observation?: string
  conversation_strategy?: string
  casual_turn?: boolean
  lease_grounded?: boolean
}

export type AssistantResponse = {
  transcript?: string
  message?: string
  response?: string
  action?: AssistantNavigationAction | null
  quota?: AssistantQuota
  love?: LoveCapability
  speech?: LoveSpeech
  context?: AssistantContext
  inference?: AssistantInference
  error?: string
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

export async function fetchProofTTLAssistantUsage(signal?: AbortSignal) {
  const response = await fetch(ASSISTANT_USAGE_ENDPOINT, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    signal,
  })

  const body = await response.json().catch(() => ({})) as { quota?: AssistantQuota; message?: string; error?: string }
  if (!response.ok) {
    throw new Error(body.message || body.error || `Assistant usage request failed with HTTP ${response.status}.`)
  }
  return body.quota || null
}

export async function askProofTTLByVoice(audio: Blob, signal?: AbortSignal) {
  if (!audio.type.toLowerCase().startsWith('audio/')) {
    throw new Error('Microphone recording must have an audio/* content type.')
  }

  const response = await fetch(ASSISTANT_VOICE_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': audio.type },
    body: audio,
    signal,
  })

  const body = await readAssistantResponse(response)

  return {
    transcript: typeof body.transcript === 'string' ? body.transcript : '',
    response: typeof body.response === 'string' ? body.response : '',
    action: validateAssistantAction(body.action),
    quota: body.quota,
    love: body.love,
    speech: body.speech,
    context: body.context,
    inference: body.inference,
  }
}

export async function askProofTTLByText(
  message: string,
  history: AssistantHistoryMessage[] = [],
  signal?: AbortSignal,
) {
  const clean = message.replace(/\s+/g, ' ').trim().slice(0, 1200)
  if (!clean) throw new Error('Enter a ProofTTL question.')

  const boundedHistory = history
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: item.content.replace(/\s+/g, ' ').trim().slice(0, 600),
    }))
    .filter((item) => item.content)

  const response = await fetch(ASSISTANT_TEXT_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: clean, history: boundedHistory }),
    signal,
  })

  const body = await readAssistantResponse(response)

  return {
    message: clean,
    response: typeof body.response === 'string' ? body.response : '',
    action: validateAssistantAction(body.action),
    quota: body.quota,
    context: body.context,
    inference: body.inference,
  }
}

async function readAssistantResponse(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => ({})) as AssistantResponse
    : {}

  if (!response.ok) {
    const message = body.message || body.error || `Assistant request failed with HTTP ${response.status}.`
    throw new Error(message)
  }

  return body
}

export function loveSpeechDataUrl(speech?: LoveSpeech) {
  if (!speech?.available || !speech.audio_base64) return null
  const mime = speech.mime_type || 'audio/mpeg'
  return `data:${mime};base64,${speech.audio_base64}`
}

export function validateAssistantAction(value: unknown): AssistantNavigationAction | null {
  if (!value || typeof value !== 'object') return null

  const action = value as Partial<AssistantNavigationAction>
  if (action.type !== 'navigate' || typeof action.section !== 'string' || typeof action.route !== 'string') {
    return null
  }

  if (!Object.prototype.hasOwnProperty.call(ALLOWED_TARGETS, action.section)) return null

  const section = action.section as AssistantSection
  const allowedRoute = ALLOWED_TARGETS[section]
  if (action.route !== allowedRoute) return null

  return { type: 'navigate', route: allowedRoute, section }
}

export function assistantNavigationHref(action: AssistantNavigationAction) {
  const safe = validateAssistantAction(action)
  if (!safe) return null

  if (safe.route === '/console/' && safe.section !== 'home') {
    return `${safe.route}#${encodeURIComponent(safe.section)}`
  }

  return safe.route
}
