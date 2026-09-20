// Composant bouton réutilisable — thème sombre compact style Nike
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'rounded-lg font-semibold disabled:opacity-40 transition-all duration-150 cursor-pointer'
  const variants = {
    primary: 'bg-[#d4ff00] text-black hover:bg-[#c2ee00]',
    secondary: 'bg-[#242424] text-white border border-[#333] hover:border-[#444] hover:bg-[#2a2a2a]',
    danger: 'bg-transparent text-red-400 hover:text-red-300',
  }
  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
