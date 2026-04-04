'use client'

import { useEffect, useState } from 'react'
import { getAvatar, randomReaction, type AvatarId, type AvatarState } from '@/lib/avatars'

type Props = {
  avatarId: AvatarId
  state: AvatarState
  customMessage?: string   // overschrijft de random reactie
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = { sm: 64, md: 96, lg: 128 }

export default function AvatarDisplay({ avatarId, state, customMessage, size = 'md' }: Props) {
  const avatar = getAvatar(avatarId)
  const [message, setMessage] = useState<string | null>(null)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    setAnimKey(k => k + 1)

    if (customMessage) {
      setMessage(customMessage)
      return
    }

    if (state === 'happy') {
      setMessage(randomReaction(avatar.reactions.correct))
    } else if (state === 'thinking') {
      setMessage(randomReaction(avatar.reactions.wrong1))
    } else if (state === 'celebrate') {
      setMessage(avatar.reactions.perfect)
    } else {
      setMessage(null)
    }
  }, [state, customMessage, avatar])

  const emojiSize = SIZE_MAP[size]

  const animClass =
    state === 'happy' || state === 'celebrate'
      ? 'animate-bounce-in'
      : state === 'thinking'
      ? 'animate-wiggle'
      : 'animate-float animate-pulse-glow'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar emoji */}
      <div key={animKey} className={animClass} style={{ fontSize: emojiSize, lineHeight: 1 }}>
        {avatar.emoji}
      </div>

      {/* Speech bubble */}
      {message && (
        <div
          className="rounded-2xl px-4 py-2.5 text-center font-bold text-sm max-w-xs animate-pop-in"
          style={{
            background: state === 'thinking' ? '#FEF3C7' : avatar.colorLight,
            color: avatar.colorDark,
            border: `2px solid ${avatar.color}44`,
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}
