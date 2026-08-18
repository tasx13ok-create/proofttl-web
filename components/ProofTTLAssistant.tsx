'use client'

import { useEffect, useRef, useState } from 'react'
import {
  askProofTTLByVoice,
  assistantNavigationHref,
  type AssistantNavigationAction,
} from '../lib/proofttl-assistant'

type AssistantPhase =
  | 'idle'
  | 'permission'
  | 'recording'
  | 'processing'
  | 'response'
  | 'error'

const MAX_RECORDING_MS = 12_000
const MAX_AUDIO_BYTES = 512 * 1024

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
    case 'recording': return 'LISTENING'
    case 'processing': return 'TRANSCRIBING + THINKING'
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

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timeoutRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const navigationTimerRef = useRef<number | null>(null)

  function clearRecordingTimer() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function stopMediaTracks() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  function clearNavigationTimer() {
    if (navigationTimerRef.current !== null) {
      window.clearTimeout(navigationTimerRef.current)
      navigationTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearRecordingTimer()
      clearNavigationTimer()
      abortRef.current?.abort()

      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null
        recorder.onstop = null
        recorder.onerror = null
        recorder.stop()
      }
      stopMediaTracks()
    }
  }, [])

  async function startRecording() {
    setOpen(true)
    setTranscript('')
    setAnswer('')
    setError('')
    setNavigation(null)

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setPhase('error')
      setError('This browser does not expose the microphone recording APIs ProofTTL needs.')
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
      streamRef.current = stream

      const mimeType = preferredMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onerror = () => {
        clearRecordingTimer()
        stopMediaTracks()
        setPhase('error')
        setError('The microphone recorder stopped unexpectedly. Try again.')
      }

      recorder.onstop = () => {
        void processRecording(recorder.mimeType || mimeType || 'audio/webm')
      }

      recorder.start()
      setPhase('recording')
      clearRecordingTimer()
      timeoutRef.current = window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, MAX_RECORDING_MS)
    } catch (caught) {
      clearRecordingTimer()
      stopMediaTracks()
      setPhase('error')
      const denied = caught instanceof DOMException && caught.name === 'NotAllowedError'
      setError(
        denied
          ? 'Microphone permission was denied. Allow microphone access and try again.'
          : 'ProofTTL could not start the microphone on this device.'
      )
    }
  }

  function stopRecording() {
    clearRecordingTimer()
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') recorder.stop()
  }

  async function processRecording(mimeType: string) {
    clearRecordingTimer()
    stopMediaTracks()
    recorderRef.current = null

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

    try {
      const result = await askProofTTLByVoice(audio, controller.signal)
      setTranscript(result.transcript)
      setAnswer(result.response || 'I heard you, but I do not have a text response for that request.')
      setNavigation(result.action)
      setPhase('response')

      if (result.action) {
        const href = assistantNavigationHref(result.action)
        if (href) {
          clearNavigationTimer()
          navigationTimerRef.current = window.setTimeout(() => {
            window.location.assign(href)
          }, 650)
        }
      }
    } catch (caught) {
      if (controller.signal.aborted) return
      setPhase('error')
      setError(caught instanceof Error ? caught.message : 'ProofTTL Assistant is unavailable right now.')
    } finally {
      if (abortRef.current === controller) abortRef.current = null
    }
  }

  function handleMicClick() {
    if (phase === 'recording') {
      stopRecording()
      return
    }

    if (phase === 'permission' || phase === 'processing') return
    void startRecording()
  }

  function closePanel() {
    setOpen(false)
    clearNavigationTimer()
    if (phase === 'recording') stopRecording()
  }

  if (!open) {
    return (
      <div className="pttl-assistant pttl-assistant-collapsed">
        <button
          type="button"
          className="pttl-assistant-trigger"
          onClick={handleMicClick}
          aria-label="Talk to ProofTTL Assistant"
          title="Talk to ProofTTL Assistant"
        >
          <MicIcon />
        </button>
      </div>
    )
  }

  return (
    <aside className="pttl-assistant" aria-label="ProofTTL Assistant">
      <div className="pttl-assistant-panel">
        <header className="pttl-assistant-header">
          <div>
            <span className="pttl-assistant-kicker">PROOFTTL ASSISTANT</span>
            <strong>Speak. Get a text answer.</strong>
          </div>
          <button type="button" className="pttl-assistant-close" onClick={closePanel} aria-label="Close assistant">×</button>
        </header>

        <div className={`pttl-assistant-status phase-${phase}`} aria-live="polite">
          <span className="pttl-assistant-status-dot" />
          {phaseLabel(phase)}
        </div>

        <div className="pttl-assistant-content" aria-live="polite">
          {phase === 'idle' && (
            <p>Press the microphone and ask about ProofTTL, or tell me where you want to go.</p>
          )}

          {phase === 'permission' && <p>Waiting for microphone permission…</p>}
          {phase === 'recording' && <p>Listening. Press the microphone again when you are finished.</p>}
          {phase === 'processing' && <p>Turning your voice into a ProofTTL request…</p>}

          {transcript && (
            <div className="pttl-assistant-message pttl-assistant-transcript">
              <span>YOU SAID</span>
              <p>{transcript}</p>
            </div>
          )}

          {answer && (
            <div className="pttl-assistant-message pttl-assistant-answer">
              <span>PROOFTTL</span>
              <p>{answer}</p>
              {navigation && <small>NAVIGATING TO {navigation.section.toUpperCase()}…</small>}
            </div>
          )}

          {error && (
            <div className="pttl-assistant-error" role="alert">
              {error}
            </div>
          )}
        </div>

        <footer className="pttl-assistant-footer">
          <button
            type="button"
            className={`pttl-assistant-mic ${phase === 'recording' ? 'recording' : ''}`}
            onClick={handleMicClick}
            disabled={phase === 'permission' || phase === 'processing'}
            aria-label={phase === 'recording' ? 'Stop recording' : 'Start voice request'}
          >
            <MicIcon />
            <span>{phase === 'recording' ? 'STOP' : phase === 'processing' ? 'WORKING' : 'TALK'}</span>
          </button>
          <small>VOICE IN · TEXT OUT · 12 SEC MAX</small>
        </footer>
      </div>
    </aside>
  )
}
