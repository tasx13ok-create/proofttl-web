'use client'

import { useEffect, useRef, useState } from 'react'
import {
  askProofTTLByVoice,
  assistantNavigationHref,
  loveSpeechDataUrl,
  type AssistantNavigationAction,
  type LoveCapability,
} from '../lib/proofttl-assistant'

type AssistantPhase =
  | 'idle'
  | 'permission'
  | 'recording'
  | 'processing'
  | 'speaking'
  | 'response'
  | 'error'

const MAX_RECORDING_MS = 12_000
const MAX_AUDIO_BYTES = 512 * 1024
const MAX_PROCESSING_MS = 25_000

const MIME_PREFERENCES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
]

function preferredMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  return MIME_PREFERENCES.find((type) => MediaRecorder.isTypeSupported(type)) || ''
}

function phaseLabel(phase: AssistantPhase) {
  switch (phase) {
    case 'permission': return 'MIC PERMISSION'
    case 'recording': return 'L.O.V.E. IS LISTENING'
    case 'processing': return 'L.O.V.E. IS THINKING'
    case 'speaking': return 'L.O.V.E. IS SPEAKING'
    case 'response': return 'READY'
    case 'error': return 'ERROR'
    default: return 'READY'
  }
}

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.5 11.5v.5a5.5 5.5 0 0 0 11 0v-.5M12 17.5V21M9.5 21h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export default function ProofTTLAssistant() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<AssistantPhase>('idle')
  const [transcript, setTranscript] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [navigation, setNavigation] = useState<AssistantNavigationAction | null>(null)
  const [love, setLove] = useState<LoveCapability | null>(null)
  const [speechUrl, setSpeechUrl] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timeoutRef = useRef<number | null>(null)
  const processingTimeoutRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const navigationTimerRef = useRef<number | null>(null)
  const operationRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function clearRecordingTimer() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function clearProcessingTimer() {
    if (processingTimeoutRef.current !== null) {
      window.clearTimeout(processingTimeoutRef.current)
      processingTimeoutRef.current = null
    }
  }

  function stopMediaTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function stopSpeech() {
    const audio = audioRef.current
    audioRef.current = null
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  function clearNavigationTimer() {
    if (navigationTimerRef.current !== null) {
      window.clearTimeout(navigationTimerRef.current)
      navigationTimerRef.current = null
    }
  }

  function cancelActiveOperation() {
    operationRef.current += 1
    clearRecordingTimer()
    clearProcessingTimer()
    stopSpeech()
    abortRef.current?.abort()
    abortRef.current = null

    const recorder = recorderRef.current
    recorderRef.current = null
    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null
      recorder.onstop = null
      recorder.onerror = null
      recorder.stop()
    }

    chunksRef.current = []
    stopMediaTracks()
  }

  useEffect(() => {
    return () => {
      clearNavigationTimer()
      cancelActiveOperation()
    }
  }, [])

  async function startRecording() {
    cancelActiveOperation()
    const operationId = operationRef.current

    setOpen(true)
    setTranscript('')
    setAnswer('')
    setError('')
    setNavigation(null)
    setSpeechUrl(null)

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setPhase('error')
      setError('This browser does not expose the microphone recording APIs L.O.V.E. needs.')
      return
    }

    setPhase('permission')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      if (operationId !== operationRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      const mimeType = preferredMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (operationId === operationRef.current && event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        if (operationId !== operationRef.current) return
        clearRecordingTimer()
        stopMediaTracks()
        recorderRef.current = null
        setPhase('error')
        setError('The microphone recorder stopped unexpectedly. Try again.')
      }

      recorder.onstop = () => {
        void processRecording(recorder.mimeType || mimeType || 'audio/webm', operationId)
      }

      recorder.start()
      setPhase('recording')
      clearRecordingTimer()
      timeoutRef.current = window.setTimeout(() => {
        if (operationId === operationRef.current && recorder.state === 'recording') recorder.stop()
      }, MAX_RECORDING_MS)
    } catch (caught) {
      if (operationId !== operationRef.current) return
      clearRecordingTimer()
      stopMediaTracks()
      setPhase('error')
      const denied = caught instanceof DOMException && caught.name === 'NotAllowedError'
      setError(
        denied
          ? 'Microphone permission was denied. Allow microphone access and try again.'
          : 'L.O.V.E. could not start the microphone on this device.'
      )
    }
  }

  function stopRecording() {
    clearRecordingTimer()
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') recorder.stop()
  }

  async function playLoveSpeech(url: string, operationId: number) {
    stopSpeech()
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => {
      if (operationId === operationRef.current) setPhase('response')
      if (audioRef.current === audio) audioRef.current = null
    }
    audio.onerror = () => {
      if (operationId === operationRef.current) setPhase('response')
      if (audioRef.current === audio) audioRef.current = null
    }
    setPhase('speaking')
    try {
      await audio.play()
    } catch {
      if (operationId === operationRef.current) setPhase('response')
    }
  }

  async function processRecording(mimeType: string, operationId: number) {
    clearRecordingTimer()
    stopMediaTracks()
    recorderRef.current = null

    if (operationId !== operationRef.current) {
      chunksRef.current = []
      return
    }

    const audio = new Blob(chunksRef.current, { type: mimeType })
    chunksRef.current = []

    if (audio.size === 0) {
      setPhase('error')
      setError('No microphone audio was captured. Try speaking again.')
      return
    }

    if (audio.size > MAX_AUDIO_BYTES) {
      setPhase('error')
      setError('That recording was too large. Keep voice requests short and try again.')
      return
    }

    setPhase('processing')
    const controller = new AbortController()
    abortRef.current = controller
    clearProcessingTimer()
    processingTimeoutRef.current = window.setTimeout(() => {
      if (operationId !== operationRef.current || controller.signal.aborted) return
      controller.abort()
      setPhase('error')
      setError('L.O.V.E. took too long to respond. Try a shorter request.')
    }, MAX_PROCESSING_MS)

    try {
      const result = await askProofTTLByVoice(audio, controller.signal)
      if (operationId !== operationRef.current) return

      setTranscript(result.transcript)
      setAnswer(result.response || 'I heard you, but I do not have a response for that request.')
      setNavigation(result.action)
      setLove(result.love || null)

      const url = loveSpeechDataUrl(result.speech)
      setSpeechUrl(url)
      if (url) {
        await playLoveSpeech(url, operationId)
      } else {
        setPhase('response')
      }

      if (result.action) {
        const href = assistantNavigationHref(result.action)
        if (href) {
          clearNavigationTimer()
          navigationTimerRef.current = window.setTimeout(() => {
            if (operationId === operationRef.current) window.location.assign(href)
          }, url ? 1400 : 650)
        }
      }
    } catch (caught) {
      if (controller.signal.aborted || operationId !== operationRef.current) return
      setPhase('error')
      setError(caught instanceof Error ? caught.message : 'L.O.V.E. is unavailable right now.')
    } finally {
      clearProcessingTimer()
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  function handleMicClick() {
    if (phase === 'recording') {
      stopRecording()
      return
    }
    if (phase === 'permission' || phase === 'processing' || phase === 'speaking') return
    void startRecording()
  }

  function closePanel() {
    setOpen(false)
    clearNavigationTimer()
    cancelActiveOperation()
    setPhase('idle')
  }

  const visualState = phase === 'recording'
    ? 'listening'
    : phase === 'processing'
      ? 'thinking'
      : phase === 'speaking'
        ? 'speaking'
        : open
          ? 'awake'
          : 'dormant'

  if (!open) {
    return (
      <div className="pttl-assistant pttl-assistant-collapsed" data-love-state={visualState}>
        <button
          type="button"
          className="pttl-assistant-trigger"
          onClick={handleMicClick}
          aria-label="Talk to L.O.V.E."
          title="Talk to L.O.V.E."
        >
          <MicIcon />
        </button>
      </div>
    )
  }

  return (
    <aside className="pttl-assistant pttl-love" data-love-state={visualState} aria-label="L.O.V.E. voice assistant">
      <div className="pttl-assistant-panel pttl-love-panel">
        <header className="pttl-assistant-header">
          <div>
            <span className="pttl-assistant-kicker">L.O.V.E. · PROOFTTL</span>
            <strong>Lease Offering Value Interpreter</strong>
          </div>
          <button type="button" className="pttl-assistant-close" onClick={closePanel} aria-label="Close L.O.V.E.">×</button>
        </header>

        <div className={`pttl-assistant-status phase-${phase}`} aria-live="polite">
          <span className="pttl-assistant-status-dot" />
          {phaseLabel(phase)}
        </div>

        <div className="pttl-assistant-content" aria-live="polite">
          {phase === 'idle' && <p>Speak to L.O.V.E. about ProofTTL or tell it where you want to go.</p>}
          {phase === 'permission' && <p>Waiting for microphone permission…</p>}
          {phase === 'recording' && <p>Listening. Press the microphone again when you are finished.</p>}
          {phase === 'processing' && <p>Interpreting your request…</p>}
          {phase === 'speaking' && <p>L.O.V.E. is responding.</p>}

          {transcript && (
            <div className="pttl-assistant-message pttl-assistant-transcript">
              <span>YOU SAID</span>
              <p>{transcript}</p>
            </div>
          )}

          {answer && (
            <div className="pttl-assistant-message pttl-assistant-answer">
              <span>L.O.V.E.</span>
              <p>{answer}</p>
              {navigation && <small>NAVIGATING TO {navigation.section.toUpperCase()}…</small>}
            </div>
          )}

          {error && <div className="pttl-assistant-error" role="alert">{error}</div>}
        </div>

        <footer className="pttl-assistant-footer">
          <button
            type="button"
            className={`pttl-assistant-mic ${phase === 'recording' ? 'recording' : ''}`}
            onClick={handleMicClick}
            disabled={phase === 'permission' || phase === 'processing' || phase === 'speaking'}
            aria-label={phase === 'recording' ? 'Stop recording' : 'Start voice request'}
          >
            <MicIcon />
            <span>{phase === 'recording' ? 'STOP' : phase === 'processing' ? 'THINKING' : phase === 'speaking' ? 'SPEAKING' : 'TALK'}</span>
          </button>
          {speechUrl && phase !== 'speaking' && (
            <button type="button" className="pttl-love-replay" onClick={() => void playLoveSpeech(speechUrl, operationRef.current)}>
              REPLAY VOICE
            </button>
          )}
          <small>
            {love?.preview_enabled ? 'L.O.V.E. TESTNET PREVIEW' : love?.voice_mode ? 'MEMBER VOICE MODE' : 'MEMBERSHIP REQUIRED'}
          </small>
        </footer>
      </div>
    </aside>
  )
}
