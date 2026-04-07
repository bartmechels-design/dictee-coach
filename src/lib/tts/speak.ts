'use client'

import { useState, useRef, useCallback } from 'react'

type TtsState = 'idle' | 'loading' | 'playing' | 'error'

export type UseTtsReturn = {
  state: TtsState
  speak: (word: string) => void
  speakDictee: (word: string, grade: number, sentence?: string | null) => void
  stop: () => void
}

export function useTTS(): UseTtsReturn {
  const [state, setState] = useState<TtsState>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setState('idle')
  }, [])

  const playBlob = useCallback((blob: Blob): Promise<void> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => { URL.revokeObjectURL(url); resolve() }
      audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('audio-error')) }
      audio.play().catch(reject)
    })
  }, [])

  // Classroom dictee via één SSML-verzoek (word→2s→[sentence→2s]→word)
  const speakDictee = useCallback(async (word: string, grade: number, sentence?: string | null) => {
    if (state !== 'idle') return
    stop()
    setState('loading')

    try {
      const res = await fetch('/api/dictee-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, grade, sentence: sentence ?? null }),
      })

      if (!res.ok) throw new Error('TTS mislukt')
      const blob = await res.blob()
      setState('playing')
      await playBlob(blob)
    } catch {
      // Fallback: browser synthesis met handmatige pauze
      setState('playing')
      await speakBrowserDictee(word, grade, sentence ?? null)
    }

    setState('idle')
  }, [state, stop, playBlob])

  // Enkelvoudig woord (voor herhaalpogingen e.d.)
  const speak = useCallback(async (word: string) => {
    if (state !== 'idle') return
    stop()
    setState('loading')

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word }),
      })
      if (!res.ok) throw new Error('TTS mislukt')
      const blob = await res.blob()
      setState('playing')
      await playBlob(blob)
    } catch {
      setState('playing')
      await speakBrowserWord(word)
    }

    setState('idle')
  }, [state, stop, playBlob])

  return { state, speak, speakDictee, stop }
}

// Browser speech synthesis helpers (buiten hook, geen state nodig)
function speakBrowserWord(text: string): Promise<void> {
  return new Promise(resolve => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'nl-NL'
    utt.rate = 0.85
    utt.onend = () => resolve()
    utt.onerror = () => resolve()
    window.speechSynthesis.speak(utt)
  })
}

async function speakBrowserDictee(word: string, grade: number, sentence: string | null): Promise<void> {
  await speakBrowserWord(word)
  await new Promise<void>(r => setTimeout(r, 2000))
  if (grade >= 4 && sentence) {
    await speakBrowserWord(sentence)
    await new Promise<void>(r => setTimeout(r, 2000))
  }
  await speakBrowserWord(word)
}
