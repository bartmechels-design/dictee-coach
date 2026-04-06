'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_LISTS } from '@/lib/dictee/defaultLists'
import { createSession, saveResult, completeSession } from '@/lib/dictee/queries'
import AudioButton from '@/components/dictee/AudioButton'
import AnswerInput from '@/components/dictee/AnswerInput'
import FeedbackBanner from '@/components/dictee/FeedbackBanner'
import SessionSummary from '@/components/dictee/SessionSummary'
import AvatarDisplay from '@/components/dictee/AvatarDisplay'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Button from '@/components/ui/Button'
import { getAvatar } from '@/lib/avatars'
import type { AvatarId, AvatarState } from '@/lib/avatars'
import type { DicteeResult } from '@/types/dictee'
import type { WordEntry } from '@/lib/dictee/defaultLists'
import type { AnswerInputHandle } from '@/components/dictee/AnswerInput'

const AVATAR_KEY = 'dictee_avatar'
const GUEST_MODE_KEY = 'dictee_guest_mode'
type Stage = 'selecting' | 'playing' | 'feedback-correct' | 'feedback-wrong1' | 'feedback-wrong2' | 'finished'

export default function DicteePage() {
  const [stage, setStage] = useState<Stage>('selecting')
  const [userId, setUserId] = useState<string | null>(null)
  const [isGuestMode, setIsGuestMode] = useState(false)
  const [selectedListIndex, setSelectedListIndex] = useState(0)
  const [words, setWords] = useState<WordEntry[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [results, setResults] = useState<DicteeResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [avatarId, setAvatarId] = useState<AvatarId>('ollie')
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [explanation, setExplanation] = useState<string | null>(null)
  const [lastTyped, setLastTyped] = useState('')
  const wordStartTime = useRef<number>(Date.now())
  const answerInputRef = useRef<AnswerInputHandle>(null)

  useEffect(() => {
    const saved = localStorage.getItem(AVATAR_KEY) as AvatarId | null
    if (saved) setAvatarId(saved)

    // Check for guest mode query param
    const params = new URLSearchParams(window.location.search)
    const guestParam = params.get('guest') === '1'

    if (guestParam) {
      setIsGuestMode(true)
      localStorage.setItem(GUEST_MODE_KEY, 'true')
    } else {
      const wasGuest = localStorage.getItem(GUEST_MODE_KEY) === 'true'
      if (wasGuest) {
        localStorage.removeItem(GUEST_MODE_KEY)
      }

      createClient().auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id)
        else window.location.href = '/'
      })
    }
  }, [])

  async function startSession() {
    if (!userId && !isGuestMode) return
    setError(null)
    const list = DEFAULT_LISTS[selectedListIndex]
    try {
      let sid: string
      if (isGuestMode) {
        // Generate temporary session ID for guest
        sid = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}`
      } else {
        const session = await createSession(userId!, null, 'kind')
        sid = session.id
      }
      setSessionId(sid)
      setWords(list.words)
      setWordIndex(0)
      setResults([])
      setAnswer('')
      setAvatarState('idle')
      wordStartTime.current = Date.now()
      setStage('playing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sessie aanmaken mislukt')
    }
  }

  async function fetchExplanation(word: WordEntry): Promise<string | null> {
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: word.word, grade: word.grade }),
      })
      const data = await res.json()
      return data.explanation ?? null
    } catch {
      return null
    }
  }

  const checkAnswer = useCallback(async () => {
    if (!answer.trim() || !sessionId) return
    const currentWord = words[wordIndex]
    const typed = answer.trim()
    const isCorrect = typed.toLowerCase() === currentWord.word.toLowerCase()
    const responseMs = Date.now() - wordStartTime.current

    setLastTyped(typed)
    setAnswer('')

    if (isCorrect) {
      setAvatarState('happy')
      setResults(prev => [...prev, {
        id: `local-${wordIndex}-1`,
        session_id: sessionId,
        word: currentWord.word,
        typed_answer: typed,
        is_correct: true,
        attempt_number: 1,
        answered_at: new Date().toISOString(),
        category: currentWord.category,
      }])
      setStage('feedback-correct')
      saveResult(sessionId, currentWord.word, typed, true, responseMs).catch(() => {})
      return
    }

    if (stage === 'playing') {
      setAvatarState('thinking')
      setStage('feedback-wrong1')
    } else {
      setAvatarState('thinking')
      const expl = await fetchExplanation(currentWord)
      setExplanation(expl)
      setResults(prev => [...prev, {
        id: `local-${wordIndex}-2`,
        session_id: sessionId,
        word: currentWord.word,
        typed_answer: typed,
        is_correct: false,
        attempt_number: 2,
        answered_at: new Date().toISOString(),
        category: currentWord.category,
      }])
      setStage('feedback-wrong2')
      saveResult(sessionId, currentWord.word, typed, false, responseMs).catch(() => {})
    }
  }, [answer, sessionId, wordIndex, words, stage])

  function handleRetry() {
    setAnswer('')
    wordStartTime.current = Date.now()
    setAvatarState('idle')
    setStage('playing')
  }

  async function nextWord() {
    const next = wordIndex + 1
    setExplanation(null)
    setAvatarState('idle')
    if (next >= words.length) {
      const correct = results.filter(r => r.is_correct).length
      if (sessionId) completeSession(sessionId, words.length, correct).catch(() => {})
      setAvatarState('celebrate')
      setStage('finished')
      return
    }
    setWordIndex(next)
    setAnswer('')
    wordStartTime.current = Date.now()
    setStage('playing')
  }

  function restart() {
    setStage('selecting')
    setSessionId(null)
    setResults([])
    setWordIndex(0)
    setAnswer('')
    setAvatarState('idle')
    setExplanation(null)
  }

  const avatar = getAvatar(avatarId)
  const currentWord = words[wordIndex]
  const progress = words.length > 0 ? `${wordIndex + 1} / ${words.length}` : ''
  const bg = 'linear-gradient(160deg, #fdf4ff 0%, #fef3c7 50%, #ecfdf5 100%)'

  if (stage === 'selecting') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 gap-6" style={{ background: bg }}>
        <div className="text-center">
          <div className="text-7xl mb-3 animate-float">{avatar.emoji}</div>
          <h1 className="text-3xl font-black text-slate-800">{avatar.name} staat klaar!</h1>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div>
            <label className="block text-sm font-black text-slate-600 mb-2">📚 Woordenlijst</label>
            <select value={selectedListIndex} onChange={e => setSelectedListIndex(Number(e.target.value))}
              className="w-full rounded-2xl px-4 py-3 text-slate-800 font-semibold focus:outline-none"
              style={{ border: '2.5px solid #e5e7eb', background: 'white' }}>
              {DEFAULT_LISTS.map((list, i) => (
                <option key={i} value={i}>{list.name} ({list.words.length} woorden)</option>
              ))}
            </select>
          </div>
          {error && <ErrorMessage message={error} />}
          <button onClick={startSession} disabled={!userId && !isGuestMode}
            className="rounded-2xl py-4 font-black text-white text-xl active:scale-95 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})`, boxShadow: `0 6px 20px ${avatar.color}44` }}>
            🎧 Start dictee!
          </button>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>← Terug</Button>
        </div>
      </main>
    )
  }

  if (stage === 'finished') {
    const grade = DEFAULT_LISTS[selectedListIndex]?.grade || 0
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6" style={{ background: bg }}>
        <AvatarDisplay avatarId={avatarId} state="celebrate" size="lg" />
        <div className="mt-6 w-full max-w-sm">
          <SessionSummary
            results={results}
            avatarId={avatarId}
            onRestart={restart}
            grade={grade}
            previousScore={undefined}
            isGuestMode={isGuestMode}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center pt-8 pb-10 px-6 gap-6" style={{ background: bg }}>
      <div className="flex items-center justify-between w-full max-w-sm">
        <button onClick={() => window.location.href = '/'} className="text-slate-400 text-sm font-semibold">← Stop</button>
        <div className="flex items-center gap-1.5">
          {words.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{ width: 10, height: 10, background: i < wordIndex ? avatar.color : i === wordIndex ? avatar.colorDark : '#e5e7eb' }} />
          ))}
        </div>
        <span className="text-sm font-black text-slate-500">{progress}</span>
      </div>

      <AvatarDisplay avatarId={avatarId} state={avatarState} size="md" />

      <div className="w-full max-w-sm flex flex-col gap-4">
        {(stage === 'playing' || stage === 'feedback-wrong1') && (
          <>
            {stage === 'feedback-wrong1' && (
              <FeedbackBanner isCorrect={false} correctWord={currentWord.word} typedAnswer={lastTyped} attempt={1} />
            )}
            <AudioButton word={currentWord.word} label="Hoor het woord" avatarColor={avatar.color} onPlayEnd={() => answerInputRef.current?.focus()} />
            <AnswerInput ref={answerInputRef} value={answer} onChange={setAnswer} onSubmit={checkAnswer} />
            {error && <ErrorMessage message={error} />}
            {stage === 'feedback-wrong1' ? (
              <button onClick={handleRetry}
                className="w-full rounded-2xl py-4 font-black text-white text-lg active:scale-95"
                style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})` }}>
                💪 Nog eens proberen!
              </button>
            ) : (
              <button onClick={checkAnswer} disabled={!answer.trim()}
                className="w-full rounded-2xl py-4 font-black text-white text-lg active:scale-95 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})` }}>
                Controleer ✓
              </button>
            )}
          </>
        )}

        {stage === 'feedback-correct' && (
          <>
            <FeedbackBanner isCorrect={true} correctWord={currentWord.word} typedAnswer={lastTyped} attempt={1} />
            <button onClick={nextWord}
              className="w-full rounded-2xl py-4 font-black text-white text-lg active:scale-95"
              style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})` }}>
              {wordIndex + 1 >= words.length ? '🏆 Bekijk resultaten!' : 'Volgende woord →'}
            </button>
          </>
        )}

        {stage === 'feedback-wrong2' && (
          <>
            <p className="text-center text-xs font-black text-slate-500 uppercase tracking-wide">
              {avatar.reactions.wrong2}
            </p>
            <FeedbackBanner isCorrect={false} correctWord={currentWord.word} typedAnswer={lastTyped} attempt={2} explanation={explanation ?? undefined} />
            <button onClick={nextWord}
              className="w-full rounded-2xl py-4 font-black text-white text-lg active:scale-95"
              style={{ background: `linear-gradient(135deg, ${avatar.color}, ${avatar.colorDark})` }}>
              {wordIndex + 1 >= words.length ? '🏆 Bekijk resultaten!' : 'Volgende woord →'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
