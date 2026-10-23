// Page d'aiguillage — oriente vers l'espace sportif ou l'espace coach
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[#0a0a0a] text-white flex flex-col">
      {/* Logo centré */}
      <div className="pt-10 pb-6 flex justify-center">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-[#d4ff00] rounded-xl flex items-center justify-center">
            <span className="text-black font-extrabold text-sm" style={{ fontFamily: 'Bricolage Grotesque' }}>K</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>KTRY</span>
        </Link>
      </div>

      {/* Contenu centré verticalement */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-16">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-center leading-tight mb-4"
          style={{ fontFamily: 'Bricolage Grotesque' }}
        >
          L&apos;entraînement<br />
          <span className="text-[#d4ff00]">qui vous ressemble.</span>
        </h1>
        <p className="text-[#777] text-center max-w-md mb-12 text-sm sm:text-base">
          Coaching sportif personnalisé — pour les athlètes qui veulent un plan, et pour les coachs qui veulent un outil.
        </p>

        {/* Deux cartes d'aiguillage */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Carte Sportif */}
          <Link
            href="/sportif"
            className="group relative rounded-2xl p-8 bg-[#d4ff00]/[0.04] border border-[#d4ff00]/10 hover:border-[#d4ff00]/30 transition-all duration-500 hover:-translate-y-1 flex flex-col min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-xl bg-[#d4ff00]/10 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-[#d4ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2
              className="text-xl font-bold mb-2 group-hover:text-[#d4ff00] transition-colors duration-300"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Je prépare une course
            </h2>
            <p className="text-sm text-[#666] leading-relaxed flex-1">
              Trail, running, cyclisme, triathlon... Un coach construit ton plan personnalisé jusqu&apos;au jour J.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[#d4ff00] text-sm font-semibold">
              Découvrir
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Carte Coach */}
          <Link
            href="/pour-les-coachs"
            className="group relative rounded-2xl p-8 bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all duration-500 hover:-translate-y-1 flex flex-col min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2
              className="text-xl font-bold mb-2 group-hover:text-white transition-colors duration-300"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Je suis coach
            </h2>
            <p className="text-sm text-[#666] leading-relaxed flex-1">
              Créez vos programmes, suivez vos clients, développez votre activité. Gratuit jusqu&apos;à 3 clients.
            </p>
            <div className="mt-5 flex items-center gap-2 text-[#888] group-hover:text-white text-sm font-semibold transition-colors">
              Découvrir
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Lien connexion */}
        <p className="mt-10 text-sm text-[#555]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#888] hover:text-white transition-colors font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
