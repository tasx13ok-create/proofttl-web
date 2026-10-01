export const FOUNDRY_WORLD_CONTRACT = 'foundry10-world-state' as const
export const FOUNDRY_WORLD_VERSION = 1 as const

export type FoundryWorldAgentStatus = 'idle' | 'busy' | 'blocked' | 'paused' | string

export type FoundryWorldTask = {
  id: string
  experiment_id: string | null
  title: string
  type: string
  state: string
  priority: number
  important: boolean
  touch_count: number
  required_touches: number
  claimed_by: string | null
  reviewer_id: string | null
  blocker: string | null
  attempts: number
  max_attempts: number
}

export type FoundryWorldAgent = {
  id: string
  slug: string
  name: string
  role: string
  status: FoundryWorldAgentStatus
  current_task_id: string | null
  current_task: null | {
    id: string
    title: string
    type: string
    state: string
    priority: number
    important: boolean
    touch_count: number
    required_touches: number
    experiment_id: string | null
    experiment_title: string | null
  }
  last_action: string | null
  blocker: string | null
  confidence: number
  revenue_influenced_cents: number
  cost_used_cents: number
}

export type FoundryWorldExperiment = {
  id: string
  slug: string
  title: string
  status: string
  score: number
  target_buyer: string
  monetization_method: string
  compliance_risk: number
  price_cents: number | null
  checkout_attached: boolean
  revenue_cents: number
  cost_cents: number
  clicks: number
  conversions: number
  kill_reason: string | null
}

export type FoundryWorldState = {
  contract: typeof FOUNDRY_WORLD_CONTRACT
  version: typeof FOUNDRY_WORLD_VERSION
  generated_at: string
  system: {
    name: 'FOUNDRY-10'
    paused: boolean
    mode: string
  }
  finance: {
    revenue_cents: number
    cost_cents: number
    profit_cents: number
    reinvestment_cap_cents: number
    spending_cap_cents: number
    revenue_goal_cents: number
    risk_tolerance: number
  }
  agents: FoundryWorldAgent[]
  tasks: FoundryWorldTask[]
  experiments: FoundryWorldExperiment[]
  approvals: Array<{
    id: string
    type: string
    experiment_id: string | null
    task_id: string | null
    created_at: string
  }>
  activity: Array<{
    id: string | number
    type: string
    agent_id: string | null
    experiment_id: string | null
    task_id: string | null
    revenue_cents: number
    cost_cents: number
    created_at: string
  }>
}

export function isFoundryWorldState(value: unknown): value is FoundryWorldState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<FoundryWorldState>
  return state.contract === FOUNDRY_WORLD_CONTRACT
    && state.version === FOUNDRY_WORLD_VERSION
    && Array.isArray(state.agents)
    && Array.isArray(state.tasks)
    && Array.isArray(state.experiments)
    && Array.isArray(state.approvals)
    && Array.isArray(state.activity)
    && Boolean(state.finance && typeof state.finance === 'object')
}
