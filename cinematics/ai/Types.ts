export type CinematicShotV3 = {
  id: string
  name: string
  duration_seconds: number
  camera: string
  action: string
  contact: string
  continuity_in: string
  continuity_out: string
  render_prompt: string
  storyboard_prompt: string
}

export type CinematicPlanV3 = {
  schema: 'proofttl-cinematic-v3'
  seed: number
  prompt: string
  title: string
  logline: string
  environment: string
  time_of_day: string
  palette: string
  aspect_ratio: string
  style: string
  character_bible: string
  continuity_bible: string
  shots: CinematicShotV3[]
  planning?: {
    mode?: 'ai' | 'deterministic_fallback'
    model?: string
    reason?: string
    detail?: string
  }
}

export type CinematicStoryboardResult = {
  schema: 'proofttl-cinematic-v3'
  model: string
  seed: number
  prompt: string
  image_data_url: string
}

export type CinematicRenderResult = {
  schema: 'proofttl-cinematic-v3'
  model: string
  video_url: string
  task_id?: string | null
  provider_state?: string | null
  resolution: '768P' | '1080P'
  duration_seconds: number
}

export type CinematicCapability = {
  service?: string
  schema?: string
  ai_binding?: boolean
  planner_model?: string
  storyboard_model?: string
  video_models?: {
    text_to_video?: string
    image_to_video?: string
  }
  render_requires_authentication?: boolean
  render_requires_explicit_cost_confirmation?: boolean
  local_previs?: boolean
}

export type ShotGenerationState = {
  storyboard?: string
  video?: string
  storyboardModel?: string
  videoModel?: string
  status: 'idle' | 'storyboarding' | 'storyboard-ready' | 'rendering' | 'video-ready' | 'error'
  error?: string
}
