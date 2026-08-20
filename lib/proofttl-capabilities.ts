export type CapabilityRisk = 'read' | 'navigate' | 'modify' | 'sensitive'
export type CapabilityState = 'live' | 'built_locked' | 'planned'

export type ProofTTLCapability = {
  id: string
  area: 'love' | 'money' | 'work' | 'truth' | 'studio' | 'files' | 'automations' | 'connections' | 'security'
  label: string
  description: string
  route?: string
  risk: CapabilityRisk
  state: CapabilityState
  examples: string[]
}

export const RISK_POLICY: Record<CapabilityRisk, { label: string; confirmation: string }> = {
  read: { label: 'READ', confirmation: 'Usually no confirmation required.' },
  navigate: { label: 'NAVIGATE', confirmation: 'No confirmation required for allowlisted destinations.' },
  modify: { label: 'CREATE / MODIFY', confirmation: 'Confirmation depends on what changes and whether it is reversible.' },
  sensitive: { label: 'MONEY / SEND / DELETE / SECURITY', confirmation: 'Explicit user confirmation is required before execution.' },
}

export const PROOFTTL_CAPABILITIES: ProofTTLCapability[] = [
  { id: 'love-command', area: 'love', label: 'Universal command', description: 'Ask L.O.V.E. what you want done instead of deciding which app to open first.', route: '/workspace/', risk: 'read', state: 'live', examples: ['Explain this', 'Open Studio', 'Show my audit status'] },
  { id: 'truth-verify', area: 'truth', label: 'Verify a claim', description: 'Run the ProofTTL verification flow and inspect time-bounded Fact Lease evidence.', route: '/#verify', risk: 'modify', state: 'live', examples: ['Verify this claim', 'Open the Lease verifier'] },
  { id: 'truth-audits', area: 'truth', label: 'Claim audits', description: 'Submit and track Claim Stress Tests and Full Verification Audits.', route: '/audit/', risk: 'modify', state: 'live', examples: ['Start a stress test', 'Show my audits'] },
  { id: 'studio-code', area: 'studio', label: 'Code workspace', description: 'Multi-file coding workspace, model playground, safe terminal and cloud projects.', route: '/studio/', risk: 'modify', state: 'live', examples: ['Open my project', 'Review this file', 'Run Python'] },
  { id: 'studio-runner', area: 'studio', label: 'Isolated execution', description: 'Run approved runtimes in ephemeral sandboxes rather than the production server.', route: '/studio/', risk: 'sensitive', state: 'built_locked', examples: ['Run this Python file', 'Execute JavaScript in sandbox'] },
  { id: 'money-intelligence', area: 'money', label: 'Money intelligence', description: 'Understand balances, spending, bills, cash flow and goals after a financial-data provider is connected.', route: '/money/', risk: 'read', state: 'planned', examples: ['Why did I spend more?', 'Can I afford this next month?'] },
  { id: 'money-movement', area: 'money', label: 'Money movement', description: 'Future sponsor-bank or payments integrations for transfers, savings rules and bill actions.', route: '/money/', risk: 'sensitive', state: 'planned', examples: ['Move $75 to savings', 'Pay this bill'] },
  { id: 'work-mail', area: 'work', label: 'Email', description: 'Read, search, draft and eventually send through connected mail providers.', route: '/work/', risk: 'sensitive', state: 'planned', examples: ['Find the email from John', 'Draft a reply'] },
  { id: 'work-calendar', area: 'work', label: 'Calendar', description: 'Read schedule, find free time and create or update events with confirmation.', route: '/work/', risk: 'modify', state: 'planned', examples: ['What meetings do I have?', 'Schedule this tomorrow'] },
  { id: 'files-library', area: 'files', label: 'Files', description: 'One account-scoped library for generated, uploaded and connected files.', route: '/files/', risk: 'modify', state: 'planned', examples: ['Find my resume', 'Open the report'] },
  { id: 'automations', area: 'automations', label: 'Automations', description: 'Recurring and condition-based actions using only connected capabilities and explicit permissions.', route: '/automations/', risk: 'sensitive', state: 'planned', examples: ['Every Friday summarize my week', 'When X happens do Y'] },
  { id: 'connections', area: 'connections', label: 'Connections', description: 'Central permissioned integrations for identity, AI models, developer tools, work apps and future financial providers.', route: '/connections/', risk: 'sensitive', state: 'built_locked', examples: ['Connect Google', 'Connect GitHub', 'Choose an AI model'] },
  { id: 'security-account', area: 'security', label: 'Account security', description: 'Passkeys, TOTP, recovery codes, session management and provider-backed identity.', route: '/console/#security', risk: 'sensitive', state: 'built_locked', examples: ['Add a passkey', 'Log out other devices'] },
]

export const AREA_META = {
  love: { label: 'L.O.V.E.', description: 'INTELLIGENCE + CONTROL' },
  money: { label: 'MONEY', description: 'FINANCIAL INTELLIGENCE + ACTIONS' },
  work: { label: 'WORK', description: 'MAIL + CALENDAR + TASKS' },
  truth: { label: 'TRUTH', description: 'VERIFY + MONITOR + AUDIT' },
  studio: { label: 'STUDIO', description: 'CODE + MODELS + RUNNER' },
  files: { label: 'FILES', description: 'USER CONTENT + OUTPUTS' },
  automations: { label: 'AUTOMATIONS', description: 'RECURRING + CONDITION-BASED WORK' },
  connections: { label: 'CONNECTIONS', description: 'INTEGRATIONS + PROVIDERS' },
  security: { label: 'SECURITY', description: 'IDENTITY + PERMISSIONS + SESSIONS' },
} as const
