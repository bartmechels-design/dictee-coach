/**
 * Generate audio for Groep 4 words (75 words)
 * Uses Google Cloud TTS
 * Output: public/audio/{word}.mp3
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import * as fs from 'fs'
import * as path from 'path'
import { CITO_WORDS } from '../src/lib/languages/nl/cito-wordbank'

const outputDir = path.join(process.cwd(), 'public', 'audio')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

async function generateAudio() {
  const client = new TextToSpeechClient({
    keyFilename: path.join(process.cwd(), 'credentials.json'),
  })

  const groep4Words = CITO_WORDS.filter(w => w.grade === 4)
  console.log(`🎧 Generating audio for ${groep4Words.length} Groep 4 words...`)

  let success = 0
  let failed = 0

  for (const wordEntry of groep4Words) {
    try {
      const { word } = wordEntry

      // Check if file already exists (skip if done)
      const filename = path.join(outputDir, `${word}.mp3`)
      if (fs.existsSync(filename)) {
        console.log(`  ⏭  ${word} — al aanwezig`)
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

  console.log(`\n✅ Groep 4 complete! ${success} success, ${failed} failed`)
}

generateAudio().catch(console.error)
