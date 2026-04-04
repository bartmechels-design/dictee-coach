import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import * as fs from 'fs'
import * as path from 'path'
import { CITO_WORDS } from '../src/lib/languages/nl/cito-wordbank'

const outputDir = path.join(process.cwd(), 'public', 'audio')
const client = new TextToSpeechClient({ keyFilename: path.join(process.cwd(), 'credentials.json') })

async function generate() {
  const grades = [6, 7, 8]
  for (const grade of grades) {
    const words = CITO_WORDS.filter(w => w.grade === grade)
    console.log(`🎧 Groep ${grade} (${words.length} words)...`)
    
    let count = 0
    for (const w of words) {
      try {
        const file = path.join(outputDir, `${w.word}.mp3`)
        if (fs.existsSync(file)) { count++; continue }
        
        const [res] = await client.synthesizeSpeech({
          input: { text: `${w.word}. ${w.rule}. ${w.word}.` },
          voice: { languageCode: 'nl-NL', name: 'nl-NL-Standard-A' },
          audioConfig: { audioEncoding: 'MP3' as any, pitch: 0, speakingRate: 0.9 },
        })
        if (res.audioContent) {
          fs.writeFileSync(file, Buffer.from(res.audioContent as any))
          count++
        }
      } catch (e) {}
    }
    console.log(`  ✅ ${count}/${words.length}`)
  }
  
  console.log('\n✅ Done!')
}

generate().catch(console.error)
