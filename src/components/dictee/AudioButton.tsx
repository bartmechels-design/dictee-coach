'use client'

import React, { useEffect } from 'react'
import { useTTS } from '@/lib/tts/speak'

type Props = {
  word: string
  label?: string
  avatarColor?: string
  onPlayEnd?: () => void
}

export default function AudioButton({ word, label = 'Hoor het woord', avatarColor = '#F59E0B', onPlayEnd }: Props) {
  const { state, speak } = useTTS()

  // Call onPlayEnd when audio finishes
  useEffect(() => {
    if (state === 'idle' && onPlayEnd) {
      // Only call if transitioning from playing to idle
      const timer = setTimeout(() => onPlayEnd(), 100)
      return () => clearTimeout(timer)
    }
  }, [state, onPlayEnd])
  const isActive = state === 'loading' || state === 'playing'

  return (
    <button
      onClick={() => speak(word)}
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
