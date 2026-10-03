# KTRY

Application SaaS de coaching sportif multi-disciplines. Les coachs creent des programmes d'entrainement personnalises, leurs clients les suivent depuis leur telephone avec videos et chronometre integres.

## Fonctionnalites

### Landing & Inscription
- **Landing page** — Presentation, pricing (Gratuit / Pro 24e/mois), CTA
- **Inscription coach** — Signup avec creation de compte automatique
- **Freemium** — 3 clients gratuits, clients illimites en Pro
- **Stripe** — Paiement abonnement, checkout, webhook, portail client

### Espace Coach
- **Exercices** — Bibliotheque de demarrage (25 exercices) + exercices personnels avec videos
- **Programmes** — Blocs reutilisables d'exercices (TRX, Renforcement, Cardio...)
- **Clients** — Gestion des fiches clients avec invitation par email
- **Plans** — Plans d'entrainement par semaines et seances, avec programmes assignes
- **Dashboard** — Suivi des clients actifs/inactifs, feedbacks recents
- **Guide** — Mode d'emploi integre

### Espace Client
- **Mon plan** — Visualisation des seances de la semaine avec progression
- **Mode entrainement** — Plein ecran, video en boucle, chronometre integre
- **Mon parcours** — Historique des programmes termines

### PWA
- Application installable sur mobile (manifest, icones, standalone mode)

## Stack technique

- **Frontend** — Next.js (App Router), TypeScript, Tailwind CSS
- **Backend** — Supabase (PostgreSQL, Auth, Storage, RLS)
- **Paiement** — Stripe (Checkout, Webhooks, Customer Portal)
- **Hebergement** — Vercel
- **Typo** — Bricolage Grotesque (headings), DM Sans (body)

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
| `STRIPE_SECRET_KEY` | Cle secrete Stripe (sk_test_ ou sk_live_) |
| `STRIPE_PRICE_ID` | ID du prix Stripe pour l'abonnement Pro |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe |

## Base de donnees

Les migrations SQL sont dans `supabase/migrations/`. Les appliquer dans l'ordre via l'editeur SQL de Supabase.

## Categories d'exercices

Renforcement, Haut du corps, Bas du corps, Core, Full body, Cardio, Mobilite, TRX, Swissball, Running, Velo, Elastiques, Poids du corps, Autre

## Licence

Projet prive.
