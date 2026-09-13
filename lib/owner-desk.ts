export type AuditState = 'received' | 'scoped' | 'payment_ready' | 'paid' | 'fulfilled' | 'cancelled'
export type DeskSection = 'Overview' | 'Requests' | 'Payments' | 'Delivery' | 'Tasks' | 'Settings'
export type DeskTask = { id: string; title: string; done: number; created_at_ms: number }
export type AuditSummary = { id: string; company_or_project: string; email?: string; status: AuditState; created_at_ms: number; approximate_claims?: string; amount_due_usd?: number; payment_state?: string; watch_ends_at_ms?: number }
export type AuditDetail = AuditSummary & { email: string; website_url: string | null; claim_scope: string; why_it_matters: string; deadline: string | null; scope_summary: string | null; scope_turnaround: string | null; scoped_price_usd: number | null; payment_url: string | null; paid_at_ms: number | null; human_approved_at_ms: number | null; human_approved_by: string | null; report_url: string | null; report_delivered_at_ms: number | null }
export type DeskEvent = { id?: string; action: string; actor: string; created_at_ms: number; company_or_project?: string; intake_id?: string }
export type DetailResponse = { intake: AuditDetail; notes: { id: string; body: string; created_by: string; created_at_ms: number }[]; activity: DeskEvent[]; report: { body: string; sha256: string; updated_at_ms: number } | null }
export type Overview = { owner: { name: string; email: string }; counts: Record<AuditState, number>; recorded_payments_usd: number; active_watches: number; recent: AuditSummary[]; tasks: DeskTask[]; activity: DeskEvent[]; services: { auth: boolean; database: boolean; checkout: boolean; stripe_mode: 'live' | 'test' | 'unconfigured'; webhook: boolean; admin_controls: boolean } }
export const stateLabels: Record<AuditState, string> = { received: 'Needs scope', scoped: 'Ready for checkout', payment_ready: 'Awaiting payment', paid: 'In progress', fulfilled: 'Delivered', cancelled: 'Closed' }
export const eventLabels: Record<string, string> = { scope: 'Scope confirmed', checkout: 'Checkout checked', report_saved: 'Report draft saved', approve: 'Report approved', deliver: 'Report published', cancel: 'Request closed' }
export const money = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
export const date = (n?: number | null) => n ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(n) : '—'
export const timestamp = (n: number) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(n)
export const nextAction = (a: AuditSummary) => ({ received: 'Review scope', scoped: 'Create checkout', payment_ready: 'View payment', paid: 'Prepare report', fulfilled: 'View delivery', cancelled: 'View request' })[a.status]
const messages: Record<string, string> = {
  authentication_required: 'Sign in to continue.', owner_access_required: 'This account does not have verified owner access.',
  trusted_origin_required: 'Open your desk on the official ProofTTL website to make changes.',
  owner_controls_not_configured: 'Owner controls are not configured. Refresh or check Settings.',
  invalid_scope: 'Add the agreed scope and turnaround before confirming.',
  fact_audit_scope_exceeds_25_claims: 'This request lists more than 25 claims. Agree a smaller request with the customer before checkout.',
  audit_scope_locked_after_checkout: 'Checkout has already started. Scope can no longer be changed here.',
  audit_cancellation_requires_reconciliation: 'This request has a payment attempt. Review it in Stripe before closing it.',
  save_report_before_review: 'Save a report draft before reviewing it.', report_changed_refresh_review: 'A newer report version exists. Copy your unsaved text, then reload this request before continuing.',
  report_changed_or_audit_not_paid: 'The report or payment state changed. Reload the request before continuing.',
  human_approval_required_before_fulfillment: 'Review and approve the current saved report before publishing.',
  human_review_confirmation_required: 'Confirm that you have reviewed the saved report.',
  request_too_large: 'That content is too large. Reports can contain up to 480 KB of text.',
  task_limit_reached: 'Your desk holds 100 tasks. Remove completed tasks to make room.',
  stripe_verification_required: 'Payment must be confirmed by Stripe.',
  report_requires_paid_audit: 'Reports can be edited only while a paid audit is in progress.',
  intake_not_scoped: 'Confirm the scope before creating checkout.',
}
export class DeskError extends Error {
  constructor(public status: number, public code: string, message?: string) { super(messages[code] || message || 'Could not confirm the result. Refresh before retrying.'); this.name = 'DeskError' }
}
export async function deskRequest<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) controller.abort()
  const timeout = window.setTimeout(abort, 20000)
  try {
    const response = await fetch(`/api/runtime/${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'include', cache: 'no-store', signal: controller.signal, ...(body === undefined ? {} : { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new DeskError(response.status, result.error || 'service_unavailable', result.message)
    return result as T
  } catch (error) {
    if (error instanceof DeskError) throw error
    throw new DeskError(503, 'connection_unavailable', 'Connection interrupted. Your action may have completed. Refresh before trying again.')
  } finally { window.clearTimeout(timeout); signal?.removeEventListener('abort', abort) }
}
export function safeHttps(url?: string | null) {
  try { const parsed = new URL(url || ''); return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : null } catch { return null }
}
export const customerStatusUrl = (id: string) => `${window.location.origin}/audit/status/?request=${encodeURIComponent(id)}`
