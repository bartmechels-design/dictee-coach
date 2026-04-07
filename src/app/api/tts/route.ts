export async function POST(request: Request) {
  let text: string

  try {
    const body = await request.json()
    text = (body.text || body.word)?.trim()
  } catch {
    return Response.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!text) return Response.json({ error: 'Geen tekst opgegeven' }, { status: 400 })

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'Geen TTS API key' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: text,
        voice: 'nova',   // heldere vrouwelijke stem, goed voor NL
        speed: 0.85,
        response_format: 'mp3',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return Response.json({ error: `OpenAI TTS: ${err}` }, { status: 500 })
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
