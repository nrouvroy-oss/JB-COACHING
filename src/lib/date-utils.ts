// Utilitaires de formatage de dates relatives en français

/**
 * Retourne une chaîne de date relative en français
 * Exemple : "il y a 2h", "hier", "il y a 3 jours"
 */
export function relativeDate(date: string | null): string {
  if (!date) return 'Aucune activité'

  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  if (diffH < 24) return `il y a ${diffH}h`
  if (diffD === 1) return 'hier'
  if (diffD < 30) return `il y a ${diffD} jours`
  return `il y a ${Math.floor(diffD / 30)} mois`
}

/**
 * Retourne le lundi de la semaine courante à minuit (ISO string)
 */
export function getMondayOfThisWeek(): string {
  const now = new Date()
  const day = now.getDay() // 0 = dimanche, 1 = lundi, ...
  // Si dimanche (0), on recule de 6 jours, sinon on recule de (day - 1) jours
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString()
}
