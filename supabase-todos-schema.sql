-- ============================================
-- To-Do Table
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create the todos table

CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'Pending',
  company TEXT,
  created_by TEXT NOT NULL,
  owner_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_todos_owner_identifier ON todos(owner_identifier);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- App handles per-user filtering through owner_identifier.
CREATE POLICY "Enable read access for todos" ON todos
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for todos" ON todos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for todos" ON todos
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for todos" ON todos
  FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Done! Your todos table is now ready to use.
