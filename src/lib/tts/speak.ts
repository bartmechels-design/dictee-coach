'use client'

import { useState, useRef, useCallback } from 'react'

type TtsState = 'idle' | 'loading' | 'playing' | 'error'

export type UseTtsReturn = {
  state: TtsState
  error: string | null
  speak: (word: string) => void
  speakDictee: (word: string, grade: number, sentence?: string | null) => void
  stop: () => void
}

export function useTTS(): UseTtsReturn {
  const [state, setState] = useState<TtsState>('idle')
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const abortRef = useRef(false)

  const stop = useCallback(() => {
    abortRef.current = true
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    setState('idle')
  }, [])

  // Play audio from URL; resolves when playback ends
  const playUrl = useCallback((url: string, isBlob: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url)
      audioRef.current = audio
      let playing = false

      audio.oncanplaythrough = () => {
        if (playing) return
        playing = true
        audio.play().catch(reject)
      }
      audio.onended = () => {
        if (isBlob) URL.revokeObjectURL(url)
        resolve()
      }
      audio.onerror = () => {
        if (isBlob) URL.revokeObjectURL(url)
        reject(new Error('audio-error'))
      }
      setTimeout(() => { if (!playing) reject(new Error('timeout')) }, 6000)
      audio.load()
    })
  }, [])

  // Speak via browser synthesis; resolves when done
  const speakBrowser = useCallback((text: string): Promise<void> => {
    return new Promise(resolve => {
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'nl-NL'
      utt.rate = 0.85
      utt.onend = () => resolve()
      utt.onerror = () => resolve() // don't block on error
      window.speechSynthesis.speak(utt)
    })
  }, [])

  // Play a single piece of text: static file → API TTS → browser
  const playText = useCallback(async (text: string): Promise<void> => {
    if (abortRef.current) return

    // Static pre-generated file (single words only)
    const isWord = !text.includes(' ')
    if (isWord) {
      try {
        const check = await fetch(`/audio/${encodeURIComponent(text)}.mp3`, { method: 'HEAD' })
        if (check.ok) {
          await playUrl(`/audio/${encodeURIComponent(text)}.mp3`, false)
          return
        }
      } catch { /* continue */ }
    }

    // Google Cloud TTS via API
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        await playUrl(url, true)
        return
      }
    } catch { /* continue */ }

    // Browser speech synthesis fallback
    await speakBrowser(text)
  }, [playUrl, speakBrowser])

  const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

  // Simple one-shot speak
  const speak = useCallback(async (word: string) => {
    if (state === 'loading' || state === 'playing') return
    stop()
    abortRef.current = false
    setState('loading')
    setError(null)
    try {
      setState('playing')
      await playText(word)
    } catch {
      setState('error')
      return
    }
    setState('idle')
  }, [state, stop, playText])

  // Classroom dictee format:
  //   Groep 3:  word → 2s → word
  //   Groep 4+: word → 2s → sentence → 2s → word
  const speakDictee = useCallback(async (word: string, grade: number, sentence?: string | null) => {
    if (state === 'loading' || state === 'playing') return
    stop()
    abortRef.current = false
    setState('loading')
    setError(null)

    try {
      setState('playing')

      await playText(word)
      if (abortRef.current) { setState('idle'); return }

      await sleep(2000)
      if (abortRef.current) { setState('idle'); return }

      if (grade >= 4 && sentence) {
        await playText(sentence)
        if (abortRef.current) { setState('idle'); return }

        await sleep(2000)
        if (abortRef.current) { setState('idle'); return }
      }

      await playText(word)
    } catch {
      setState('error')
      return
    }

    setState('idle')
  }, [state, stop, playText])

  return { state, error, speak, speakDictee, stop }
}
