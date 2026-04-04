import { Anthropic } from '@anthropic-ai/sdk'

export type DicteeResult = {
  word: string
  correct: boolean
  category?: string
}

export type ReportRequest = {
  results: DicteeResult[]
  grade: number
  previousScore?: number
}

export type ReportResponse = {
  summary: string
  errorPattern?: string
  tip?: string
  gradeEstimate?: number
}

export async function POST(request: Request) {
  try {
    const body: ReportRequest = await request.json()
    const { results, grade, previousScore } = body

    if (!results || results.length === 0) {
      return Response.json({ error: 'Geen resultaten' }, { status: 400 })
    }

    const correct = results.filter(r => r.correct).length
    const total = results.length
    const score = Math.round((correct / total) * 10)

    // Bepaal foutpatroon
    const errorsByCategory: Record<string, number> = {}
    results.forEach(r => {
      if (!r.correct && r.category) {
        errorsByCategory[r.category] = (errorsByCategory[r.category] || 0) + 1
      }
    })

    const topError = Object.entries(errorsByCategory).sort(
      ([, a], [, b]) => b - a
    )[0]

    // Genereer ouderrapport via Claude (kindvriendelijk Nederlands)
    const client = new Anthropic()
    const categoryName = topError
      ? getCategoryName(topError[0])
      : 'spellingfouten'

    const prompt = `Jij bent een vriendelijk onderwijscoach die ouders helpt hun kind te steunen met spelling.

Kind heeft net een dictee geoefend:
- ${correct} van ${total} woorden correct (${score}/10)
- Groep: ${grade}
${topError ? `- Meeste fouten in: ${categoryName}` : ''}
${previousScore ? `- Vorige sessie: ${previousScore}/10 (nu: ${score}/10)` : ''}

Schrijf in Nederlands, kortaf, warm tone:
1. Korte pep-talk (1 zin): iets positiefs over de prestatie
2. Wat ging goed / waar letten op (1-2 zinnen)
3. Oefentip speciaal voor ${categoryName} (1-2 zinnen, praktisch)

Hou het onder 60 woorden totaal. Geen backticks, pure tekst.`

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    const reportText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Bereken geschatte toetsscore (zeer simpel)
    let gradeEstimate: number | undefined
    if (previousScore) {
      // Trend-based estimate: if score improved, assume continued improvement
      const trend = score - previousScore
      gradeEstimate = Math.min(score + Math.max(0, Math.round(trend * 0.5)), 10)
    }

    return Response.json({
      summary: `${correct} van ${total} woorden goed — goed bezig!`,
      errorPattern: topError ? categoryName : undefined,
      tip: reportText,
      gradeEstimate,
    } as ReportResponse)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return Response.json({ error: `Report mislukt: ${message}` }, { status: 500 })
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    'ei-ij': 'ei/ij-woorden',
    'au-ou': 'au/ou-woorden',
    'dt-regel': 'd/t-regel',
    'medeklinkergroep': 'medeklinkergroepen (br, tr, sl)',
    'verdubbeling': 'verdubbeling medeklinker',
    'verlengingsregel': 'verlengingsregel',
    'trema': 'trema (ë, ï)',
    'werkwoord': 'werkwoorden',
  }
  return names[category] || category
}
