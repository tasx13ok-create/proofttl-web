import { PROOFTTL_API_URL, type LoveSpeech } from './proofttl-assistant'

const ASSISTANT_SPEECH_ENDPOINT = `${PROOFTTL_API_URL}/assistant/speech`

export async function synthesizeLoveFinalResponse(text: string, signal?: AbortSignal): Promise<LoveSpeech> {
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 900)
  if (!clean) throw new Error('There is no L.O.V.E. response to speak.')

  const response = await fetch(ASSISTANT_SPEECH_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: clean }),
    signal,
  })

  const body = await response.json().catch(() => ({})) as {
    speech?: LoveSpeech
    message?: string
    error?: string
  }

  if (!response.ok || !body.speech?.available || !body.speech.audio_base64) {
    throw new Error(body.message || body.error || `Speech synthesis failed with HTTP ${response.status}.`)
  }

  return body.speech
}
