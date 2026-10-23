// Page guide coach — explique comment utiliser l'app étape par étape
export default function GuidePage() {
  const steps = [
    {
      number: '1',
      title: 'Complète ton profil',
      description: 'Clique sur l\'icône profil en haut à droite. Renseigne ton prénom, nom et téléphone. C\'est ce que tes clients verront.',
      tip: 'Un profil complet inspire confiance à tes clients.',
    },
    {
      number: '2',
      title: 'Explore la bibliothèque d\'exercices',
      description: 'L\'onglet Exercices contient 25 exercices de base avec vidéos. Tu peux les utiliser directement ou créer tes propres exercices avec "+ Ajouter".',
      tip: 'Tu peux filtrer par catégorie ou par programme pour retrouver tes exercices.',
    },
    {
      number: '3',
      title: 'Créer tes programmes d\'exercices',
      description: 'Va dans l\'onglet Programmes et clique "+ Créer". Un programme c\'est un groupe d\'exercices réutilisable (ex: Muscu 3, TRX, Course). Ajoute les exercices de ton choix.',
      tip: 'Un même exercice peut être dans plusieurs programmes.',
    },
    {
      number: '4',
      title: 'Ajouter un client',
      description: 'Va dans Clients et clique "+ Ajouter un client". Entre son prénom, nom et email. Le client recevra un email d\'invitation pour créer son mot de passe.',
      tip: 'L\'offre gratuite permet jusqu\'à 3 clients. Au-delà, passe en Pro (24€/mois).',
    },
    {
      number: '5',
      title: 'Créer le plan d\'entraînement',
      description: 'Clique sur un client puis "Créer un plan". Ajoute des semaines, puis des séances dans chaque semaine. Pour chaque séance, assigne un programme ou des exercices individuels.',
      tip: 'Tu peux personnaliser les exercices par séance : séries, répétitions, durée. Le programme template ne change pas.',
    },
    {
      number: '6',
      title: 'Ajouter les détails des séances',
      description: 'Clique "Modifier" sur une séance pour ajouter le type (muscu, cardio, trail...), la durée, la distance, le D+ et les instructions.',
      tip: 'Ces détails sont visibles par le client dans son plan.',
    },
    {
      number: '7',
      title: 'Suivre la progression',
      description: 'Le tableau de bord affiche les clients actifs, inactifs, et les feedbacks récents. Clique sur un client puis "Suivi" pour voir sa progression détaillée.',
      tip: 'Tu es notifié quand un client donne un feedback après sa séance.',
    },
    {
      number: '8',
      title: 'Gérer les objectifs course',
      description: 'L\'onglet Objectifs affiche les demandes de préparation course/trail de tes clients. Consulte le dossier sportif, crée un plan adapté, et suis les feedbacks.',
      tip: 'Les clients B2C (69€) arrivent directement dans cet onglet avec leur questionnaire rempli.',
    },
  ]

  const clientSteps = [
    {
      title: 'Se connecter',
      description: 'Le client clique sur le lien dans l\'email d\'invitation, choisit son mot de passe, et accède directement à son espace.',
    },
    {
      title: 'Mon plan',
      description: 'L\'onglet "Mon plan" affiche les séances de la semaine en cours. Chaque carte montre le type de séance, la durée, le D+ et le programme associé.',
    },
    {
      title: 'Lancer l\'entraînement',
      description: 'Le bouton "Go" lance le mode plein écran : vidéo de chaque exercice en boucle, chronomètre intégré, navigation entre les exercices.',
    },
    {
      title: 'Donner son feedback',
      description: 'Après chaque séance, le client peut noter son ressenti (RPE 1-10), sa sensation, et laisser un commentaire. Tu verras tout ça dans le suivi.',
    },
    {
      title: 'Mon objectif',
      description: 'Si le client prépare une course, l\'onglet "Mon objectif" affiche les infos de sa course et le statut de sa préparation.',
    },
    {
      title: 'Mot de passe oublié',
      description: 'Sur la page de connexion, le client clique "Mot de passe oublié ?" et reçoit un email pour en créer un nouveau.',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>Guide d&apos;utilisation</h1>
        <p className="text-sm text-[#888] mt-1">Comment utiliser KTRY en 8 étapes</p>
      </div>

      {/* Guide coach */}
      <section>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.number} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-full bg-[#d4ff00] text-black flex items-center justify-center font-bold text-sm shrink-0">
                  {step.number}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-[#aaa] mt-1">{step.description}</p>
                  <p className="text-xs text-[#d4ff00] mt-2">Astuce : {step.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guide client */}
      <section>
        <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>Pour tes clients</h2>
        <p className="text-sm text-[#888] mb-4">Ce que tes clients voient et font de leur côté</p>
        <div className="space-y-3">
          {clientSteps.map((step, i) => (
            <div key={i} className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#242424] text-[#888] flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                  <p className="text-sm text-[#888] mt-0.5">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
