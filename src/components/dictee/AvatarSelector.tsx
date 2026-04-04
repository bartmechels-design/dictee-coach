'use client'

import { useState } from 'react'
import { AVATAR_LIST, type AvatarId } from '@/lib/avatars'

type Props = {
  onSelect: (id: AvatarId) => void
}

export default function AvatarSelector({ onSelect }: Props) {
  const [selected, setSelected] = useState<AvatarId | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  function handlePick(id: AvatarId) {
    setSelected(id)
  }

  function handleConfirm() {
    if (!selected) return
    setConfirmed(true)
    setTimeout(() => onSelect(selected), 600)
  }

  const chosen = AVATAR_LIST.find(a => a.id === selected)

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #fef3c7 50%, #ecfdf5 100%)' }}
    >
      {/* Decoraties */}
      <div className="absolute top-6 left-6 text-3xl opacity-40 animate-float">⭐</div>
      <div className="absolute top-10 right-8 text-2xl opacity-40 animate-float" style={{ animationDelay: '1s' }}>✨</div>
      <div className="absolute bottom-16 left-8 text-3xl opacity-30 animate-float" style={{ animationDelay: '0.5s' }}>💫</div>
      <div className="absolute bottom-24 right-6 text-2xl opacity-40 animate-float" style={{ animationDelay: '1.5s' }}>🌟</div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-slate-800 leading-tight">
            Wie is<br />jouw coach?
          </h1>
          <p className="text-slate-500 mt-2 font-semibold">Kies je favoriete oefenmaatje!</p>
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {AVATAR_LIST.map(avatar => {
            const isSelected = selected === avatar.id
            return (
              <button
                key={avatar.id}
                onClick={() => handlePick(avatar.id)}
                className="rounded-3xl p-5 flex flex-col items-center gap-2 transition-all active:scale-95"
                style={{
                  background: isSelected ? avatar.color : 'white',
                  boxShadow: isSelected
                    ? `0 8px 32px ${avatar.color}66`
                    : '0 4px 16px rgba(0,0,0,0.08)',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  border: `3px solid ${isSelected ? avatar.colorDark : 'transparent'}`,
                }}
              >
                <span
                  className={isSelected ? 'animate-bounce-in' : 'animate-float'}
                  style={{ fontSize: 56, lineHeight: 1 }}
                >
                  {avatar.emoji}
                </span>
                <span
                  className="font-black text-lg"
                  style={{ color: isSelected ? 'white' : '#1e293b' }}
                >
                  {avatar.name}
                </span>
                {isSelected && (
                  <span className="text-white text-xs font-bold bg-white/20 rounded-full px-3 py-0.5 animate-pop-in">
                    Geselecteerd ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Bevestig knop */}
        {chosen && (
          <button
            onClick={handleConfirm}
            disabled={confirmed}
            className="w-full rounded-2xl py-4 font-black text-white text-xl transition-all active:scale-95 disabled:opacity-60 animate-pop-in"
            style={{
              background: `linear-gradient(135deg, ${chosen.color}, ${chosen.colorDark})`,
              boxShadow: `0 8px 24px ${chosen.color}55`,
            }}
          >
            {confirmed
              ? `${chosen.emoji} Hoi, ik ben ${chosen.name}!`
              : `Kies ${chosen.name}! ${chosen.emoji}`}
          </button>
        )}
      </div>
    </main>
  )
}
