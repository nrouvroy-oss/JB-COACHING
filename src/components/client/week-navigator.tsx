'use client'

// Sélecteur de semaine — pills horizontales avec numéro court
interface WeekNavigatorProps {
  weekNumbers: number[]
  currentWeek: number
  onChange: (week: number) => void
}

export function WeekNavigator({ weekNumbers, currentWeek, onChange }: WeekNavigatorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {weekNumbers.map((week) => (
        <button
          key={week}
          onClick={() => onChange(week)}
          className={`min-w-[48px] min-h-[44px] px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            currentWeek === week
              ? 'bg-[#d4ff00] text-black'
              : 'bg-[#1c1c1c] text-[#888] hover:bg-[#242424] border border-[#2a2a2a]'
          }`}
        >
          S{week}
        </button>
      ))}
    </div>
  )
}
