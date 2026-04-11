'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(redirect)
    })
  }, [redirect, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.replace(redirect)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Controleer je e-mail</h2>
        <p className="text-slate-500 text-sm">
          We hebben een bevestigingslink gestuurd naar <strong>{email}</strong>.
        </p>
        <a href="/" className="mt-6 inline-block text-indigo-600 hover:underline text-sm">← Terug naar home</a>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">✏️</div>
        <h1 className="text-2xl font-bold text-slate-800">
          {mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Dictee Coach voor leerkrachten</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mailadres</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
            placeholder="jou@school.nl"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
            placeholder={mode === 'register' ? 'Minimaal 6 tekens' : '••••••••'}
            minLength={mode === 'register' ? 6 : undefined}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Bezig...' : mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {mode === 'login' ? 'Nog geen account? ' : 'Al een account? '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
          className="text-indigo-600 font-semibold hover:underline"
        >
          {mode === 'login' ? 'Registreren' : 'Inloggen'}
        </button>
      </p>

      <div className="mt-6 text-center">
        <a href="/" className="text-slate-400 hover:text-slate-600 text-sm">← Terug naar home</a>
      </div>
    </>
  )
}

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-md">
        <Suspense fallback={<div className="text-center text-slate-400">Laden...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  )
}
