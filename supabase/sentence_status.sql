-- Run in Supabase SQL Editor (Dashboard → SQL)

CREATE TABLE IF NOT EXISTS sentence_status (
  id BIGSERIAL PRIMARY KEY,
  category_id TEXT NOT NULL,
  sentence_id TEXT NOT NULL,
  hanzi TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category_id, sentence_id)
);

CREATE INDEX IF NOT EXISTS idx_sentence_status_lookup ON sentence_status (category_id);

ALTER TABLE sentence_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON sentence_status;
CREATE POLICY "Allow all access" ON sentence_status
  FOR ALL USING (true) WITH CHECK (true);
