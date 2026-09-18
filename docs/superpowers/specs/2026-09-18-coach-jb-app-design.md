# App Coach JB — Spécifications

## Résumé

Web app mobile-first permettant à un coach sportif (JB) de créer des programmes d'exercices personnalisés pour ses clients (~20 max), avec vidéos explicatives. Chaque client se connecte avec ses identifiants pour consulter son programme, cocher les exercices faits et laisser un feedback.

## Stack technique

| Service | Rôle | Coût |
|---------|------|------|
| **Next.js** (App Router) | Frontend + API | Gratuit |
| **Vercel** | Hébergement | Gratuit |
| **Supabase** | Base de données (PostgreSQL), authentification, stockage vidéos | Gratuit (1 Go stockage) |
| **Tailwind CSS** | Style / UI | Gratuit |

## Modèle de données

### Table `profiles`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK, = auth.users.id) | Identifiant unique |
| email | text | Email de connexion |
| full_name | text | Nom complet |
| role | enum: coach / client | Rôle dans l'app |
| created_at | timestamp | Date de création |

### Table `exercises`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| name | text | Nom de l'exercice |
| description | text | Description / consignes |
| video_url | text | URL de la vidéo (Supabase Storage) |
| category | text | Catégorie (haut du corps, bas du corps, cardio, etc.) |
| coach_id | uuid (FK → profiles) | Coach propriétaire |
| created_at | timestamp | Date de création |

### Table `programs`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| name | text | Nom du programme |
| client_id | uuid (FK → profiles) | Client assigné |
| coach_id | uuid (FK → profiles) | Coach créateur |
| status | enum: active / completed | Statut du programme |
| created_at | timestamp | Date de création |

### Table `weeks`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| program_id | uuid (FK → programs) | Programme parent |
| week_number | integer | Numéro de la semaine |

### Table `sessions`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| week_id | uuid (FK → weeks) | Semaine parente |
| name | text | Nom de la séance (ex : "Haut du corps") |
| day_of_week | text | Jour prévu (lundi, mardi…) |
| order_index | integer | Ordre d'affichage |

### Table `session_exercises`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| session_id | uuid (FK → sessions) | Séance parente |
| exercise_id | uuid (FK → exercises) | Exercice de la bibliothèque |
| sets | integer | Nombre de séries |
| reps | text | Nombre de répétitions (text pour gérer "8-12" ou "30 sec") |
| rest_seconds | integer | Temps de repos en secondes |
| coach_notes | text | Notes / conseils du coach |
| order_index | integer | Ordre dans la séance |

### Table `exercise_logs`
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | Identifiant unique |
| session_exercise_id | uuid (FK → session_exercises) | Exercice de séance concerné |
| client_id | uuid (FK → profiles) | Client qui a fait l'exercice |
| completed | boolean | Exercice fait ou non |
| feedback | text | Commentaire du client |
| completed_at | timestamp | Date de complétion |

### Relations

```
profiles (coach) ──1:N──> exercises
profiles (coach) ──1:N──> programs
profiles (client) ──1:1──> programs (un programme actif par client)
programs ──1:N──> weeks
weeks ──1:N──> sessions
sessions ──1:N──> session_exercises
session_exercises ──N:1──> exercises
session_exercises ──1:N──> exercise_logs
profiles (client) ──1:N──> exercise_logs
```

## Écrans

### Côté Coach

**1. Tableau de bord (`/coach`)**
- Liste des clients avec statut de leur programme
- Indicateur visuel : pourcentage d'exercices complétés par client
- Bouton "Ajouter un client"

**2. Bibliothèque d'exercices (`/coach/exercises`)**
- Liste des exercices avec miniature vidéo et catégorie
- Filtre par catégorie
- Bouton "Ajouter un exercice" → formulaire avec upload vidéo
- Édition / suppression d'un exercice

**3. Gestion programme client (`/coach/clients/[id]/program`)**
- Vue du programme : semaines en accordéon → séances → exercices
- Ajouter/supprimer des semaines
- Ajouter/supprimer des séances dans une semaine
- Ajouter des exercices dans une séance (pioche dans la bibliothèque) avec séries, reps, repos, notes
- Réordonner les exercices par drag & drop

**4. Suivi client (`/coach/clients/[id]/tracking`)**
- Vue des feedbacks du client, séance par séance
- Exercices cochés / non cochés avec date
- Commentaires du client

### Côté Client

**1. Page de connexion (`/login`)**
- Email + mot de passe
- Redirige vers `/client` si client, `/coach` si coach

**2. Mon programme (`/client`)**
- Semaine en cours mise en avant
- Navigation entre les semaines
- Liste des séances de la semaine

**3. Détail séance (`/client/session/[id]`)**
- Liste des exercices avec : nom, vidéo (lecture inline), séries, reps, repos, notes du coach
- Bouton "Fait ✓" par exercice
- Champ feedback par exercice
- Barre de progression de la séance

## Authentification & sécurité

- **Supabase Auth** gère les comptes (email + mot de passe)
- JB crée les comptes clients depuis son espace → Supabase envoie un email d'invitation
- **Row Level Security (RLS)** sur Supabase :
  - Un client ne voit que ses propres données (programme, logs)
  - Le coach voit toutes les données
  - Les vidéos sont dans un bucket privé, accessibles uniquement aux utilisateurs connectés
- Pas d'inscription publique — seul le coach peut créer des comptes

## Gestion des vidéos

- Upload depuis le téléphone du coach directement dans l'app
- Stockage sur **Supabase Storage** (bucket privé `exercise-videos`)
- Compression côté client avant upload (via la librairie browser-image-compression ou ffmpeg.wasm pour la vidéo) pour rester dans les limites du plan gratuit
- Formats acceptés : MP4, MOV
- Taille max recommandée : 20 Mo par vidéo (après compression)
- Lecture en streaming via le player HTML5 natif

## Limites du MVP

Ce qu'on ne fait **PAS** dans cette première version :
- Pas de messagerie coach-client (le feedback par exercice suffit)
- Pas de statistiques avancées (graphiques de progression, etc.)
- Pas de génération de vidéos par IA (à explorer en V2)
- Pas de notifications push
- Pas de mode hors-ligne
- Pas de paiement / facturation intégré
- Pas de duplication de programmes entre clients (copier un programme type)

## Évolutions futures possibles (V2+)

- Transformation en app mobile (React Native ou PWA installable)
- Génération de vidéos d'exercices par IA
- Duplication / templates de programmes
- Statistiques et graphiques de progression
- Notifications push (rappel de séance)
- Messagerie coach-client
