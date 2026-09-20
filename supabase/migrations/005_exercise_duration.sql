-- Ajouter un champ durée optionnel aux exercices de séance (en secondes)
ALTER TABLE session_exercises ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
