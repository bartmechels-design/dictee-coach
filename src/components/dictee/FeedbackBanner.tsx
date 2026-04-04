type Props = {
  isCorrect: boolean
  correctWord: string
  typedAnswer: string
  explanation?: string | null  // AI-uitleg na 2e fout
  attempt: 1 | 2               // welke poging was dit?
}

export default function FeedbackBanner({
  isCorrect,
  correctWord,
  typedAnswer,
  explanation,
  attempt,
}: Props) {
  if (isCorrect) {
    return (
      <div className="rounded-2xl px-6 py-4 text-center animate-pop-in"
        style={{ background: '#f0fdf4', border: '2.5px solid #4ade80' }}>
        <p className="text-2xl font-black text-green-700">✓ {correctWord}</p>
      </div>
    )
  }

  if (attempt === 1) {
    // Eerste fout: aanmoedigen, GEEN antwoord geven
    return (
      <div className="rounded-2xl px-6 py-4 text-center animate-pop-in"
        style={{ background: '#fffbeb', border: '2.5px solid #fbbf24' }}>
        <p className="text-lg font-black text-amber-700">Bijna! Probeer nog eens 💪</p>
        <p className="text-amber-600 text-sm mt-1">Jij schreef: <span className="line-through font-semibold">{typedAnswer}</span></p>
      </div>
    )
  }

  // Tweede fout: laat correct woord + uitleg zien
  return (
    <div className="rounded-2xl px-6 py-4 text-center animate-pop-in"
      style={{ background: '#fef2f2', border: '2.5px solid #f87171' }}>
      <p className="text-sm text-red-500 font-semibold">Jij schreef: <span className="line-through">{typedAnswer}</span></p>
      <p className="text-xl font-black text-slate-800 mt-1">
        Het is: <span className="text-green-700">{correctWord}</span>
      </p>
      {explanation && (
        <div className="mt-3 rounded-xl px-4 py-2 text-left"
          style={{ background: '#fffbeb', border: '1.5px solid #fbbf24' }}>
          <p className="text-xs font-black text-amber-700 uppercase tracking-wide mb-1">💡 Wist je dat?</p>
          <p className="text-sm text-amber-900 font-semibold leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  )
}
