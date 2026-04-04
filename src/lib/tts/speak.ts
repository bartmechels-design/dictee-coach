'use client'

import { useState, useRef, useCallback } from 'react'

type TtsState = 'idle' | 'loading' | 'playing' | 'error'

export type UseTtsReturn = {
  state: TtsState
  error: string | null
  usingFallback: boolean
  speak: (word: string) => Promise<void>
  stop: () => void
}

/**
 * Static-first TTS — volgorde:
 * 1. /audio/{word}.mp3  (pre-gegenereerd, instant, 0 API-call)
 * 2. /api/tts           (on-demand OpenAI, voor eigen woordenlijsten)
 * 3. SpeechSynthesis    (browser fallback, werkt altijd)
 *
 * iOS Safari vereist expliciete gebruikersinteractie vóór audio.
 * Avatar-tap bij sessiestart is die interactie.
 */
export function useTTS(): UseTtsReturn {
  const [state, setState] = useState<TtsState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    setState('idle')
  }, [])

  const speakWithBrowser = useCallback((word: string) => {
    setUsingFallback(true)
    setState('playing')
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'nl-NL'
    utterance.rate = 0.85
    utterance.onend = () => setState('idle')
    utterance.onerror = () => setState('error')
    window.speechSynthesis.speak(utterance)
  }, [])

  const tryPlayUrl = useCallback((url: string, isBlob: boolean, word: string): Promise<boolean> => {
    return new Promise(resolve => {
      const audio = new Audio(url)
      audioRef.current = audio
      let started = false

      audio.oncanplaythrough = () => {
        if (started) return
        started = true
        setState('playing')
        audio.play().then(() => resolve(true)).catch(() => resolve(false))
      }
      audio.onended = () => {
        if (isBlob) URL.revokeObjectURL(url)
        setState('idle')
      }
      audio.onerror = () => {
        if (isBlob) URL.revokeObjectURL(url)
        resolve(false)
      }
      // timeout: als bestand niet laadt binnen 3s, ga door
      setTimeout(() => { if (!started) resolve(false) }, 3000)
      audio.load()
    })
  }, [])

  const speak = useCallback(async (word: string) => {
    if (state === 'loading' || state === 'playing') return
    stop()
    setState('loading')
    setError(null)
    setUsingFallback(false)

    // Stap 1: static pre-generated file (instant, geen API)
    try {
      const check = await fetch(`/audio/${word}.mp3`, { method: 'HEAD' })
      if (check.ok) {
        const ok = await tryPlayUrl(`/audio/${word}.mp3`, false, word)
        if (ok) return
      }
    } catch { /* ga door */ }

    // Stap 2: browser stem (fallback)
    // API fallback disabled — use static files or browser only
    speakWithBrowser(word)
  }, [state, stop, tryPlayUrl, speakWithBrowser])

  return { state, error, usingFallback, speak, stop }
}
