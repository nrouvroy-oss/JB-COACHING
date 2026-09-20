'use client'

// Sélecteur de semaine horizontal avec défilement
interface WeekNavigatorProps {
  weekNumbers: number[]
  currentWeek: number
  onChange: (week: number) => void
}

export function WeekNavigator({ weekNumbers, currentWeek, onChange }: WeekNavigatorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {weekNumbers.map((week) => (
        <button
          key={week}
          onClick={() => onChange(week)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            currentWeek === week
              ? 'bg-[#d4ff00] text-black'
              : 'bg-[#242424] text-[#888] hover:bg-[#2a2a2a]'
          }`}
        >
          Semaine {week}
        </button>
      ))}
    </div>
  )
}
