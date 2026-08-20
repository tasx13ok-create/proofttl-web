import type { CameraStyle, CinematicPlan, EnvironmentPreset, FightStyle, PlannedAction, PlannedActor } from '../core/Types'

function hash(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) h = Math.imul(h ^ value.charCodeAt(i), 16777619)
  return h >>> 0
}

function environmentFrom(text: string): EnvironmentPreset {
  if (/restaurant|kitchen|diner/.test(text)) return 'restaurant_kitchen'
  if (/hallway|corridor/.test(text)) return 'hallway'
  if (/warehouse|factory/.test(text)) return 'warehouse'
  if (/nightclub|club|dance floor/.test(text)) return 'nightclub'
  if (/rooftop|roof/.test(text)) return 'rooftop'
  if (/alley|street/.test(text)) return 'alley'
  if (/apartment|flat|living room/.test(text)) return 'apartment'
  if (/dojo|training hall|martial arts school/.test(text)) return 'dojo'
  return 'courtyard'
}

function attackerCount(text: string) {
  const digit = text.match(/\b([2-9]|10)\s+(?:attackers?|men|fighters?|enemies|guards?)\b/)
  if (digit) return Math.min(8, Math.max(1, Number(digit[1])))
  const words: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 }
  for (const [word, count] of Object.entries(words)) if (new RegExp(`\\b${word}\\s+(attackers?|men|fighters?|enemies|guards?)\\b`).test(text)) return count
  return /surrounded|group|gang/.test(text) ? 4 : 1
}

function styleFrom(text: string): FightStyle {
  if (/defensive|patient|counter|parr/.test(text)) return 'defensive'
  if (/aggressive|brutal|relentless|rush/.test(text)) return 'aggressive'
  if (/technical|precise|clean|disciplined/.test(text)) return 'technical'
  return 'cinematic'
}

function cameraFrom(text: string): CameraStyle {
  if (/overhead|top[- ]down/.test(text)) return 'overhead'
  if (/handheld|shaky|close[- ]up/.test(text)) return 'handheld'
  if (/side view|profile/.test(text)) return 'side'
  if (/director|dynamic camera|orbit/.test(text)) return 'director'
  return 'wide'
}

function buildActors(count: number): PlannedActor[] {
  const actors: PlannedActor[] = [{ id: 'hero', role: 'hero', palette: 'ember', spawnSlot: 0 }]
  for (let i = 0; i < count; i += 1) actors.push({ id: `enemy-${i + 1}`, role: 'enemy', palette: i % 2 ? 'slate' : 'indigo', spawnSlot: i + 1 })
  return actors
}

function buildActions(text: string, count: number): PlannedAction[] {
  const actions: PlannedAction[] = []
  let t = 1.1
  const enemy = (index: number) => `enemy-${(index % count) + 1}`
  const push = (event: Omit<PlannedAction, 'id' | 'start'> & { start?: number }) => {
    const start = event.start ?? t
    actions.push({ ...event, id: `action-${actions.length + 1}`, start })
    t = Math.max(t, start + event.duration + 0.18)
  }

  const phrases = [
    { re: /block(?:s|ed)?(?: a| the)?[^,.]*?(?:bottle|swing|punch)?/i, hero: 'block' as const, enemyAction: 'hook' as const, outcome: 'blocked' as const },
    { re: /parr(?:y|ies|ied)[^,.]*/i, hero: 'parry' as const, enemyAction: 'jab' as const, outcome: 'blocked' as const },
    { re: /throw(?:s|ing)?[^,.]*?(?:table|wall|counter)?/i, hero: 'throw' as const, enemyAction: 'approach' as const, outcome: 'throw_success' as const },
    { re: /spinning kick|spin kick/i, hero: 'spinning_kick' as const, enemyAction: 'approach' as const, outcome: 'hit' as const },
    { re: /roundhouse|kick/i, hero: 'kick' as const, enemyAction: 'approach' as const, outcome: 'hit' as const },
    { re: /dodge|slide under|sidestep|duck/i, hero: 'dodge' as const, enemyAction: 'cross' as const, outcome: 'miss' as const },
  ]

  let scripted = 0
  for (const phrase of phrases) {
    if (!phrase.re.test(text)) continue
    const target = enemy(scripted)
    push({ actorId: target, targetId: 'hero', action: phrase.enemyAction, duration: 0.8, cameraWeight: 0.55 })
    push({ actorId: 'hero', targetId: target, action: phrase.hero, duration: phrase.hero === 'throw' ? 1.15 : 0.75, outcome: phrase.outcome, propHint: phrase.hero === 'throw' ? 'table' : undefined, cameraWeight: phrase.hero === 'spinning_kick' || phrase.hero === 'throw' ? 1 : 0.8 })
    scripted += 1
  }

  if (!actions.length) {
    push({ actorId: enemy(0), targetId: 'hero', action: 'jab', duration: 0.7, cameraWeight: 0.5 })
    push({ actorId: 'hero', targetId: enemy(0), action: 'block', duration: 0.55, outcome: 'blocked', cameraWeight: 0.7 })
    push({ actorId: 'hero', targetId: enemy(0), action: 'cross', duration: 0.72, outcome: 'hit', cameraWeight: 0.9 })
    if (count > 1) {
      push({ actorId: enemy(1), targetId: 'hero', action: 'kick', duration: 0.9, cameraWeight: 0.65 })
      push({ actorId: 'hero', targetId: enemy(1), action: 'dodge', duration: 0.65, outcome: 'miss', cameraWeight: 0.75 })
    }
    push({ actorId: 'hero', targetId: enemy(Math.min(2, count - 1)), action: 'spinning_kick', duration: 1.05, outcome: 'hit', cameraWeight: 1 })
  }

  return actions
}

export function parseCinematicPrompt(prompt: string, seedOverride?: number): CinematicPlan {
  const clean = String(prompt || '').trim().slice(0, 1200)
  const text = clean.toLowerCase()
  const attackers = attackerCount(text)
  const actions = buildActions(text, attackers)
  const duration = Math.max(10, Math.min(30, actions.reduce((max, action) => Math.max(max, action.start + action.duration), 0) + 2))
  return {
    schema: 'proofttl-cinematic-v2',
    seed: seedOverride ?? hash(clean || 'proofttl-cinematic'),
    prompt: clean,
    duration,
    environment: environmentFrom(text),
    mood: /dim|dark|moody|night/.test(text) ? 'moody' : /bright|day/.test(text) ? 'bright' : 'tense',
    style: styleFrom(text),
    cameraStyle: cameraFrom(text),
    attackers,
    actors: buildActors(attackers),
    actions,
    intensity: /brutal|fast|relentless|intense/.test(text) ? 0.95 : 0.72,
    realism: /grounded|realistic|technical/.test(text) ? 0.9 : 0.72,
  }
}
