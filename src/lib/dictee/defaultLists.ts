import { getWordsByGrade, NL_WORDS } from '@/lib/languages'
import type { WordEntry } from '@/lib/languages'

export type { WordEntry }

export type DefaultList = {
  name: string
  grade: number
  words: WordEntry[]
}

export const DEFAULT_LISTS: DefaultList[] = [3, 4, 5, 6, 7, 8].map(grade => ({
  name: `Groep ${grade}`,
  grade,
  words: getWordsByGrade(grade),
}))

export { NL_WORDS }
