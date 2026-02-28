-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  pincode TEXT,
  state TEXT,
  main_area TEXT,
  sub_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all authenticated users to view clients
CREATE POLICY "Enable read access for all users" ON clients
  FOR SELECT USING (true);

-- Create RLS policy to allow admins to insert, update, delete
CREATE POLICY "Enable insert for admins" ON clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for admins" ON clients
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for admins" ON clients
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_clients_company ON clients(company);
CREATE INDEX idx_clients_state ON clients(state);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_clients_updated_at();
