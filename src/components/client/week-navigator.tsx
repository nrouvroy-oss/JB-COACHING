'use client'

// Sélecteur de semaine horizontal avec défilement
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
