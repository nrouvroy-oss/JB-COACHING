-- Création des types enum
CREATE TYPE user_role AS ENUM ('coach', 'client');
CREATE TYPE program_status AS ENUM ('active', 'completed');

-- Table des profils (liée à auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Créer automatiquement un profil quand un utilisateur s'inscrit
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Table des exercices (bibliothèque du coach)
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des programmes
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status program_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table des semaines
CREATE TABLE weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  UNIQUE(program_id, week_number)
);

-- Table des séances
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_of_week TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Table des exercices dans une séance
CREATE TABLE session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '10',
  rest_seconds INTEGER NOT NULL DEFAULT 60,
  coach_notes TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Table des logs d'exercices (suivi client)
CREATE TABLE exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_exercise_id UUID NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  feedback TEXT,
  completed_at TIMESTAMPTZ,
  UNIQUE(session_exercise_id, client_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- Fonction utilitaire : vérifier si l'utilisateur est coach
CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'coach'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES : chacun voit son profil, le coach voit tout
CREATE POLICY "Les utilisateurs voient leur profil"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_coach());

CREATE POLICY "Les utilisateurs modifient leur profil"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- EXERCISES : le coach gère tout, les clients voient les exercices de leur programme
CREATE POLICY "Le coach gère les exercices"
  ON exercises FOR ALL
  USING (coach_id = auth.uid());

CREATE POLICY "Les clients voient les exercices de leur programme"
  ON exercises FOR SELECT
  USING (
    id IN (
      SELECT se.exercise_id FROM session_exercises se
      JOIN sessions s ON se.session_id = s.id
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );

-- PROGRAMS : le coach gère tout, le client voit son programme
CREATE POLICY "Le coach gère les programmes"
  ON programs FOR ALL
  USING (coach_id = auth.uid());

CREATE POLICY "Le client voit son programme"
  ON programs FOR SELECT
  USING (client_id = auth.uid());

-- WEEKS : accès via le programme parent
CREATE POLICY "Le coach gère les semaines"
  ON weeks FOR ALL
  USING (
    program_id IN (SELECT id FROM programs WHERE coach_id = auth.uid())
  );

CREATE POLICY "Le client voit ses semaines"
  ON weeks FOR SELECT
  USING (
    program_id IN (SELECT id FROM programs WHERE client_id = auth.uid())
  );

-- SESSIONS : accès via la semaine parente
CREATE POLICY "Le coach gère les séances"
  ON sessions FOR ALL
  USING (
    week_id IN (
      SELECT w.id FROM weeks w
      JOIN programs p ON w.program_id = p.id
      WHERE p.coach_id = auth.uid()
    )
  );

CREATE POLICY "Le client voit ses séances"
  ON sessions FOR SELECT
  USING (
    week_id IN (
      SELECT w.id FROM weeks w
      JOIN programs p ON w.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );

-- SESSION_EXERCISES : accès via la séance parente
CREATE POLICY "Le coach gère les exercices de séance"
  ON session_exercises FOR ALL
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.coach_id = auth.uid()
    )
  );

CREATE POLICY "Le client voit ses exercices de séance"
  ON session_exercises FOR SELECT
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      JOIN weeks w ON s.week_id = w.id
      JOIN programs p ON w.program_id = p.id
      WHERE p.client_id = auth.uid()
    )
  );

-- EXERCISE_LOGS : le client gère ses logs, le coach les voit
CREATE POLICY "Le client gère ses logs"
  ON exercise_logs FOR ALL
  USING (client_id = auth.uid());

CREATE POLICY "Le coach voit les logs de ses clients"
  ON exercise_logs FOR SELECT
  USING (
    client_id IN (
      SELECT p.client_id FROM programs p WHERE p.coach_id = auth.uid()
    )
  );

-- ============================================
-- Storage : bucket pour les vidéos
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-videos', 'exercise-videos', FALSE);

-- Seul le coach peut uploader des vidéos
CREATE POLICY "Le coach uploade des vidéos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exercise-videos' AND is_coach()
  );

-- Le coach peut supprimer ses vidéos
CREATE POLICY "Le coach supprime des vidéos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'exercise-videos' AND is_coach()
  );

-- Tous les utilisateurs connectés peuvent voir les vidéos
CREATE POLICY "Les utilisateurs connectés voient les vidéos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'exercise-videos' AND auth.uid() IS NOT NULL
  );
