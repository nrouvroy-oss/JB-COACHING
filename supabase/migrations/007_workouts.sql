-- Programmes réutilisables (Muscu 3, TRX, Vélo...)
-- Un programme contient des exercices et peut être assigné à une séance
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exercices dans un programme (ordre + notes par exercice)
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  coach_notes TEXT DEFAULT ''
);

-- Lien séance → programme (optionnel)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS workout_id UUID REFERENCES workouts(id);

-- RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Le coach gère ses programmes
CREATE POLICY "Le coach gère ses workouts"
  ON workouts FOR ALL
  USING (coach_id = auth.uid());

-- Les clients voient les programmes assignés à leurs séances
CREATE POLICY "Les clients voient les workouts de leurs séances"
  ON workouts FOR SELECT
  USING (
    id IN (
      SELECT s.workout_id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );

-- Le coach gère les exercices de ses programmes
CREATE POLICY "Le coach gère les workout_exercises"
  ON workout_exercises FOR ALL
  USING (
    workout_id IN (SELECT id FROM workouts WHERE coach_id = auth.uid())
  );

-- Les clients voient les exercices des programmes de leurs séances
CREATE POLICY "Les clients voient les workout_exercises"
  ON workout_exercises FOR SELECT
  USING (
    workout_id IN (
      SELECT s.workout_id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );
