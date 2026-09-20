-- Permet aux clients de voir les exercices qui sont dans les programmes (workouts) assignés à leurs séances
CREATE POLICY "Les clients voient les exercices des workouts de leurs séances"
  ON exercises FOR SELECT
  USING (
    id IN (
      SELECT we.exercise_id FROM workout_exercises we
      JOIN workouts w ON we.workout_id = w.id
      JOIN sessions s ON s.workout_id = w.id
      JOIN weeks wk ON s.week_id = wk.id
      JOIN programs p ON wk.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );
