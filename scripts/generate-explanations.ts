/**
 * Pre-genereer kindvriendelijke uitleg voor alle woorden via Claude 3.5 Haiku.
 * Draai eenmalig lokaal: npx tsx scripts/generate-explanations.ts
 *
 * Slaat resultaten op als JSON — geladen door de app zonder API-call.
 * Strategie: AI is alleen "vertaler" van de vaste rule, verzint NIETS zelf.
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { NL_WORDS } from '../src/lib/languages/nl/words'
import type { WordEntry } from '../src/lib/languages/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const OUT_FILE = path.join(process.cwd(), 'src', 'lib', 'languages', 'nl', 'explanations.json')

type ExplanationCache = Record<string, string> // key: `${word}_${grade}`

async function generateExplanation(entry: WordEntry): Promise<string> {
  const prompt = `Herschrijf deze spellinguitleg voor een kind in groep ${entry.grade} (${entry.grade + 5} jaar) in precies 1-2 zinnen.
Gebruik eenvoudige woorden. Noem het woord "${entry.word}" altijd in de uitleg.
${entry.mnemonic ? `Gebruik dit ezelsbruggetje als het past: "${entry.mnemonic}".` : ''}
Verander de spellingregel NOOIT — je vertaalt alleen naar kindertaal.

Spellingregel om te vertalen:
${entry.rule}

Schrijf ALLEEN de kindvriendelijke uitleg, geen intro of extra tekst.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Onverwacht antwoord')

  // Validatie: uitleg moet het woord bevatten
  const explanation = content.text.trim()
  if (!explanation.toLowerCase().includes(entry.word.toLowerCase())) {
    // Fallback: gebruik de originele rule
    return entry.rule
  }

  return explanation
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY niet gevonden. Voeg toe aan .env.local')
    process.exit(1)
  }

  // Laad bestaande cache
  let cache: ExplanationCache = {}
  if (fs.existsSync(OUT_FILE)) {
    cache = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'))
  }

  const todo = NL_WORDS.filter(w => !cache[`${w.word}_${w.grade}`])
  console.log(`\nGenereer uitleg voor ${todo.length} woorden (${NL_WORDS.length - todo.length} al gecached)...\n`)

  if (todo.length === 0) {
    console.log('✅ Alle uitleg al gegenereerd!')
    return
  }

  for (let i = 0; i < todo.length; i++) {
    const entry = todo[i]
    const key = `${entry.word}_${entry.grade}`

    try {
      const explanation = await generateExplanation(entry)
      cache[key] = explanation
      console.log(`  ✓  ${entry.word} (groep ${entry.grade}): ${explanation}`)
    } catch (err) {
      // Fallback bij fout: gebruik de originele rule
      cache[key] = entry.rule
      console.error(`  ⚠  ${entry.word}: fout, gebruik originele rule`)
    }

    // Kleine pauze om rate limits te vermijden
    if (i % 10 === 9) await new Promise(r => setTimeout(r, 1000))
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(cache, null, 2))
  console.log(`\n✅ Klaar! ${Object.keys(cache).length} uitleggen opgeslagen in explanations.json`)
}

main()
