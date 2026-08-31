const APP_PATH_PREFIXES = [
  '/workspace/',
  '/studio/',
  '/foundry/',
  '/work/',
  '/files/',
  '/automations/',
  '/money/',
  '/connections/',
  '/login/',
  '/two-factor/',
  '/onboarding/',
  '/console/',
  '/account/',
  '/worlds/',
  '/cinematics/',
] as const

export function isAppPath(pathname: string) {
  return APP_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
}

export function isPublicPath(pathname: string) {
  return !isAppPath(pathname)
}
