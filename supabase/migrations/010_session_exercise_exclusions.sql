-- Exercices du programme masqués pour une séance spécifique (personnalisation sans toucher au template)
CREATE TABLE session_excluded_exercises (
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, workout_exercise_id)
);

ALTER TABLE session_excluded_exercises ENABLE ROW LEVEL SECURITY;

-- Le coach gère les exclusions
CREATE POLICY "Le coach gère les exclusions"
  ON session_excluded_exercises FOR ALL
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.coach_id = auth.uid()
    )
  );

-- Les clients voient les exclusions de leurs séances
CREATE POLICY "Les clients voient les exclusions"
  ON session_excluded_exercises FOR SELECT
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );
