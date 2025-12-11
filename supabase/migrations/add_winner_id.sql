-- Add winner_id to competitions table
ALTER TABLE competitions ADD COLUMN winner_id UUID REFERENCES auth.users(id);

-- Add foreign key reference to profiles if needed, but authenticating users table is safer for referencing.
-- Actually, the profiles table shares ID with auth.users, so referencing auth.users is standard.
