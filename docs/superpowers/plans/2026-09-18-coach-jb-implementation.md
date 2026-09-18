# Coach JB — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une web app mobile-first permettant à un coach sportif de gérer des programmes d'exercices avec vidéos pour ses clients, et aux clients de consulter leur programme et donner du feedback.

**Architecture:** Next.js App Router avec Supabase (PostgreSQL + Auth + Storage). Le coach a un espace d'administration protégé, le client a un espace de consultation. Le routage est protégé par middleware selon le rôle (coach/client). Les vidéos sont uploadées sur Supabase Storage.

**Tech Stack:** Next.js 14+, React 18+, TypeScript, Tailwind CSS, Supabase (Auth, DB, Storage), Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-09-18-coach-jb-app-design.md`

## Global Constraints

- Mobile-first sur tout le CSS
- Commentaires toujours en français
- Variables d'environnement pour toutes les clés API (`.env.local`)
- Pas de `console.log` en production
- Hébergement Vercel (gratuit)
- Supabase plan gratuit (1 Go stockage max)
- TypeScript strict

---

## Structure des fichiers

```
coach-jb/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Layout racine (Tailwind, polices)
│   │   ├── page.tsx                            # Redirect → /login
│   │   ├── login/
│   │   │   └── page.tsx                        # Page de connexion
│   │   ├── coach/
│   │   │   ├── layout.tsx                      # Layout coach (nav, protection rôle)
│   │   │   ├── page.tsx                        # Tableau de bord coach
│   │   │   ├── exercises/
│   │   │   │   └── page.tsx                    # Bibliothèque d'exercices
│   │   │   └── clients/
│   │   │       └── [id]/
│   │   │           ├── program/
│   │   │           │   └── page.tsx            # Gestion programme client
│   │   │           └── tracking/
│   │   │               └── page.tsx            # Suivi / feedbacks client
│   │   └── client/
│   │       ├── layout.tsx                      # Layout client (nav, protection rôle)
│   │       ├── page.tsx                        # Mon programme (vue semaines)
│   │       └── session/
│   │           └── [id]/
│   │               └── page.tsx                # Détail d'une séance
│   ├── components/
│   │   ├── auth/
│   │   │   └── login-form.tsx                  # Formulaire de connexion
│   │   ├── coach/
│   │   │   ├── client-card.tsx                 # Carte client (dashboard)
│   │   │   ├── add-client-modal.tsx            # Modal ajout client
│   │   │   ├── exercise-form.tsx               # Formulaire ajout/édition exercice
│   │   │   ├── exercise-card.tsx               # Carte exercice (bibliothèque)
│   │   │   ├── program-editor.tsx              # Éditeur de programme complet
│   │   │   ├── week-section.tsx                # Section semaine (accordéon)
│   │   │   ├── session-editor.tsx              # Éditeur de séance
│   │   │   ├── exercise-picker.tsx             # Sélecteur d'exercice depuis bibliothèque
│   │   │   └── tracking-view.tsx               # Vue suivi client
│   │   ├── client/
│   │   │   ├── week-navigator.tsx              # Navigation entre semaines
│   │   │   ├── session-card.tsx                # Carte séance (liste)
│   │   │   ├── exercise-item.tsx               # Exercice dans séance (vidéo + infos + actions)
│   │   │   └── feedback-input.tsx              # Champ feedback
│   │   └── ui/
│   │       ├── button.tsx                      # Bouton réutilisable
│   │       ├── input.tsx                       # Input réutilisable
│   │       ├── modal.tsx                       # Modal réutilisable
│   │       ├── video-player.tsx                # Lecteur vidéo
│   │       └── progress-bar.tsx                # Barre de progression
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                       # Client Supabase côté navigateur
│   │   │   ├── server.ts                       # Client Supabase côté serveur
│   │   │   └── admin.ts                        # Client Supabase admin (création de comptes)
│   │   └── types.ts                            # Types TypeScript (Database, enums)
│   └── middleware.ts                           # Protection des routes par rôle
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql              # Schéma complet + RLS
├── __tests__/
│   ├── lib/
│   │   └── supabase/
│   │       └── client.test.ts
│   ├── components/
│   │   ├── auth/
│   │   │   └── login-form.test.tsx
│   │   ├── coach/
│   │   │   ├── exercise-form.test.tsx
│   │   │   └── program-editor.test.tsx
│   │   └── client/
│   │       └── exercise-item.test.tsx
│   └── app/
│       └── login/
│           └── page.test.tsx
├── .env.local.example                          # Template des variables d'env
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
└── README.md
```

---

### Task 1: Setup du projet et configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `vitest.config.ts`, `.env.local.example`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/types.ts`
- Test: `__tests__/lib/supabase/client.test.ts`

**Interfaces:**
- Consumes: rien (première tâche)
- Produces:
  - `createBrowserClient(): SupabaseClient` (depuis `src/lib/supabase/client.ts`)
  - `createServerClient(): SupabaseClient` (depuis `src/lib/supabase/server.ts`)
  - Type `Database` avec toutes les tables (depuis `src/lib/types.ts`)

- [ ] **Step 1: Initialiser le projet Next.js**

```bash
cd "/Users/nicorouvroy/Projets/coach JB"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Répondre "Yes" à toutes les questions par défaut.

- [ ] **Step 2: Installer les dépendances**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

- [ ] **Step 3: Créer le fichier de config Vitest**

Créer `vitest.config.ts` :

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 4: Ajouter le script test dans package.json**

Ajouter dans `"scripts"` :

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Créer le fichier d'exemple des variables d'environnement**

Créer `.env.local.example` :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
```

- [ ] **Step 6: Créer les types TypeScript**

Créer `src/lib/types.ts` :

```typescript
export type UserRole = 'coach' | 'client'
export type ProgramStatus = 'active' | 'completed'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  video_url: string
  category: string
  coach_id: string
  created_at: string
}

export interface Program {
  id: string
  name: string
  client_id: string
  coach_id: string
  status: ProgramStatus
  created_at: string
}

export interface Week {
  id: string
  program_id: string
  week_number: number
}

export interface Session {
  id: string
  week_id: string
  name: string
  day_of_week: string
  order_index: number
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  coach_notes: string
  order_index: number
}

export interface ExerciseLog {
  id: string
  session_exercise_id: string
  client_id: string
  completed: boolean
  feedback: string | null
  completed_at: string | null
}

// Types enrichis (avec relations jointes)
export interface SessionExerciseWithDetails extends SessionExercise {
  exercise: Exercise
  exercise_log?: ExerciseLog | null
}

export interface SessionWithExercises extends Session {
  session_exercises: SessionExerciseWithDetails[]
}

export interface WeekWithSessions extends Week {
  sessions: SessionWithExercises[]
}

export interface ProgramWithWeeks extends Program {
  weeks: WeekWithSessions[]
  client: Profile
}
```

- [ ] **Step 7: Créer le client Supabase navigateur**

Créer `src/lib/supabase/client.ts` :

```typescript
import { createBrowserClient as createClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 8: Créer le client Supabase serveur**

Créer `src/lib/supabase/server.ts` :

```typescript
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoré dans les Server Components (lecture seule)
          }
        },
      },
    }
  )
}
```

- [ ] **Step 9: Créer le client Supabase admin**

Créer `src/lib/supabase/admin.ts` :

```typescript
import { createClient } from '@supabase/supabase-js'

// Client admin pour les opérations privilégiées (création de comptes)
// Ne jamais utiliser côté client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

- [ ] **Step 10: Écrire le test du client Supabase**

Créer `__tests__/lib/supabase/client.test.ts` :

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocker le module @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({ from: vi.fn() })),
}))

describe('createBrowserClient', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('retourne un client Supabase', async () => {
    const { createBrowserClient } = await import('@/lib/supabase/client')
    const client = createBrowserClient()
    expect(client).toBeDefined()
    expect(client.from).toBeDefined()
  })
})
```

- [ ] **Step 11: Lancer les tests**

```bash
npm test
```

Résultat attendu : 1 test PASS.

- [ ] **Step 12: Mettre à jour le layout racine**

Modifier `src/app/layout.tsx` :

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Coach JB',
  description: 'Application de coaching sportif',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 13: Créer la page d'accueil (redirect)**

Modifier `src/app/page.tsx` :

```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/login')
}
```

- [ ] **Step 14: Commit**

```bash
git init
echo "node_modules/\n.next/\n.env.local" > .gitignore
git add -A
git commit -m "feat: setup projet Next.js + Supabase + Vitest"
```

---

### Task 2: Schéma de base de données et RLS

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Interfaces:**
- Consumes: rien
- Produces: toutes les tables définies dans la spec, les politiques RLS, le bucket Storage `exercise-videos`, le trigger de création automatique de profil

- [ ] **Step 1: Créer le fichier de migration SQL**

Créer `supabase/migrations/001_initial_schema.sql` :

```sql
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
```

- [ ] **Step 2: Exécuter la migration dans Supabase**

Aller dans le dashboard Supabase → SQL Editor → coller le contenu du fichier et exécuter.

Alternativement, si Supabase CLI est installée :

```bash
npx supabase db push
```

- [ ] **Step 3: Créer le projet Supabase et récupérer les clés**

1. Aller sur https://supabase.com → créer un nouveau projet "coach-jb"
2. Aller dans Settings → API
3. Copier `Project URL` et `anon public key` et `service_role key`
4. Créer `.env.local` à partir de `.env.local.example` et remplir les valeurs

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: schéma base de données + RLS + bucket vidéos"
```

---

### Task 3: Authentification et middleware

**Files:**
- Create: `src/app/login/page.tsx`, `src/components/auth/login-form.tsx`
- Create: `src/middleware.ts`
- Create: `src/app/coach/layout.tsx`, `src/app/client/layout.tsx`
- Test: `__tests__/components/auth/login-form.test.tsx`

**Interfaces:**
- Consumes: `createBrowserClient()` depuis `src/lib/supabase/client.ts`, `createServerClient()` depuis `src/lib/supabase/server.ts`, type `Profile` depuis `src/lib/types.ts`
- Produces:
  - Composant `<LoginForm />` (formulaire de connexion)
  - Middleware qui redirige `/coach/*` si pas coach, `/client/*` si pas client
  - Layouts coach et client avec navigation

- [ ] **Step 1: Écrire le test du formulaire de connexion**

Créer `__tests__/components/auth/login-form.test.tsx` :

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginForm } from '@/components/auth/login-form'

// Mocker le module supabase
vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}))

// Mocker next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe('LoginForm', () => {
  it('affiche les champs email et mot de passe', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(screen.getByLabelText(/mot de passe/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /connexion/i })).toBeDefined()
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
npm test -- __tests__/components/auth/login-form.test.tsx
```

Résultat attendu : FAIL (module `@/components/auth/login-form` introuvable).

- [ ] **Step 3: Implémenter le formulaire de connexion**

Créer `src/components/auth/login-form.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    // Récupérer le rôle pour rediriger
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single()

    if (profile?.role === 'coach') {
      router.push('/coach')
    } else {
      router.push('/client')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="votre@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        {loading ? 'Connexion...' : 'Connexion'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Vérifier que le test passe**

```bash
npm test -- __tests__/components/auth/login-form.test.tsx
```

Résultat attendu : PASS.

- [ ] **Step 5: Créer la page de connexion**

Créer `src/app/login/page.tsx` :

```typescript
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Coach JB</h1>
        <p className="text-gray-500 mt-2">Coaching sportif personnalisé</p>
      </div>
      <LoginForm />
    </main>
  )
}
```

- [ ] **Step 6: Créer le middleware de protection des routes**

Créer `src/middleware.ts` :

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Pas connecté → redirige vers login
  if (!user && (request.nextUrl.pathname.startsWith('/coach') || request.nextUrl.pathname.startsWith('/client'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Connecté → vérifier le rôle
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Si sur /login et connecté, rediriger vers le bon espace
    if (request.nextUrl.pathname === '/login') {
      const target = profile?.role === 'coach' ? '/coach' : '/client'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // Coach qui accède à /client → rediriger
    if (profile?.role === 'coach' && request.nextUrl.pathname.startsWith('/client')) {
      return NextResponse.redirect(new URL('/coach', request.url))
    }

    // Client qui accède à /coach → rediriger
    if (profile?.role === 'client' && request.nextUrl.pathname.startsWith('/coach')) {
      return NextResponse.redirect(new URL('/client', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/coach/:path*', '/client/:path*', '/login'],
}
```

- [ ] **Step 7: Créer le layout coach**

Créer `src/app/coach/layout.tsx` :

```typescript
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation mobile-first */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/coach" className="text-lg font-bold text-gray-900">
            Coach JB
          </Link>
          <div className="flex gap-4">
            <Link href="/coach" className="text-sm text-gray-600 hover:text-gray-900">
              Clients
            </Link>
            <Link href="/coach/exercises" className="text-sm text-gray-600 hover:text-gray-900">
              Exercices
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-lg mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 8: Créer le layout client**

Créer `src/app/client/layout.tsx` :

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <p className="text-lg font-bold text-gray-900">Mon Programme</p>
          <p className="text-sm text-gray-500">{profile?.full_name}</p>
        </div>
      </nav>
      <main className="max-w-lg mx-auto p-4">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 9: Créer les pages placeholder**

Créer `src/app/coach/page.tsx` :

```typescript
export default function CoachDashboard() {
  return <p className="text-gray-500">Tableau de bord coach (à venir)</p>
}
```

Créer `src/app/client/page.tsx` :

```typescript
export default function ClientProgram() {
  return <p className="text-gray-500">Mon programme (à venir)</p>
}
```

- [ ] **Step 10: Lancer tous les tests**

```bash
npm test
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: authentification, middleware de protection des routes, layouts coach/client"
```

---

### Task 4: Espace coach — Tableau de bord et gestion des clients

**Files:**
- Create: `src/components/coach/client-card.tsx`, `src/components/coach/add-client-modal.tsx`
- Create: `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, `src/components/ui/modal.tsx`
- Modify: `src/app/coach/page.tsx`
- Create: `src/app/coach/actions.ts` (Server Actions)
- Test: `__tests__/components/coach/client-card.test.tsx`

**Interfaces:**
- Consumes: `createServerClient()`, `createAdminClient()`, types `Profile`, `Program`
- Produces:
  - Composant `<ClientCard client={Profile} programStatus={string} completionPercent={number} />` — carte client avec indicateur de progression
  - Composant `<AddClientModal onClose={() => void} />` — modal de création de client
  - Server Action `createClient(formData: FormData): Promise<{ error?: string }>` — crée un compte client via Supabase Admin
  - Composants UI : `<Button>`, `<Input>`, `<Modal>`

- [ ] **Step 1: Créer les composants UI de base**

Créer `src/components/ui/button.tsx` :

```typescript
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg font-medium disabled:opacity-50 transition-colors'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  )
}
```

Créer `src/components/ui/input.tsx` :

```typescript
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  )
}
```

Créer `src/components/ui/modal.tsx` :

```typescript
'use client'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Écrire le test du ClientCard**

Créer `__tests__/components/coach/client-card.test.tsx` :

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClientCard } from '@/components/coach/client-card'

describe('ClientCard', () => {
  const client = {
    id: '123',
    email: 'client@test.com',
    full_name: 'Jean Dupont',
    role: 'client' as const,
    created_at: '2026-01-01',
  }

  it('affiche le nom du client et son pourcentage de progression', () => {
    render(<ClientCard client={client} programStatus="active" completionPercent={75} />)
    expect(screen.getByText('Jean Dupont')).toBeDefined()
    expect(screen.getByText('75%')).toBeDefined()
  })

  it('affiche "Aucun programme" si pas de programme actif', () => {
    render(<ClientCard client={client} programStatus={null} completionPercent={0} />)
    expect(screen.getByText(/aucun programme/i)).toBeDefined()
  })
})
```

- [ ] **Step 3: Vérifier que le test échoue**

```bash
npm test -- __tests__/components/coach/client-card.test.tsx
```

Résultat attendu : FAIL.

- [ ] **Step 4: Implémenter ClientCard**

Créer `src/components/coach/client-card.tsx` :

```typescript
import Link from 'next/link'
import type { Profile } from '@/lib/types'

interface ClientCardProps {
  client: Profile
  programStatus: string | null
  completionPercent: number
}

export function ClientCard({ client, programStatus, completionPercent }: ClientCardProps) {
  return (
    <Link
      href={`/coach/clients/${client.id}/program`}
      className="block bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{client.full_name}</p>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
        {programStatus ? (
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{completionPercent}%</p>
            <p className="text-xs text-gray-400">complété</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Aucun programme</p>
        )}
      </div>
      {programStatus && (
        <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      )}
    </Link>
  )
}
```

- [ ] **Step 5: Vérifier que le test passe**

```bash
npm test -- __tests__/components/coach/client-card.test.tsx
```

Résultat attendu : PASS.

- [ ] **Step 6: Créer la Server Action pour ajouter un client**

Créer `src/app/coach/actions.ts` :

```typescript
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClient(formData: FormData) {
  const email = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const password = formData.get('password') as string

  if (!email || !fullName || !password) {
    return { error: 'Tous les champs sont obligatoires' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit faire au moins 6 caractères' }
  }

  // Vérifier que l'utilisateur actuel est bien coach
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coach') return { error: 'Non autorisé' }

  // Créer le compte client via l'API admin
  const admin = createAdminClient()
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'client' },
  })

  if (createError) {
    if (createError.message.includes('already')) {
      return { error: 'Un compte avec cet email existe déjà' }
    }
    return { error: 'Erreur lors de la création du compte' }
  }

  revalidatePath('/coach')
  return {}
}
```

- [ ] **Step 7: Implémenter le modal d'ajout de client**

Créer `src/components/coach/add-client-modal.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/app/coach/actions'

interface AddClientModalProps {
  onClose: () => void
}

export function AddClientModal({ onClose }: AddClientModalProps) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createClient(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    onClose()
  }

  return (
    <Modal title="Ajouter un client" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom complet" id="full_name" name="full_name" required placeholder="Jean Dupont" />
        <Input label="Email" id="email" name="email" type="email" required placeholder="jean@email.com" />
        <Input label="Mot de passe temporaire" id="password" name="password" type="text" required placeholder="min. 6 caractères" minLength={6} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Création...' : 'Créer le compte client'}
        </Button>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 8: Implémenter le tableau de bord coach**

Modifier `src/app/coach/page.tsx` :

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { ClientCard } from '@/components/coach/client-card'
import { CoachDashboardClient } from './dashboard-client'

export default async function CoachDashboard() {
  const supabase = await createServerClient()

  // Récupérer tous les clients
  const { data: clients } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('full_name')

  // Récupérer les programmes actifs avec stats de complétion
  const { data: programs } = await supabase
    .from('programs')
    .select('id, client_id, status')
    .eq('status', 'active')

  // Pour chaque programme actif, calculer le pourcentage de complétion
  const clientStats = new Map<string, { status: string; percent: number }>()

  if (programs) {
    for (const program of programs) {
      // Compter les exercices totaux et complétés
      const { count: totalExercises } = await supabase
        .from('session_exercises')
        .select('id', { count: 'exact', head: true })
        .in('session_id',
          (await supabase
            .from('sessions')
            .select('id')
            .in('week_id',
              (await supabase
                .from('weeks')
                .select('id')
                .eq('program_id', program.id)
              ).data?.map(w => w.id) ?? []
            )
          ).data?.map(s => s.id) ?? []
        )

      const { count: completedExercises } = await supabase
        .from('exercise_logs')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', program.client_id)
        .eq('completed', true)

      const percent = totalExercises
        ? Math.round(((completedExercises ?? 0) / totalExercises) * 100)
        : 0

      clientStats.set(program.client_id, { status: program.status, percent })
    }
  }

  return (
    <CoachDashboardClient
      clients={clients ?? []}
      clientStats={Object.fromEntries(clientStats)}
    />
  )
}
```

Créer `src/app/coach/dashboard-client.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ClientCard } from '@/components/coach/client-card'
import { AddClientModal } from '@/components/coach/add-client-modal'
import type { Profile } from '@/lib/types'

interface CoachDashboardClientProps {
  clients: Profile[]
  clientStats: Record<string, { status: string; percent: number }>
}

export function CoachDashboardClient({ clients, clientStats }: CoachDashboardClientProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes clients</h1>
        <Button onClick={() => setShowAddModal(true)} size="sm">
          + Ajouter
        </Button>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Aucun client pour le moment. Ajoutez votre premier client !
        </p>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              programStatus={clientStats[client.id]?.status ?? null}
              completionPercent={clientStats[client.id]?.percent ?? 0}
            />
          ))}
        </div>
      )}

      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
```

- [ ] **Step 9: Lancer tous les tests**

```bash
npm test
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: tableau de bord coach avec gestion des clients"
```

---

### Task 5: Espace coach — Bibliothèque d'exercices avec upload vidéo

**Files:**
- Create: `src/app/coach/exercises/page.tsx`, `src/app/coach/exercises/actions.ts`
- Create: `src/components/coach/exercise-form.tsx`, `src/components/coach/exercise-card.tsx`
- Create: `src/components/ui/video-player.tsx`
- Test: `__tests__/components/coach/exercise-form.test.tsx`

**Interfaces:**
- Consumes: `createBrowserClient()`, `createServerClient()`, types `Exercise`, composants UI
- Produces:
  - Composant `<ExerciseForm onClose={() => void} exercise?: Exercise />` — formulaire ajout/édition exercice avec upload vidéo
  - Composant `<ExerciseCard exercise={Exercise} onEdit onDelete />` — carte exercice
  - Composant `<VideoPlayer url={string} />` — lecteur vidéo inline
  - Server Action `deleteExercise(id: string): Promise<{ error?: string }>` — supprime un exercice

- [ ] **Step 1: Écrire le test du formulaire d'exercice**

Créer `__tests__/components/coach/exercise-form.test.tsx` :

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExerciseForm } from '@/components/coach/exercise-form'

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: () => ({
    storage: { from: () => ({ upload: vi.fn() }) },
    from: () => ({ insert: vi.fn().mockReturnValue({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('ExerciseForm', () => {
  it('affiche les champs nom, catégorie, description et vidéo', () => {
    render(<ExerciseForm onClose={() => {}} />)
    expect(screen.getByLabelText(/nom/i)).toBeDefined()
    expect(screen.getByLabelText(/catégorie/i)).toBeDefined()
    expect(screen.getByLabelText(/description/i)).toBeDefined()
    expect(screen.getByLabelText(/vidéo/i)).toBeDefined()
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
npm test -- __tests__/components/coach/exercise-form.test.tsx
```

Résultat attendu : FAIL.

- [ ] **Step 3: Implémenter le VideoPlayer**

Créer `src/components/ui/video-player.tsx` :

```typescript
interface VideoPlayerProps {
  url: string
  className?: string
}

export function VideoPlayer({ url, className = '' }: VideoPlayerProps) {
  if (!url) return null

  return (
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      className={`rounded-lg w-full ${className}`}
    >
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  )
}
```

- [ ] **Step 4: Implémenter le formulaire d'exercice**

Créer `src/components/coach/exercise-form.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Exercise } from '@/lib/types'

const CATEGORIES = ['Haut du corps', 'Bas du corps', 'Cardio', 'Abdominaux', 'Étirements', 'Full body']

interface ExerciseFormProps {
  onClose: () => void
  exercise?: Exercise | null
}

export function ExerciseForm({ onClose, exercise }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name ?? '')
  const [category, setCategory] = useState(exercise?.category ?? CATEGORIES[0])
  const [description, setDescription] = useState(exercise?.description ?? '')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isEditing = !!exercise

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Non connecté'); setLoading(false); return }

    let videoUrl = exercise?.video_url ?? ''

    // Upload de la vidéo si un fichier est sélectionné
    if (videoFile) {
      const fileExt = videoFile.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('exercise-videos')
        .upload(filePath, videoFile)

      if (uploadError) {
        setError('Erreur lors de l\'upload de la vidéo')
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('exercise-videos')
        .getPublicUrl(filePath)

      videoUrl = urlData.publicUrl
    }

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ name, category, description, video_url: videoUrl })
        .eq('id', exercise.id)

      if (updateError) { setError('Erreur lors de la mise à jour'); setLoading(false); return }
    } else {
      if (!videoFile) { setError('Veuillez sélectionner une vidéo'); setLoading(false); return }

      const { error: insertError } = await supabase
        .from('exercises')
        .insert({ name, category, description, video_url: videoUrl, coach_id: user.id })

      if (insertError) { setError('Erreur lors de la création'); setLoading(false); return }
    }

    router.refresh()
    onClose()
  }

  return (
    <Modal title={isEditing ? 'Modifier l\'exercice' : 'Nouvel exercice'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Squat, Pompes..." />
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Consignes, points d'attention..."
          />
        </div>
        <div>
          <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
            Vidéo {isEditing && '(laisser vide pour garder l\'actuelle)'}
          </label>
          <input
            id="video"
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
        </Button>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 5: Implémenter la carte exercice**

Créer `src/components/coach/exercise-card.tsx` :

```typescript
'use client'

import { VideoPlayer } from '@/components/ui/video-player'
import { Button } from '@/components/ui/button'
import type { Exercise } from '@/lib/types'

interface ExerciseCardProps {
  exercise: Exercise
  onEdit: (exercise: Exercise) => void
  onDelete: (id: string) => void
}

export function ExerciseCard({ exercise, onEdit, onDelete }: ExerciseCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {exercise.video_url && (
        <VideoPlayer url={exercise.video_url} className="rounded-none" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{exercise.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              {exercise.category}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => onEdit(exercise)}>
              Modifier
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(exercise.id)}>
              Suppr.
            </Button>
          </div>
        </div>
        {exercise.description && (
          <p className="mt-2 text-sm text-gray-600">{exercise.description}</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Créer la Server Action de suppression**

Créer `src/app/coach/exercises/actions.ts` :

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteExercise(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('exercises').delete().eq('id', id)

  if (error) return { error: 'Erreur lors de la suppression' }

  revalidatePath('/coach/exercises')
  return {}
}
```

- [ ] **Step 7: Implémenter la page bibliothèque d'exercices**

Créer `src/app/coach/exercises/page.tsx` :

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { ExercisesPageClient } from './exercises-client'

export default async function ExercisesPage() {
  const supabase = await createServerClient()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('category')
    .order('name')

  return <ExercisesPageClient exercises={exercises ?? []} />
}
```

Créer `src/app/coach/exercises/exercises-client.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExerciseCard } from '@/components/coach/exercise-card'
import { ExerciseForm } from '@/components/coach/exercise-form'
import { deleteExercise } from './actions'
import type { Exercise } from '@/lib/types'

interface ExercisesPageClientProps {
  exercises: Exercise[]
}

export function ExercisesPageClient({ exercises }: ExercisesPageClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const router = useRouter()

  // Extraire les catégories uniques
  const categories = [...new Set(exercises.map((e) => e.category))].sort()

  const filtered = filterCategory === 'all'
    ? exercises
    : exercises.filter((e) => e.category === filterCategory)

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return
    await deleteExercise(id)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          + Ajouter
        </Button>
      </div>

      {/* Filtre par catégorie */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Aucun exercice. Ajoutez votre premier exercice !
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onEdit={(ex) => { setEditingExercise(ex); setShowForm(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ExerciseForm
          exercise={editingExercise}
          onClose={() => { setShowForm(false); setEditingExercise(null) }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 8: Vérifier que le test passe**

```bash
npm test
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: bibliothèque d'exercices avec upload vidéo"
```

---

### Task 6: Espace coach — Gestion des programmes

**Files:**
- Create: `src/app/coach/clients/[id]/program/page.tsx`, `src/app/coach/clients/[id]/program/actions.ts`, `src/app/coach/clients/[id]/program/program-client.tsx`
- Create: `src/components/coach/program-editor.tsx`, `src/components/coach/week-section.tsx`, `src/components/coach/session-editor.tsx`, `src/components/coach/exercise-picker.tsx`
- Create: `src/components/ui/progress-bar.tsx`
- Test: `__tests__/components/coach/program-editor.test.tsx`

**Interfaces:**
- Consumes: `createServerClient()`, `createBrowserClient()`, types `ProgramWithWeeks`, `Exercise`, `WeekWithSessions`, composants UI
- Produces:
  - Composant `<ProgramEditor program={ProgramWithWeeks} exercises={Exercise[]} />` — éditeur complet de programme
  - Server Actions : `createProgram`, `addWeek`, `deleteWeek`, `addSession`, `deleteSession`, `addExerciseToSession`, `removeExerciseFromSession`, `updateSessionExercise`
  - Composant `<ExercisePicker exercises={Exercise[]} onPick={(id) => void} />`
  - Composant `<ProgressBar percent={number} />`

- [ ] **Step 1: Créer le composant ProgressBar**

Créer `src/components/ui/progress-bar.tsx` :

```typescript
interface ProgressBarProps {
  percent: number
  className?: string
}

export function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full bg-gray-100 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Écrire le test du ProgramEditor**

Créer `__tests__/components/coach/program-editor.test.tsx` :

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgramEditor } from '@/components/coach/program-editor'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('ProgramEditor', () => {
  it('affiche un message si le programme n\'a pas de semaines', () => {
    const program = {
      id: '1', name: 'Programme Test', client_id: 'c1', coach_id: 'co1',
      status: 'active' as const, created_at: '', weeks: [],
      client: { id: 'c1', email: 'c@t.com', full_name: 'Client Test', role: 'client' as const, created_at: '' },
    }

    render(<ProgramEditor program={program} exercises={[]} />)
    expect(screen.getByText(/ajouter une semaine/i)).toBeDefined()
  })
})
```

- [ ] **Step 3: Vérifier que le test échoue**

```bash
npm test -- __tests__/components/coach/program-editor.test.tsx
```

Résultat attendu : FAIL.

- [ ] **Step 4: Créer les Server Actions pour la gestion du programme**

Créer `src/app/coach/clients/[id]/program/actions.ts` :

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProgram(clientId: string, name: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Désactiver les anciens programmes de ce client
  await supabase
    .from('programs')
    .update({ status: 'completed' })
    .eq('client_id', clientId)
    .eq('status', 'active')

  const { error } = await supabase
    .from('programs')
    .insert({ name, client_id: clientId, coach_id: user.id })

  if (error) return { error: 'Erreur lors de la création' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

export async function addWeek(programId: string, weekNumber: number, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').insert({ program_id: programId, week_number: weekNumber })
  if (error) return { error: 'Erreur lors de l\'ajout de la semaine' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

export async function deleteWeek(weekId: string, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('weeks').delete().eq('id', weekId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

export async function addSession(weekId: string, name: string, dayOfWeek: string, clientId: string) {
  const supabase = await createServerClient()

  // Récupérer le prochain order_index
  const { data: existing } = await supabase
    .from('sessions')
    .select('order_index')
    .eq('week_id', weekId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const { error } = await supabase
    .from('sessions')
    .insert({ week_id: weekId, name, day_of_week: dayOfWeek, order_index: nextIndex })

  if (error) return { error: 'Erreur lors de l\'ajout de la séance' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

export async function deleteSession(sessionId: string, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

export async function addExerciseToSession(
  sessionId: string,
  exerciseId: string,
  sets: number,
  reps: string,
  restSeconds: number,
  coachNotes: string,
  clientId: string
) {
  const supabase = await createServerClient()

  const { data: existing } = await supabase
    .from('session_exercises')
    .select('order_index')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1

  const { error } = await supabase.from('session_exercises').insert({
    session_id: sessionId,
    exercise_id: exerciseId,
    sets,
    reps,
    rest_seconds: restSeconds,
    coach_notes: coachNotes,
    order_index: nextIndex,
  })

  if (error) return { error: 'Erreur lors de l\'ajout' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

export async function removeExerciseFromSession(sessionExerciseId: string, clientId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').delete().eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la suppression' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}

export async function updateSessionExercise(
  sessionExerciseId: string,
  data: { sets?: number; reps?: string; rest_seconds?: number; coach_notes?: string },
  clientId: string
) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('session_exercises').update(data).eq('id', sessionExerciseId)
  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath(`/coach/clients/${clientId}/program`)
  return {}
}
```

- [ ] **Step 5: Implémenter l'ExercisePicker**

Créer `src/components/coach/exercise-picker.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Exercise } from '@/lib/types'

interface ExercisePickerProps {
  exercises: Exercise[]
  onPick: (exerciseId: string, sets: number, reps: string, restSeconds: number, coachNotes: string) => void
  onClose: () => void
}

export function ExercisePicker({ exercises, onPick, onClose }: ExercisePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState('10')
  const [restSeconds, setRestSeconds] = useState(60)
  const [coachNotes, setCoachNotes] = useState('')
  const [search, setSearch] = useState('')

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const selected = exercises.find((e) => e.id === selectedId)

  if (selected) {
    return (
      <Modal title={`Ajouter : ${selected.name}`} onClose={onClose}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Séries" id="sets" type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} min={1} />
            <Input label="Répétitions" id="reps" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10 ou 8-12" />
            <Input label="Repos (sec)" id="rest" type="number" value={restSeconds} onChange={(e) => setRestSeconds(Number(e.target.value))} min={0} step={15} />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes du coach</label>
            <textarea
              id="notes"
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Garde le dos droit, contrôle la descente..."
            />
          </div>
          <Button className="w-full" onClick={() => { onPick(selected.id, sets, reps, restSeconds, coachNotes); onClose() }}>
            Ajouter à la séance
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Choisir un exercice" onClose={onClose}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un exercice..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filtered.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => setSelectedId(exercise.id)}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <p className="font-medium text-gray-900">{exercise.name}</p>
            <span className="text-xs text-blue-600">{exercise.category}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-4">Aucun exercice trouvé</p>
        )}
      </div>
    </Modal>
  )
}
```

- [ ] **Step 6: Implémenter le SessionEditor**

Créer `src/components/coach/session-editor.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ExercisePicker } from '@/components/coach/exercise-picker'
import { deleteSession, addExerciseToSession, removeExerciseFromSession } from '@/app/coach/clients/[id]/program/actions'
import type { SessionWithExercises, Exercise } from '@/lib/types'

interface SessionEditorProps {
  session: SessionWithExercises
  exercises: Exercise[]
  clientId: string
}

export function SessionEditor({ session, exercises, clientId }: SessionEditorProps) {
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()

  async function handleAddExercise(exerciseId: string, sets: number, reps: string, restSeconds: number, coachNotes: string) {
    await addExerciseToSession(session.id, exerciseId, sets, reps, restSeconds, coachNotes, clientId)
    router.refresh()
  }

  async function handleRemoveExercise(sessionExerciseId: string) {
    await removeExerciseFromSession(sessionExerciseId, clientId)
    router.refresh()
  }

  async function handleDeleteSession() {
    if (!confirm(`Supprimer la séance "${session.name}" ?`)) return
    await deleteSession(session.id, clientId)
    router.refresh()
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium text-gray-900">{session.name}</span>
          {session.day_of_week && (
            <span className="ml-2 text-xs text-gray-500">{session.day_of_week}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowPicker(true)}>+ Exercice</Button>
          <Button size="sm" variant="danger" onClick={handleDeleteSession}>Suppr.</Button>
        </div>
      </div>

      {session.session_exercises.length > 0 ? (
        <div className="space-y-2">
          {session.session_exercises
            .sort((a, b) => a.order_index - b.order_index)
            .map((se) => (
              <div key={se.id} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{se.exercise.name}</p>
                  <p className="text-xs text-gray-500">
                    {se.sets}x{se.reps} • repos {se.rest_seconds}s
                    {se.coach_notes && ` • ${se.coach_notes}`}
                  </p>
                </div>
                <button onClick={() => handleRemoveExercise(se.id)} className="text-red-400 hover:text-red-600 text-sm">
                  ✕
                </button>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Aucun exercice dans cette séance</p>
      )}

      {showPicker && (
        <ExercisePicker
          exercises={exercises}
          onPick={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 7: Implémenter le WeekSection**

Créer `src/components/coach/week-section.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SessionEditor } from '@/components/coach/session-editor'
import { deleteWeek, addSession } from '@/app/coach/clients/[id]/program/actions'
import type { WeekWithSessions, Exercise } from '@/lib/types'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

interface WeekSectionProps {
  week: WeekWithSessions
  exercises: Exercise[]
  clientId: string
}

export function WeekSection({ week, exercises, clientId }: WeekSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [showAddSession, setShowAddSession] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [sessionDay, setSessionDay] = useState(DAYS[0])
  const router = useRouter()

  async function handleAddSession() {
    if (!sessionName.trim()) return
    await addSession(week.id, sessionName, sessionDay, clientId)
    setSessionName('')
    setShowAddSession(false)
    router.refresh()
  }

  async function handleDeleteWeek() {
    if (!confirm(`Supprimer la semaine ${week.week_number} et toutes ses séances ?`)) return
    await deleteWeek(week.id, clientId)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
      >
        <h3 className="font-bold text-gray-900">Semaine {week.week_number}</h3>
        <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {week.sessions
            .sort((a, b) => a.order_index - b.order_index)
            .map((session) => (
              <SessionEditor
                key={session.id}
                session={session}
                exercises={exercises}
                clientId={clientId}
              />
            ))}

          {showAddSession ? (
            <div className="flex gap-2 items-end">
              <input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Nom de la séance"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <select
                value={sessionDay}
                onChange={(e) => setSessionDay(e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <Button size="sm" onClick={handleAddSession}>OK</Button>
              <Button size="sm" variant="secondary" onClick={() => setShowAddSession(false)}>Annuler</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowAddSession(true)}>+ Séance</Button>
              <Button size="sm" variant="danger" onClick={handleDeleteWeek}>Suppr. semaine</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Implémenter le ProgramEditor**

Créer `src/components/coach/program-editor.tsx` :

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WeekSection } from '@/components/coach/week-section'
import { addWeek } from '@/app/coach/clients/[id]/program/actions'
import type { ProgramWithWeeks, Exercise } from '@/lib/types'

interface ProgramEditorProps {
  program: ProgramWithWeeks
  exercises: Exercise[]
}

export function ProgramEditor({ program, exercises }: ProgramEditorProps) {
  const router = useRouter()

  async function handleAddWeek() {
    const nextNumber = program.weeks.length > 0
      ? Math.max(...program.weeks.map((w) => w.week_number)) + 1
      : 1
    await addWeek(program.id, nextNumber, program.client_id)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">{program.name}</h2>
        <p className="text-sm text-gray-500">Programme de {program.client.full_name}</p>
      </div>

      <div className="space-y-4">
        {program.weeks
          .sort((a, b) => a.week_number - b.week_number)
          .map((week) => (
            <WeekSection
              key={week.id}
              week={week}
              exercises={exercises}
              clientId={program.client_id}
            />
          ))}
      </div>

      <Button onClick={handleAddWeek} variant="secondary" className="w-full mt-4">
        + Ajouter une semaine
      </Button>
    </div>
  )
}
```

- [ ] **Step 9: Implémenter la page programme du client**

Créer `src/app/coach/clients/[id]/program/page.tsx` :

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgramPageClient } from './program-client'

export default async function ClientProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params
  const supabase = await createServerClient()

  // Récupérer le profil du client
  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) redirect('/coach')

  // Récupérer le programme actif avec toutes les relations
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      client:profiles!client_id(*),
      weeks(
        *,
        sessions(
          *,
          session_exercises(
            *,
            exercise:exercises(*)
          )
        )
      )
    `)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  // Récupérer tous les exercices (pour le picker)
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('name')

  return (
    <ProgramPageClient
      client={client}
      program={program}
      exercises={exercises ?? []}
    />
  )
}
```

Créer `src/app/coach/clients/[id]/program/program-client.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProgramEditor } from '@/components/coach/program-editor'
import { createProgram } from './actions'
import type { Profile, Exercise, ProgramWithWeeks } from '@/lib/types'

interface ProgramPageClientProps {
  client: Profile
  program: ProgramWithWeeks | null
  exercises: Exercise[]
}

export function ProgramPageClient({ client, program, exercises }: ProgramPageClientProps) {
  const [showCreate, setShowCreate] = useState(false)
  const [programName, setProgramName] = useState('')
  const router = useRouter()

  async function handleCreate() {
    if (!programName.trim()) return
    await createProgram(client.id, programName)
    setProgramName('')
    setShowCreate(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.full_name}</h1>
          <p className="text-sm text-gray-500">{client.email}</p>
        </div>
      </div>

      {program ? (
        <ProgramEditor program={program} exercises={exercises} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Aucun programme actif pour ce client.</p>
          {showCreate ? (
            <div className="max-w-sm mx-auto space-y-3">
              <Input
                label="Nom du programme"
                id="program-name"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="Ex: Remise en forme - Septembre"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">Créer</Button>
                <Button variant="secondary" onClick={() => setShowCreate(false)}>Annuler</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowCreate(true)}>Créer un programme</Button>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 10: Vérifier que les tests passent**

```bash
npm test
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: gestion des programmes (semaines, séances, exercices)"
```

---

### Task 7: Espace client — Consultation du programme et séances

**Files:**
- Modify: `src/app/client/page.tsx`
- Create: `src/app/client/session/[id]/page.tsx`
- Create: `src/components/client/week-navigator.tsx`, `src/components/client/session-card.tsx`, `src/components/client/exercise-item.tsx`, `src/components/client/feedback-input.tsx`
- Test: `__tests__/components/client/exercise-item.test.tsx`

**Interfaces:**
- Consumes: `createServerClient()`, `createBrowserClient()`, types `ProgramWithWeeks`, `SessionExerciseWithDetails`, composants UI (`VideoPlayer`, `ProgressBar`)
- Produces:
  - Composant `<WeekNavigator weeks={Week[]} currentWeek={number} onChange={(n) => void} />`
  - Composant `<SessionCard session={Session} completedCount={number} totalCount={number} />`
  - Composant `<ExerciseItem sessionExercise={SessionExerciseWithDetails} clientId={string} />`
  - Composant `<FeedbackInput value={string} onChange={(v) => void} onSubmit={() => void} />`
  - Server Action `toggleExercise(sessionExerciseId, clientId, completed)`, `submitFeedback(sessionExerciseId, clientId, feedback)`

- [ ] **Step 1: Écrire le test du ExerciseItem**

Créer `__tests__/components/client/exercise-item.test.tsx` :

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExerciseItem } from '@/components/client/exercise-item'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

describe('ExerciseItem', () => {
  const sessionExercise = {
    id: 'se1',
    session_id: 's1',
    exercise_id: 'e1',
    sets: 4,
    reps: '12',
    rest_seconds: 60,
    coach_notes: 'Garde le dos droit',
    order_index: 0,
    exercise: {
      id: 'e1', name: 'Squat', description: 'Flexion de jambes',
      video_url: 'https://example.com/video.mp4', category: 'Bas du corps',
      coach_id: 'c1', created_at: '',
    },
    exercise_log: null,
  }

  it('affiche le nom de l\'exercice et les détails', () => {
    render(<ExerciseItem sessionExercise={sessionExercise} clientId="client1" />)
    expect(screen.getByText('Squat')).toBeDefined()
    expect(screen.getByText(/4x12/)).toBeDefined()
    expect(screen.getByText(/60s/)).toBeDefined()
    expect(screen.getByText(/Garde le dos droit/)).toBeDefined()
  })
})
```

- [ ] **Step 2: Vérifier que le test échoue**

```bash
npm test -- __tests__/components/client/exercise-item.test.tsx
```

Résultat attendu : FAIL.

- [ ] **Step 3: Créer les Server Actions client**

Créer `src/app/client/actions.ts` :

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleExercise(sessionExerciseId: string, clientId: string, completed: boolean) {
  const supabase = await createServerClient()

  // Vérifier que c'est bien le bon client
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== clientId) return { error: 'Non autorisé' }

  // Upsert le log (créer ou mettre à jour)
  const { error } = await supabase
    .from('exercise_logs')
    .upsert(
      {
        session_exercise_id: sessionExerciseId,
        client_id: clientId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'session_exercise_id,client_id' }
    )

  if (error) return { error: 'Erreur lors de la mise à jour' }
  revalidatePath('/client')
  return {}
}

export async function submitFeedback(sessionExerciseId: string, clientId: string, feedback: string) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== clientId) return { error: 'Non autorisé' }

  const { error } = await supabase
    .from('exercise_logs')
    .upsert(
      {
        session_exercise_id: sessionExerciseId,
        client_id: clientId,
        feedback,
      },
      { onConflict: 'session_exercise_id,client_id' }
    )

  if (error) return { error: 'Erreur lors de l\'envoi' }
  revalidatePath('/client')
  return {}
}
```

- [ ] **Step 4: Implémenter le FeedbackInput**

Créer `src/components/client/feedback-input.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FeedbackInputProps {
  initialValue: string
  onSubmit: (feedback: string) => void
}

export function FeedbackInput({ initialValue, onSubmit }: FeedbackInputProps) {
  const [value, setValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)

  if (!editing && !value) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        + Laisser un commentaire
      </button>
    )
  }

  if (!editing && value) {
    return (
      <button onClick={() => setEditing(true)} className="text-sm text-gray-600 italic">
        &quot;{value}&quot; <span className="text-blue-600 ml-1">modifier</span>
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Trop facile, douleur au genou..."
        className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm"
        autoFocus
      />
      <Button
        size="sm"
        onClick={() => { onSubmit(value); setEditing(false) }}
      >
        OK
      </Button>
    </div>
  )
}
```

- [ ] **Step 5: Implémenter le ExerciseItem**

Créer `src/components/client/exercise-item.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VideoPlayer } from '@/components/ui/video-player'
import { FeedbackInput } from '@/components/client/feedback-input'
import { toggleExercise, submitFeedback } from '@/app/client/actions'
import type { SessionExerciseWithDetails } from '@/lib/types'

interface ExerciseItemProps {
  sessionExercise: SessionExerciseWithDetails
  clientId: string
}

export function ExerciseItem({ sessionExercise, clientId }: ExerciseItemProps) {
  const [showVideo, setShowVideo] = useState(false)
  const router = useRouter()
  const { exercise, exercise_log } = sessionExercise
  const isCompleted = exercise_log?.completed ?? false

  async function handleToggle() {
    await toggleExercise(sessionExercise.id, clientId, !isCompleted)
    router.refresh()
  }

  async function handleFeedback(feedback: string) {
    await submitFeedback(sessionExercise.id, clientId, feedback)
    router.refresh()
  }

  return (
    <div className={`bg-white rounded-xl border p-4 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isCompleted
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {isCompleted && '✓'}
        </button>

        <div className="flex-1">
          {/* Nom et détails */}
          <h3 className={`font-medium ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
            {exercise.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {sessionExercise.sets}x{sessionExercise.reps} • repos {sessionExercise.rest_seconds}s
          </p>

          {/* Notes du coach */}
          {sessionExercise.coach_notes && (
            <p className="text-sm text-blue-600 mt-1">
              💡 {sessionExercise.coach_notes}
            </p>
          )}

          {/* Bouton vidéo */}
          {exercise.video_url && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2"
            >
              {showVideo ? 'Masquer la vidéo' : '▶ Voir la vidéo'}
            </button>
          )}

          {/* Vidéo */}
          {showVideo && exercise.video_url && (
            <div className="mt-2">
              <VideoPlayer url={exercise.video_url} />
            </div>
          )}

          {/* Feedback */}
          <div className="mt-2">
            <FeedbackInput
              initialValue={exercise_log?.feedback ?? ''}
              onSubmit={handleFeedback}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Vérifier que le test passe**

```bash
npm test -- __tests__/components/client/exercise-item.test.tsx
```

Résultat attendu : PASS.

- [ ] **Step 7: Implémenter le WeekNavigator**

Créer `src/components/client/week-navigator.tsx` :

```typescript
'use client'

interface WeekNavigatorProps {
  totalWeeks: number
  currentWeek: number
  onChange: (week: number) => void
}

export function WeekNavigator({ totalWeeks, currentWeek, onChange }: WeekNavigatorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
        <button
          key={week}
          onClick={() => onChange(week)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            currentWeek === week
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Sem. {week}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 8: Implémenter le SessionCard**

Créer `src/components/client/session-card.tsx` :

```typescript
import Link from 'next/link'
import { ProgressBar } from '@/components/ui/progress-bar'

interface SessionCardProps {
  sessionId: string
  name: string
  dayOfWeek: string
  completedCount: number
  totalCount: number
}

export function SessionCard({ sessionId, name, dayOfWeek, completedCount, totalCount }: SessionCardProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Link
      href={`/client/session/${sessionId}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{name}</h3>
          {dayOfWeek && <p className="text-sm text-gray-500">{dayOfWeek}</p>}
        </div>
        <span className="text-sm font-medium text-gray-500">
          {completedCount}/{totalCount}
        </span>
      </div>
      <ProgressBar percent={percent} />
    </Link>
  )
}
```

- [ ] **Step 9: Implémenter la page programme client**

Modifier `src/app/client/page.tsx` :

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { ClientProgramView } from './program-view'

export default async function ClientProgramPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Récupérer le programme actif avec toutes les relations
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      weeks(
        *,
        sessions(
          *,
          session_exercises(
            *,
            exercise:exercises(*),
            exercise_log:exercise_logs(*)
          )
        )
      )
    `)
    .eq('client_id', user.id)
    .eq('status', 'active')
    .single()

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun programme pour le moment.</p>
        <p className="text-sm text-gray-400 mt-2">Ton coach te préparera bientôt un programme !</p>
      </div>
    )
  }

  return <ClientProgramView program={program} />
}
```

Créer `src/app/client/program-view.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { WeekNavigator } from '@/components/client/week-navigator'
import { SessionCard } from '@/components/client/session-card'
import type { ProgramWithWeeks } from '@/lib/types'

interface ClientProgramViewProps {
  program: ProgramWithWeeks
}

export function ClientProgramView({ program }: ClientProgramViewProps) {
  const sortedWeeks = [...program.weeks].sort((a, b) => a.week_number - b.week_number)
  const [currentWeekNum, setCurrentWeekNum] = useState(sortedWeeks[0]?.week_number ?? 1)

  const currentWeek = sortedWeeks.find((w) => w.week_number === currentWeekNum)

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">{program.name}</h1>

      <WeekNavigator
        totalWeeks={sortedWeeks.length}
        currentWeek={currentWeekNum}
        onChange={setCurrentWeekNum}
      />

      <div className="mt-4 space-y-3">
        {currentWeek?.sessions
          .sort((a, b) => a.order_index - b.order_index)
          .map((session) => {
            const total = session.session_exercises.length
            const completed = session.session_exercises.filter(
              (se) => {
                const logs = (se as any).exercise_log
                // exercise_log peut être un tableau (relation 1:N) ou un objet
                if (Array.isArray(logs)) return logs.some((l: any) => l.completed)
                return logs?.completed ?? false
              }
            ).length

            return (
              <SessionCard
                key={session.id}
                sessionId={session.id}
                name={session.name}
                dayOfWeek={session.day_of_week}
                completedCount={completed}
                totalCount={total}
              />
            )
          })}

        {(!currentWeek || currentWeek.sessions.length === 0) && (
          <p className="text-gray-500 text-center py-8">Pas de séance cette semaine.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 10: Implémenter la page détail séance**

Créer `src/app/client/session/[id]/page.tsx` :

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExerciseItem } from '@/components/client/exercise-item'
import { ProgressBar } from '@/components/ui/progress-bar'
import Link from 'next/link'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupérer la séance avec ses exercices et les logs du client
  const { data: session } = await supabase
    .from('sessions')
    .select(`
      *,
      session_exercises(
        *,
        exercise:exercises(*),
        exercise_log:exercise_logs(client_id)
      )
    `)
    .eq('id', sessionId)
    .single()

  if (!session) redirect('/client')

  // Filtrer les logs pour ne garder que ceux du client connecté
  const exercises = session.session_exercises
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((se: any) => ({
      ...se,
      exercise_log: Array.isArray(se.exercise_log)
        ? se.exercise_log.find((l: any) => l.client_id === user.id) ?? null
        : se.exercise_log,
    }))

  const total = exercises.length
  const completed = exercises.filter((e: any) => e.exercise_log?.completed).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div>
      <Link href="/client" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Retour
      </Link>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
        {session.day_of_week && (
          <p className="text-sm text-gray-500">{session.day_of_week}</p>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <ProgressBar percent={percent} className="flex-1" />
        <span className="text-sm font-medium text-gray-500">{completed}/{total}</span>
      </div>

      <div className="space-y-3">
        {exercises.map((se: any) => (
          <ExerciseItem
            key={se.id}
            sessionExercise={se}
            clientId={user.id}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 11: Lancer tous les tests**

```bash
npm test
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: espace client - consultation programme, séances, exercices avec suivi"
```

---

### Task 8: Espace coach — Suivi client (tracking)

**Files:**
- Create: `src/app/coach/clients/[id]/tracking/page.tsx`
- Create: `src/components/coach/tracking-view.tsx`

**Interfaces:**
- Consumes: `createServerClient()`, types `ProgramWithWeeks`
- Produces:
  - Page `/coach/clients/[id]/tracking` — vue des feedbacks et progression du client

- [ ] **Step 1: Implémenter la vue de suivi**

Créer `src/components/coach/tracking-view.tsx` :

```typescript
import type { WeekWithSessions } from '@/lib/types'

interface TrackingViewProps {
  weeks: WeekWithSessions[]
  clientName: string
}

export function TrackingView({ weeks, clientName }: TrackingViewProps) {
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number)

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Suivi de {clientName}</h2>

      {sortedWeeks.map((week) => (
        <div key={week.id} className="mb-6">
          <h3 className="font-bold text-gray-700 mb-2">Semaine {week.week_number}</h3>

          {week.sessions
            .sort((a, b) => a.order_index - b.order_index)
            .map((session) => (
              <div key={session.id} className="mb-4 bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {session.name}
                  {session.day_of_week && <span className="text-gray-400 ml-2 text-sm">{session.day_of_week}</span>}
                </h4>

                <div className="space-y-2">
                  {session.session_exercises
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((se) => {
                      const log = se.exercise_log
                      return (
                        <div
                          key={se.id}
                          className={`flex items-start justify-between p-2 rounded-lg ${
                            log?.completed ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-0.5 ${log?.completed ? 'text-green-500' : 'text-gray-300'}`}>
                              {log?.completed ? '✓' : '○'}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{se.exercise.name}</p>
                              <p className="text-xs text-gray-500">
                                {se.sets}x{se.reps} • repos {se.rest_seconds}s
                              </p>
                              {log?.feedback && (
                                <p className="text-sm text-blue-600 mt-1 italic">
                                  &quot;{log.feedback}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                          {log?.completed_at && (
                            <span className="text-xs text-gray-400">
                              {new Date(log.completed_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
        </div>
      ))}

      {sortedWeeks.length === 0 && (
        <p className="text-gray-500 text-center py-8">Aucun programme actif pour ce client.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Implémenter la page de suivi**

Créer `src/app/coach/clients/[id]/tracking/page.tsx` :

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrackingView } from '@/components/coach/tracking-view'
import Link from 'next/link'

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clientId } = await params
  const supabase = await createServerClient()

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) redirect('/coach')

  // Récupérer le programme actif avec logs
  const { data: program } = await supabase
    .from('programs')
    .select(`
      *,
      weeks(
        *,
        sessions(
          *,
          session_exercises(
            *,
            exercise:exercises(*),
            exercise_log:exercise_logs(*)
          )
        )
      )
    `)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  // Reformater les logs pour ne garder que ceux du client
  const weeks = program?.weeks.map((week: any) => ({
    ...week,
    sessions: week.sessions.map((session: any) => ({
      ...session,
      session_exercises: session.session_exercises.map((se: any) => ({
        ...se,
        exercise_log: Array.isArray(se.exercise_log)
          ? se.exercise_log.find((l: any) => l.client_id === clientId) ?? null
          : se.exercise_log,
      })),
    })),
  })) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href={`/coach/clients/${clientId}/program`} className="text-sm text-blue-600">
          ← Programme
        </Link>
        <Link href="/coach" className="text-sm text-blue-600">
          Tableau de bord →
        </Link>
      </div>
      <TrackingView weeks={weeks} clientName={client.full_name} />
    </div>
  )
}
```

- [ ] **Step 3: Ajouter un lien vers le suivi dans le layout coach**

Mettre à jour la navigation du `ClientCard` pour inclure un lien tracking. Modifier `src/components/coach/client-card.tsx` pour ajouter un second lien :

Dans le composant, ajouter sous le lien existant :

```typescript
// Ajouter dans le JSX, après la barre de progression :
{programStatus && (
  <Link
    href={`/coach/clients/${client.id}/tracking`}
    className="text-xs text-blue-600 mt-2 inline-block"
    onClick={(e) => e.stopPropagation()}
  >
    Voir le suivi →
  </Link>
)}
```

- [ ] **Step 4: Lancer tous les tests**

```bash
npm test
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: suivi client - vue des feedbacks et progression pour le coach"
```

---

### Task 9: Bouton de déconnexion et finalisation

**Files:**
- Modify: `src/app/coach/layout.tsx`, `src/app/client/layout.tsx`
- Create: `src/components/auth/logout-button.tsx`

**Interfaces:**
- Consumes: `createBrowserClient()`
- Produces: Composant `<LogoutButton />`

- [ ] **Step 1: Créer le bouton de déconnexion**

Créer `src/components/auth/logout-button.tsx` :

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-400 hover:text-gray-600"
    >
      Déconnexion
    </button>
  )
}
```

- [ ] **Step 2: Ajouter le bouton dans les layouts**

Dans `src/app/coach/layout.tsx`, ajouter l'import et le composant dans la nav :

```typescript
import { LogoutButton } from '@/components/auth/logout-button'
// ... dans la nav, après les liens :
<LogoutButton />
```

Dans `src/app/client/layout.tsx`, ajouter pareil dans la nav.

- [ ] **Step 3: Lancer tous les tests**

```bash
npm test
```

Résultat attendu : tous les tests PASS.

- [ ] **Step 4: Tester manuellement l'application**

```bash
npm run dev
```

Vérifications :
1. Aller sur `http://localhost:3000` → redirige vers `/login`
2. Se connecter en tant que coach → arrive sur le tableau de bord
3. Ajouter un client → le client apparaît dans la liste
4. Ajouter un exercice avec vidéo → l'exercice apparaît dans la bibliothèque
5. Créer un programme pour un client → ajouter semaines, séances, exercices
6. Se déconnecter → se reconnecter en tant que client
7. Voir son programme → naviguer entre les semaines → ouvrir une séance
8. Cocher un exercice → laisser un feedback
9. Se reconnecter en tant que coach → voir le suivi du client

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "feat: déconnexion + finalisation MVP Coach JB"
```
