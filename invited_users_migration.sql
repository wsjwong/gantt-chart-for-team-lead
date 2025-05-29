-- Create invited_users table for users who haven't signed up yet
CREATE TABLE IF NOT EXISTS invited_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    invited_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE invited_users ENABLE ROW LEVEL SECURITY;

-- Invited users policies
CREATE POLICY "Users can view invited users they created" ON invited_users FOR SELECT USING (invited_by = auth.uid());
CREATE POLICY "Users can create invited users" ON invited_users FOR INSERT WITH CHECK (invited_by = auth.uid());
CREATE POLICY "Users can delete invited users they created" ON invited_users FOR DELETE USING (invited_by = auth.uid());

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invited_users_email ON invited_users(email);
CREATE INDEX IF NOT EXISTS idx_invited_users_invited_by ON invited_users(invited_by);
