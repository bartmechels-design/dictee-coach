import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UploadWordlist } from '@/components/teacher/UploadWordlist'

export default async function TeacherPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?redirect=/teacher')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👩‍🏫 Leerkracht Dashboard</h1>
          <p className="text-gray-600">Beheer je eigen woordenlijsten voor dictee</p>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <UploadWordlist />
        </div>

        {/* Info Box */}
        <div className="max-w-2xl mx-auto bg-blue-50 rounded-2xl p-8 border-2 border-blue-200">
          <h2 className="text-xl font-bold text-blue-900 mb-4">📋 Hoe werkt het?</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span>1️⃣</span>
              <span><strong>Upload je woordenlijst</strong> — CSV of JSON formaat</span>
            </li>
            <li className="flex gap-3">
              <span>2️⃣</span>
              <span><strong>Kies groep</strong> — voor welke groep is deze lijst?</span>
            </li>
            <li className="flex gap-3">
              <span>3️⃣</span>
              <span><strong>Gebruik in lessen</strong> — je eigen woorden in dictee-oefening</span>
            </li>
            <li className="flex gap-3">
              <span>4️⃣</span>
              <span><strong>Track voortgang</strong> — zie hoe je kinderen verbeteren</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-blue-900 mt-8 mb-3">📁 Bestandsformat</h3>
          <p className="text-sm text-gray-700 mb-3"><strong>CSV (simpel):</strong></p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto mb-4">
{`huis
boom
school
auto,voertuig`}
          </pre>

          <p className="text-sm text-gray-700 mb-3"><strong>JSON (met categorieën):</strong></p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`[
  {"word": "huis"},
  {"word": "boom"},
  {"word": "school"},
  {"word": "auto", "category": "voertuig"}
]`}
          </pre>
        </div>
      </div>
    </main>
  )
}
