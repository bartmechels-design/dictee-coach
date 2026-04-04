'use client'

import { useState, useEffect } from 'react'
import { DicteeMode } from '@/components/dictee/DicteeMode'

interface DicteeSentence {
  id: string
  text: string
  grade: number
  categories: string[]
}

export default function DicteeTestPage() {
  const [sentences, setSentences] = useState<DicteeSentence[]>([])
  const [selectedSentence, setSelectedSentence] = useState<DicteeSentence | null>(null)
  const [grade, setGrade] = useState(3)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch sentences from hardcoded data since table not yet seeded
    const mockSentences: DicteeSentence[] = [
      {
        id: '1',
        text: 'De kat zit op de mat in het huis.',
        grade: 3,
        categories: ['klankzuiver'],
      },
      {
        id: '2',
        text: 'De hond rent achter de bal in het park.',
        grade: 3,
        categories: ['klankzuiver'],
      },
      {
        id: '3',
        text: 'De zon schijnt en het is warm buiten.',
        grade: 3,
        categories: ['klankzuiver'],
      },
      {
        id: '4',
        text: 'Ik ga naar school met mijn fiets.',
        grade: 3,
        categories: ['klankzuiver'],
      },
      {
        id: '5',
        text: 'De boom heeft groene bladeren en bruine takken.',
        grade: 3,
        categories: ['klankzuiver'],
      },
      {
        id: '6',
        text: 'Het bloed stroomt als je jezelf snijdt.',
        grade: 4,
        categories: ['oe-regel'],
      },
      {
        id: '7',
        text: 'De bloem groeit in de tuin bij het huis.',
        grade: 4,
        categories: ['oe-regel'],
      },
      {
        id: '8',
        text: 'De trein rijdt naar Amsterdam vandaag.',
        grade: 5,
        categories: ['ei-ij'],
      },
      {
        id: '9',
        text: 'Dit is een klein en fijn moment.',
        grade: 5,
        categories: ['ei-ij'],
      },
    ]

    const filtered = mockSentences.filter(s => s.grade === grade)
    setSentences(filtered)
  }, [grade])

  const handleComplete = (results: any[]) => {
    const correctCount = results.filter(r => r.correct).length
    const accuracy = Math.round((correctCount / results.length) * 100)
    console.log(`✅ Test complete: ${correctCount}/${results.length} (${accuracy}%)`)
  }

  if (selectedSentence) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
        <div className="container mx-auto">
          <button
            onClick={() => setSelectedSentence(null)}
            className="mb-6 text-blue-600 font-semibold hover:underline"
          >
            ← Terug naar selectie
          </button>
          <DicteeMode sentence={selectedSentence} onComplete={handleComplete} />
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎙️ Dictee Test Mode</h1>
          <p className="text-gray-600">Test de DicteeMode component met AI-gegenereerde zinnen</p>
        </div>

        {/* Grade Selector */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-4">
            Kies groep:
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[3, 4, 5, 6, 7, 8].map(g => (
              <button
                key={g}
                onClick={() => {
                  setGrade(g)
                  setSelectedSentence(null)
                }}
                className={`py-2 px-4 rounded-lg font-semibold transition ${
                  grade === g
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Groep {g}
              </button>
            ))}
          </div>
        </div>

        {/* Sentences List */}
        <div className="grid gap-4">
          {sentences.length > 0 ? (
            sentences.map(sentence => (
              <button
                key={sentence.id}
                onClick={() => setSelectedSentence(sentence)}
                className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition text-left hover:bg-blue-50"
              >
                <p className="text-lg text-gray-800 mb-2">{sentence.text}</p>
                <p className="text-sm text-gray-500">
                  Categorieën: {sentence.categories.join(', ')}
                </p>
              </button>
            ))
          ) : (
            <p className="text-gray-600 text-center py-8">
              Geen zinnen voor groep {grade}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-2xl p-8 border-2 border-blue-200 mt-12">
          <h2 className="text-xl font-bold text-blue-900 mb-4">📋 Hoe werkt het?</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Kies een groep (3-8)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Selecteer een zin</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Klik "Luister naar zin" om de audio af te spelen</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Typ elk woord na elkaar</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">5.</span>
              <span>Zie je score en fouten</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  )
}
