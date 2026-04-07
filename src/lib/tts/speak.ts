'use client'

import { useState, useRef, useCallback } from 'react'

type TtsState = 'idle' | 'loading' | 'playing' | 'error'

export type UseTtsReturn = {
  state: TtsState
  speak: (word: string) => void
  speakDictee: (word: string, grade: number, sentence?: string | null) => void
  stop: () => void
}

async function fetchAudioBuffer(ctx: AudioContext, text: string): Promise<AudioBuffer> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error('TTS API fout')
  const arrayBuffer = await res.arrayBuffer()
  return ctx.decodeAudioData(arrayBuffer)
}

function scheduleBuffer(ctx: AudioContext, buffer: AudioBuffer, when: number): Promise<void> {
  return new Promise(resolve => {
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.onended = () => resolve()
    source.start(when)
  })
}

export function useTTS(): UseTtsReturn {
  const [state, setState] = useState<TtsState>('idle')
  const ctxRef = useRef<AudioContext | null>(null)
  const cancelledRef = useRef(false)

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }, [])

  const stop = useCallback(() => {
    cancelledRef.current = true
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close()
      ctxRef.current = null
    }
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

    const ctx = getCtx()
    // Resume AudioContext in response to user gesture (required on iOS)
    await ctx.resume()

    setState('loading')

    try {
      // Fetch all audio in parallel
      const [wordBuf, sentBuf] = await Promise.all([
        fetchAudioBuffer(ctx, word),
        grade >= 4 && sentence ? fetchAudioBuffer(ctx, sentence) : Promise.resolve(null),
      ])

      if (cancelledRef.current) { setState('idle'); return }

      setState('playing')

      const PAUSE = 2.0 // seconds
      let t = ctx.currentTime + 0.05 // small buffer

      // 1. word
      await scheduleBuffer(ctx, wordBuf, t)
      if (cancelledRef.current) { setState('idle'); return }

      t += wordBuf.duration + PAUSE

      // 2. sentence (grade 4+)
      if (sentBuf) {
        await scheduleBuffer(ctx, sentBuf, t)
        if (cancelledRef.current) { setState('idle'); return }
        t += sentBuf.duration + PAUSE
      }

      // 3. word again
      await scheduleBuffer(ctx, wordBuf, t)

    } catch {
      // Fallback to browser synthesis
      setState('playing')
      await fallbackBrowserDictee(word, grade, sentence ?? null)
    }

    setState('idle')
  }, [state, getCtx])

  const speak = useCallback(async (word: string) => {
    if (state !== 'idle') return
    cancelledRef.current = false
    const ctx = getCtx()
    await ctx.resume()
    setState('loading')

    try {
      const buf = await fetchAudioBuffer(ctx, word)
      if (cancelledRef.current) { setState('idle'); return }
      setState('playing')
      await scheduleBuffer(ctx, buf, ctx.currentTime + 0.05)
    } catch {
      setState('playing')
      await fallbackBrowserSpeak(word)
    }

    setState('idle')
  }, [state, getCtx])

  return { state, speak, speakDictee, stop }
}

// Browser synthesis fallbacks
function fallbackBrowserSpeak(text: string): Promise<void> {
  return new Promise(resolve => {
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'nl-NL'
    utt.rate = 0.85
    const dutch = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('nl'))
    if (dutch) utt.voice = dutch
    utt.onend = () => resolve()
    utt.onerror = () => resolve()
    window.speechSynthesis.speak(utt)
  })
}

async function fallbackBrowserDictee(word: string, grade: number, sentence: string | null) {
  await fallbackBrowserSpeak(word)
  await new Promise<void>(r => setTimeout(r, 2000))
  if (grade >= 4 && sentence) {
    await fallbackBrowserSpeak(sentence)
    await new Promise<void>(r => setTimeout(r, 2000))
  }
  await fallbackBrowserSpeak(word)
}
