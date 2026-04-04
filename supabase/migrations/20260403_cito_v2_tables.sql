-- Migration: Create CITO v2 tables (Apr 3, 2026)

-- 1. Official CITO wordbanks (we curate these)
CREATE TABLE IF NOT EXISTS cito_wordbanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  grade INT NOT NULL CHECK (grade >= 3 AND grade <= 8),
  category TEXT NOT NULL,
  rule TEXT NOT NULL,
  mnemonic TEXT,
  difficulty INT NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  source TEXT NOT NULL CHECK (source IN ('SLO', 'CITO', 'AI-generated')),
  audio_url TEXT,  -- /public/audio/g{grade}-{word}.mp3
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cito_grade ON cito_wordbanks(grade);
CREATE INDEX idx_cito_category ON cito_wordbanks(category);
CREATE INDEX idx_cito_difficulty ON cito_wordbanks(difficulty);

-- 2. Teacher-uploaded wordlists
CREATE TABLE IF NOT EXISTS teacher_wordlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade >= 3 AND grade <= 8),
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  total_words INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_teacher_user ON teacher_wordlists(user_id);
CREATE INDEX idx_teacher_grade ON teacher_wordlists(grade);

-- 3. Words in teacher wordlists
CREATE TABLE IF NOT EXISTS teacher_wordlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wordlist_id UUID NOT NULL REFERENCES teacher_wordlists(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  category TEXT,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wordlist_item ON teacher_wordlist_items(wordlist_id);

-- 4. Per-word mastery tracking (for individual child progress)
CREATE TABLE IF NOT EXISTS word_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('cito', 'teacher')),  -- where word came from
  correct_count INT DEFAULT 0,
  wrong_count INT DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  mastered BOOLEAN DEFAULT FALSE,  -- 3+ correct in a row
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, word)
);

CREATE INDEX idx_mastery_user ON word_mastery(user_id);
CREATE INDEX idx_mastery_mastered ON word_mastery(mastered);

-- 5. Dictee sentences (full sentences for dictation mode)
CREATE TABLE IF NOT EXISTS dictee_sentences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  grade INT NOT NULL CHECK (grade >= 3 AND grade <= 8),
  categories TEXT[] NOT NULL,  -- array of categories covered (ei-ij, dt-regel, etc)
  word_count INT NOT NULL,
  difficulty INT NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  audio_url TEXT,  -- /public/audio/dictee-{grade}-{id}.mp3
  source TEXT NOT NULL CHECK (source IN ('SLO', 'CITO', 'AI-generated', 'teacher')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dictee_grade ON dictee_sentences(grade);
CREATE INDEX idx_dictee_difficulty ON dictee_sentences(difficulty);

-- Enable RLS (Row-Level Security)
ALTER TABLE cito_wordbanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_wordlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_wordlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictee_sentences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- CITO wordbanks: everyone can read, only we can write
CREATE POLICY "cito_read_public" ON cito_wordbanks FOR SELECT USING (true);
CREATE POLICY "cito_write_admin" ON cito_wordbanks FOR INSERT WITH CHECK (false);  -- Admin only
CREATE POLICY "cito_update_admin" ON cito_wordbanks FOR UPDATE WITH CHECK (false);

-- Teacher wordlists: user can see own + shared public ones
CREATE POLICY "teacher_list_own_or_public" ON teacher_wordlists
  FOR SELECT USING (
    user_id = auth.uid() OR is_public = true
  );

CREATE POLICY "teacher_list_insert" ON teacher_wordlists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "teacher_list_update" ON teacher_wordlists
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "teacher_list_delete" ON teacher_wordlists
  FOR DELETE USING (user_id = auth.uid());

-- Teacher wordlist items: see if parent list accessible
CREATE POLICY "teacher_items_access" ON teacher_wordlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teacher_wordlists
      WHERE teacher_wordlists.id = wordlist_id
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

-- Word mastery: user sees own progress
CREATE POLICY "mastery_own" ON word_mastery
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "mastery_insert" ON word_mastery
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "mastery_update" ON word_mastery
  FOR UPDATE USING (user_id = auth.uid());

-- Dictee sentences: everyone reads
CREATE POLICY "dictee_read_public" ON dictee_sentences FOR SELECT USING (true);
