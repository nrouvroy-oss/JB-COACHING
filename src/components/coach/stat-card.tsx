// Carte statistique pour le tableau de bord coach — affiche un chiffre clé avec icône et libellé

interface StatCardProps {
  label: string
  value: string | number
  icon: string // emoji
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-[#1c1c1c] rounded-xl border border-[#2a2a2a] p-4 flex items-center justify-between gap-3">
      {/* Valeur et libellé */}
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-[#888] mt-0.5 leading-snug uppercase tracking-wide">{label}</p>
      </div>
      {/* Icône grande à droite */}
      <span className="text-3xl flex-shrink-0" role="img" aria-label={label}>
        {icon}
      </span>
    </div>
  )
}
