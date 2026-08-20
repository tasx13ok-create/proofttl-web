export type EnvironmentPreset = 'restaurant_kitchen' | 'hallway' | 'warehouse' | 'nightclub' | 'rooftop' | 'alley' | 'apartment' | 'dojo' | 'courtyard'
export type FightStyle = 'technical' | 'aggressive' | 'defensive' | 'cinematic'
export type CameraStyle = 'director' | 'handheld' | 'wide' | 'overhead' | 'side'
export type ActorRole = 'hero' | 'enemy' | 'ally'

export type PlannedAction = {
  id: string
  actorId: string
  targetId?: string
  action: 'approach' | 'jab' | 'cross' | 'hook' | 'kick' | 'spinning_kick' | 'block' | 'parry' | 'dodge' | 'throw' | 'stagger' | 'recover' | 'idle'
  start: number
  duration: number
  outcome?: 'hit' | 'blocked' | 'miss' | 'throw_success'
  propHint?: string
  cameraWeight?: number
}

export type PlannedActor = {
  id: string
  role: ActorRole
  palette: string
  spawnSlot: number
}

export type CinematicPlan = {
  schema: 'proofttl-cinematic-v2'
  seed: number
  prompt: string
  duration: number
  environment: EnvironmentPreset
  mood: string
  style: FightStyle
  cameraStyle: CameraStyle
  attackers: number
  actors: PlannedActor[]
  actions: PlannedAction[]
  intensity: number
  realism: number
}
