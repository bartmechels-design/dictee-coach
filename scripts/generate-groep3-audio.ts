/**
 * Generate audio for Groep 3 words (50 words)
 * Uses Google Cloud TTS
 * Output: public/audio/g3-{word}.mp3
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

  const groep3Words = CITO_WORDS.filter(w => w.grade === 3)
  console.log(`🎧 Generating audio for ${groep3Words.length} Groep 3 words...`)

  for (const wordEntry of groep3Words) {
    try {
      const { word } = wordEntry

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
        const filename = path.join(outputDir, `g3-${word}.mp3`)
        fs.writeFileSync(filename, Buffer.from(response.audioContent as any))
        console.log(`  ✅ ${word}`)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`  ❌ ${wordEntry.word}: ${msg}`)
    }
  }

  console.log(`\n✅ Groep 3 audio generation complete!`)
  console.log(`   Files: ${outputDir}`)
}

generateAudio().catch(console.error)
