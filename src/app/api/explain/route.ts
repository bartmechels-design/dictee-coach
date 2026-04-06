import Anthropic from '@anthropic-ai/sdk'
import { NL_WORDS } from '@/lib/languages/nl/words'

// Laad pre-gegenereerde uitleggen (gegenereerd via npm run gen:explanations)
let explanationCache: Record<string, string> = {}
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  explanationCache = require('@/lib/languages/nl/explanations.json')
} catch {
  // Cache nog niet gegenereerd — valt terug op live API
}

export async function POST(request: Request) {
  let word: string
  let grade: number

  try {
    const body = await request.json()
    word = body.word?.trim()
    grade = Number(body.grade) || 5
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!word) return Response.json({ error: 'Geen woord opgegeven' }, { status: 400 })

  // Stap 1: check pre-gegenereerde cache (0ms, €0)
  const cacheKey = `${word}_${grade}`
  if (explanationCache[cacheKey]) {
    return Response.json({ explanation: explanationCache[cacheKey], cached: true })
  }

  // Stap 2: zoek vaste regel in woordenbank
  const entry = NL_WORDS.find(w => w.word === word)

  if (!entry) {
    // Woord niet in standaard woordenbank (bijv. eigen lijst leerkracht)
    return generateLiveExplanation(word, grade, null, null)
  }

  // Stap 3: gebruik vaste regel als basis voor Claude Haiku
  return generateLiveExplanation(word, grade, entry.rule, entry.mnemonic ?? null)
}

async function generateLiveExplanation(
  word: string,
  grade: number,
  rule: string | null,
  mnemonic: string | null
): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ explanation: null, cached: false })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = rule
    ? `Herschrijf deze spellinguitleg voor een kind in groep ${grade} (${grade + 5} jaar) in precies 1-2 zinnen.
Gebruik eenvoudige woorden. Noem het woord "${word}" in de uitleg.
${mnemonic ? `Gebruik dit ezelsbruggetje: "${mnemonic}".` : ''}
Verander de spellingregel NOOIT.

Regel: ${rule}

Schrijf ALLEEN de uitleg, geen intro.`
    : `Leg in 1-2 eenvoudige zinnen uit hoe je "${word}" schrijft. Je schrijft voor een kind van groep ${grade}. Noem het woord in de uitleg.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Onverwacht antwoord')

    let explanation = content.text.trim()

    // Validatie: uitleg moet het woord bevatten
    if (!explanation.toLowerCase().includes(word.toLowerCase())) {
      explanation = rule ?? explanation
    }

    return Response.json({ explanation, cached: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return Response.json({ explanation: null, error: message, cached: false })
  }
}
