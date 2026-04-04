export type WordList = {
  id: string
  user_id: string
  name: string
  grade: number | null
  is_default: boolean
  created_at: string
}

export type WordListItem = {
  id: string
  list_id: string
  word: string
  hint: string | null
  sort_order: number
}

export type DicteeSession = {
  id: string
  user_id: string
  child_name: string | null
  list_id: string | null
  total_words: number
  correct_count: number
  completed_at: string | null
  created_at: string
}

export type DicteeResult = {
  id: string
  session_id: string
  word: string
  typed_answer: string | null
  is_correct: boolean
  attempt_number: number
  answered_at: string
  category?: string
}

export type ChildProfile = {
  id: string
  user_id: string
  name: string
  grade: number
  avatar_id: string
  current_streak: number
  longest_streak: number
  last_session_date: string | null
  created_at: string
}
