'use client'

import { useState, useRef, useCallback } from 'react'

type TtsState = 'idle' | 'loading' | 'playing' | 'error'

export type UseTtsReturn = {
  state: TtsState
  speak: (word: string) => void
  speakDictee: (word: string, grade: number, sentence?: string | null) => void
  stop: () => void
}

// Speak one piece of text via browser synthesis, resolves when done.
function browserSpeak(text: string): Promise<void> {
  return new Promise(resolve => {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'nl-NL'
    utt.rate = 0.85

    // Pick best Dutch voice available
    const voices = window.speechSynthesis.getVoices()
    const dutch = voices.find(v => v.lang === 'nl-NL' && /femke|anna|xander/i.test(v.name))
      ?? voices.find(v => v.lang === 'nl-NL')
      ?? voices.find(v => v.lang.startsWith('nl'))
    if (dutch) utt.voice = dutch

    utt.onend = () => resolve()
    utt.onerror = () => resolve()
    window.speechSynthesis.speak(utt)
  })
}

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

export function useTTS(): UseTtsReturn {
  const [state, setState] = useState<TtsState>('idle')
  const cancelledRef = useRef(false)

  const stop = useCallback(() => {
    cancelledRef.current = true
    window.speechSynthesis?.cancel()
    setState('idle')
  }, [])

  // Classroom dictee:
  //   Groep 3:  woord → 2s → woord
  //   Groep 4+: woord → 2s → zin → 2s → woord
  const speakDictee = useCallback(async (
    word: string,
    grade: number,
    sentence?: string | null,
  ) => {
    if (state !== 'idle') return
    cancelledRef.current = false
    setState('loading')

    // Ensure voices are loaded (needed on first call in some browsers)
    if (window.speechSynthesis.getVoices().length === 0) {
      await new Promise<void>(r => {
        window.speechSynthesis.onvoiceschanged = () => r()
        setTimeout(r, 1000)
      })
    }

    setState('playing')

    await browserSpeak(word)
    if (cancelledRef.current) { setState('idle'); return }

    await sleep(2000)
    if (cancelledRef.current) { setState('idle'); return }

    if (grade >= 4 && sentence) {
      await browserSpeak(sentence)
      if (cancelledRef.current) { setState('idle'); return }
      await sleep(2000)
      if (cancelledRef.current) { setState('idle'); return }
    }

    await browserSpeak(word)
    setState('idle')
  }, [state])

  const speak = useCallback(async (word: string) => {
    if (state !== 'idle') return
    cancelledRef.current = false
    setState('playing')
    await browserSpeak(word)
    setState('idle')
  }, [state])

  return { state, speak, speakDictee, stop }
}
