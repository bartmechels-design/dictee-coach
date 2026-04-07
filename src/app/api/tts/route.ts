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

export async function POST(request: Request) {
  let word: string

  try {
    const body = await request.json()
    word = (body.text || body.word)?.trim()
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!word) {
    return Response.json({ error: 'Geen woord opgegeven' }, { status: 400 })
  }

  try {
    const client = getTTSClient()

    const request = {
      input: { text: word },
      voice: {
        languageCode: 'nl-NL',
        name: 'nl-NL-Standard-A',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 0.9,
      },
    }

    const [response] = await client.synthesizeSpeech(request as any)
    const audioContent = response.audioContent

    if (!audioContent) {
      return Response.json({ error: 'Geen audio gegenereerd' }, { status: 500 })
    }

    const buffer = Buffer.isBuffer(audioContent)
      ? audioContent
      : Buffer.from(audioContent as any)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return Response.json({ error: `TTS mislukt: ${message}` }, { status: 500 })
  }
}
