/**
 * Generate audio for Groep 5 words
 * Uses Google Cloud TTS
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import * as fs from 'fs'
import * as path from 'path'
import { CITO_WORDS } from '../src/lib/languages/nl/cito-wordbank'

const outputDir = path.join(process.cwd(), 'public', 'audio')

async function generateAudio() {
  const client = new TextToSpeechClient({
    keyFilename: path.join(process.cwd(), 'credentials.json'),
  })

  const groep5Words = CITO_WORDS.filter(w => w.grade === 5)
  console.log(`🎧 Generating Groep 5 (${groep5Words.length} words)...`)

  let success = 0

  for (const wordEntry of groep5Words) {
    try {
      const { word } = wordEntry
      const filename = path.join(outputDir, `${word}.mp3`)
      if (fs.existsSync(filename)) {
        console.log(`  ⏭  ${word}`)
        continue
      }

      const text = `${word}. ${wordEntry.rule}. ${word}.`
      const request = {
        input: { text },
        voice: { languageCode: 'nl-NL', name: 'nl-NL-Standard-A' },
        audioConfig: { audioEncoding: 'MP3' as any, pitch: 0, speakingRate: 0.9 },
      }

      const [response] = await client.synthesizeSpeech(request)
      if (response.audioContent) {
        fs.writeFileSync(filename, Buffer.from(response.audioContent as any))
        console.log(`  ✅ ${word}`)
        success++
      }
    } catch (err) {
      console.log(`  ❌ ${wordEntry.word}`)
    }
  }

  console.log(`\n✅ Groep 5: ${success} files`)
}

generateAudio().catch(console.error)
