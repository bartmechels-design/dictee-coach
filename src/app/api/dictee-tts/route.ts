import * as path from 'path'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

function getTTSClient() {
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    return new TextToSpeechClient({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
    })
  }
  return new TextToSpeechClient({
    keyFilename: path.join(process.cwd(), 'credentials.json'),
  })
}

// Returns one MP3 with the full classroom dictee sequence:
//   Groep 3:  word — 2s — word
//   Groep 4+: word — 2s — sentence — 2s — word
export async function POST(request: Request) {
  let word: string
  let grade: number
  let sentence: string | null

  try {
    const body = await request.json()
    word = body.word?.trim()
    grade = Number(body.grade) || 3
    sentence = body.sentence?.trim() || null
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!word) return Response.json({ error: 'Geen woord opgegeven' }, { status: 400 })

  const useSentence = grade >= 4 && sentence

  const ssml = useSentence
    ? `<speak>${word}<break time="2000ms"/>${sentence}<break time="2000ms"/>${word}</speak>`
    : `<speak>${word}<break time="2000ms"/>${word}</speak>`

  try {
    const client = getTTSClient()

    const [response] = await client.synthesizeSpeech({
      input: { ssml },
      voice: { languageCode: 'nl-NL', name: 'nl-NL-Standard-A' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.85 },
    } as any)

    const audioContent = response.audioContent
    if (!audioContent) return Response.json({ error: 'Geen audio' }, { status: 500 })

    const buffer = Buffer.isBuffer(audioContent)
      ? audioContent
      : Buffer.from(audioContent as any)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return Response.json({ error: `TTS mislukt: ${message}` }, { status: 500 })
  }
}
