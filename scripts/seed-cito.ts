/**
 * Seed CITO wordbank into Supabase
 * Usage: npx tsx scripts/seed-cito.ts [--grade=3]
 */

import { createClient } from '@supabase/supabase-js'
import { CITO_WORDS } from '../src/lib/languages/nl/cito-wordbank'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedWords() {
  console.log('🌱 Seeding CITO words...')

  const inserted = await supabase
    .from('cito_wordbanks')
    .insert(CITO_WORDS)
    .select()

  if (inserted.error) {
    console.error('❌ Seed failed:', inserted.error.message)
    process.exit(1)
  }

  console.log(`✅ Seeded ${inserted.data?.length || 0} words`)
  
  // Group by grade
  const byGrade = CITO_WORDS.reduce((acc, w) => {
    acc[w.grade] = (acc[w.grade] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  Object.entries(byGrade).forEach(([grade, count]) => {
    console.log(`   Groep ${grade}: ${count} woorden`)
  })
}

seedWords()
