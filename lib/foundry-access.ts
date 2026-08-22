export const FOUNDRY_OWNER_EMAILS = new Set([
  'tasx13ok@gmail.com',
  'g0f0rth3kil1@gmail.com',
])

export function isFoundryOwnerEmail(value?: string | null) {
  return FOUNDRY_OWNER_EMAILS.has(String(value || '').trim().toLowerCase())
}
