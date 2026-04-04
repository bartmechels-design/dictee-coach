/**
 * Admin endpoint to seed CITO wordbank
 * Usage: POST /api/admin/seed-cito with ?token=secret
 *
 * SECURITY: Requires admin token (set in .env.local: SEED_TOKEN)
 */

import { createClient } from '@/lib/supabase/server'
import { CITO_WORDS } from '@/lib/languages/nl/cito-wordbank'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const seedToken = process.env.SEED_TOKEN || 'dev-seed-token'

  if (token !== seedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // Insert all CITO words
    const { data, error } = await supabase
      .from('cito_wordbanks')
      .insert(CITO_WORDS)
      .select('id, word, grade')

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    // Group by grade for summary
    const byGrade: Record<number, number> = {}
    CITO_WORDS.forEach(w => {
      byGrade[w.grade] = (byGrade[w.grade] || 0) + 1
    })

    return Response.json({
      success: true,
      message: `Seeded ${data?.length || 0} CITO words`,
      byGrade,
      sample: data?.slice(0, 5)
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const seedToken = process.env.SEED_TOKEN || 'dev-seed-token'

  if (token !== seedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({
    message: 'POST to /api/admin/seed-cito to seed database',
    wordCount: CITO_WORDS.length,
    grades: [3, 4, 5, 6, 7, 8],
    example: CITO_WORDS[0]
  })
}
