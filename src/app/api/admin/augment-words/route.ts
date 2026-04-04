/**
 * API endpoint to AI-augment CITO wordbank
 * Generates similar words for each existing word using Claude Haiku
 *
 * Usage: POST /api/admin/augment-words?token=...&grade=3&count=10
 */

import { Anthropic } from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const grade = Number(searchParams.get('grade')) || 3
  const seedToken = process.env.SEED_TOKEN || 'dev-seed-token'

  if (token !== seedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = new Anthropic()

    // Generate words for a specific grade + category
    const prompt = `Je bent een Nederlandse spelling-expert. Genereer 30 Nederlandse woorden voor groep ${grade} spelling oefening.

Richtlijnen:
- Zelfde moeilijkheidsgraad als groep ${grade}
- Varieer over categorieën: klankzuiver, medeklinkergroep, verdubbeling, ei/ij, au/ou, dt-regel, etc.
- Geschikt voor kinderen
- Alleen basis Nederlandse woorden

Format: JSON array met objects:
[
  {"word": "woord", "category": "klankzuiver", "rule": "Uitleg van de regel"},
  ...
]

Geef ALLEEN de JSON array, geen andere tekst.`

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON
    let words
    try {
      words = JSON.parse(responseText)
    } catch (e) {
      return Response.json({
        error: 'Failed to parse AI response',
        raw: responseText,
      }, { status: 400 })
    }

    return Response.json({
      success: true,
      grade,
      count: words.length,
      words,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const seedToken = process.env.SEED_TOKEN || 'dev-seed-token'

  if (token !== seedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({
    message: 'POST to /api/admin/augment-words to generate AI words',
    usage: 'POST /api/admin/augment-words?token=...&grade=3',
    grades: [3, 4, 5, 6, 7, 8],
  })
}
