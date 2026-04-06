import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  let word: string
  let grade: number

  try {
    const body = await request.json()
    word = body.word?.trim()
    grade = Number(body.grade) || 4
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!word) return Response.json({ error: 'Geen woord opgegeven' }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ sentence: null })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `Maak één korte, natuurlijke Nederlandse zin voor een kind in groep ${grade} (${grade + 5} jaar) die het woord "${word}" bevat.
De zin moet duidelijk en eenvoudig zijn. Geen uitleg, alleen de zin zelf.
Voorbeeld: als woord "fiets" → "Ik rijd elke dag op mijn fiets naar school."
Schrijf ALLEEN de zin, geen aanhalingstekens, geen uitleg.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') return Response.json({ sentence: null })

    const sentence = content.text.trim()
    if (!sentence.toLowerCase().includes(word.toLowerCase())) {
      return Response.json({ sentence: null })
    }

    return Response.json({ sentence })
  } catch {
    return Response.json({ sentence: null })
  }
}
