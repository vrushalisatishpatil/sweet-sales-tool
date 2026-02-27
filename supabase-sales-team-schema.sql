-- Create sales_team table
DROP TABLE IF EXISTS sales_team CASCADE;

CREATE TABLE sales_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  leads_assigned INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  avatar TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  leads INTEGER DEFAULT 0,
  converted INTEGER DEFAULT 0,
  rate TEXT DEFAULT '0%',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_sales_team_status ON sales_team(status);
CREATE INDEX idx_sales_team_email ON sales_team(email);
CREATE INDEX idx_sales_team_created_at ON sales_team(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE sales_team ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON sales_team;
CREATE POLICY "Enable read access for all users on sales_team"
  ON sales_team FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sales_team;
CREATE POLICY "Enable insert for authenticated users on sales_team"
  ON sales_team FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON sales_team;
CREATE POLICY "Enable update for authenticated users on sales_team"
  ON sales_team FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for authenticated users" ON sales_team;
CREATE POLICY "Enable delete for authenticated users on sales_team"
  ON sales_team FOR DELETE
  USING (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_sales_team_updated_at ON sales_team;
CREATE TRIGGER update_sales_team_updated_at
  BEFORE UPDATE ON sales_team
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
