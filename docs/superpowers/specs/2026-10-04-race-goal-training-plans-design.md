# KTRY — Race Goal Training Plans

## Goal

Ajouter à KTRY la possibilité pour un sportif de préparer une compétition (trail pour le MVP) avec un plan d'entraînement personnalisé construit par son coach.

## Architecture

Le Race Goal est une **couche au-dessus** du système existant (programmes/semaines/séances). Il ne le remplace pas. Les deux coexistent : un coach peut avoir des clients en mode classique (renfo, muscu) et d'autres en préparation trail.

Le MVP est **human-in-the-loop** : le sportif remplit un questionnaire, le coach analyse le dossier et construit le plan manuellement. Pas de génération automatique par IA.

## Scope MVP

- Sport : Running
- Discipline : Trail
- Un seul objectif actif par sportif
- Le sportif crée son objectif via un wizard
- Le coach construit le plan manuellement
- Feedback post-séance côté sportif
- Pas de Garmin/Strava, pas d'IA, pas de marketplace

Le modèle de données reste générique pour accueillir d'autres sports/disciplines plus tard.

---

## 1. Modèle de données

### 1.1 Nouvelle table : `race_goals`

Objectif course du sportif.

```sql
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

  -- Statut
  status TEXT NOT NULL DEFAULT 'draft',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Valeurs `status` : `draft` → `pending` (soumis au coach) → `active` (plan publié) → `completed` (course passée).

Valeurs `goal_type` : `finish`, `comfortable`, `improve`, `target_time`, `performance`.

Valeurs `terrain_type` : `roulant`, `vallonne`, `montagne`, `technique`, `tres_technique`.

### 1.2 Nouvelle table : `athlete_trail_profiles`

Profil trail rempli via le questionnaire. Un profil par objectif.

```sql
CREATE TABLE athlete_trail_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_goal_id UUID NOT NULL UNIQUE REFERENCES race_goals(id) ON DELETE CASCADE,

  -- Niveau
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

  -- Disponibilités (JSON : {"lundi": {"available": false}, "mardi": {"available": true, "max_minutes": 60}, ...})
  availability JSONB,
  preferred_long_run_day TEXT,

  -- Terrain & renfo
  terrain_access JSONB,
  has_strength_access BOOLEAN DEFAULT false,
  strength_location TEXT,

  -- Contraintes
  constraints_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Valeurs `declared_level` : `debutant`, `intermediaire`, `confirme`, `avance`.

Valeurs `running_experience` : `<1an`, `1-2ans`, `2-5ans`, `5+ans`.

Valeurs `trail_experience` : `jamais`, `quelques_courts`, `regulierement`, `experimente`.

Valeurs `strength_location` : `maison`, `salle`, `les_deux`.

### 1.3 Nouvelle table : `session_feedbacks`

Feedback post-séance enrichi. Remplace/complète le système exercise_logs pour les séances trail.

```sql
CREATE TABLE session_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Complétion
  completion TEXT NOT NULL DEFAULT 'yes',
  difficulty_rpe INTEGER CHECK (difficulty_rpe BETWEEN 1 AND 10),
  feeling TEXT,
  comment TEXT,

  -- Données spécifiques sortie longue (optionnel)
  actual_duration_minutes INTEGER,
  actual_distance_km NUMERIC,
  actual_elevation_m INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, client_id)
);
```

Valeurs `completion` : `yes`, `partial`, `no`.

Valeurs `feeling` : `great`, `good`, `tired`, `very_tired`, `pain`.

### 1.4 Table existante modifiée : `sessions`

Ajout de champs optionnels pour les séances trail. Pas d'impact sur les séances classiques (champs nullable).

```sql
ALTER TABLE sessions ADD COLUMN session_type TEXT;
ALTER TABLE sessions ADD COLUMN duration_minutes INTEGER;
ALTER TABLE sessions ADD COLUMN distance_km NUMERIC;
ALTER TABLE sessions ADD COLUMN elevation_gain_m INTEGER;
ALTER TABLE sessions ADD COLUMN intensity TEXT;
ALTER TABLE sessions ADD COLUMN objective TEXT;
```

Valeurs `session_type` : `easy_run`, `endurance`, `recovery_run`, `tempo`, `threshold`, `intervals`, `hill_repeats`, `uphill_training`, `downhill_training`, `technical_trail`, `long_run`, `long_trail`, `race_specific`, `strength_training`, `mobility`, `cross_training`, `rest`, `taper`, `race`.

### 1.5 Table existante modifiée : `programs`

Lien optionnel vers un objectif course + phase de périodisation.

```sql
ALTER TABLE programs ADD COLUMN race_goal_id UUID REFERENCES race_goals(id) ON DELETE SET NULL;
ALTER TABLE programs ADD COLUMN phase TEXT;
```

Valeurs `phase` : `base`, `build`, `specific`, `taper`.

### 1.6 Table existante modifiée : `weeks`

Objectifs hebdomadaires pour le suivi du volume.

```sql
ALTER TABLE weeks ADD COLUMN target_distance_km NUMERIC;
ALTER TABLE weeks ADD COLUMN target_duration_minutes INTEGER;
ALTER TABLE weeks ADD COLUMN target_elevation_gain_m INTEGER;
```

### 1.7 RLS

- `race_goals` : le sportif voit ses propres objectifs, le coach voit ceux de ses sportifs.
- `athlete_trail_profiles` : même logique via race_goal → client_id / coach_id.
- `session_feedbacks` : le sportif crée/modifie les siens, le coach les voit.

---

## 2. Parcours utilisateur

### 2.1 Sportif : Création de l'objectif

Wizard 7 étapes dans `/client/goal/new` :

| Étape | Titre | Champs |
|-------|-------|--------|
| 1 | Ma course | race_name, race_date, distance_km, elevation_gain_m, elevation_loss_m (opt), terrain_type, max_altitude_m (opt) |
| 2 | Mon objectif | goal_type, target_time_minutes (si chrono) |
| 3 | Mon niveau | declared_level, running_experience, trail_experience |
| 4 | Mon entraînement | sessions_per_week, weekly_distance_km, weekly_duration_minutes, weekly_elevation_gain_m, longest_trail_km/elevation/date |
| 5 | Ma sortie longue | longest_run_minutes, longest_run_km, longest_run_elevation_m |
| 6 | Mes disponibilités | grille 7 jours (available + max_minutes), preferred_long_run_day |
| 7 | Terrain & contraintes | terrain_access, has_strength_access, strength_location, constraints_notes |

Page finale : **Résumé** avec toutes les infos + nombre de semaines calculé. CTA "Créer ma préparation".

À la soumission : `race_goal.status` passe à `pending`. Le sportif voit un message d'attente.

### 2.2 Sportif : Suivi de la préparation

- Quand le plan est publié (`status: active`), le sportif le retrouve via l'onglet "Mon objectif".
- Les séances s'affichent avec leur type (Endurance, Côtes, Sortie longue...), durée, D+ cible.
- Après chaque séance terminée, modal feedback (complétion, RPE 1-10, ressenti, commentaire, données sortie longue si applicable).

### 2.3 Coach : Gestion des préparations

**Nouvel onglet "Préparations"** dans la nav coach.

**Liste** : carte par préparation avec nom du sportif, course, distance, D+, semaines restantes, statut.

**Dossier sportif** (`/coach/preparations/[goalId]`) :
- Synthèse du questionnaire (profil, volume actuel, dispos, écart objectif/niveau)
- Le plan (= programme lié au race_goal, avec phases)
- Les feedbacks reçus

**Construction du plan** : le coach utilise le système existant. Il crée un programme (lié au race_goal_id), ajoute des semaines avec phases (base/build/specific/taper), crée des séances avec les nouveaux champs (type, durée, distance, D+, objectif). Il peut utiliser ses workouts templates pour les séances récurrentes (renfo trail, mobilité...).

---

## 3. Routes & composants

### 3.1 Nouvelles routes

**Sportif :**
```
/client/goal/new              → Wizard création objectif
/client/goal/[id]             → Vue résumé objectif + plan
```

**Coach :**
```
/coach/preparations           → Liste des préparations
/coach/preparations/[goalId]  → Dossier sportif
```

### 3.2 Navigation modifiée

**Sportif** — onglets : Mon plan | Mon objectif (si actif) | Mon parcours

**Coach** — onglets : Clients | Exercices | Programmes | Préparations

### 3.3 Nouveaux composants

```
src/app/client/goal/
  new/page.tsx, wizard-form.tsx
  [id]/page.tsx, goal-view.tsx

src/app/coach/preparations/
  page.tsx, preparations-list.tsx
  [goalId]/page.tsx, preparation-detail.tsx

src/components/client/
  session-feedback-modal.tsx

src/components/coach/
  athlete-profile-card.tsx
```

### 3.4 Server actions

```
src/app/client/goal/actions.ts
  createRaceGoal(formData)       → crée race_goal + athlete_trail_profile, status = pending
  updateRaceGoal(id, data)       → modifie avant soumission

src/app/client/actions.ts
  submitSessionFeedback(...)     → crée/modifie session_feedback

src/app/coach/preparations/actions.ts
  publishPreparation(goalId)     → status = active, lie le programme
  completePreparation(goalId)    → status = completed
```

---

## 4. Séances trail

### 4.1 Structure d'une séance

Une séance trail utilise les champs existants + les nouveaux :

- `name` : "Côtes — 8 × 3 min"
- `session_type` : "hill_repeats"
- `duration_minutes` : 70
- `distance_km` : null (pas pertinent pour des côtes)
- `elevation_gain_m` : 400
- `intensity` : "modérée à haute"
- `objective` : "Développer la capacité à courir efficacement en montée"
- `details` : "20 min footing facile\n8 × 3 min montée (récup descente)\n15 min footing facile"
- `recovery` : "Récupération en descente entre chaque répétition"

### 4.2 Templates coach

Le coach crée des workouts templates pour les séances récurrentes :
- "Côtes 8×3 min", "Seuil Trail 3×10 min", "Sortie longue 2h", "Renfo Trail jambes", "Mobilité"
- Réutilisables d'un plan à l'autre via le système workouts existant.

### 4.3 Volume hebdomadaire

Chaque semaine du plan a des objectifs de volume :
- `target_distance_km` : 48
- `target_duration_minutes` : 380
- `target_elevation_gain_m` : 1900

Affiché dans la vue coach et dans la vue sportif.

---

## 5. Feedback post-séance

### 5.1 Déclenchement

Après que le sportif clique "Terminer" sur une séance (système session_logs existant), une modal feedback apparaît.

### 5.2 Champs

1. As-tu terminé la séance ? (oui / partiellement / non)
2. Difficulté ressentie (slider 1-10, RPE)
3. Comment te sens-tu ? (très bien / bien / fatigué / très fatigué / douleur)
4. Commentaire (texte libre)
5. Si sortie longue : durée réelle, distance réelle, D+ réel

### 5.3 Côté coach

Les feedbacks sont visibles dans le dossier de la préparation. Le coach peut détecter :
- Séance partiellement réalisée + RPE élevé → surcharge possible
- Écart entre sortie longue prévue et réalisée → ajuster le plan

---

## 6. Ce qui ne change pas

- Le système programmes/semaines/séances/exercices reste identique
- L'espace client classique (Mon plan, Mon parcours) reste inchangé
- Les workouts templates fonctionnent pareil
- La bibliothèque d'exercices reste la même
- Le système de suivi existant (tracking-view) reste en place
- Stripe, freemium, inscription coach : inchangés

---

## 7. Vision commerciale

Le sportif n'achète pas un "programme trail 42 km". Il achète **sa préparation pour son trail** : personnalisée selon son niveau, ses dispos, son terrain, son expérience, sa course.

Message produit : "Ton trail. Ton niveau. Ton emploi du temps. Ton plan."

Le trail est le premier cas d'usage. L'architecture supporte ensuite : running route, cyclisme, triathlon, Hyrox.

---

## 8. Contraintes

- Mobile-first : le wizard et le feedback sont conçus pour le mobile
- Le coach peut aussi voir le dossier sur mobile
- Pas de données médicales automatisées (contraintes santé = texte libre pour le coach)
- RGPD : les données du questionnaire appartiennent au sportif
