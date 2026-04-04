import { DEFAULT_LISTS } from '@/lib/dictee/defaultLists'

export default function LijstenPage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <a href="/" className="text-slate-400 hover:text-slate-600">← Terug</a>
        <h1 className="text-2xl font-bold text-slate-800">Woordenlijsten</h1>
      </div>

      <div className="flex flex-col gap-6">
        {DEFAULT_LISTS.map(list => (
          <div key={list.grade} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-800 mb-3">
              {list.name}
              <span className="ml-2 text-sm font-normal text-slate-400">{list.words.length} woorden</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {list.words.map(entry => (
                <span
                  key={entry.word}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {entry.word}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate-400 text-center">
        Eigen woordenlijsten uploaden komt binnenkort beschikbaar.
      </p>
    </main>
  )
}
