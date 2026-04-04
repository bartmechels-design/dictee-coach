'use client'

import { useState, useEffect } from 'react'
import type { DicteeResult } from '@/types/dictee'
import { getAvatar } from '@/lib/avatars'
import type { AvatarId } from '@/lib/avatars'
import type { ReportResponse } from '@/app/api/report/route'

type Props = {
  results: DicteeResult[]
  avatarId: AvatarId
  onRestart: () => void
  grade: number
  previousScore?: number
  isGuestMode?: boolean
}

export default function SessionSummary({ results, avatarId, onRestart, grade, previousScore, isGuestMode }: Props) {
  const avatar = getAvatar(avatarId)
  const correct = results.filter(r => r.is_correct).length
  const total = results.length
  const score = `${correct}/${total}`
  const scoreNum = Math.round((correct / total) * 10)
  const stars = correct === total ? 5 : correct >= total * 0.8 ? 4 : correct >= total * 0.6 ? 3 : correct >= total * 0.4 ? 2 : 1
  const mistakes = results.filter(r => !r.is_correct)

  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const reportResults = results.map(r => ({
          word: r.word,
          correct: r.is_correct,
          category: r.category,
        }))

        const response = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            results: reportResults,
            grade,
            previousScore,
          }),
        })
        const data = await response.json()
        setReport(data)
      } catch (e) {
        console.error('Report fetch failed:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [results, grade, previousScore])

  function handleShare() {
    const text = `${avatar.emoji} Dictee Coach: ${score} gehaald! ${Array(stars).fill('⭐').join('')}\ndicteecoach.nl`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text).catch(() => {})
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Score kaart — het shareable moment */}
      <div className="w-full rounded-3xl p-6 text-center"
        style={{ background: `linear-gradient(135deg, ${avatar.color}22, ${avatar.colorLight})`, border: `3px solid ${avatar.color}44` }}>
        <div className="text-6xl font-black mb-1" style={{ color: avatar.colorDark }}>{score}</div>
        <div className="text-2xl mb-2">{Array(stars).fill('⭐').join('')}</div>
        <p className="font-black text-lg" style={{ color: avatar.colorDark }}>
          {correct === total ? 'Alles goed! Wauw!' : correct >= total * 0.6 ? 'Goed gedaan!' : 'Blijven oefenen!'}
        </p>
        <p className="text-xs mt-3 font-semibold text-slate-500">dicteecoach.nl</p>
      </div>

      {/* Deel knop */}
      <button onClick={handleShare}
        className="w-full rounded-2xl py-3.5 font-black text-white text-base active:scale-95"
        style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})` }}>
        📲 Deel met opa/oma of de juf!
      </button>

      {/* Ouderrapport — uitleg voor de ouder */}
      {!loading && report && (
        <div className="w-full rounded-2xl p-5" style={{ background: '#f8f4ff', border: '2px solid #ddd6fe' }}>
          <p className="font-black text-slate-700 mb-3 text-sm">👨‍👩‍👧 Voor jou (ouder):</p>
          <p className="text-slate-700 font-semibold text-sm mb-2">{report.summary}</p>
          {previousScore && (
            <p className="text-xs text-slate-600 mb-2">
              📈 Vorige sessie: {previousScore}/10 — nu: {scoreNum}/10
            </p>
          )}
          {report.errorPattern && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mb-2">
              ⚠️ Extra aandacht: <strong>{report.errorPattern}</strong>
            </p>
          )}
          <p className="text-sm text-slate-700 leading-relaxed italic">{report.tip}</p>
          {report.gradeEstimate && (
            <p className="text-xs text-slate-500 mt-2">
              💡 Verwachte toetsscore: ~{report.gradeEstimate}
            </p>
          )}
        </div>
      )}

      {/* Guest sign-up CTA */}
      {isGuestMode && (
        <div className="w-full rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${avatar.color}22, ${avatar.colorLight})`, border: `2px solid ${avatar.color}44` }}>
          <p className="font-black text-slate-700 text-sm mb-2">💾 Wil je je voortgang bijhouden?</p>
          <p className="text-xs text-slate-600 mb-3">Maak een gratis account en volg alle prestaties van je kind!</p>
          <button onClick={() => window.location.href = '/?action=signup'}
            className="w-full rounded-2xl py-2.5 font-black text-white text-sm"
            style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})` }}>
            ✨ Gratis account maken
          </button>
        </div>
      )}

      {/* Fouten overzicht */}
      {mistakes.length > 0 && (
        <div className="w-full rounded-2xl p-4" style={{ background: '#fef9f0', border: '2px solid #fde68a' }}>
          <p className="font-black text-amber-800 mb-3 text-sm">📝 Deze woorden mogen nog eens:</p>
          <div className="flex flex-wrap gap-2">
            {mistakes.map(r => (
              <span key={r.id} className="rounded-xl px-3 py-1 text-sm font-black"
                style={{ background: '#fef3c7', color: '#92400e' }}>
                {r.word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Knoppen */}
      <div className="flex gap-3 w-full">
        {isGuestMode ? (
          <>
            <button onClick={() => window.location.href = '/'}
              className="flex-1 rounded-2xl py-3.5 font-black text-slate-700 active:scale-95"
              style={{ background: 'white', border: '2.5px solid #e5e7eb' }}>
              🏠 Home
            </button>
          </>
        ) : (
          <>
            <button onClick={onRestart}
              className="flex-1 rounded-2xl py-3.5 font-black text-white active:scale-95"
              style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})` }}>
              🔄 Opnieuw
            </button>
            <button onClick={() => window.location.href = '/'}
              className="flex-1 rounded-2xl py-3.5 font-black text-slate-700 active:scale-95"
              style={{ background: 'white', border: '2.5px solid #e5e7eb' }}>
              🏠 Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
