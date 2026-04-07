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
  const ctxRef = useRef<AudioContext | null>(null)
  const cancelRef = useRef(false)

  const getCtx = () => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }

  const stop = useCallback(() => {
    cancelRef.current = true
    try { ctxRef.current?.close() } catch { /* ignore */ }
    ctxRef.current = null
    window.speechSynthesis?.cancel()
    setState('idle')
  }, [])

  // Fetch static MP3 and decode into AudioBuffer
  const loadWord = async (ctx: AudioContext, word: string): Promise<AudioBuffer | null> => {
    try {
      const res = await fetch(`/audio/${encodeURIComponent(word)}.mp3`)
      if (!res.ok) return null
      const buf = await res.arrayBuffer()
      return await ctx.decodeAudioData(buf)
    } catch {
      return null
    }
  }

  // Schedule an AudioBuffer to play at `when` seconds, resolves when done
  const playAt = (ctx: AudioContext, buffer: AudioBuffer, when: number): Promise<void> => {
    return new Promise(resolve => {
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(ctx.destination)
      src.onended = () => resolve()
      src.start(when)
    })
  }

  // Browser synthesis for sentences (grade 4+ only)
  const browserSpeak = (text: string): Promise<void> => {
    return new Promise(resolve => {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = 'nl-NL'
      utt.rate = 0.82
      const dutch = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('nl'))
      if (dutch) utt.voice = dutch
      utt.onend = () => resolve()
      utt.onerror = () => resolve()
      window.speechSynthesis.speak(utt)
    })
  }

  // Classroom dictee:
  //   Groep 3:  woord → 2s → woord          (via static MP3)
  //   Groep 4+: woord → 2s → zin → 2s → woord
  const speakDictee = useCallback(async (
    word: string,
    grade: number,
    sentence?: string | null,
  ) => {
    if (state !== 'idle') return
    cancelRef.current = false

    const ctx = getCtx()
    await ctx.resume() // iOS requirement: resume from gesture

    setState('loading')

    const wordBuf = await loadWord(ctx, word)
    if (cancelRef.current) { setState('idle'); return }

    setState('playing')

    if (wordBuf) {
      // Web Audio: schedule word → 2s gap → word with precision
      const PAUSE = 2.0
      const t0 = ctx.currentTime + 0.05

      if (!sentence || grade < 4) {
        // Groep 3: word → 2s → word (pure AudioContext, no iOS issues)
        const p1 = playAt(ctx, wordBuf, t0)
        const p2 = playAt(ctx, wordBuf, t0 + wordBuf.duration + PAUSE)
        await p1
        if (cancelRef.current) { setState('idle'); return }
        await p2
      } else {
        // Groep 4+: word → 2s → sentence (browser) → 2s → word
        await playAt(ctx, wordBuf, t0)
        if (cancelRef.current) { setState('idle'); return }

        await new Promise<void>(r => setTimeout(r, 2000))
        if (cancelRef.current) { setState('idle'); return }

        await browserSpeak(sentence)
        if (cancelRef.current) { setState('idle'); return }

        await new Promise<void>(r => setTimeout(r, 2000))
        if (cancelRef.current) { setState('idle'); return }

        await playAt(ctx, wordBuf, ctx.currentTime + 0.05)
      }
    } else {
      // Fallback: browser synthesis voor alles
      await browserSpeak(word)
      await new Promise<void>(r => setTimeout(r, 2000))
      if (grade >= 4 && sentence) {
        await browserSpeak(sentence)
        await new Promise<void>(r => setTimeout(r, 2000))
      }
      await browserSpeak(word)
    }

    setState('idle')
  }, [state])

  const speak = useCallback(async (word: string) => {
    if (state !== 'idle') return
    cancelRef.current = false
    const ctx = getCtx()
    await ctx.resume()
    setState('loading')
    const buf = await loadWord(ctx, word)
    setState('playing')
    if (buf) {
      await playAt(ctx, buf, ctx.currentTime + 0.05)
    } else {
      await browserSpeak(word)
    }
    setState('idle')
  }, [state])

  return { state, speak, speakDictee, stop }
}
