-- Migration 017 : Race Goal Training Plans
-- Ajout des tables pour les objectifs course, profils trail et feedbacks post-séance
-- + Enrichissement des tables existantes (sessions, programs, weeks)

-- ─────────────────────────────────────────────────────────────────────────────
-- Table des objectifs course
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE race_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES profiles(id),

  -- Sport
  sport TEXT NOT NULL DEFAULT 'running',
  discipline TEXT NOT NULL DEFAULT 'trail',

  -- Course
  race_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  distance_km NUMERIC NOT NULL,
  elevation_gain_m INTEGER NOT NULL DEFAULT 0,
  elevation_loss_m INTEGER,
  terrain_type TEXT,
  max_altitude_m INTEGER,

  -- Objectif
  goal_type TEXT NOT NULL DEFAULT 'finish',
  target_time_minutes INTEGER,

  -- Statut : draft → pending → active → completed
  status TEXT NOT NULL DEFAULT 'draft',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE race_goals ENABLE ROW LEVEL SECURITY;

-- Le sportif voit ses propres objectifs
CREATE POLICY "Le client voit ses objectifs"
  ON race_goals FOR SELECT
  USING (client_id = auth.uid());

-- Le sportif crée ses objectifs
CREATE POLICY "Le client crée ses objectifs"
  ON race_goals FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Le sportif modifie ses objectifs en draft
CREATE POLICY "Le client modifie ses objectifs draft"
  ON race_goals FOR UPDATE
  USING (client_id = auth.uid());

-- Le coach voit les objectifs de ses sportifs
CREATE POLICY "Le coach voit les objectifs de ses clients"
  ON race_goals FOR SELECT
  USING (
    coach_id = auth.uid()
    OR client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
  );

-- Le coach modifie les objectifs (statut)
CREATE POLICY "Le coach modifie les objectifs"
  ON race_goals FOR UPDATE
  USING (
    coach_id = auth.uid()
    OR client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
  );

-- Service role pour les actions serveur
CREATE POLICY "Service role gère les objectifs"
  ON race_goals FOR ALL
  USING (auth.role() = 'service_role');

-- GRANT pour Data API (Supabase oct 2026)
GRANT SELECT ON race_goals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON race_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON race_goals TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Table profil trail (questionnaire)
-- Un profil par objectif course
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE athlete_trail_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_goal_id UUID NOT NULL UNIQUE REFERENCES race_goals(id) ON DELETE CASCADE,

  -- Niveau déclaré
  declared_level TEXT,
  running_experience TEXT,
  trail_experience TEXT,

  -- Plus long trail réalisé
  longest_trail_km NUMERIC,
  longest_trail_elevation_m INTEGER,
  longest_trail_date DATE,

  -- Entraînement actuel
  sessions_per_week INTEGER,
  weekly_distance_km NUMERIC,
  weekly_duration_minutes INTEGER,
  weekly_elevation_gain_m INTEGER,

  -- Sortie longue actuelle
  longest_run_minutes INTEGER,
  longest_run_km NUMERIC,
  longest_run_elevation_m INTEGER,

  -- Disponibilités (JSON : {"lundi": {"available": true, "max_minutes": 60}, ...})
  availability JSONB,
  preferred_long_run_day TEXT,

  -- Terrain & renforcement musculaire
  terrain_access JSONB,
  has_strength_access BOOLEAN DEFAULT false,
  strength_location TEXT,

  -- Contraintes et notes libres
  constraints_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE athlete_trail_profiles ENABLE ROW LEVEL SECURITY;

-- Le sportif voit son profil trail
CREATE POLICY "Le client voit son profil trail"
  ON athlete_trail_profiles FOR SELECT
  USING (
    race_goal_id IN (SELECT id FROM race_goals WHERE client_id = auth.uid())
  );

-- Le sportif crée son profil trail
CREATE POLICY "Le client crée son profil trail"
  ON athlete_trail_profiles FOR INSERT
  WITH CHECK (
    race_goal_id IN (SELECT id FROM race_goals WHERE client_id = auth.uid())
  );

-- Le coach voit les profils trail de ses clients
CREATE POLICY "Le coach voit les profils trail de ses clients"
  ON athlete_trail_profiles FOR SELECT
  USING (
    race_goal_id IN (
      SELECT id FROM race_goals WHERE coach_id = auth.uid()
      OR client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
    )
  );

-- Service role pour les actions serveur
CREATE POLICY "Service role gère les profils trail"
  ON athlete_trail_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- GRANT pour Data API (Supabase oct 2026)
GRANT SELECT ON athlete_trail_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON athlete_trail_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON athlete_trail_profiles TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Table feedbacks post-séance
-- Remplace/complète exercise_logs pour les séances trail
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE session_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Complétion de la séance
  completion TEXT NOT NULL DEFAULT 'yes',
  difficulty_rpe INTEGER CHECK (difficulty_rpe BETWEEN 1 AND 10),
  feeling TEXT,
  comment TEXT,

  -- Données réelles sortie longue (optionnel)
  actual_duration_minutes INTEGER,
  actual_distance_km NUMERIC,
  actual_elevation_m INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un seul feedback par sportif par séance
  UNIQUE(session_id, client_id)
);

ALTER TABLE session_feedbacks ENABLE ROW LEVEL SECURITY;

-- Le sportif gère ses propres feedbacks
CREATE POLICY "Le client gère ses feedbacks"
  ON session_feedbacks FOR ALL
  USING (client_id = auth.uid());

-- Le coach voit les feedbacks de ses clients
CREATE POLICY "Le coach voit les feedbacks de ses clients"
  ON session_feedbacks FOR SELECT
  USING (
    client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
  );

-- Service role pour les actions serveur
CREATE POLICY "Service role gère les feedbacks"
  ON session_feedbacks FOR ALL
  USING (auth.role() = 'service_role');

-- GRANT pour Data API (Supabase oct 2026)
GRANT SELECT ON session_feedbacks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON session_feedbacks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON session_feedbacks TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Colonnes ajoutées à sessions
-- Champs optionnels pour les séances trail (nullable, pas d'impact sur l'existant)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_type TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS distance_km NUMERIC;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS elevation_gain_m INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intensity TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS objective TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- Colonnes ajoutées à programs
-- Lien optionnel vers un objectif course + phase de périodisation
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE programs ADD COLUMN IF NOT EXISTS race_goal_id UUID REFERENCES race_goals(id) ON DELETE SET NULL;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS phase TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- Colonnes ajoutées à weeks
-- Objectifs de volume hebdomadaires (km, durée, D+)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS target_distance_km NUMERIC;
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS target_duration_minutes INTEGER;
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS target_elevation_gain_m INTEGER;
