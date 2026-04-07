import Anthropic from '@anthropic-ai/sdk'

const BANNED_PHRASES = ['gewoon woord', 'spelling', 'schrijf', 'de regel', 'klinkt als', 'het woord is']

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

  const prompt = `Schrijf één Nederlandse spreekzin voor een kind in groep ${grade} met het woord "${word}".
Schrijf gewoon een zin zoals een leraar die hardop uitspreekt bij een dictee.
Voorbeeld voor "fiets": "Ik rijd elke dag op mijn fiets naar school."
Voorbeeld voor "appel": "Ik eet een appel als tussendoortje."
Schrijf ALLEEN de zin, niets anders.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') return Response.json({ sentence: null })

    const sentence = content.text.trim().replace(/^["']|["']$/g, '')
    const lower = sentence.toLowerCase()

    // Must contain the word
    if (!lower.includes(word.toLowerCase())) return Response.json({ sentence: null })

    // Must not contain spelling meta-language
    if (BANNED_PHRASES.some(p => lower.includes(p))) return Response.json({ sentence: null })

    return Response.json({ sentence })
  } catch {
    return Response.json({ sentence: null })
  }
}
