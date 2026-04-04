import type { WordEntry, SpellingCategory } from '../types'
import { CITO_WORDS } from './cito-wordbank'

/**
 * NL_WORDS — All Dutch spelling words from CITO wordbank
 * Converted from CITOWord format to WordEntry format
 */
export const NL_WORDS: WordEntry[] = CITO_WORDS.map(w => ({
  word: w.word,
  grade: w.grade,
  category: mapCategoryToSpellingCategory(w.category),
  rule: w.rule,
  mnemonic: w.mnemonic,
}))

/**
 * Map CITO category strings to SpellingCategory enum values
 */
function mapCategoryToSpellingCategory(category: string): SpellingCategory {
  const categoryMap: Record<string, SpellingCategory> = {
    'basic': 'klankzuiver',
    'verdubbeling': 'verdubbeling',
    'verdubbeling-aa': 'verdubbeling',
    'verdubbeling-oo': 'verdubbeling',
    'verdubbeling-ee': 'verdubbeling',
    'verdubbeling-oe': 'verdubbeling',
    'ei-ij': 'ei-ij',
    'au-ou': 'au-ou',
    'trema': 'trema',
    'dt-regel': 'dt-regel',
    'werkwoord-stam': 'werkwoord-stam',
    'voltooid-deelwoord': 'voltooid-deelwoord',
    'medeklinkergroep': 'medeklinkergroep',
  }
  return categoryMap[category] || 'klankzuiver'
}

export function getWordsByGrade(grade: number): WordEntry[] {
  return NL_WORDS.filter(w => w.grade === grade)
}

export function getWordsByCategory(category: string): WordEntry[] {
  return NL_WORDS.filter(w => w.category === category)
}
