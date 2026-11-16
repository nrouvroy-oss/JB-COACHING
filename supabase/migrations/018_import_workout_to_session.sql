-- Permet d'importer les exercices de plusieurs programmes dans une même séance
-- source_workout_id : référence au programme d'origine (NULL = exercice ajouté manuellement)
-- source_workout_name : nom du programme au moment de l'import (affiché même si le programme change de nom)
ALTER TABLE session_exercises
  ADD COLUMN IF NOT EXISTS source_workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_workout_name TEXT;
