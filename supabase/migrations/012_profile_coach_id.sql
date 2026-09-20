-- Lie chaque client à son coach — nécessaire pour le multi-coach
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id);

-- Lier les clients existants au premier coach trouvé (JB)
UPDATE profiles SET coach_id = (SELECT id FROM profiles WHERE role = 'coach' LIMIT 1) WHERE role = 'client' AND coach_id IS NULL;
