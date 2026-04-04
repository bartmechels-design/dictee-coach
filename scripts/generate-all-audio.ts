/**
 * Generate audio for ALL CITO words across all grades (3-8)
 * Uses Google Cloud TTS (nl-NL-Standard-A)
 * Output: public/audio/{word}.mp3 (no prefix)
 * Skips existing files to avoid re-generating
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import * as fs from 'fs'
import * as path from 'path'
import { CITO_WORDS } from '../src/lib/languages/nl/cito-wordbank'

const outputDir = path.join(process.cwd(), 'public', 'audio')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function generateAllAudio() {
  const client = new TextToSpeechClient({
    keyFilename: path.join(process.cwd(), 'credentials.json'),
  })

  console.log(`🎧 Generating audio for all CITO words (Groep 3-8)...\n`)

  let success = 0
  let skipped = 0
  let failed = 0

  // Group words by grade for progress tracking
  const byGrade = new Map<number, typeof CITO_WORDS>()
  CITO_WORDS.forEach(w => {
    if (!byGrade.has(w.grade)) byGrade.set(w.grade, [])
    byGrade.get(w.grade)!.push(w)
  })

  for (const grade of [3, 4, 5, 6, 7, 8]) {
    const gradeWords = byGrade.get(grade) || []
    console.log(`\nGroep ${grade} (${gradeWords.length} words):`)

    for (const wordEntry of gradeWords) {
      try {
        const { word } = wordEntry
        const filename = path.join(outputDir, `${word}.mp3`)

        // Skip if file already exists
        if (fs.existsSync(filename)) {
          console.log(`  ⏭  ${word}`)
          skipped++
          continue
        }

        // Text format: word. [Rule]. Word.
        const text = `${word}. ${wordEntry.rule}. ${word}.`

        const request = {
          input: { text },
          voice: {
            languageCode: 'nl-NL',
            name: 'nl-NL-Standard-A',
          },
          audioConfig: {
            audioEncoding: 'MP3' as any,
            pitch: 0,
            speakingRate: 0.9,
          },
        }

        const [response] = await client.synthesizeSpeech(request)

        if (response.audioContent) {
          fs.writeFileSync(filename, Buffer.from(response.audioContent as any))
          console.log(`  ✅ ${word}`)
          success++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.log(`  ❌ ${wordEntry.word}: ${msg}`)
        failed++
      }
    }
  }

  console.log(`\n✅ Audio generation complete!`)
  console.log(`   Success: ${success}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Failed: ${failed}`)
  console.log(`   Output: ${outputDir}`)
}

generateAllAudio().catch(console.error)
