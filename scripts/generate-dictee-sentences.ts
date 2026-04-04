/**
 * Generate Dutch dictee sentences for each grade
 * Uses Claude Haiku API to create natural sentences containing CITO words
 * Output: Database seeding via /api/admin/seed-sentences endpoint
 */

import * as fs from 'fs'
import * as path from 'path'
import { Anthropic } from '@anthropic-ai/sdk'
import { CITO_WORDS } from '../src/lib/languages/nl/cito-wordbank'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    process.env[key.trim()] = value.trim()
  }
})

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function generateSentencesForGrade(grade: number): Promise<any[]> {
  // Get sample words for this grade (max 10 to keep prompt reasonable)
  const gradeWords = CITO_WORDS.filter(w => w.grade === grade)
    .slice(0, 10)
    .map(w => w.word)

  if (gradeWords.length === 0) {
    console.log(`  ⚠️  No words found for Groep ${grade}`)
    return []
  }

  const prompt = `Je bent een Nederlands taalexpert. Genereer 10 natuurlijke, eenvoudige dictee-zinnen geschikt voor groep ${grade}.

Richtlijnen:
- Elk zin bevat minstens 1 woord uit deze lijst: ${gradeWords.join(', ')}
- Zin is geschikt voor groep ${grade} (simpel → complex)
- Zin is compleet en grammaticaal correct
- Lengte: 8-15 woorden
- Onderwerp geschikt voor kinderen

Return ONLY JSON array (geen andere tekst):
[
  {"sentence": "De kat speelt in het huis.", "words": ["kat", "speelt", "huis"], "grade": ${grade}},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract JSON from markdown code blocks if needed
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : text

    const sentences = JSON.parse(jsonStr)

    return sentences.map((s: any) => ({
      sentence: s.sentence,
      grade,
      words: s.words || [],
      category: 'dictee',
    }))
  } catch (err) {
    console.error(`Groep ${grade} failed:`, err instanceof Error ? err.message : String(err))
    return []
  }
}

async function main() {
  console.log('📝 Generating dictee sentences for Groep 3–8...\n')

  const allSentences: any[] = []

  for (const grade of [3, 4, 5, 6, 7, 8]) {
    console.log(`⏳ Groep ${grade}...`)
    const sentences = await generateSentencesForGrade(grade)
    console.log(`   ✅ ${sentences.length} sentences`)
    allSentences.push(...sentences)
  }

  console.log(`\n📊 Total: ${allSentences.length} sentences generated`)
  console.log('\n📝 Add these to database via /api/admin/seed-sentences endpoint')
  console.log('\nSentences JSON:')
  console.log(JSON.stringify(allSentences, null, 2))
}

main().catch(console.error)
