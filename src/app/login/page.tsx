// Page de connexion — design sombre et sportif avec photo de fond et cercles décoratifs
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1c1c1c] relative overflow-hidden">
      {/* Photo de fond — salle de sport sombre, opacité réduite pour lisibilité */}
      <img
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />

      {/* Cercles décoratifs en arrière-plan — lueur lime très subtile */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#d4ff00]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-[#d4ff00]/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          {/* Logo — silhouette haltère stylisée */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5">
            <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="28" width="12" height="24" rx="3" fill="#d4ff00"/>
              <rect x="60" y="28" width="12" height="24" rx="3" fill="#d4ff00"/>
              <rect x="16" y="24" width="8" height="32" rx="2" fill="#d4ff00" opacity="0.7"/>
              <rect x="56" y="24" width="8" height="32" rx="2" fill="#d4ff00" opacity="0.7"/>
              <rect x="24" y="36" width="32" height="8" rx="2" fill="#d4ff00" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">JB COACHING</h1>
          <p className="text-[#888] mt-2 text-sm uppercase tracking-widest">Train. Progress. Repeat.</p>
        </div>
        <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
