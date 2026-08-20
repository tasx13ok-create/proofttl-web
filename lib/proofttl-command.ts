import { PROOFTTL_API_URL } from './proofttl-auth'

export type ProofTTLCommandPlan = {
  resolved?: boolean
  type?: 'navigate' | 'capability_action' | 'model_fallback'
  route?: string
  label?: string
  action_id?: string
  area?: string
  risk?: string
  risk_label?: string
  confirmation_required?: boolean
  executable_now?: boolean
}

export type ProofTTLActionPlan = {
  ok?: boolean
  executable?: boolean
  confirmation_required?: boolean
  message?: string
  error?: string
  receipt?: {
    receipt_id?: string
    persisted?: boolean
    state?: string
    user_scoped?: boolean
  }
}

export async function planProofTTLCommand(command: string, signal?: AbortSignal): Promise<ProofTTLCommandPlan | null> {
  try {
    const response = await fetch(`${PROOFTTL_API_URL}/commands/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ command }),
      signal,
    })
    if (!response.ok) return null
    return await response.json() as ProofTTLCommandPlan
  } catch {
    if (signal?.aborted) return null
    return null
  }
}

export async function createProofTTLActionPlan(actionId: string, inputSummary: string, signal?: AbortSignal): Promise<ProofTTLActionPlan | null> {
  try {
    const response = await fetch(`${PROOFTTL_API_URL}/actions/plan`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action_id: actionId, input_summary: inputSummary }),
      signal,
    })
    return await response.json().catch(() => null) as ProofTTLActionPlan | null
  } catch {
    if (signal?.aborted) return null
    return null
  }
}
