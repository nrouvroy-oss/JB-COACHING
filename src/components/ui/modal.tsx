'use client'

// Composant modal réutilisable — s'affiche en bas sur mobile, centré sur desktop avec backdrop blur
interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1c1c1c] border border-[#2a2a2a] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 max-h-[85vh] overflow-y-auto pb-safe">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-[#777] hover:text-white text-2xl leading-none transition-colors w-11 h-11 flex items-center justify-center" aria-label="Fermer">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
