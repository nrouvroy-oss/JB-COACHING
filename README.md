# JB COACHING

Application web de coaching sportif permettant aux coachs de creer des programmes d'entrainement personnalises pour leurs clients.

## Fonctionnalites

### Espace Coach
- **Exercices** — Bibliotheque d'exercices avec videos, images ou PDF
- **Programmes** — Blocs reutilisables d'exercices (Muscu 3, TRX, Velo...)
- **Clients** — Gestion des fiches clients avec invitation par email
- **Plannings** — Plans d'entrainement par semaines et seances, avec programmes assignes
- **Dashboard** — Suivi des clients actifs/inactifs, feedbacks recents
- **Guide** — Mode d'emploi integre

### Espace Client
- **Programme** — Visualisation des seances de la semaine avec progression
- **Mode entrainement** — Plein ecran, video en boucle, chronometre integre
- **Mon parcours** — Historique des programmes termines

## Stack technique

- **Frontend** — Next.js (App Router), TypeScript, Tailwind CSS
- **Backend** — Supabase (PostgreSQL, Auth, Storage, RLS)
- **Hebergement** — Vercel

## Installation

```bash
git clone https://github.com/nrouvroy-oss/JB-COACHING.git
cd JB-COACHING
npm install
cp .env.local.example .env.local
# Remplir les variables dans .env.local
npm run dev
```

## Variables d'environnement

Copier `.env.local.example` en `.env.local` et remplir :

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service role (serveur uniquement) |
| `NEXT_PUBLIC_APP_URL` | URL de l'app (pour les emails d'invitation) |

## Base de donnees

Les migrations SQL sont dans `supabase/migrations/`. Les appliquer dans l'ordre via l'editeur SQL de Supabase.

## Licence

Projet prive.
