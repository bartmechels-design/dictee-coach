/**
 * API endpoint for teachers to upload custom word lists
 * Accepts CSV or JSON format
 * Usage: POST /api/teacher/upload-wordlist
 */

import { createClient } from '@supabase/supabase-js'
import { jwtDecode } from 'jwt-decode'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface ParsedWord {
  word: string
  category?: string
}

function parseCSV(content: string): ParsedWord[] {
  const lines = content.split('\n').filter(l => l.trim())
  const words: ParsedWord[] = []

  // Try to detect header row
  const firstLine = lines[0]
  const hasHeader = !firstLine.match(/^[a-z]+\s*,/) && firstLine.includes(',')

  const startIdx = hasHeader ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim()).filter(p => p)
    if (parts.length === 0) continue

    words.push({
      word: parts[0],
      category: parts[1] || undefined,
    })
  }

  return words
}

function parseJSON(content: string): ParsedWord[] {
  const data = JSON.parse(content)
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array')
  }

  return data.map((item: any) => ({
    word: typeof item === 'string' ? item : item.word,
    category: item.category,
  }))
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Extract token and decode to get user ID
    const token = authHeader.replace('Bearer ', '')
    const decoded: any = jwtDecode(token)
    const userId = decoded.sub

    if (!userId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const listName = formData.get('listName') as string
    const grade = Number(formData.get('grade')) || 3

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!listName) {
      return Response.json({ error: 'listName required' }, { status: 400 })
    }

    if (grade < 3 || grade > 8) {
      return Response.json({ error: 'Grade must be 3-8' }, { status: 400 })
    }

    // Parse file
    const fileContent = await file.text()
    let words: ParsedWord[]

    try {
      if (file.name.endsWith('.json')) {
        words = parseJSON(fileContent)
      } else {
        words = parseCSV(fileContent)
      }
    } catch (err) {
      return Response.json(
        { error: `Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      )
    }

    if (words.length === 0) {
      return Response.json({ error: 'No words found in file' }, { status: 400 })
    }

    // Validate words
    const validWords = words.filter(w => w.word && w.word.length > 0 && w.word.length < 100)
    if (validWords.length === 0) {
      return Response.json({ error: 'No valid words found' }, { status: 400 })
    }

    // Create wordlist in database
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: wordlist, error: listError } = await supabase
      .from('teacher_wordlists')
      .insert({
        user_id: userId,
        name: listName,
        grade,
        is_public: false,
        total_words: validWords.length,
      })
      .select()
      .single()

    if (listError) {
      return Response.json({ error: `Database error: ${listError.message}` }, { status: 500 })
    }

    // Insert words
    const { data: items, error: itemsError } = await supabase
      .from('teacher_wordlist_items')
      .insert(
        validWords.map((w, idx) => ({
          wordlist_id: wordlist.id,
          word: w.word,
          category: w.category,
          sort_order: idx,
        }))
      )
      .select()

    if (itemsError) {
      return Response.json({ error: `Failed to insert words: ${itemsError.message}` }, { status: 500 })
    }

    return Response.json({
      success: true,
      wordlistId: wordlist.id,
      listName: wordlist.name,
      grade,
      totalWords: validWords.length,
      message: `${validWords.length} words uploaded successfully`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
