'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function UploadWordlist() {
  const [session, setSession] = useState<any>(null)

  // Get session on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])
  const [file, setFile] = useState<File | null>(null)
  const [listName, setListName] = useState('')
  const [grade, setGrade] = useState(3)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !listName) {
      setMessage({ type: 'error', text: 'Please select a file and enter a list name' })
      return
    }

    if (!session) {
      setMessage({ type: 'error', text: 'You must be logged in' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('listName', listName)
      formData.append('grade', grade.toString())

      const response = await fetch('/api/teacher/upload-wordlist', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({
          type: 'error',
          text: data.error || 'Upload failed',
        })
        return
      }

      setMessage({
        type: 'success',
        text: `✅ ${data.totalWords} woorden geüpload: "${data.listName}"`,
      })

      // Reset form
      setFile(null)
      setListName('')
      setGrade(3)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Upload failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📚 Upload Woordenlijst</h2>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* List Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Naam van de woordenlijst
          </label>
          <input
            type="text"
            value={listName}
            onChange={e => setListName(e.target.value)}
            placeholder="bijv. 'Vogelsoorten' of 'Werkwoorden Groep 4'"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            disabled={loading}
          />
        </div>

        {/* Grade */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Groep
          </label>
          <select
            value={grade}
            onChange={e => setGrade(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
            disabled={loading}
          >
            {[3, 4, 5, 6, 7, 8].map(g => (
              <option key={g} value={g}>
                Groep {g}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Bestand (CSV of JSON)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition">
            <input
              type="file"
              accept=".csv,.json"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input" className="cursor-pointer">
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-green-600">✅ {file.name}</p>
                  <p className="text-xs text-gray-500">Klik om te wijzigen</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">📁 Kies een bestand</p>
                  <p className="text-sm text-gray-500">CSV of JSON formaat</p>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            CSV: één woord per regel of woord,categorie<br/>
            JSON: <code className="bg-gray-100 px-1">[{"{"}"word":"huis"{"}"}]</code>
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file || !listName}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '⏳ Uploaden...' : '🚀 Upload Woordenlijst'}
        </button>
      </form>
    </div>
  )
}
