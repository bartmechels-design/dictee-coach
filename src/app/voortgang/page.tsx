'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DicteeSession } from '@/types/dictee'

type SessionWithResults = DicteeSession & {
  wrongWords: string[]
}

export default function VoortgangPage() {
  const [sessions, setSessions] = useState<SessionWithResults[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVoortgang()
  }, [])

  async function loadVoortgang() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Je bent niet ingelogd.')
      setLoading(false)
      return
    }

    const { data: sessionData, error: sessErr } = await supabase
      .from('dictee_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20)

    if (sessErr) { setError(sessErr.message); setLoading(false); return }

    const sessionsWithResults: SessionWithResults[] = []
    for (const session of (sessionData ?? [])) {
      const { data: results } = await supabase
        .from('dictee_results')
        .select('word, is_correct')
        .eq('session_id', session.id)
        .eq('is_correct', false)

      sessionsWithResults.push({
        ...session,
        wrongWords: [...new Set((results ?? []).map((r: { word: string }) => r.word))],
      })
    }

    setSessions(sessionsWithResults)
    setLoading(false)
  }

  const totalSessions = sessions.length
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((s, sess) => s + (sess.total_words > 0 ? (sess.correct_count / sess.total_words) * 100 : 0), 0) / totalSessions)
    : 0

  const allWrongWords = sessions.flatMap(s => s.wrongWords)
  const wordFreq = allWrongWords.reduce<Record<string, number>>((acc, w) => {
    acc[w] = (acc[w] ?? 0) + 1
    return acc
  }, {})
  const topWrong = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 8)

  if (loading) {
    return (
      <main className="min-h-screen p-8 max-w-2xl mx-auto flex items-center justify-center">
        <div className="text-slate-400">Laden...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/" className="text-slate-400 hover:text-slate-600">← Terug</a>
        <h1 className="text-2xl font-bold text-slate-800">Voortgang</h1>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      {sessions.length === 0 && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Nog geen dictees afgerond.{' '}
          <a href="/dictee" className="text-indigo-600 hover:underline">Start je eerste dictee →</a>
        </div>
      )}

      {sessions.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">{totalSessions}</div>
              <div className="text-xs text-slate-500 mt-1">Dictees gedaan</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{avgScore}%</div>
              <div className="text-xs text-slate-500 mt-1">Gemiddelde score</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-3xl font-bold text-orange-500">{topWrong.length}</div>
              <div className="text-xs text-slate-500 mt-1">Lastige woorden</div>
            </div>
          </div>

          {topWrong.length > 0 && (
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-5 mb-8">
              <h2 className="font-semibold text-slate-800 mb-3">Woorden om extra te oefenen</h2>
              <div className="flex flex-wrap gap-2">
                {topWrong.map(([word, count]) => (
                  <span key={word} className="rounded-full bg-white border border-orange-200 px-3 py-1 text-sm text-slate-700 flex items-center gap-1.5">
                    {word}
                    <span className="text-xs text-orange-500 font-medium">{count}×</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <h2 className="font-semibold text-slate-800 mb-3">Recente dictees</h2>
          <div className="flex flex-col gap-3">
            {sessions.map((session) => {
              const pct = session.total_words > 0
                ? Math.round((session.correct_count / session.total_words) * 100)
                : 0
              const date = session.completed_at
                ? new Date(session.completed_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
                : ''

              return (
                <div key={session.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">
                      {session.child_name || 'Anoniem'} — {session.correct_count}/{session.total_words} goed
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{date}</div>
                    {session.wrongWords.length > 0 && (
                      <div className="text-xs text-orange-500 mt-1">
                        Fout: {session.wrongWords.slice(0, 4).join(', ')}
                        {session.wrongWords.length > 4 ? ` +${session.wrongWords.length - 4}` : ''}
                      </div>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                    {pct}%
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
