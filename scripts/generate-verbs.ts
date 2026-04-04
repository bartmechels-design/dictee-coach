/**
 * Generate Dutch verbs for each grade using Claude Haiku
 * Add them to CITO_WORDS array
 */

import { Anthropic } from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function generateVerbsForGrade(grade: number): Promise<any[]> {
  const prompt = `Je bent een Nederlandse taalexpert. Genereer 15 basiswerkwoorden (infinitief vorm) geschikt voor groep ${grade} spelling oefening.

Richtlijnen:
- Geschikt voor groep ${grade} niveau (simpel → complex)
- Veelvoorkomende Nederlandse werkwoorden
- Belangrijk voor spelling:
  ${grade <= 4 ? '- Regelmatige conjugatie (e-uitgang)' : ''}
  ${grade >= 5 ? '- Verschillende uitgangsgroepen' : ''}
  ${grade >= 7 ? '- Sterke werkwoorden' : ''}
- Alleen infinitief vormen
- Geen samengestelde werkwoorden

Return ONLY JSON array (geen andere tekst):
[
  {"word": "lopen", "category": "werkwoord", "rule": "Regelmatig werkwoord"},
  {"word": "maken", "category": "werkwoord", "rule": "Regelmatig werkwoord"},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const verbs = JSON.parse(text)
    return verbs.map((v: any) => ({
      word: v.word,
      grade,
      category: 'werkwoord',
      rule: v.rule || 'Werkwoord',
      difficulty: grade <= 4 ? 1 : grade <= 6 ? 2 : 3,
      source: 'AI-generated',
    }))
  } catch (err) {
    console.error(`Groep ${grade} failed:`, err instanceof Error ? err.message : String(err))
    return []
  }
}

async function main() {
  console.log('🤖 Generating verbs for Groep 3–8...\n')

  const allVerbs: any[] = []

  for (const grade of [3, 4, 5, 6, 7, 8]) {
    console.log(`⏳ Groep ${grade}...`)
    const verbs = await generateVerbsForGrade(grade)
    console.log(`   ✅ ${verbs.length} verbs`)
    allVerbs.push(...verbs)
  }

  console.log(`\n📊 Total: ${allVerbs.length} verbs generated`)
  console.log('\n📝 Add these to src/lib/languages/nl/cito-wordbank.ts before the closing ]')
  console.log('\nVerbs JSON:')
  console.log(JSON.stringify(allVerbs, null, 2))
}

main().catch(console.error)
