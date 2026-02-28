-- ============================================
-- Follow-up History Table
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create the follow-up history table

CREATE TABLE IF NOT EXISTS follow_up_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  follow_up_type TEXT,
  description TEXT,
  follow_up_by TEXT,
  follow_up_date DATE,
  next_follow_up TEXT,
  next_follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_follow_up_history_lead_id ON follow_up_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_history_created_at ON follow_up_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE follow_up_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
CREATE POLICY "Enable read access for follow_up_history" ON follow_up_history
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for follow_up_history" ON follow_up_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for follow_up_history" ON follow_up_history
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for follow_up_history" ON follow_up_history
  FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
-- (Skip if you already created this function for other tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS update_follow_up_history_updated_at ON follow_up_history;

-- Trigger to update updated_at on every update
CREATE TRIGGER update_follow_up_history_updated_at
  BEFORE UPDATE ON follow_up_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Done! Your follow-up history table is now ready to use.
