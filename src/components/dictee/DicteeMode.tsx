'use client'

import { useState, useRef, useEffect } from 'react'

interface DicteeSentence {
  id: string
  text: string
  grade: number
  categories: string[]
}

interface WordResult {
  word: string
  correct: boolean
  userInput: string
}

export function DicteeMode({ sentence, onComplete }: { sentence: DicteeSentence; onComplete: (results: WordResult[]) => void }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [userInputs, setUserInputs] = useState<string[]>([])
  const [results, setResults] = useState<WordResult[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Split sentence into words for dictation
  const words = sentence.text.replace(/[.,!?;:]/g, '').split(/\s+/)

  useEffect(() => {
    setUserInputs(new Array(words.length).fill(''))
  }, [sentence])

  const handlePlayAudio = async () => {
    if (isPlaying) return

    setIsPlaying(true)
    try {
      // Generate audio for the complete sentence via TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sentence.text,
          grade: sentence.grade,
          // Add sentence ID for potential caching
          sentenceId: sentence.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.onended = () => setIsPlaying(false)
        await audioRef.current.play()
      }
    } catch (err) {
      console.error('Failed to play audio:', err)
      setIsPlaying(false)
    }
  }

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs]
    newInputs[index] = value
    setUserInputs(newInputs)
  }

  const handleSkipWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    }
  }

  const normalizeWord = (word: string): string => {
    return word
      .toLowerCase()
      .trim()
      .replace(/[.,!?;:—–-]/g, '') // Remove punctuation
  }

  const handleSubmitWord = () => {
    const userInput = userInputs[currentWordIndex]
    const correctWord = words[currentWordIndex]

    // Normalize both words for comparison (case-insensitive, no punctuation)
    const isCorrect = normalizeWord(userInput) === normalizeWord(correctWord)

    const newResults = [...results]
    newResults[currentWordIndex] = {
      word: correctWord,
      correct: isCorrect,
      userInput: userInput || '[leeg]',
    }
    setResults(newResults)

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      setIsCompleted(true)
      onComplete(newResults)
    }
  }

  if (isCompleted) {
    const correctCount = results.filter(r => r.correct).length
    const accuracy = Math.round((correctCount / results.length) * 100)

    // Determine star rating (1-3 stars)
    let stars = '⭐'
    if (accuracy >= 80) stars = '⭐⭐⭐'
    else if (accuracy >= 60) stars = '⭐⭐'

    // Motivational message
    let message = ''
    if (accuracy === 100) message = 'Perfect! 🎉'
    else if (accuracy >= 80) message = 'Goed bezig! 👏'
    else if (accuracy >= 60) message = 'Bijna daar! 💪'
    else message = 'Probeer volgende keer beter! 📚'

    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">📊 Dictee Resultaat</h3>
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="text-6xl font-bold text-blue-600 mb-2">{correctCount}/{results.length}</div>
          <p className="text-3xl mb-3">{stars}</p>
          <p className="text-2xl font-bold text-gray-800 mb-2">{accuracy}%</p>
          <p className="text-lg text-gray-700">{message}</p>
        </div>

        <h4 className="font-bold text-gray-800 mb-3">Jouw antwoorden:</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 ${
                result.correct
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">{result.word}</span>
                <span className="text-xl">{result.correct ? '✓' : '✗'}</span>
              </div>
              {!result.correct && (
                <p className="text-sm text-red-600 mt-1">
                  Jij zei: <em>"{result.userInput}"</em>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">🎙️ Dictee: {sentence.text}</h3>

      {/* Audio Player */}
      <button
        onClick={handlePlayAudio}
        disabled={isPlaying}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mb-6 hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isPlaying ? '⏳ Audio aan het afspelen...' : '🔊 Luister naar zin'}
      </button>

      <audio ref={audioRef} />

      {/* Word Input */}
      <div className="bg-gray-50 p-6 rounded-xl mb-6">
        <p className="text-sm text-gray-600 mb-2">
          Woord {currentWordIndex + 1} van {words.length}
        </p>
        <p className="text-lg font-semibold text-gray-800 mb-4">Typ het woord:</p>
        <input
          type="text"
          value={userInputs[currentWordIndex]}
          onChange={e => handleInputChange(currentWordIndex, e.target.value)}
          placeholder="..."
          onKeyDown={e => e.key === 'Enter' && handleSubmitWord()}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
          autoFocus
        />
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSkipWord}
          className="flex-1 bg-gray-400 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition"
        >
          ⏭️ Volgende
        </button>
        <button
          onClick={handleSubmitWord}
          className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition"
        >
          ✓ OK
        </button>
      </div>
    </div>
  )
}
