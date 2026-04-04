-- Woordenlijsten (aangemaakt door leerkracht/ouder)
CREATE TABLE word_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INT CHECK (grade BETWEEN 1 AND 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Woorden in een lijst
CREATE TABLE word_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  hint TEXT,
  sort_order INT DEFAULT 0
);

-- Dictee-sessies
CREATE TABLE dictee_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT,
  list_id UUID REFERENCES word_lists(id),
  total_words INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resultaat per woord
CREATE TABLE dictee_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES dictee_sessions(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  typed_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  attempt_number INT DEFAULT 1,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE word_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictee_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dictee_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eigen lijsten" ON word_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Items van eigen lijsten" ON word_list_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM word_lists WHERE id = list_id AND user_id = auth.uid())
  );

CREATE POLICY "Eigen sessies" ON dictee_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Resultaten van eigen sessies" ON dictee_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM dictee_sessions WHERE id = session_id AND user_id = auth.uid())
  );
