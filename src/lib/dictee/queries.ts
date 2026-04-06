import { createClient } from '@/lib/supabase/client'
import type { DicteeResult, DicteeSession, WordList, WordListItem } from '@/types/dictee'

export async function getWordLists(userId: string): Promise<WordList[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('word_lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getWordListItems(listId: string): Promise<WordListItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('word_list_items')
    .select('*')
    .eq('list_id', listId)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createSession(
  userId: string,
  listId: string | null,
  childName: string
): Promise<DicteeSession> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('dictee_sessions')
    .insert({ user_id: userId, list_id: listId, child_name: childName })
    .select()
    .single()

  if (error) {
    console.warn('Session tracking unavailable:', error.message)
    return { id: crypto.randomUUID(), user_id: userId, list_id: listId, child_name: childName, total_words: 0, correct_count: 0, completed_at: null, created_at: new Date().toISOString() } as DicteeSession
  }
  return data
}

export async function saveResult(
  sessionId: string,
  word: string,
  typedAnswer: string,
  isCorrect: boolean,
  responseMs?: number
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('dictee_results').insert({
    session_id: sessionId,
    word,
    typed_answer: typedAnswer,
    is_correct: isCorrect,
    ...(responseMs !== undefined ? { response_ms: responseMs } : {}),
  })

  if (error) throw new Error(error.message)
}

export async function completeSession(
  sessionId: string,
  totalWords: number,
  correctCount: number
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('dictee_sessions')
    .update({ total_words: totalWords, correct_count: correctCount, completed_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function getSessionResults(sessionId: string): Promise<DicteeResult[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('dictee_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('answered_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
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

export type CITOWordbankWord = {
  id: string
  word: string
  grade: number
  category: string
  rule: string
  mnemonic?: string
  difficulty: 1 | 2 | 3 | 4 | 5
  source: string
  audio_url?: string
}

export async function getChildProfiles(userId: string): Promise<ChildProfile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createChildProfile(
  userId: string,
  name: string,
  grade: number,
  avatarId: string
): Promise<ChildProfile> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('child_profiles')
    .insert({ user_id: userId, name, grade, avatar_id: avatarId, current_streak: 0, longest_streak: 0 })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateStreak(childProfileId: string): Promise<void> {
  const supabase = createClient()

  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('child_profiles')
    .select('current_streak, longest_streak, last_session_date')
    .eq('id', childProfileId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const today = new Date().toISOString().split('T')[0]
  const lastDate = profile.last_session_date ? profile.last_session_date.split('T')[0] : null

  // Check if session is today
  let newStreak = profile.current_streak
  if (lastDate !== today) {
    // New session today
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (lastDate === yesterday) {
      newStreak = profile.current_streak + 1
    } else {
      newStreak = 1
    }
  }

  const newLongest = Math.max(newStreak, profile.longest_streak)

  const { error: updateError } = await supabase
    .from('child_profiles')
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_session_date: new Date().toISOString(),
    })
    .eq('id', childProfileId)

  if (updateError) throw new Error(updateError.message)
}

/**
 * Get CITO words by grade from wordbank
 */
export async function getCITOWordsByGrade(grade: number): Promise<CITOWordbankWord[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cito_wordbanks')
    .select('*')
    .eq('grade', grade)
    .order('word', { ascending: true })

  if (error) {
    console.warn(`Failed to fetch CITO words for grade ${grade}:`, error.message)
    return []
  }

  return data ?? []
}
