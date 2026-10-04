# Race Goal Training Plans — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à un sportif de créer un objectif course (trail MVP), remplir un questionnaire de profil, et recevoir un plan de préparation personnalisé construit par son coach.

**Architecture:** Nouvelle couche Race Goal au-dessus du système existant programmes/semaines/séances. Le sportif crée son objectif via un wizard 7 étapes. Le coach reçoit le dossier, construit le plan manuellement avec le système existant (enrichi de champs trail), et le publie. Le sportif suit le plan et envoie des feedbacks post-séance.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, RLS), Server Actions.

**Spec:** `docs/superpowers/specs/2026-10-04-race-goal-training-plans-design.md`

## Global Constraints

- Mobile-first, touch targets 44px minimum
- Dark mode exclusif (#0a0a0a / #1c1c1c / #d4ff00)
- Typo Bricolage Grotesque pour les titres, DM Sans pour le body
- Commentaires en français
- Pas de console.log en production
- RLS sur toutes les tables
- Toutes les nouvelles tables requièrent des GRANT explicites (Supabase oct 2026)

---

### Task 1: Migration base de données + types TypeScript

**Files:**
- Create: `supabase/migrations/017_race_goals.sql`
- Modify: `src/lib/types.ts`

**Interfaces:**
- Consumes: schéma existant (profiles, programs, sessions, weeks)
- Produces: tables `race_goals`, `athlete_trail_profiles`, `session_feedbacks` + colonnes ajoutées à `sessions`, `programs`, `weeks` + types TS `RaceGoal`, `AthleteTrailProfile`, `SessionFeedback`, champs ajoutés à `Session`, `Program`, `Week`

- [ ] **Step 1: Créer la migration `017_race_goals.sql`**

```sql
-- Table des objectifs course
CREATE TABLE race_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES profiles(id),
  sport TEXT NOT NULL DEFAULT 'running',
  discipline TEXT NOT NULL DEFAULT 'trail',
  race_name TEXT NOT NULL,
  race_date DATE NOT NULL,
  distance_km NUMERIC NOT NULL,
  elevation_gain_m INTEGER NOT NULL DEFAULT 0,
  elevation_loss_m INTEGER,
  terrain_type TEXT,
  max_altitude_m INTEGER,
  goal_type TEXT NOT NULL DEFAULT 'finish',
  target_time_minutes INTEGER,
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

-- Table profil trail (questionnaire)
CREATE TABLE athlete_trail_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_goal_id UUID NOT NULL UNIQUE REFERENCES race_goals(id) ON DELETE CASCADE,
  declared_level TEXT,
  running_experience TEXT,
  trail_experience TEXT,
  longest_trail_km NUMERIC,
  longest_trail_elevation_m INTEGER,
  longest_trail_date DATE,
  sessions_per_week INTEGER,
  weekly_distance_km NUMERIC,
  weekly_duration_minutes INTEGER,
  weekly_elevation_gain_m INTEGER,
  longest_run_minutes INTEGER,
  longest_run_km NUMERIC,
  longest_run_elevation_m INTEGER,
  availability JSONB,
  preferred_long_run_day TEXT,
  terrain_access JSONB,
  has_strength_access BOOLEAN DEFAULT false,
  strength_location TEXT,
  constraints_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE athlete_trail_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Le client voit son profil trail"
  ON athlete_trail_profiles FOR SELECT
  USING (
    race_goal_id IN (SELECT id FROM race_goals WHERE client_id = auth.uid())
  );

CREATE POLICY "Le client crée son profil trail"
  ON athlete_trail_profiles FOR INSERT
  WITH CHECK (
    race_goal_id IN (SELECT id FROM race_goals WHERE client_id = auth.uid())
  );

CREATE POLICY "Le coach voit les profils trail de ses clients"
  ON athlete_trail_profiles FOR SELECT
  USING (
    race_goal_id IN (
      SELECT id FROM race_goals WHERE coach_id = auth.uid()
      OR client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
    )
  );

CREATE POLICY "Service role gère les profils trail"
  ON athlete_trail_profiles FOR ALL
  USING (auth.role() = 'service_role');

GRANT SELECT ON athlete_trail_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON athlete_trail_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON athlete_trail_profiles TO service_role;

-- Table feedbacks post-séance
CREATE TABLE session_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completion TEXT NOT NULL DEFAULT 'yes',
  difficulty_rpe INTEGER CHECK (difficulty_rpe BETWEEN 1 AND 10),
  feeling TEXT,
  comment TEXT,
  actual_duration_minutes INTEGER,
  actual_distance_km NUMERIC,
  actual_elevation_m INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, client_id)
);

ALTER TABLE session_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Le client gère ses feedbacks"
  ON session_feedbacks FOR ALL
  USING (client_id = auth.uid());

CREATE POLICY "Le coach voit les feedbacks de ses clients"
  ON session_feedbacks FOR SELECT
  USING (
    client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
  );

CREATE POLICY "Service role gère les feedbacks"
  ON session_feedbacks FOR ALL
  USING (auth.role() = 'service_role');

GRANT SELECT ON session_feedbacks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON session_feedbacks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON session_feedbacks TO service_role;

-- Colonnes ajoutées à sessions
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_type TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS distance_km NUMERIC;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS elevation_gain_m INTEGER;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS intensity TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS objective TEXT;

-- Colonnes ajoutées à programs
ALTER TABLE programs ADD COLUMN IF NOT EXISTS race_goal_id UUID REFERENCES race_goals(id) ON DELETE SET NULL;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS phase TEXT;

-- Colonnes ajoutées à weeks
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS target_distance_km NUMERIC;
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS target_duration_minutes INTEGER;
ALTER TABLE weeks ADD COLUMN IF NOT EXISTS target_elevation_gain_m INTEGER;
```

- [ ] **Step 2: Exécuter la migration dans le SQL Editor Supabase**

Copier-coller le contenu de `017_race_goals.sql` dans le SQL Editor et cliquer Run.

- [ ] **Step 3: Ajouter les types TypeScript dans `src/lib/types.ts`**

Ajouter après l'interface `ProgramWithWeeks` :

```typescript
// ── Race Goal ────────────────────────────────────────────────────────────────

export type RaceGoalStatus = 'draft' | 'pending' | 'active' | 'completed'
export type GoalType = 'finish' | 'comfortable' | 'improve' | 'target_time' | 'performance'
export type SessionType = 'easy_run' | 'endurance' | 'recovery_run' | 'tempo' | 'threshold' | 'intervals' | 'hill_repeats' | 'uphill_training' | 'downhill_training' | 'technical_trail' | 'long_run' | 'long_trail' | 'race_specific' | 'strength_training' | 'mobility' | 'cross_training' | 'rest' | 'taper' | 'race'
export type Completion = 'yes' | 'partial' | 'no'
export type Feeling = 'great' | 'good' | 'tired' | 'very_tired' | 'pain'

export interface RaceGoal {
  id: string
  client_id: string
  coach_id: string | null
  sport: string
  discipline: string
  race_name: string
  race_date: string
  distance_km: number
  elevation_gain_m: number
  elevation_loss_m: number | null
  terrain_type: string | null
  max_altitude_m: number | null
  goal_type: GoalType
  target_time_minutes: number | null
  status: RaceGoalStatus
  created_at: string
  updated_at: string
}

export interface AthleteTrailProfile {
  id: string
  race_goal_id: string
  declared_level: string | null
  running_experience: string | null
  trail_experience: string | null
  longest_trail_km: number | null
  longest_trail_elevation_m: number | null
  longest_trail_date: string | null
  sessions_per_week: number | null
  weekly_distance_km: number | null
  weekly_duration_minutes: number | null
  weekly_elevation_gain_m: number | null
  longest_run_minutes: number | null
  longest_run_km: number | null
  longest_run_elevation_m: number | null
  availability: Record<string, { available: boolean; max_minutes?: number }> | null
  preferred_long_run_day: string | null
  terrain_access: string[] | null
  has_strength_access: boolean
  strength_location: string | null
  constraints_notes: string | null
  created_at: string
}

export interface SessionFeedback {
  id: string
  session_id: string
  client_id: string
  completion: Completion
  difficulty_rpe: number | null
  feeling: Feeling | null
  comment: string | null
  actual_duration_minutes: number | null
  actual_distance_km: number | null
  actual_elevation_m: number | null
  created_at: string
}

export interface RaceGoalWithProfile extends RaceGoal {
  athlete_trail_profile: AthleteTrailProfile | null
  client?: Profile
}
```

Modifier les interfaces existantes — ajouter les champs optionnels :

```typescript
// Dans Session, ajouter :
  session_type?: string | null
  duration_minutes?: number | null
  distance_km?: number | null
  elevation_gain_m?: number | null
  intensity?: string | null
  objective?: string | null

// Dans Program, ajouter :
  race_goal_id?: string | null
  phase?: string | null

// Dans Week, ajouter :
  target_distance_km?: number | null
  target_duration_minutes?: number | null
  target_elevation_gain_m?: number | null
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/017_race_goals.sql src/lib/types.ts
git commit -m "feat: migration race_goals + types TS — tables, RLS, grants"
```

---

### Task 2: Wizard création objectif (côté sportif)

**Files:**
- Create: `src/app/client/goal/new/page.tsx`
- Create: `src/app/client/goal/new/wizard-form.tsx`
- Create: `src/app/client/goal/actions.ts`

**Interfaces:**
- Consumes: types `RaceGoal`, `AthleteTrailProfile` de Task 1
- Produces: `createRaceGoal(formData: FormData)` server action qui insère `race_goals` + `athlete_trail_profiles`

- [ ] **Step 1: Créer le server action `src/app/client/goal/actions.ts`**

```typescript
'use server'

// Actions pour les objectifs course du sportif
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRaceGoal(formData: FormData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Récupérer le coach_id du sportif
  const { data: profile } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('id', user.id)
    .single()

  // Vérifier qu'il n'a pas déjà un objectif actif
  const { data: existing } = await supabase
    .from('race_goals')
    .select('id')
    .eq('client_id', user.id)
    .in('status', ['draft', 'pending', 'active'])
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'Tu as déjà un objectif en cours.' }
  }

  // Créer le race_goal
  const { data: goal, error: goalError } = await supabase
    .from('race_goals')
    .insert({
      client_id: user.id,
      coach_id: profile?.coach_id ?? null,
      sport: 'running',
      discipline: 'trail',
      race_name: formData.get('race_name') as string,
      race_date: formData.get('race_date') as string,
      distance_km: parseFloat(formData.get('distance_km') as string),
      elevation_gain_m: parseInt(formData.get('elevation_gain_m') as string),
      elevation_loss_m: formData.get('elevation_loss_m') ? parseInt(formData.get('elevation_loss_m') as string) : null,
      terrain_type: formData.get('terrain_type') as string || null,
      max_altitude_m: formData.get('max_altitude_m') ? parseInt(formData.get('max_altitude_m') as string) : null,
      goal_type: formData.get('goal_type') as string || 'finish',
      target_time_minutes: formData.get('target_time_minutes') ? parseInt(formData.get('target_time_minutes') as string) : null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (goalError || !goal) return { error: 'Erreur lors de la création' }

  // Créer le profil trail
  const availability: Record<string, { available: boolean; max_minutes?: number }> = {}
  for (const day of ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']) {
    const avail = formData.get(`avail_${day}`) === 'true'
    const minutes = formData.get(`minutes_${day}`) ? parseInt(formData.get(`minutes_${day}`) as string) : undefined
    availability[day] = { available: avail, ...(minutes ? { max_minutes: minutes } : {}) }
  }

  const terrainAccess = formData.getAll('terrain_access') as string[]

  const { error: profileError } = await supabase
    .from('athlete_trail_profiles')
    .insert({
      race_goal_id: goal.id,
      declared_level: formData.get('declared_level') as string || null,
      running_experience: formData.get('running_experience') as string || null,
      trail_experience: formData.get('trail_experience') as string || null,
      longest_trail_km: formData.get('longest_trail_km') ? parseFloat(formData.get('longest_trail_km') as string) : null,
      longest_trail_elevation_m: formData.get('longest_trail_elevation_m') ? parseInt(formData.get('longest_trail_elevation_m') as string) : null,
      longest_trail_date: formData.get('longest_trail_date') as string || null,
      sessions_per_week: formData.get('sessions_per_week') ? parseInt(formData.get('sessions_per_week') as string) : null,
      weekly_distance_km: formData.get('weekly_distance_km') ? parseFloat(formData.get('weekly_distance_km') as string) : null,
      weekly_duration_minutes: formData.get('weekly_duration_minutes') ? parseInt(formData.get('weekly_duration_minutes') as string) : null,
      weekly_elevation_gain_m: formData.get('weekly_elevation_gain_m') ? parseInt(formData.get('weekly_elevation_gain_m') as string) : null,
      longest_run_minutes: formData.get('longest_run_minutes') ? parseInt(formData.get('longest_run_minutes') as string) : null,
      longest_run_km: formData.get('longest_run_km') ? parseFloat(formData.get('longest_run_km') as string) : null,
      longest_run_elevation_m: formData.get('longest_run_elevation_m') ? parseInt(formData.get('longest_run_elevation_m') as string) : null,
      availability,
      preferred_long_run_day: formData.get('preferred_long_run_day') as string || null,
      terrain_access: terrainAccess.length > 0 ? terrainAccess : null,
      has_strength_access: formData.get('has_strength_access') === 'true',
      strength_location: formData.get('strength_location') as string || null,
      constraints_notes: formData.get('constraints_notes') as string || null,
    })

  if (profileError) return { error: 'Erreur lors de la création du profil' }

  revalidatePath('/client')
  return { id: goal.id }
}
```

- [ ] **Step 2: Créer la page serveur `src/app/client/goal/new/page.tsx`**

```typescript
// Page création objectif course — wizard 7 étapes
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WizardForm } from './wizard-form'

export default async function NewGoalPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérifier qu'il n'a pas déjà un objectif actif
  const { data: existing } = await supabase
    .from('race_goals')
    .select('id')
    .eq('client_id', user.id)
    .in('status', ['draft', 'pending', 'active'])
    .limit(1)

  if (existing && existing.length > 0) {
    redirect(`/client/goal/${existing[0].id}`)
  }

  return <WizardForm />
}
```

- [ ] **Step 3: Créer le composant wizard `src/app/client/goal/new/wizard-form.tsx`**

Composant client avec 7 étapes + résumé + soumission. Chaque étape est un écran avec barre de progression. Le wizard stocke les données dans un state local et soumet tout à la fin via `createRaceGoal`.

Ce fichier est le plus gros de la feature (~400 lignes). Il contient :
- State pour toutes les données du questionnaire
- 7 composants d'étape inline (StepRace, StepGoal, StepLevel, StepTraining, StepLongRun, StepAvailability, StepConstraints)
- Page résumé avec CTA
- Barre de progression
- Navigation Précédent/Suivant
- Soumission via server action

Les champs correspondent exactement à ceux définis dans la spec section 5-13 et dans le type `AthleteTrailProfile` de Task 1.

Design : fond #0a0a0a, inputs min-h-[44px], boutons 48px, typo Bricolage Grotesque pour les titres d'étape, barre de progression lime en haut.

- [ ] **Step 4: Commit**

```bash
git add src/app/client/goal/
git commit -m "feat: wizard création objectif trail — 7 étapes + server action"
```

---

### Task 3: Vue objectif sportif + navigation client

**Files:**
- Create: `src/app/client/goal/[id]/page.tsx`
- Create: `src/app/client/goal/[id]/goal-view.tsx`
- Modify: `src/components/client/client-nav.tsx`
- Modify: `src/middleware.ts`

**Interfaces:**
- Consumes: types `RaceGoal`, `AthleteTrailProfile` de Task 1, table `race_goals` de Task 1
- Produces: page `/client/goal/[id]` affichant le résumé de l'objectif + statut

- [ ] **Step 1: Créer la page serveur `src/app/client/goal/[id]/page.tsx`**

Page serveur qui récupère le race_goal + athlete_trail_profile et passe au composant client.

- [ ] **Step 2: Créer le composant `src/app/client/goal/[id]/goal-view.tsx`**

Composant client affichant :
- Statut (En attente / En cours / Terminé)
- Résumé course (nom, date, distance, D+, terrain)
- Résumé profil (niveau, volume, dispos)
- Nombre de semaines restantes (calculé depuis race_date)
- Si `status === 'pending'` : message "Ton coach prépare ton plan"
- Si `status === 'active'` : lien vers le plan de préparation

- [ ] **Step 3: Modifier `src/components/client/client-nav.tsx`**

Ajouter l'onglet "Mon objectif" conditionnellement. Le composant reçoit un prop `hasGoal` (boolean). Si true, afficher l'onglet entre "Mon plan" et "Mon parcours".

```typescript
const TABS = [
  { href: '/client', label: 'Mon plan' },
  // { href: '/client/goal', label: 'Mon objectif' } — conditionnel
  { href: '/client/parcours', label: 'Mon parcours' },
]
```

L'onglet pointe vers `/client/goal/[id]`. Pour gérer ça sans passer l'ID dans le composant, créer une route `/client/goal` qui redirige vers le goal actif.

- [ ] **Step 4: Créer `src/app/client/goal/page.tsx`** (redirect vers le goal actif ou vers /new)

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GoalRedirect() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goal } = await supabase
    .from('race_goals')
    .select('id')
    .eq('client_id', user.id)
    .in('status', ['draft', 'pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (goal) redirect(`/client/goal/${goal.id}`)
  redirect('/client/goal/new')
}
```

- [ ] **Step 5: Modifier `src/middleware.ts`** pour autoriser `/client/goal`

Ajouter `/client/goal` dans les routes client autorisées (déjà couvert par `/client/:path*`).

- [ ] **Step 6: Modifier le layout client** pour passer `hasGoal` à ClientNav

Dans `src/app/client/layout.tsx`, requêter si le client a un race_goal actif et passer le prop.

- [ ] **Step 7: Commit**

```bash
git add src/app/client/goal/ src/components/client/client-nav.tsx src/app/client/layout.tsx
git commit -m "feat: vue objectif sportif + navigation conditionnelle Mon objectif"
```

---

### Task 4: Liste préparations côté coach + navigation

**Files:**
- Create: `src/app/coach/preparations/page.tsx`
- Create: `src/app/coach/preparations/preparations-list.tsx`
- Modify: `src/app/coach/layout.tsx` (ajouter onglet Préparations)

**Interfaces:**
- Consumes: table `race_goals` + `athlete_trail_profiles` de Task 1
- Produces: page `/coach/preparations` listant les dossiers sportifs

- [ ] **Step 1: Créer la page serveur `src/app/coach/preparations/page.tsx`**

Requête les race_goals des clients du coach avec jointure athlete_trail_profiles et profiles (nom du sportif).

- [ ] **Step 2: Créer le composant `src/app/coach/preparations/preparations-list.tsx`**

Liste des préparations avec pour chaque carte :
- Avatar initiales du sportif
- Nom course + distance + D+
- Semaines restantes (calculé)
- Volume actuel du sportif
- Badge statut (À préparer / En cours / Terminé)

Design cohérent avec les cartes client existantes.

- [ ] **Step 3: Modifier `src/app/coach/layout.tsx`**

Ajouter l'onglet "Prépas" dans la nav coach à côté de Programmes.

```typescript
<Link href="/coach/preparations" className="text-sm text-[#888] hover:text-[#d4ff00] py-3 transition-colors whitespace-nowrap min-h-[44px] flex items-center">Prépas</Link>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/coach/preparations/ src/app/coach/layout.tsx
git commit -m "feat: liste préparations côté coach + onglet navigation"
```

---

### Task 5: Dossier sportif côté coach + actions

**Files:**
- Create: `src/app/coach/preparations/[goalId]/page.tsx`
- Create: `src/app/coach/preparations/[goalId]/preparation-detail.tsx`
- Create: `src/app/coach/preparations/actions.ts`
- Create: `src/components/coach/athlete-profile-card.tsx`

**Interfaces:**
- Consumes: tables `race_goals`, `athlete_trail_profiles`, `programs`, `session_feedbacks` de Task 1
- Produces: page `/coach/preparations/[goalId]` avec synthèse profil + plan + feedbacks, actions `publishPreparation`, `completePreparation`

- [ ] **Step 1: Créer les server actions `src/app/coach/preparations/actions.ts`**

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { requireCoach } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Publier la préparation (passer en active)
export async function publishPreparation(goalId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('race_goals')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', goalId)

  if (error) return { error: 'Erreur' }
  revalidatePath('/coach/preparations')
  return {}
}

// Terminer la préparation (course passée)
export async function completePreparation(goalId: string) {
  const user = await requireCoach()
  if (!user) return { error: 'Non autorisé' }
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('race_goals')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', goalId)

  if (error) return { error: 'Erreur' }
  revalidatePath('/coach/preparations')
  return {}
}
```

- [ ] **Step 2: Créer le composant `src/components/coach/athlete-profile-card.tsx`**

Carte résumé du profil trail rempli par le sportif : course, objectif, niveau, volume actuel, dispos, terrain, contraintes. Format condensé avec sections visuelles et icônes SVG.

- [ ] **Step 3: Créer la page serveur `src/app/coach/preparations/[goalId]/page.tsx`**

Requête race_goal + athlete_trail_profile + programme lié (si existant) + session_feedbacks.

- [ ] **Step 4: Créer le composant `src/app/coach/preparations/[goalId]/preparation-detail.tsx`**

Layout en 3 sections :
1. Carte profil sportif (athlete-profile-card)
2. Plan de préparation (lien vers le programme ou bouton "Créer le plan")
3. Feedbacks reçus (liste des session_feedbacks triés par date)

Boutons d'action : "Publier" (si pending), "Terminer" (si active).

- [ ] **Step 5: Commit**

```bash
git add src/app/coach/preparations/ src/components/coach/athlete-profile-card.tsx
git commit -m "feat: dossier sportif côté coach — profil, plan, feedbacks, actions"
```

---

### Task 6: Feedback post-séance côté sportif

**Files:**
- Create: `src/components/client/session-feedback-modal.tsx`
- Modify: `src/app/client/actions.ts` (ajouter `submitSessionFeedback`)
- Modify: `src/app/client/session/[id]/train/train-mode.tsx` (déclencher la modal après "Terminer")

**Interfaces:**
- Consumes: table `session_feedbacks` de Task 1, type `SessionFeedback`
- Produces: modal feedback + action `submitSessionFeedback(sessionId, data)`

- [ ] **Step 1: Ajouter l'action dans `src/app/client/actions.ts`**

```typescript
// Enregistrer le feedback post-séance
export async function submitSessionFeedback(
  sessionId: string,
  completion: string,
  difficultyRpe: number | null,
  feeling: string | null,
  comment: string | null,
  actualDuration: number | null,
  actualDistance: number | null,
  actualElevation: number | null,
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase
    .from('session_feedbacks')
    .upsert({
      session_id: sessionId,
      client_id: user.id,
      completion,
      difficulty_rpe: difficultyRpe,
      feeling,
      comment,
      actual_duration_minutes: actualDuration,
      actual_distance_km: actualDistance,
      actual_elevation_m: actualElevation,
    }, { onConflict: 'session_id,client_id' })

  if (error) return { error: 'Erreur' }
  revalidatePath('/client')
  return {}
}
```

- [ ] **Step 2: Créer `src/components/client/session-feedback-modal.tsx`**

Modal avec :
- Complétion (3 boutons : Oui / Partiellement / Non)
- RPE slider 1-10
- Ressenti (5 boutons : Très bien → Douleur)
- Commentaire (textarea)
- Section conditionnelle sortie longue (durée, distance, D+ réels)
- Bouton Envoyer

Design : modal bottom-sheet mobile, fond sombre, touch targets 44px.

- [ ] **Step 3: Modifier `src/app/client/session/[id]/train/train-mode.tsx`**

Après le clic "Terminer", au lieu de rediriger directement, afficher la modal feedback. La redirection se fait après soumission du feedback.

- [ ] **Step 4: Commit**

```bash
git add src/components/client/session-feedback-modal.tsx src/app/client/actions.ts src/app/client/session/
git commit -m "feat: feedback post-séance — modal RPE/ressenti + action"
```

---

### Task 7: Enrichir le session-editor coach pour les séances trail

**Files:**
- Modify: `src/components/coach/session-editor.tsx`
- Modify: `src/app/coach/clients/[id]/program/actions.ts`

**Interfaces:**
- Consumes: nouveaux champs `sessions` (session_type, duration_minutes, distance_km, elevation_gain_m, intensity, objective) de Task 1
- Produces: formulaire d'édition de séance enrichi avec les champs trail

- [ ] **Step 1: Modifier le formulaire d'édition dans `session-editor.tsx`**

Quand `editingSession` est true, ajouter sous les champs existants (nom, jour, programme, description, récupération) :
- Select `session_type` avec les 19 types prévus dans la spec
- Input `duration_minutes` (nombre)
- Input `distance_km` (nombre, optionnel)
- Input `elevation_gain_m` (nombre, optionnel)
- Input `intensity` (texte)
- Textarea `objective` (texte)

Ces champs sont optionnels — ils n'apparaissent que si le programme est lié à un race_goal (ou toujours visibles mais non obligatoires).

- [ ] **Step 2: Modifier l'affichage de la séance (mode lecture)**

Quand la séance a un `session_type`, afficher un badge coloré avec le type (Endurance, Côtes, Sortie longue...) + durée + D+ si renseignés.

- [ ] **Step 3: Modifier l'action `updateSession` dans `actions.ts`**

Ajouter les nouveaux champs à la requête update.

- [ ] **Step 4: Commit**

```bash
git add src/components/coach/session-editor.tsx src/app/coach/clients/[id]/program/actions.ts
git commit -m "feat: champs trail dans l'éditeur de séance coach"
```

---

### Task 8: Volume hebdomadaire dans week-section

**Files:**
- Modify: `src/components/coach/week-section.tsx`
- Modify: `src/app/coach/clients/[id]/program/actions.ts`

**Interfaces:**
- Consumes: nouveaux champs `weeks` (target_distance_km, target_duration_minutes, target_elevation_gain_m) de Task 1
- Produces: affichage et édition des objectifs de volume par semaine

- [ ] **Step 1: Modifier `week-section.tsx`**

Sous le titre "Semaine N", afficher les stats de volume si renseignées :
- Distance : 48 km
- Durée : 6h20
- D+ : 1900 m

Ajouter un bouton "Objectifs" qui ouvre un mini formulaire inline pour saisir les 3 valeurs.

- [ ] **Step 2: Ajouter l'action `updateWeekTargets` dans `actions.ts`**

```typescript
export async function updateWeekTargets(
  weekId: string,
  targetDistanceKm: number | null,
  targetDurationMinutes: number | null,
  targetElevationGainM: number | null,
  clientId: string,
) {
  // update weeks set target_distance_km, target_duration_minutes, target_elevation_gain_m
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/week-section.tsx src/app/coach/clients/[id]/program/actions.ts
git commit -m "feat: objectifs volume hebdomadaire (km, durée, D+) dans week-section"
```
