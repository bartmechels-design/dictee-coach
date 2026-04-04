/**
 * Pre-genereer MP3-bestanden via Google Cloud Text-to-Speech (natuurlijke stemmen)
 * Draai eenmalig lokaal: GOOGLE_APPLICATION_CREDENTIALS=./credentials.json npx tsx scripts/generate-audio.ts
 *
 * Formaat audio: woord... (pauze) contextzin... (pauze) woord
 * Stem: Google Cloud nl-NL-Standard-A (natural Dutch voice)
 * Kwaliteit: hoge kwaliteit, natuurlijk
 */

import * as fs from 'fs'
import * as path from 'path'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { NL_WORDS } from '../src/lib/languages/nl/words'

const client = new TextToSpeechClient({
  keyFilename: path.join(process.cwd(), 'credentials.json'),
})

const OUT_DIR = path.join(process.cwd(), 'public', 'audio')

const CONTEXT_SENTENCES: Record<string, string> = {
  kat: 'De kat ligt in de zon.',
  hond: 'De hond blaft hard.',
  boom: 'De boom is groot.',
  fiets: 'Ik rij op mijn fiets.',
  school: 'Ik ga naar school.',
  boek: 'Ik lees een boek.',
  huis: 'Ons huis heeft een tuin.',
  trap: 'Ik loop de trap op.',
  brug: 'We rijden over de brug.',
  lopen: 'We gaan een eindje lopen.',
  maan: 'De maan schijnt helder.',
  rijst: 'We eten rijst met groente.',
  fijn: 'Het is fijn buiten.',
  trein: 'De trein rijdt snel.',
  schrijven: 'Ik ga een brief schrijven.',
  klein: 'Het is een klein hondje.',
  blauw: 'De lucht is blauw.',
  goud: 'Het sieraad is van goud.',
  vrouw: 'De vrouw loopt op straat.',
  werkt: 'Papa werkt elke dag.',
  rijdt: 'Mama rijdt de auto.',
  wordt: 'Het wordt morgen mooi weer.',
  vindt: 'Hij vindt het leuk.',
  gekocht: 'We hebben brood gekocht.',
  gelopen: 'We hebben ver gelopen.',
  gespeeld: 'De kinderen hebben gespeeld.',
  gewerkt: 'Ik heb hard gewerkt.',
}

function getContextSentence(word: string): string {
  return CONTEXT_SENTENCES[word] ?? `Wij gebruiken het woord ${word} elke dag.`
}

async function generateAudio(word: string): Promise<void> {
  const filePath = path.join(OUT_DIR, `${word}.mp3`)
  if (fs.existsSync(filePath)) {
    console.log(`  ⏭  ${word} — al aanwezig, sla over`)
    return
  }

  try {
    const text = `${word}.\n\n${getContextSentence(word)}\n\n${word}.`

    const request = {
      input: { text },
      voice: {
        languageCode: 'nl-NL',
        name: 'nl-NL-Standard-A', // vrouwelijke stem, natuurlijk
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 0.9, // iets langzamer
      },
    }

    const [response] = await client.synthesizeSpeech(request as any)
    const audioContent = response.audioContent

    if (!audioContent) {
      throw new Error('No audio content returned')
    }

    const buffer = Buffer.isBuffer(audioContent)
      ? audioContent
      : Buffer.from(audioContent as any)

    fs.writeFileSync(filePath, buffer)
    console.log(`  ✓  ${word}`)
  } catch (err) {
    console.error(`  ✗  ${word}: ${err instanceof Error ? err.message : err}`)
  }
}

async function main() {
  const credentialsPath = path.join(process.cwd(), 'credentials.json')
  if (!fs.existsSync(credentialsPath)) {
    console.error('credentials.json niet gevonden. Plaats het in de project root.')
    process.exit(1)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const words = [...new Set(NL_WORDS.map(w => w.word))]
  console.log(`\nGenereer audio voor ${words.length} woorden via Google Cloud TTS...\n`)

  // 3 tegelijk
  for (let i = 0; i < words.length; i += 3) {
    const batch = words.slice(i, i + 3)
    await Promise.all(batch.map(generateAudio))
  }

  console.log('\n✅ Klaar! Bestanden staan in public/audio/')
  console.log('Geluid: Google Cloud TTS (nl-NL-Standard-A) — natuurlijk Nederlands 🎧')
}

main()
