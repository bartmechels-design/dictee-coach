/**
 * API endpoint to seed dictee sentences into database
 * Usage: POST /api/admin/seed-sentences?token=...
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Sample sentences (generated via scripts/generate-dictee-sentences.ts)
const DICTEE_SENTENCES = [
  // Groep 3 (10 sentences)
  { text: 'De kat zit op de mat in het huis.', grade: 3, categories: ['klankzuiver'], wordCount: 8 },
  { text: 'De hond rent achter de bal in het park.', grade: 3, categories: ['klankzuiver'], wordCount: 8 },
  { text: 'De zon schijnt en het is warm buiten.', grade: 3, categories: ['klankzuiver'], wordCount: 8 },
  { text: 'Ik ga naar school met mijn fiets.', grade: 3, categories: ['klankzuiver'], wordCount: 7 },
  { text: 'De boom heeft groene bladeren en bruine takken.', grade: 3, categories: ['klankzuiver'], wordCount: 8 },
  { text: 'De auto rijdt snel over de weg naar huis.', grade: 3, categories: ['klankzuiver'], wordCount: 8 },
  { text: 'We varen met de boot over het water.', grade: 3, categories: ['klankzuiver'], wordCount: 7 },
  { text: 'De maan komt uit als het donker wordt.', grade: 3, categories: ['klankzuiver'], wordCount: 8 },
  { text: 'De kat en de hond spelen samen in de tuin.', grade: 3, categories: ['klankzuiver'], wordCount: 9 },
  { text: 'Ik zie een grote boom naast onze school.', grade: 3, categories: ['klankzuiver'], wordCount: 8 },

  // Groep 4 (10 sentences)
  { text: 'Het bloed stroomt als je jezelf snijdt.', grade: 4, categories: ['oe-regel'], wordCount: 7 },
  { text: 'De bloem groeit in de tuin bij het huis.', grade: 4, categories: ['oe-regel'], wordCount: 8 },
  { text: 'Hij bakte het brood in de oven.', grade: 4, categories: ['oe-regel'], wordCount: 7 },
  { text: 'De brandweer reed snel naar het huis.', grade: 4, categories: ['ee-regel'], wordCount: 7 },
  { text: 'Wij bouwden een huis van blokken.', grade: 4, categories: ['verdubbeling'], wordCount: 6 },
  { text: 'Het bos heeft veel bomen en wilde dieren.', grade: 4, categories: ['verdubbeling'], wordCount: 8 },
  { text: 'De druif is zoet en gezond fruit.', grade: 4, categories: ['ui-ui'], wordCount: 7 },
  { text: 'Er groeit gras op de duin bij zee.', grade: 4, categories: ['ui-ui'], wordCount: 8 },
  { text: 'Ik drink melk en zuivel elke dag.', grade: 4, categories: ['ui-ui'], wordCount: 7 },
  { text: 'De wijze man had veel kennis.', grade: 4, categories: ['wijze'], wordCount: 6 },

  // Groep 5 (10 sentences)
  { text: 'De trein rijdt naar Amsterdam vandaag.', grade: 5, categories: ['ei-ij'], wordCount: 6 },
  { text: 'Dit is een klein en fijn moment.', grade: 5, categories: ['ei-ij'], wordCount: 6 },
  { text: 'De vrouw antwoordde met een lach.', grade: 5, categories: ['au-ou'], wordCount: 6 },
  { text: 'We bepaalden samen wat we gaan doen.', grade: 5, categories: ['aa-regel'], wordCount: 7 },
  { text: 'De beige kleur is heel mooi en warm.', grade: 5, categories: ['ei-ij'], wordCount: 7 },
  { text: 'Een grau lucht betekent regen vandaag.', grade: 5, categories: ['au-ou'], wordCount: 6 },
  { text: 'We bereikten ons doel na lang werken.', grade: 5, categories: ['ei-ij'], wordCount: 7 },
  { text: 'De flauw grapjes maakten niemand aan het lachen.', grade: 5, categories: ['au-ou'], wordCount: 8 },
  { text: 'Rijst is een belangrijk voedsel in veel landen.', grade: 5, categories: ['ij'], wordCount: 8 },
  { text: 'De ij staat in veel Nederlandse woorden.', grade: 5, categories: ['ei-ij'], wordCount: 7 },

  // Groep 6 (10 sentences)
  { text: 'Zij zei dat ze het betaald had.', grade: 6, categories: ['d-t regel'], wordCount: 7 },
  { text: 'Wat zij gezegd heeft was heel interessant.', grade: 6, categories: ['d-t regel'], wordCount: 7 },
  { text: 'We hebben het huis gekocht afgelopen jaar.', grade: 6, categories: ['d-t regel'], wordCount: 7 },
  { text: 'De zee heeft vele kleuren en zeeën.', grade: 6, categories: ['trema'], wordCount: 8 },
  { text: 'Ideeën groeien wanneer je samen brainstormt.', grade: 6, categories: ['trema'], wordCount: 6 },
  { text: 'Ik moet kiezen wat ik wil eten.', grade: 6, categories: ['ie-ee'], wordCount: 7 },
  { text: 'Ze zingen samen in het koor.', grade: 6, categories: ['werkwoord'], wordCount: 6 },
  { text: 'Hij dragen zijn jas omdat het koud is.', grade: 6, categories: ['werkwoord'], wordCount: 8 },
  { text: 'De groei van de plant is snel geweest.', grade: 6, categories: ['groei'], wordCount: 8 },
  { text: 'We staan op en beginnen met ontbijt.', grade: 6, categories: ['werkwoord'], wordCount: 7 },

  // Groep 7 (10 sentences)
  { text: 'Het werkt niet omdat het kapot is.', grade: 7, categories: ['werkwoord'], wordCount: 7 },
  { text: 'Zij fietst naar school elke ochtend.', grade: 7, categories: ['werkwoord'], wordCount: 6 },
  { text: 'De auto rijdt voorzichtig door de regen.', grade: 7, categories: ['werkwoord'], wordCount: 7 },
  { text: 'Dit wordt interessant voor iedereen straks.', grade: 7, categories: ['werkwoord'], wordCount: 6 },
  { text: 'Zij vindt het leuk om te lezen boeken.', grade: 7, categories: ['werkwoord'], wordCount: 8 },
  { text: 'De plant groeit heel snel in het licht.', grade: 7, categories: ['werkwoord'], wordCount: 8 },
  { text: 'Wat gebeurde gisteren in de stad.', grade: 7, categories: ['werkwoord'], wordCount: 6 },
  { text: 'Zij rende snel van het huis weg.', grade: 7, categories: ['werkwoord'], wordCount: 7 },
  { text: 'Het ijs smelt wanneer het warm wordt.', grade: 7, categories: ['werkwoord'], wordCount: 7 },
  { text: 'We spreken Nederlands in deze les hier.', grade: 7, categories: ['werkwoord'], wordCount: 7 },

  // Groep 8 (10 sentences)
  { text: 'Zij hebben gelopen naar de winkel gisteren.', grade: 8, categories: ['voltoooid deelwoord'], wordCount: 7 },
  { text: 'We hebben gespeeld in het park vandaag.', grade: 8, categories: ['voltoooid deelwoord'], wordCount: 7 },
  { text: 'Zij gereden met de auto heel snel.', grade: 8, categories: ['voltoooid deelwoord'], wordCount: 7 },
  { text: 'Wij hebben gewerkt hard op het project.', grade: 8, categories: ['voltoooid deelwoord'], wordCount: 7 },
  { text: 'In de bibliotheek zijn veel boeken te vinden.', grade: 8, categories: ['samengestelde woorden'], wordCount: 8 },
  { text: 'Het schoolbord is groot en heel schoon.', grade: 8, categories: ['samengestelde woorden'], wordCount: 7 },
  { text: 'Kinderen begrijpen dit snel want het is simpel.', grade: 8, categories: ['werkwoord'], wordCount: 8 },
  { text: 'Zij verdienen geld door hard te werken.', grade: 8, categories: ['werkwoord'], wordCount: 7 },
  { text: 'Het verhaal is spannend en heel interessant.', grade: 8, categories: ['samengestelde woorden'], wordCount: 7 },
  { text: 'Zij hebben veel geleerd in deze les.', grade: 8, categories: ['voltoooid deelwoord'], wordCount: 7 },
]

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const seedToken = process.env.SEED_TOKEN || 'dev-seed-token'

  if (token !== seedToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First check if table exists by trying to insert
    const { error: insertError, data } = await supabase
      .from('dictee_sentences')
      .insert(
        DICTEE_SENTENCES.map(s => ({
          text: s.text,
          grade: s.grade,
          categories: s.categories,
          word_count: s.wordCount,
          difficulty: s.grade <= 4 ? 1 : s.grade <= 6 ? 2 : 3,
          source: 'AI-generated',
        }))
      )
      .select()

    if (insertError) {
      // If table doesn't exist, return helpful error
      if (insertError.message.includes('does not exist')) {
        return Response.json(
          {
            error: 'Table dictee_sentences does not exist',
            help: 'Run database migration: supabase/migrations/20260403_cito_v2_tables.sql',
          },
          { status: 400 }
        )
      }
      throw insertError
    }

    return Response.json({
      success: true,
      count: data?.length || DICTEE_SENTENCES.length,
      message: `${DICTEE_SENTENCES.length} dictee sentences seeded`,
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
    message: 'POST to /api/admin/seed-sentences to populate dictee sentences',
    usage: 'POST /api/admin/seed-sentences?token=...',
    count: DICTEE_SENTENCES.length,
    preview: DICTEE_SENTENCES.slice(0, 3),
  })
}
