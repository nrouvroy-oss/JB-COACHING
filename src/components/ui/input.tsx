// Composant input réutilisable avec label intégré — thème sombre
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-[#888] mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4ff00] focus:border-[#d4ff00] text-white placeholder:text-[#777] text-sm transition-colors"
        {...props}
      />
    </div>
  )
}
