-- Enable RLS on games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to update their own games
CREATE POLICY "Users can update their own games"
ON games
FOR UPDATE
USING (auth.uid() = created_by);

-- Ensure insert is allowed (already likely exists, but good to ensure)
CREATE POLICY "Authenticated users can insert games"
ON games
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
