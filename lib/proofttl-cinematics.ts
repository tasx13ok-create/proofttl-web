import { PROOFTTL_API_URL } from './proofttl-assistant'
import type {
  CinematicCapability,
  CinematicPlanV3,
  CinematicRenderResult,
  CinematicStoryboardResult,
} from '../cinematics/ai/Types'

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = body?.message || body?.detail || body?.error || `HTTP ${response.status}`
    const error = new Error(String(message)) as Error & { status?: number; code?: string }
    error.status = response.status
    error.code = body?.error
    throw error
  }
  return body as T
}

export async function getCinematicsCapability(): Promise<CinematicCapability> {
  const response = await fetch(`${PROOFTTL_API_URL}/cinematics/status`, {
    credentials: 'include',
    cache: 'no-store',
  })
  return readJson<CinematicCapability>(response)
}

export async function planCinematic(input: {
  prompt: string
  shotCount: number
  durationSeconds: number
  aspectRatio: string
  style: string
  seed?: number
}): Promise<CinematicPlanV3> {
  const response = await fetch(`${PROOFTTL_API_URL}/cinematics/plan`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      prompt: input.prompt,
      shot_count: input.shotCount,
      duration_seconds: input.durationSeconds,
      aspect_ratio: input.aspectRatio,
      style: input.style,
      seed: input.seed,
    }),
  })
  return readJson<CinematicPlanV3>(response)
}

export async function generateStoryboard(input: {
  prompt: string
  seed?: number
  width?: number
  height?: number
}): Promise<CinematicStoryboardResult> {
  const response = await fetch(`${PROOFTTL_API_URL}/cinematics/storyboard`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      prompt: input.prompt,
      seed: input.seed,
      width: input.width ?? 1024,
      height: input.height ?? 576,
    }),
  })
  return readJson<CinematicStoryboardResult>(response)
}

export async function renderCinematicShot(input: {
  prompt: string
  firstFrameImage?: string
  durationSeconds: number
  resolution: '768P' | '1080P'
  confirmCost: boolean
}): Promise<CinematicRenderResult> {
  const response = await fetch(`${PROOFTTL_API_URL}/cinematics/render`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      prompt: input.prompt,
      first_frame_image: input.firstFrameImage,
      duration_seconds: input.durationSeconds,
      resolution: input.resolution,
      confirm_cost: input.confirmCost,
    }),
  })
  return readJson<CinematicRenderResult>(response)
}
