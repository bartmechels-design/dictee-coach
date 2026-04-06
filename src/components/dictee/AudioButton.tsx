'use client'

import React, { useEffect, useRef } from 'react'
import { useTTS } from '@/lib/tts/speak'

type Props = {
  word: string
  grade?: number
  sentence?: string | null
  label?: string
  avatarColor?: string
  onPlayEnd?: () => void
}

export default function AudioButton({
  word,
  grade = 3,
  sentence,
  label = 'Hoor het woord',
  avatarColor = '#F59E0B',
  onPlayEnd,
}: Props) {
  const { state, speakDictee } = useTTS()
  const prevState = useRef(state)

  // Fire onPlayEnd when transitioning from playing → idle
  useEffect(() => {
    if (prevState.current === 'playing' && state === 'idle') {
      onPlayEnd?.()
    }
    prevState.current = state
  }, [state, onPlayEnd])

  const isActive = state === 'loading' || state === 'playing'

  return (
    <button
      onClick={() => speakDictee(word, grade, sentence)}
      disabled={isActive}
      aria-label={label}
      className="w-full flex items-center justify-center gap-3 rounded-2xl py-5 text-white font-black text-xl transition-all active:scale-95 disabled:opacity-70 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}cc)`,
        boxShadow: `0 6px 20px ${avatarColor}44`,
      }}
    >
      {state === 'loading' && (
        <span className="inline-block h-6 w-6 rounded-full border-3 border-white border-t-transparent animate-spin" />
      )}
      {state === 'playing' && <span className="text-2xl">🔊</span>}
      {(state === 'idle' || state === 'error') && <span className="text-2xl">▶</span>}
      <span>
        {state === 'loading' ? 'Laden...' : state === 'playing' ? 'Luisteren...' : label}
      </span>
    </button>
  )
}
