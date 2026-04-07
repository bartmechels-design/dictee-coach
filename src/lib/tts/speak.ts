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
  const stoppedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stop = useCallback(() => {
    stoppedRef.current = true
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.speechSynthesis?.cancel()
    setState('idle')
  }, [])

  // Play a pre-generated static MP3. Returns true on success.
  const playStaticMp3 = useCallback((word: string): Promise<boolean> => {
    return new Promise(resolve => {
      const audio = new Audio(`/audio/${encodeURIComponent(word)}.mp3`)
      audioRef.current = audio
      let started = false

      audio.oncanplaythrough = () => {
        if (started) return
        started = true
        audio.play().catch(() => resolve(false))
      }
      audio.onended = () => resolve(true)
      audio.onerror = () => resolve(false)
      // If file not found within 3s, bail
      setTimeout(() => { if (!started) resolve(false) }, 3000)
      audio.load()
    })
  }, [])

  // Speak text via browser synthesis. Always resolves.
  const speakBrowser = useCallback((text: string, rate = 0.85): Promise<void> => {
    return new Promise(resolve => {
      window.speechSynthesis?.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'nl-NL'
      utt.rate = rate
      // Prefer a Dutch female voice if available
      const voices = window.speechSynthesis?.getVoices() ?? []
      const dutch = voices.find(v => v.lang === 'nl-NL' || v.lang === 'nl_NL')
      if (dutch) utt.voice = dutch
      utt.onend = () => resolve()
      utt.onerror = () => resolve()
      window.speechSynthesis?.speak(utt)
    })
  }, [])

  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

  // Play one word: static MP3 first, browser fallback
  const playWord = useCallback(async (word: string) => {
    if (stoppedRef.current) return
    const ok = await playStaticMp3(word)
    if (!ok && !stoppedRef.current) await speakBrowser(word)
  }, [playStaticMp3, speakBrowser])

  // Classroom dictee sequence:
  //   Groep 3:  word → 2s → word
  //   Groep 4+: word → 2s → sentence → 2s → word
  const speakDictee = useCallback(async (word: string, grade: number, sentence?: string | null) => {
    if (state !== 'idle') return
    stop()
    stoppedRef.current = false
    setState('loading')

    // Pre-check that static file exists so there's no gap
    const hasStatic = await fetch(`/audio/${encodeURIComponent(word)}.mp3`, { method: 'HEAD' })
      .then(r => r.ok).catch(() => false)

    if (stoppedRef.current) return
    setState('playing')

    // 1. Play word
    if (hasStatic) {
      await playStaticMp3(word)
    } else {
      await speakBrowser(word)
    }

    if (stoppedRef.current) return
    await sleep(2000)

    // 2. Sentence (grade 4+ only)
    if (!stoppedRef.current && grade >= 4 && sentence) {
      await speakBrowser(sentence)
      if (stoppedRef.current) return
      await sleep(2000)
    }

    // 3. Play word again
    if (!stoppedRef.current) {
      if (hasStatic) {
        await playStaticMp3(word)
      } else {
        await speakBrowser(word)
      }
    }

    setState('idle')
  }, [state, stop, playStaticMp3, speakBrowser, playWord])

  // Simple one-shot word (for review screens etc.)
  const speak = useCallback(async (word: string) => {
    if (state !== 'idle') return
    stop()
    stoppedRef.current = false
    setState('playing')
    await playWord(word)
    setState('idle')
  }, [state, stop, playWord])

  return { state, speak, speakDictee, stop }
}
