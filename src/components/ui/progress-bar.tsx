// Composant barre de progression réutilisable — thème sombre lime néon
interface ProgressBarProps {
  percent: number
  className?: string
}

export function ProgressBar({ percent, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full bg-[#242424] rounded-full h-1.5 ${className}`}>
      <div
        className="bg-[#d4ff00] h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}
