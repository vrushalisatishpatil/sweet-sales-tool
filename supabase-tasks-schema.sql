-- ============================================
-- Tasks Table for Supabase
-- ============================================
-- Run this SQL in your Supabase SQL Editor to create the tasks table

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  lead_company TEXT,
  contact_person TEXT,
  phone TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Pending',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
-- You can customize these policies based on your security requirements
CREATE POLICY "Enable read access for tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for tasks" ON tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for tasks" ON tasks
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for tasks" ON tasks
  FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
-- (Skip if you already created this function for the leads table)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Trigger to update updated_at on every update
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Done! Your tasks table is now ready to use.
-- You can verify it in the Supabase Table Editor.
