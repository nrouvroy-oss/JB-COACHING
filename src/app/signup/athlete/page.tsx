// Page d'inscription sportif — crée un compte client assigné au coach par défaut
import { AthleteSignupForm } from './athlete-signup-form'
import Link from 'next/link'

export default function AthleteSignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] bg-[#d4ff00]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -left-32 w-[300px] h-[300px] bg-[#d4ff00]/3 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-[#d4ff00] rounded-xl flex items-center justify-center">
              <span className="text-black font-extrabold text-sm" style={{ fontFamily: 'Bricolage Grotesque' }}>K</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>KTRY</span>
          </Link>
          <h1
            className="text-2xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            Prépare ton trail
          </h1>
          <p className="text-[#777] mt-2 text-sm">Crée ton compte pour recevoir ton plan personnalisé.</p>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
          <AthleteSignupForm />
        </div>

        <p className="text-center mt-6 text-sm text-[#777]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#d4ff00] hover:text-[#e8ff66] transition-colors duration-300 font-semibold">
            Se connecter
          </Link>
        </p>
        <p className="text-center mt-2 text-sm text-[#555]">
          Tu es coach ?{' '}
          <Link href="/signup" className="text-[#888] hover:text-white transition-colors duration-300">
            Créer un espace coach
          </Link>
        </p>
      </div>
    </main>
  )
}
