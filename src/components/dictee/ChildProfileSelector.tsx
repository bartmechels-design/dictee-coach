'use client'

import { useState } from 'react'
import type { ChildProfile } from '@/types/dictee'
import { getAvatar } from '@/lib/avatars'
import type { AvatarId } from '@/lib/avatars'

type Props = {
  profiles: ChildProfile[]
  onSelect: (profile: ChildProfile) => void
  onCreateNew: () => void
}

export default function ChildProfileSelector({ profiles, onSelect, onCreateNew }: Props) {
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGrade, setNewGrade] = useState(3)
  const [newAvatar, setNewAvatar] = useState<AvatarId>('ollie')
  const avatarIds: AvatarId[] = ['ollie', 'leo', 'stella', 'max']

  if (showNew) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-black text-slate-800">Nieuw kind toevoegen</h2>

        <div>
          <label className="block text-sm font-black text-slate-600 mb-2">📝 Voornaam</label>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="bijv. Emma"
            className="w-full rounded-2xl px-4 py-3 text-slate-800 font-semibold"
            style={{ border: '2.5px solid #e5e7eb' }}
          />
        </div>

        <div>
          <label className="block text-sm font-black text-slate-600 mb-2">📚 Groep</label>
          <select
            value={newGrade}
            onChange={e => setNewGrade(Number(e.target.value))}
            className="w-full rounded-2xl px-4 py-3 text-slate-800 font-semibold"
            style={{ border: '2.5px solid #e5e7eb' }}
          >
            {[3, 4, 5, 6, 7, 8].map(g => (
              <option key={g} value={g}>
                Groep {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-black text-slate-600 mb-3">🎨 Coach</label>
          <div className="grid grid-cols-4 gap-3">
            {avatarIds.map(id => {
              const avatar = getAvatar(id)
              return (
                <button
                  key={id}
                  onClick={() => setNewAvatar(id)}
                  className={`rounded-2xl p-3 text-4xl transition-all ${newAvatar === id ? 'ring-4' : ''}`}
                  style={{
                    background: newAvatar === id ? `${avatar.color}22` : 'white',
                    border: newAvatar === id ? `3px solid ${avatar.color}` : '2px solid #e5e7eb',
                    color: newAvatar === id ? avatar.colorDark : 'inherit',
                  }}
                >
                  {avatar.emoji}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => {
            if (newName.trim()) {
              onCreateNew()
              setShowNew(false)
            }
          }}
          className="w-full rounded-2xl py-3.5 font-black text-white text-base"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          ✅ Toevoegen
        </button>

        <button
          onClick={() => setShowNew(false)}
          className="w-full rounded-2xl py-3.5 font-black text-slate-700"
          style={{ background: 'white', border: '2.5px solid #e5e7eb' }}
        >
          Annuleren
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-black text-slate-800">Welk kind oefent?</h2>

      <div className="grid gap-3">
        {profiles.map(profile => {
          const avatar = getAvatar(profile.avatar_id as AvatarId)
          return (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className="rounded-2xl p-4 text-left transition-all hover:scale-102 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${avatar.color}22, ${avatar.colorLight})`,
                border: `2px solid ${avatar.color}44`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{avatar.emoji}</div>
                  <div>
                    <p className="font-black text-slate-800">{profile.name}</p>
                    <p className="text-xs text-slate-600">Groep {profile.grade}</p>
                  </div>
                </div>
                {profile.current_streak > 0 && (
                  <div className="text-2xl font-black">🔥 {profile.current_streak}</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => setShowNew(true)}
        className="w-full rounded-2xl py-3.5 font-black text-white text-base"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
      >
        ➕ Nieuw kind
      </button>
    </div>
  )
}
