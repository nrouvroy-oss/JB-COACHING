// Landing page KTRY — design "luxury athletic"
import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#d4ff00] rounded-lg flex items-center justify-center">
              <span className="text-black font-extrabold text-xs" style={{ fontFamily: 'Bricolage Grotesque' }}>K</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>KTRY</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#666] hover:text-white transition-colors duration-300">
              Connexion
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold bg-[#d4ff00] text-black px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] transition-all duration-300"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-5">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-[#d4ff00]/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] bg-[#d4ff00]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4ff00]/3 rounded-full blur-[150px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-[#d4ff00] rounded-full animate-pulse" />
            <span className="text-[#999] text-xs font-medium uppercase tracking-widest">Gratuit pour 3 clients</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.95]"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            <span className="block">Vos programmes.</span>
            <span className="block mt-2 bg-gradient-to-r from-[#d4ff00] via-[#e8ff66] to-[#d4ff00] bg-clip-text text-transparent">
              Leurs résultats.
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-[#777] max-w-lg mx-auto leading-relaxed">
            L&apos;outil qui transforme vos programmes d&apos;entraînement en une app guidée pour vos clients. Vidéos, chrono, suivi.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#d4ff00] text-black font-extrabold rounded-full text-base hover:shadow-[0_0_40px_rgba(212,255,0,0.25)] transition-all duration-500"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Commencer gratuitement
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#pricing"
              className="text-sm text-[#666] hover:text-[#d4ff00] transition-colors duration-300 underline underline-offset-4 decoration-[#333] hover:decoration-[#d4ff00]/50"
            >
              Voir les tarifs
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { value: '25', label: 'exercices de base' },
              { value: '0€', label: 'pour démarrer' },
              { value: '2min', label: 'pour créer un plan' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-extrabold text-[#d4ff00]" style={{ fontFamily: 'Bricolage Grotesque' }}>{stat.value}</p>
                <p className="text-xs text-[#777] uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-[#666] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#444] to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4ff00]/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <p className="text-[#d4ff00] text-xs font-bold uppercase tracking-[0.3em] mb-4">Fonctionnalités</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Tout pour coacher.<br />
              <span className="text-[#666]">Rien de superflu.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                num: '01',
                title: 'Bibliothèque vidéo',
                desc: '25 exercices de démarrage avec vidéos. Enrichissez avec votre propre méthode.',
                accent: true,
              },
              {
                num: '02',
                title: 'Plans sur mesure',
                desc: 'Semaines, séances, séries, repos. Chaque client a son programme.',
                accent: false,
              },
              {
                num: '03',
                title: 'App client guidée',
                desc: 'Mode entraînement plein écran. Vidéos en boucle, chronomètre intégré.',
                accent: false,
              },
              {
                num: '04',
                title: 'Suivi en temps réel',
                desc: 'Voyez qui s\'entraîne, quelles séances sont faites. Zéro relance.',
                accent: true,
              },
            ].map((f) => (
              <div
                key={f.num}
                className={`group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 ${
                  f.accent
                    ? 'bg-[#d4ff00]/[0.04] border border-[#d4ff00]/10 hover:border-[#d4ff00]/25'
                    : 'bg-white/[0.02] border border-white/5 hover:border-white/10'
                }`}
              >
                <span className="text-[#333] text-xs font-bold tracking-widest">{f.num}</span>
                <h3
                  className="text-xl font-bold text-white mt-4 mb-2 group-hover:text-[#d4ff00] transition-colors duration-300"
                  style={{ fontFamily: 'Bricolage Grotesque' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-32 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#d4ff00] text-xs font-bold uppercase tracking-[0.3em] mb-4">Comment ça marche</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Prêt en 3 étapes
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Créez vos programmes', desc: 'Piochez dans la bibliothèque ou ajoutez vos exercices. Organisez-les en programmes réutilisables.' },
              { step: '02', title: 'Invitez vos clients', desc: 'Un email suffit. Le client reçoit un lien, choisit son mot de passe, et c\'est parti.' },
              { step: '03', title: 'Ils s\'entraînent', desc: 'Votre client ouvre l\'app, lance sa séance, suit les vidéos. Vous voyez sa progression.' },
            ].map((s, i) => (
              <div key={s.step} className="group flex gap-6 sm:gap-10 py-10 border-t border-[#1a1a1a] first:border-t-0">
                <div className="shrink-0 w-16">
                  <span
                    className="text-3xl font-extrabold text-[#1a1a1a] group-hover:text-[#d4ff00] transition-colors duration-500"
                    style={{ fontFamily: 'Bricolage Grotesque' }}
                  >
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3
                    className="text-xl sm:text-2xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Bricolage Grotesque' }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#666] leading-relaxed max-w-md">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4ff00]/[0.015] to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#d4ff00] text-xs font-bold uppercase tracking-[0.3em] mb-4">Tarifs</p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Simple. Transparent.
            </h2>
            <p className="text-[#666] mt-4">Pas de surprise. Pas d&apos;engagement.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl p-8 bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold text-[#777] uppercase tracking-widest">Starter</p>
              </div>
              <p className="mb-1">
                <span className="text-4xl font-extrabold" style={{ fontFamily: 'Bricolage Grotesque' }}>0€</span>
                <span className="text-[#777] text-sm ml-1">/mois</span>
              </p>
              <p className="text-xs text-[#666] mb-8">Pour tester et démarrer</p>
              <ul className="space-y-3 text-sm text-[#888] mb-8">
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  Jusqu&apos;à 3 clients
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  Bibliothèque de démarrage (25 exos)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  Plans illimités
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  App client avec vidéos
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 border border-[#333] text-white font-bold rounded-full hover:border-[#d4ff00]/30 hover:text-[#d4ff00] transition-all duration-300 text-sm"
              >
                Commencer
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-8 bg-[#d4ff00]/[0.04] border-2 border-[#d4ff00]/20 hover:border-[#d4ff00]/40 transition-all duration-300 relative">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-[#d4ff00] text-black text-xs font-extrabold rounded-full uppercase tracking-wider">
                Recommandé
              </div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold text-[#d4ff00] uppercase tracking-widest">Pro</p>
              </div>
              <p className="mb-1">
                <span className="text-4xl font-extrabold" style={{ fontFamily: 'Bricolage Grotesque' }}>24€</span>
                <span className="text-[#777] text-sm ml-1">/mois</span>
              </p>
              <p className="text-xs text-[#666] mb-8">Pour les coachs sérieux</p>
              <ul className="space-y-3 text-sm text-[#aaa] mb-8">
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  <strong className="text-white">Clients illimités</strong>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  Bibliothèque de démarrage (25 exos)
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  Plans illimités
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  App client avec vidéos
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-[#d4ff00] rounded-full" />
                  Support prioritaire
                </li>
              </ul>
              <Link
                href="/signup"
                className="block w-full text-center py-3 bg-[#d4ff00] text-black font-extrabold rounded-full hover:shadow-[0_0_30px_rgba(212,255,0,0.2)] transition-all duration-500 text-sm"
              >
                Essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-32 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            Prêt à digitaliser<br />
            <span className="text-[#d4ff00]">votre coaching ?</span>
          </h2>
          <p className="mt-6 text-[#666] max-w-md mx-auto">
            Créez votre compte en 30 secondes. Vos 3 premiers clients sont gratuits, pour toujours.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center mt-8 px-10 py-4 bg-[#d4ff00] text-black font-extrabold rounded-full text-base hover:shadow-[0_0_50px_rgba(212,255,0,0.25)] transition-all duration-500"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            Créer mon compte
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-5 border-t border-[#151515]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#d4ff00] rounded-md flex items-center justify-center">
              <span className="text-black font-extrabold text-[10px]" style={{ fontFamily: 'Bricolage Grotesque' }}>K</span>
            </div>
            <span className="font-bold text-sm" style={{ fontFamily: 'Bricolage Grotesque' }}>KTRY</span>
          </div>
          <p className="text-[11px] text-[#333]">© 2026 KTRY. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  )
}
