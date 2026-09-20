-- Détails personnalisés par séance pour chaque exercice du programme (séries, répétitions)
-- Permet de varier les séries/reps d'un même exercice d'une séance à l'autre
CREATE TABLE session_exercise_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  sets TEXT DEFAULT '',
  reps TEXT DEFAULT '',
  UNIQUE(session_id, workout_exercise_id)
);

ALTER TABLE session_exercise_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Le coach gère les détails exercices"
  ON session_exercise_details FOR ALL
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.coach_id = auth.uid()
    )
  );

CREATE POLICY "Les clients voient les détails exercices"
  ON session_exercise_details FOR SELECT
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );
