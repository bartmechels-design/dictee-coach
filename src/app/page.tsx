'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AvatarSelector from '@/components/dictee/AvatarSelector'
import type { AvatarId } from '@/lib/avatars'
import { getAvatar } from '@/lib/avatars'

type Screen = 'avatar' | 'login' | 'home'
type Mode = 'login' | 'register'

const AVATAR_KEY = 'dictee_avatar'
const GRADE_KEY = 'dictee_grade'

export default function Home() {
  const [screen, setScreen] = useState<Screen>('avatar')
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null)
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [checking, setChecking] = useState(true)

  // Herstel avatar + check sessie
  useEffect(() => {
    const saved = localStorage.getItem(AVATAR_KEY) as AvatarId | null
    if (saved) setAvatarId(saved)

    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUser({ email: data.user.email })
        setScreen(saved ? 'home' : 'avatar')
      } else {
        setScreen(saved ? 'login' : 'avatar')
      }
      setChecking(false)
    })
  }, [])

  function handleAvatarSelect(id: AvatarId) {
    setAvatarId(id)
    localStorage.setItem(AVATAR_KEY, id)
    setScreen(user ? 'home' : 'login')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    let result
    if (mode === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      return
    }
    if (mode === 'register') {
      setError('Check je e-mail om je account te bevestigen.')
      return
    }
    setUser({ email })
    setScreen('home')
  }

  async function handleSignOut() {
    await createClient().auth.signOut()
    setUser(null)
    setScreen('login')
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #fef3c7 50%, #ecfdf5 100%)' }}>
        <span className="text-5xl animate-float">✏️</span>
      </main>
    )
  }

  if (screen === 'avatar') {
    return <AvatarSelector onSelect={handleAvatarSelect} />
  }

  const avatar = avatarId ? getAvatar(avatarId) : null

  if (screen === 'home' && user && avatar) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #fef3c7 50%, #ecfdf5 100%)' }}>
        <div className="absolute top-6 left-6 text-3xl opacity-40 animate-float">⭐</div>
        <div className="absolute top-10 right-8 text-2xl opacity-40 animate-float" style={{ animationDelay: '1s' }}>✨</div>

        <div className="w-full max-w-sm relative z-10">
          {/* Avatar header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-28 h-28 rounded-full mb-4 animate-float"
              style={{ background: avatar.colorLight, fontSize: 64 }}
            >
              {avatar.emoji}
            </div>
            <h1 className="text-3xl font-black text-slate-800">Dictee Coach</h1>
            <p className="text-slate-500 mt-1 font-semibold">
              {avatar.name} is er klaar voor! 🎯
            </p>
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-3">
            <a href="/dictee"
              className="flex items-center gap-4 rounded-2xl px-6 py-4 text-white font-black text-xl transition-all active:scale-95 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})`, boxShadow: `0 6px 20px ${avatar.color}44` }}>
              <span className="text-4xl">🎧</span>
              <div>
                <div>Dictee oefenen</div>
                <div className="text-sm font-semibold opacity-80">Hoor en schrijf!</div>
              </div>
            </a>
            <a href="/lijsten"
              className="flex items-center gap-4 rounded-2xl px-6 py-4 text-white font-black text-xl transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4facfe, #00c6fb)', boxShadow: '0 6px 20px #4facfe44' }}>
              <span className="text-4xl">📋</span>
              <div>
                <div>Woordenlijsten</div>
                <div className="text-sm font-semibold opacity-80">Kies je woorden</div>
              </div>
            </a>
            <a href="/voortgang"
              className="flex items-center gap-4 rounded-2xl px-6 py-4 text-white font-black text-xl transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)', boxShadow: '0 6px 20px #43e97b44' }}>
              <span className="text-4xl">⭐</span>
              <div>
                <div>Mijn voortgang</div>
                <div className="text-sm font-semibold opacity-80">Sterren &amp; streaks</div>
              </div>
            </a>
          </div>

          <div className="flex justify-between items-center mt-8">
            <button onClick={() => { localStorage.removeItem(AVATAR_KEY); setAvatarId(null); setScreen('avatar') }}
              className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
              {avatar.emoji} Wissel coach
            </button>
            <button onClick={handleSignOut}
              className="text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
              Uitloggen
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Login scherm
  return (
    <main className="flex min-h-screen flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #fef3c7 50%, #ecfdf5 100%)' }}>

      {/* Decoraties */}
      <div className="absolute top-6 left-5 text-4xl opacity-40 animate-float">⭐</div>
      <div className="absolute top-10 right-6 text-3xl opacity-40 animate-float" style={{ animationDelay: '0.7s' }}>✨</div>

      {/* Header */}
      <div className="flex flex-col items-center justify-center pt-12 pb-6 px-6 relative z-10">
        {avatar && (
          <div className="text-7xl mb-4 animate-float">{avatar.emoji}</div>
        )}
        <h1 className="text-5xl font-black tracking-tight text-center leading-none"
          style={{ color: avatar?.color ?? '#F59E0B' }}>
          Dictee<br />Coach
        </h1>
        <div className="mt-4 flex items-center gap-2 bg-white/80 rounded-full px-5 py-2 shadow backdrop-blur-sm">
          <span className="text-xl">🎤</span>
          <p className="text-slate-700 font-bold text-sm">
            {avatar ? `${avatar.name} helpt je oefenen!` : 'Leer spellen met een AI-coach!'}
          </p>
        </div>
      </div>

      {/* Formulier */}
      <div className="flex-1 rounded-t-[2.5rem] bg-white px-6 pt-8 pb-10 shadow-2xl relative z-10">
        <div className="flex justify-center gap-2 mb-6">
          {['🔵', '🟡', '🔴', '🟢', '🟠', '🟣'].map((dot, i) => (
            <span key={i} className="text-xl">{dot}</span>
          ))}
        </div>

        <div className="flex rounded-2xl p-1 mb-6" style={{ background: '#f5f5f5' }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button key={m}
              className="flex-1 py-3 rounded-xl text-sm font-black transition-all"
              style={mode === m
                ? { background: `linear-gradient(135deg, ${avatar?.color ?? '#F59E0B'}, ${avatar?.colorDark ?? '#D97706'})`, color: 'white', boxShadow: `0 4px 12px ${avatar?.color ?? '#F59E0B'}44` }
                : { color: '#999' }}
              onClick={() => { setMode(m); setError(null) }}>
              {m === 'login' ? 'Inloggen' : 'Nieuw account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-black text-slate-600 mb-2">📧 E-mailadres</label>
            <input type="email" placeholder="jouw@email.nl" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="w-full rounded-2xl px-4 py-3.5 text-slate-800 text-base focus:outline-none font-medium"
              style={{ border: '2.5px solid #e5e7eb', background: '#fafafa' }}
              onFocus={e => { e.target.style.borderColor = avatar?.color ?? '#F59E0B' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-sm font-black text-slate-600 mb-2">🔒 Wachtwoord</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required
              className="w-full rounded-2xl px-4 py-3.5 text-slate-800 text-base focus:outline-none font-medium"
              style={{ border: '2.5px solid #e5e7eb', background: '#fafafa' }}
              onFocus={e => { e.target.style.borderColor = avatar?.color ?? '#F59E0B' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb' }} />
          </div>

          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm font-bold"
              style={{ background: '#fff0f0', border: '2px solid #fca5a5', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="mt-2 rounded-2xl py-4 font-black text-white text-lg transition-all active:scale-95 disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${avatar?.color ?? '#F59E0B'}, ${avatar?.colorDark ?? '#D97706'})`,
              boxShadow: `0 8px 24px ${avatar?.color ?? '#F59E0B'}44`
            }}>
            {loading ? '⏳ Even wachten...' : mode === 'login' ? '🚀 Inloggen!' : '✨ Account aanmaken!'}
          </button>
        </form>

        <button onClick={() => setScreen('avatar')}
          className="mt-6 w-full text-center text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors">
          ← Andere coach kiezen
        </button>
      </div>
    </main>
  )
}
