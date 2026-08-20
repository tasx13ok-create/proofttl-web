import { createProofTTLActionPlan, planProofTTLCommand } from './proofttl-command'

export const PROOFTTL_API_URL = (
  process.env.NEXT_PUBLIC_PROOFTTL_API_URL ||
  'https://proofttl.tasx13ok.workers.dev'
).replace(/\/$/, '')

export const ASSISTANT_VOICE_ENDPOINT = `${PROOFTTL_API_URL}/assistant/voice`
export const ASSISTANT_TEXT_ENDPOINT = `${PROOFTTL_API_URL}/assistant/text`
export const ASSISTANT_SPEECH_ENDPOINT = `${PROOFTTL_API_URL}/assistant/speech`
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
  | 'trust'
  | 'how-it-works'
  | 'studio'
  | 'workspace'
  | 'money'
  | 'work'
  | 'files'
  | 'automations'
  | 'connections'
  | 'audit'
  | 'audit-status'
  | 'docs'
  | 'methodology'
  | 'service-status'
  | 'lease-verifier'
  | 'lease-ops'
  | 'live-verifier'

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
  source?: string
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
  client_command?: boolean
  command_planner?: boolean
  action_id?: string
  action_risk?: string
  final_response_tts?: boolean
  tts_error?: string
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
  trust: '/trust/',
  'how-it-works': '/how-proofttl-works/',
  studio: '/studio/',
  workspace: '/workspace/',
  money: '/money/',
  work: '/work/',
  files: '/files/',
  automations: '/automations/',
  connections: '/connections/',
  audit: '/audit/',
  'audit-status': '/audit/status/',
  docs: '/docs/',
  methodology: '/methodology.html',
  'service-status': '/status.html',
  'lease-verifier': '/verify-lease.html',
  'lease-ops': '/lease-ops.html',
  'live-verifier': '/#verify',
})

type LocalLoveCommand = {
  response: string
  action?: AssistantNavigationAction | null
  execute?: () => void
}

type NavigationRule = {
  section: AssistantSection
  label: string
  patterns: RegExp[]
}

const NAVIGATION_COMMAND_PREFIX = /\b(?:go(?:\s+to)?|open|show|take\s+me(?:\s+to)?|bring\s+me(?:\s+to)?|navigate(?:\s+to)?|view|visit|head(?:\s+to)?|switch(?:\s+to)?)\b/i

const LOCAL_NAVIGATION_RULES: NavigationRule[] = [
  { section: 'home', label: 'Home', patterns: [/\bhome(?:\s*page)?\b/i, /\bhomepage\b/i, /\bmain\s*page\b/i] },
  { section: 'workspace', label: 'Workspace', patterns: [/\bworkspace\b/i, /\bcommand\s+center\b/i, /\bcontrol\s+center\b/i, /\bai\s+os\b/i, /\bmain\s+menu\b/i, /\bmain\s+workspace\b/i, /\bdashboard\b/i] },
  { section: 'money', label: 'Money', patterns: [/\bmoney\b/i, /\bfinancial\b/i, /\bbanking\b/i] },
  { section: 'work', label: 'Work', patterns: [/\bwork\b/i, /\bemail\b/i, /\bcalendar\b/i] },
  { section: 'files', label: 'Files', patterns: [/\bfiles?\b/i, /\blibrary\b/i] },
  { section: 'automations', label: 'Automations', patterns: [/\bautomations?\b/i] },
  { section: 'connections', label: 'Connections', patterns: [/\bconnections?\b/i, /\bintegrations?\b/i, /\bproviders?\b/i] },
  { section: 'account', label: 'Account settings', patterns: [/\bsettings?\b/i, /\baccount(?:\s+settings?)?\b/i, /\bprofile\b/i] },
  { section: 'security', label: 'Security', patterns: [/\bsecurity\b/i, /\bpasskeys?\b/i, /\b2fa\b/i, /\bmfa\b/i, /\brecovery\s+codes?\b/i] },
  { section: 'payments', label: 'Payments', patterns: [/\bpayments?\b/i, /\bbilling\b/i, /\btransactions?\b/i] },
  { section: 'fact-leases', label: 'Fact Leases', patterns: [/\bfact\s+leases?\b/i, /\bmy\s+leases?\b/i] },
  { section: 'usage', label: 'Usage', patterns: [/\busage\b/i, /\bactivity\b/i] },
  { section: 'api', label: 'API', patterns: [/\bapi(?:\s+section)?\b/i, /\bapi\s+keys?\b/i] },
  { section: 'trust', label: 'Trust Center', patterns: [/\btrust\s+center\b/i, /\btrust\s+page\b/i] },
  { section: 'how-it-works', label: 'How ProofTTL Works', patterns: [/\bhow\s+(?:proofttl|this|the\s+site|the\s+website)\s+works?\b/i, /\bhow\s+it\s+works?\b/i, /\bproduct\s+guide\b/i, /\bl\.o\.v\.e\.?\s+guide\b/i, /\blove\s+guide\b/i] },
  { section: 'studio', label: 'ProofTTL Studio', patterns: [/\bstudio\b/i, /\bcoding\s+(?:section|workspace|studio)\b/i, /\bdeveloper\s+workspace\b/i, /\bcode\s+editor\b/i, /\bmodel\s+playground\b/i, /\bterminal\s+workspace\b/i] },
  { section: 'audit-status', label: 'Audit status', patterns: [/\baudit\s+status\b/i, /\brequest\s+status\b/i] },
  { section: 'audit', label: 'Verification Audit', patterns: [/\bverification\s+audit\b/i, /\bclaim\s+stress\s+test\b/i, /\baudit\s+page\b/i] },
  { section: 'lease-verifier', label: 'Lease verifier', patterns: [/\blease\s+verifier\b/i, /\bverify\s+(?:a\s+)?lease\b/i, /\bsignature\s+verifier\b/i] },
  { section: 'lease-ops', label: 'Lease Operations', patterns: [/\blease\s+ops\b/i, /\blease\s+operations\b/i] },
  { section: 'methodology', label: 'Methodology', patterns: [/\bmethodology\b/i, /\bverification\s+method\b/i] },
  { section: 'service-status', label: 'Service status', patterns: [/\bservice\s+status\b/i, /\bsystem\s+status\b/i, /\bstatus\s+page\b/i] },
  { section: 'docs', label: 'Documentation', patterns: [/\bdocs?\b/i, /\bdocumentation\b/i, /\bdeveloper\s+docs?\b/i] },
  { section: 'support', label: 'Support', patterns: [/\bsupport\b/i, /\bhelp\s+center\b/i] },
  { section: 'get-started', label: 'Get started', patterns: [/\bget\s+started\b/i, /\bpricing\b/i, /\bprices?\b/i] },
  { section: 'solutions', label: 'Solutions', patterns: [/\bsolutions?\b/i, /\buse\s+cases?\b/i] },
  { section: 'login', label: 'Sign in', patterns: [/\bsign\s*in\b/i, /\blog\s*in\b/i, /\blogin\b/i] },
  { section: 'live-verifier', label: 'Live verifier', patterns: [/\blive\s+verifier\b/i, /\bclaim\s+verifier\b/i, /\bverify\s+(?:a\s+)?claim\b/i] },
]

function navigationCommand(section: AssistantSection, label: string): LocalLoveCommand {
  return {
    response: `Opening ${label}.`,
    action: { type: 'navigate', route: ALLOWED_TARGETS[section], section },
  }
}

function normalizeCommand(value: string) {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function clickByAriaLabel(label: string) {
  if (typeof document === 'undefined') return false
  const node = document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  if (!node) return false
  node.click()
  return true
}

function resolveLocalLoveCommand(message: string): LocalLoveCommand | null {
  const text = normalizeCommand(message)
  if (!text || text.length > 500) return null

  if (/^(?:how\s+does\s+(?:proofttl|this|the\s+site|the\s+website|love|l\.o\.v\.e\.?)\s+work\??|explain\s+(?:proofttl|the\s+website|the\s+site|love|l\.o\.v\.e\.?)|what\s+does\s+(?:proofttl|love|l\.o\.v\.e\.?)\s+do\??)$/i.test(text)) {
    return navigationCommand('how-it-works', 'the full ProofTTL guide')
  }

  if (/^(?:close|minimi[sz]e|hide|dismiss)(?:\s+(?:the|this|love|l\.o\.v\.e\.?))?\s+(?:chat|panel|assistant|window)$/i.test(text) || /^(?:close|minimi[sz]e)\s+love$/i.test(text)) {
    return { response: 'Closing L.O.V.E.', execute: () => { clickByAriaLabel('Minimize chat') } }
  }

  if (/^(?:exit|leave|close)\s+(?:chat\s+)?fullscreen$/i.test(text) || /^exit\s+full\s*screen$/i.test(text)) {
    return { response: 'Exiting fullscreen.', execute: () => { clickByAriaLabel('Exit fullscreen chat') } }
  }

  if (/^(?:open|enter|go)\s+(?:chat\s+)?fullscreen$/i.test(text) || /^(?:full\s*screen|fullscreen)\s+(?:chat|love)$/i.test(text)) {
    return { response: 'Opening fullscreen.', execute: () => { clickByAriaLabel('Open fullscreen chat') } }
  }

  if (/^(?:scroll|go|jump)\s+(?:to\s+)?(?:the\s+)?top(?:\s+of\s+(?:the\s+)?page)?$/i.test(text)) {
    return { response: 'Going to the top.', execute: () => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }) } }
  }

  if (/^(?:scroll|go|jump)\s+(?:to\s+)?(?:the\s+)?bottom(?:\s+of\s+(?:the\s+)?page)?$/i.test(text)) {
    return { response: 'Going to the bottom.', execute: () => { if (typeof window !== 'undefined' && typeof document !== 'undefined') window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }) } }
  }

  if (/^(?:go\s+)?back(?:\s+(?:a\s+)?page)?$/i.test(text) || /^previous\s+page$/i.test(text)) {
    return { response: 'Going back.', execute: () => { if (typeof window !== 'undefined') window.history.back() } }
  }

  if (/^(?:go\s+)?forward(?:\s+(?:a\s+)?page)?$/i.test(text) || /^next\s+page$/i.test(text)) {
    return { response: 'Going forward.', execute: () => { if (typeof window !== 'undefined') window.history.forward() } }
  }

  if (/^(?:reload|refresh)(?:\s+(?:the|this))?\s*(?:page|site|tab)?$/i.test(text)) {
    return { response: 'Reloading.', execute: () => { if (typeof window !== 'undefined') window.setTimeout(() => window.location.reload(), 250) } }
  }

  if (/^(?:close|exit)\s+(?:this\s+)?(?:browser\s+)?(?:tab|window)(?:\s+out)?$/i.test(text) || /^close\s+tab\s+out$/i.test(text)) {
    const canClose = typeof window !== 'undefined' && Boolean(window.opener)
    return canClose
      ? { response: 'Closing this tab.', execute: () => { if (typeof window !== 'undefined') window.setTimeout(() => window.close(), 250) } }
      : { response: 'I understand the command, but browsers block a site from closing a tab it did not open. I can minimize this chat, go back, or navigate somewhere else instead.' }
  }

  if (/^(?:run|start|launch|execute)\s+(?:the\s+)?(?:claim\s+|live\s+)?verifier(?:\s+script)?$/i.test(text)) return navigationCommand('live-verifier', 'the live verifier')
  if (/^(?:run|start|launch|execute)\s+(?:the\s+)?(?:lease|signature)\s+verifier(?:\s+script)?$/i.test(text)) return navigationCommand('lease-verifier', 'the Lease verifier')
  if (/^(?:run|start|launch|execute)\s+(?:the\s+)?(?:status|health)\s+(?:check|script)$/i.test(text)) return navigationCommand('service-status', 'the service status check')
  if (/^(?:run|start|launch|execute)\s+(?:the\s+)?(?:audit|stress\s+test)(?:\s+script)?$/i.test(text)) return navigationCommand('audit', 'the audit flow')

  if (/^(?:run|execute|start|launch)\s+(?:a\s+|the\s+)?script$/i.test(text) || /^(?:scripts?|commands?)$/i.test(text)) {
    return { response: 'I can route approved ProofTTL tools and isolated Studio jobs. I will not execute arbitrary code in the production site process. Tell me what you want to run.' }
  }

  if (NAVIGATION_COMMAND_PREFIX.test(text)) {
    for (const rule of LOCAL_NAVIGATION_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(text))) return navigationCommand(rule.section, rule.label)
    }
  }

  return null
}

function executeLocalCommand(command: LocalLoveCommand) {
  if (!command.execute || typeof window === 'undefined') return
  window.setTimeout(() => command.execute?.(), 120)
}

function sectionForRoute(route?: string): AssistantSection | null {
  if (!route) return null
  for (const [section, allowed] of Object.entries(ALLOWED_TARGETS)) {
    if (allowed === route) return section as AssistantSection
  }
  return null
}

async function resolvePlatformCommand(clean: string, signal?: AbortSignal) {
  const plan = await planProofTTLCommand(clean, signal)
  if (!plan?.resolved) return null

  if (plan.type === 'navigate' && plan.route) {
    const section = sectionForRoute(plan.route)
    if (!section) return null
    return {
      message: clean,
      response: `Opening ${plan.label || section}.`,
      action: validateAssistantAction({ type: 'navigate', route: plan.route, section }),
      quota: undefined,
      context: { history_messages_used: 0, max_history_messages: 6, lease_grounding: null },
      inference: { response_model: null, deterministic_route: true, client_command: true, command_planner: true },
    }
  }

  if (plan.type === 'capability_action' && plan.action_id) {
    const actionPlan = await createProofTTLActionPlan(plan.action_id, clean, signal)
    const risk = plan.risk || 'unknown'
    const sensitive = Boolean(plan.confirmation_required)
    const persisted = Boolean(actionPlan?.receipt?.persisted)
    const response = sensitive
      ? `I understand that as ${plan.action_id}. It is a ${String(plan.risk_label || risk).toUpperCase()} action and requires explicit confirmation. Nothing has been executed.${persisted ? ' I created an account receipt; open Workspace to review and confirm it.' : ' Sign in and open Workspace to review it.'}`
      : `I understand that as ${plan.action_id}. Policy allows the plan to advance, but no provider execution has happened yet. Open Workspace to continue.`
    return {
      message: clean,
      response,
      action: validateAssistantAction({ type: 'navigate', route: '/workspace/', section: 'workspace' }),
      quota: undefined,
      context: { history_messages_used: 0, max_history_messages: 6, lease_grounding: null },
      inference: { response_model: null, deterministic_route: true, client_command: true, command_planner: true, action_id: plan.action_id, action_risk: risk },
    }
  }

  return null
}

export async function fetchProofTTLAssistantUsage(signal?: AbortSignal) {
  const response = await fetch(ASSISTANT_USAGE_ENDPOINT, { method: 'GET', credentials: 'include', cache: 'no-store', signal })
  const body = await response.json().catch(() => ({})) as { quota?: AssistantQuota; message?: string; error?: string }
  if (!response.ok) throw new Error(body.message || body.error || `Assistant usage request failed with HTTP ${response.status}.`)
  return body.quota || null
}

async function requestFinalLoveSpeech(text: string, signal?: AbortSignal): Promise<{ speech?: LoveSpeech; error?: string }> {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 900)
  if (!clean) return { error: 'empty_response' }
  try {
    const response = await fetch(ASSISTANT_SPEECH_ENDPOINT, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: clean }),
      signal,
    })
    const body = await response.json().catch(() => ({})) as { speech?: LoveSpeech; message?: string; error?: string }
    if (!response.ok || !body.speech?.available || !body.speech.audio_base64) return { error: body.message || body.error || `HTTP ${response.status}` }
    return { speech: body.speech }
  } catch (caught) {
    if (signal?.aborted) throw caught
    return { error: caught instanceof Error ? caught.message : 'tts_request_failed' }
  }
}

async function finalizeVoiceResult<T extends { response?: string; inference?: AssistantInference }>(result: T, signal?: AbortSignal) {
  const finalText = typeof result.response === 'string' ? result.response : ''
  const spoken = await requestFinalLoveSpeech(finalText, signal)
  return {
    ...result,
    speech: spoken.speech,
    inference: {
      ...(result.inference || {}),
      final_response_tts: Boolean(spoken.speech?.available),
      ...(spoken.error ? { tts_error: spoken.error } : {}),
    },
  }
}

export async function askProofTTLByVoice(audio: Blob, signal?: AbortSignal) {
  if (!audio.type.toLowerCase().startsWith('audio/')) throw new Error('Microphone recording must have an audio/* content type.')

  const response = await fetch(ASSISTANT_VOICE_ENDPOINT, {
    method: 'POST', credentials: 'include', headers: { 'content-type': audio.type }, body: audio, signal,
  })

  const body = await readAssistantResponse(response)
  const transcript = typeof body.transcript === 'string' ? body.transcript : ''
  const localCommand = resolveLocalLoveCommand(transcript)

  if (localCommand) {
    executeLocalCommand(localCommand)
    return finalizeVoiceResult({
      transcript,
      response: localCommand.response,
      action: localCommand.action ? validateAssistantAction(localCommand.action) : null,
      quota: body.quota,
      love: body.love,
      context: body.context,
      inference: { ...(body.inference || {}), deterministic_route: true, client_command: true },
    }, signal)
  }

  const platform = await resolvePlatformCommand(transcript, signal)
  if (platform) {
    return finalizeVoiceResult({
      transcript,
      response: platform.response,
      action: platform.action,
      quota: body.quota,
      love: body.love,
      context: body.context,
      inference: { ...(body.inference || {}), ...(platform.inference || {}), deterministic_route: true, command_planner: true },
    }, signal)
  }

  return finalizeVoiceResult({
    transcript,
    response: typeof body.response === 'string' ? body.response : '',
    action: validateAssistantAction(body.action),
    quota: body.quota,
    love: body.love,
    context: body.context,
    inference: body.inference,
  }, signal)
}

export async function askProofTTLByText(
  message: string,
  history: AssistantHistoryMessage[] = [],
  signal?: AbortSignal,
) {
  const clean = message.replace(/\s+/g, ' ').trim().slice(0, 1200)
  if (!clean) throw new Error('Enter a message.')

  const localCommand = resolveLocalLoveCommand(clean)
  if (localCommand) {
    executeLocalCommand(localCommand)
    return {
      message: clean,
      response: localCommand.response,
      action: localCommand.action ? validateAssistantAction(localCommand.action) : null,
      quota: undefined,
      context: { history_messages_used: 0, max_history_messages: 6, lease_grounding: null },
      inference: { response_model: null, deterministic_route: true, client_command: true },
    }
  }

  const platform = await resolvePlatformCommand(clean, signal)
  if (platform) return platform

  const boundedHistory = history
    .slice(-6)
    .map((item) => ({ role: item.role, content: item.content.replace(/\s+/g, ' ').trim().slice(0, 600) }))
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
  if (action.type !== 'navigate' || typeof action.section !== 'string' || typeof action.route !== 'string') return null
  if (!Object.prototype.hasOwnProperty.call(ALLOWED_TARGETS, action.section)) return null

  const section = action.section as AssistantSection
  const allowedRoute = ALLOWED_TARGETS[section]
  if (action.route !== allowedRoute) return null

  return { type: 'navigate', route: allowedRoute, section }
}

export function assistantNavigationHref(action: AssistantNavigationAction) {
  const safe = validateAssistantAction(action)
  if (!safe) return null

  if (safe.route === '/console/' && safe.section !== 'home') return `${safe.route}#${encodeURIComponent(safe.section)}`
  return safe.route
}
