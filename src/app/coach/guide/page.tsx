// Page guide coach — explique comment utiliser l'app étape par étape
export default function GuidePage() {
  const steps = [
    {
      number: '1',
      title: 'Créer tes exercices',
      description: 'Va dans l\'onglet Exercices et clique "+ Ajouter". Donne un nom, une catégorie, et ajoute une vidéo ou une image pour montrer le mouvement. Tu peux aussi assigner l\'exercice à un ou plusieurs programmes directement.',
      tip: 'Tu peux ajouter des exercices sans vidéo et les compléter plus tard.',
    },
    {
      number: '2',
      title: 'Créer tes programmes',
      description: 'Va dans l\'onglet Programmes et clique "+ Créer". Un programme c\'est un groupe d\'exercices réutilisable (ex: Muscu 3, TRX, Course). Ajoute les exercices de ton choix dans chaque programme.',
      tip: 'Un même exercice peut être dans plusieurs programmes.',
    },
    {
      number: '3',
      title: 'Ajouter un client',
      description: 'Va dans Clients et clique "+ Ajouter un client". Entre son prénom, nom et email. Le client recevra un email d\'invitation pour créer son mot de passe.',
      tip: 'Tu ne gères pas le mot de passe — le client le choisit lui-même.',
    },
    {
      number: '4',
      title: 'Créer le plan d\'entraînement',
      description: 'Clique sur un client → Plan → "Créer un plan". Ajoute des semaines, puis des séances dans chaque semaine. Pour chaque séance, clique "+ Programme" pour assigner un programme (Muscu 3, TRX...).',
      tip: 'Tu peux personnaliser les exercices par séance : ajouter/retirer un exercice, indiquer les séries et répétitions. Le programme template ne change pas.',
    },
    {
      number: '5',
      title: 'Ajouter les détails de la séance',
      description: 'Clique "Modifier" sur une séance pour ajouter les instructions (Description) et les temps de repos (Récupération). Ces infos seront visibles par le client.',
      tip: 'Tu peux écrire en texte libre — circuits, Tabata, intervalles, tout ce que tu veux.',
    },
    {
      number: '6',
      title: 'Le client s\'entraîne',
      description: 'Le client se connecte, voit ses séances de la semaine, et clique "Go" pour lancer le mode entraînement. Les vidéos tournent en boucle, un chrono est intégré, et il peut naviguer entre les exercices.',
      tip: 'Le client peut marquer ses séances comme terminées. Tu verras sa progression sur le tableau de bord.',
    },
  ]

  const clientSteps = [
    {
      title: 'Se connecter',
      description: 'Le client clique sur le lien dans l\'email d\'invitation, choisit son mot de passe, et accède directement à son espace.',
    },
    {
      title: 'Voir son plan',
      description: 'L\'onglet "Mon plan" affiche les séances de la semaine en cours. Chaque carte montre le nom de la séance et le programme associé.',
    },
    {
      title: 'Lancer l\'entraînement',
      description: 'Le bouton "Go" lance le mode plein écran : vidéo de chaque exercice en boucle, chronomètre intégré, navigation Précédent/Suivant.',
    },
    {
      title: 'Marquer comme fait',
      description: 'En fin de séance, le client clique "Terminer" ou "Marquer comme terminée". La progression de la semaine se met à jour.',
    },
    {
      title: 'Mon parcours',
      description: 'L\'onglet "Mon parcours" montre le programme en cours et l\'historique des programmes terminés avec les stats.',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Guide d&apos;utilisation</h1>
        <p className="text-sm text-[#888] mt-1">Comment utiliser JB Coaching en 6 étapes</p>
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
        <h2 className="text-lg font-bold text-white mb-2">Pour tes clients</h2>
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
