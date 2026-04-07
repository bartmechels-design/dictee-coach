// ElevenLabs TTS — eleven_multilingual_v2 met Nederlandse taalinstelling
// Voice: Sarah (vrouwelijk, helder, multilingual)
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // Bella — heldere vrouwenstem

export async function POST(request: Request) {
  let text: string

  try {
    const body = await request.json()
    text = (body.text || body.word)?.trim()
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!text) return Response.json({ error: 'Geen tekst opgegeven' }, { status: 400 })

  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: 'Geen TTS API key' }, { status: 500 })
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        language_code: 'nl',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `ElevenLabs TTS: ${err}` }, { status: 500 })
    }

    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return Response.json({ error: message }, { status: 500 })
  }
}
