export type SpellingCategory =
  | 'klankzuiver'
  | 'medeklinkergroep'
  | 'open-gesloten-lettergreep'
  | 'meervoud'
  | 'ei-ij'
  | 'au-ou'
  | 'verdubbeling'
  | 'trema'
  | 'dt-regel'
  | 'werkwoord-stam'
  | 'voltooid-deelwoord'
  | 'samengesteld'

export type WordEntry = {
  word: string
  grade: number
  category: SpellingCategory
  rule: string
  mnemonic?: string
}
