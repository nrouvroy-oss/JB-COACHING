-- Séparer full_name en first_name et last_name
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';

-- Migrer les données existantes (premier mot = prénom, reste = nom)
UPDATE profiles SET
  first_name = split_part(full_name, ' ', 1),
  last_name = CASE
    WHEN position(' ' in full_name) > 0 THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE ''
  END
WHERE full_name IS NOT NULL AND full_name != '';
