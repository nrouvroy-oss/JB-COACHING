// Landing page sportif B2C — prépare ta course avec un coach
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
              href="/signup/athlete"
              className="text-sm font-bold bg-[#d4ff00] text-black px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] transition-all duration-300"
            >
              Préparer ma course
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-5">
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-[#d4ff00]/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] bg-[#d4ff00]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4ff00]/3 rounded-full blur-[150px]" />

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
            <span className="text-[#999] text-xs font-medium uppercase tracking-widest">Plan personnalisé par un coach</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.95]"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            <span className="block">Ta course.</span>
            <span className="block mt-2 bg-gradient-to-r from-[#d4ff00] via-[#e8ff66] to-[#d4ff00] bg-clip-text text-transparent">
              Ton plan.
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg text-[#777] max-w-lg mx-auto leading-relaxed">
            Trail, running, cyclisme, triathlon... Décris ta course et ton niveau. Un coach construit ton plan d&apos;entraînement jusqu&apos;au jour J.
          </p>

          <div className="mt-10 flex flex-col gap-4 justify-center items-center">
            <Link
              href="/signup/athlete"
              className="group inline-flex items-center justify-center px-8 py-4 bg-[#d4ff00] text-black font-extrabold rounded-full text-base hover:shadow-[0_0_40px_rgba(212,255,0,0.25)] transition-all duration-500 w-full sm:w-auto"
              style={{ fontFamily: 'Bricolage Grotesque' }}
            >
              Préparer mon objectif — 69€
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <span className="text-xs text-[#666]">Paiement unique · Jusqu&apos;au jour de ta course</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-[#666] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#444] to-transparent" />
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-32 px-5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4ff00]/[0.02] to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <p className="text-[#d4ff00] text-xs font-bold uppercase tracking-[0.3em] mb-4">Comment ça marche</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>
              3 étapes.<br />
              <span className="text-[#666]">C&apos;est tout.</span>
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Décris ta course et ton profil', desc: 'Distance, D+, terrain, date. Ton niveau, ton volume actuel, tes disponibilités. 5 minutes.' },
              { step: '02', title: 'Ton coach construit ton plan', desc: 'Un coach analyse ton profil et crée un plan semaine par semaine. Séances, volume, récupération, affûtage.' },
              { step: '03', title: 'Entraîne-toi et progresse', desc: 'Suis tes séances sur l\'app. Donne tes feedbacks. Ton coach ajuste si besoin.' },
            ].map((s) => (
              <div key={s.step} className="group flex gap-6 sm:gap-10 py-10 border-t border-[#1a1a1a] first:border-t-0">
                <div className="shrink-0 w-16">
                  <span className="text-3xl font-extrabold text-[#1a1a1a] group-hover:text-[#d4ff00] transition-colors duration-500" style={{ fontFamily: 'Bricolage Grotesque' }}>
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Bricolage Grotesque' }}>{s.title}</h3>
                  <p className="text-sm sm:text-base text-[#666] leading-relaxed max-w-md">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi KTRY */}
      <section className="py-32 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[#d4ff00] text-xs font-bold uppercase tracking-[0.3em] mb-4">Pourquoi KTRY</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Pas un programme générique.<br />
              <span className="text-[#666]">Ton plan.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { num: '01', title: 'Adapté à ta course', desc: 'Distance, D+, terrain, altitude. Ton plan est construit pour TA course, pas un programme type.', accent: true },
              { num: '02', title: 'Adapté à ton niveau', desc: 'Volume actuel, expérience, sortie longue. On part de là où tu es.', accent: false },
              { num: '03', title: 'Adapté à ta vie', desc: 'Tes jours dispos, ta durée max, ton accès au terrain. Le plan s\'adapte à toi.', accent: false },
              { num: '04', title: 'Suivi par un coach', desc: 'Pas un algorithme. Un coach humain qui analyse tes feedbacks et ajuste ton plan.', accent: true },
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
                <h3 className="text-xl font-bold text-white mt-4 mb-2 group-hover:text-[#d4ff00] transition-colors duration-300" style={{ fontFamily: 'Bricolage Grotesque' }}>
                  {f.title}
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing sportif */}
      <section id="pricing" className="py-32 px-5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4ff00]/[0.015] to-transparent" />
        <div className="max-w-md mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-[#d4ff00] text-xs font-bold uppercase tracking-[0.3em] mb-4">Tarif</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque' }}>
              Simple. Clair.
            </h2>
          </div>

          <div className="bg-[#d4ff00]/[0.05] border-2 border-[#d4ff00]/20 rounded-2xl p-8 text-center">
            <p className="text-xs font-bold text-[#d4ff00] uppercase tracking-widest mb-4">Plan personnalisé</p>
            <p className="mb-1">
              <span className="text-5xl font-extrabold text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>69€</span>
            </p>
            <p className="text-sm text-[#888] mb-8">Paiement unique · Jusqu&apos;au jour de ta course</p>
            <ul className="space-y-3 text-sm text-[#aaa] mb-8 text-left">
              <li className="flex items-start gap-3"><span className="w-1 h-1 bg-[#d4ff00] rounded-full mt-2 shrink-0" />Plan construit par un coach pour ta course</li>
              <li className="flex items-start gap-3"><span className="w-1 h-1 bg-[#d4ff00] rounded-full mt-2 shrink-0" />Adapté à ton niveau, tes dispos, ton terrain</li>
              <li className="flex items-start gap-3"><span className="w-1 h-1 bg-[#d4ff00] rounded-full mt-2 shrink-0" />Séances semaine par semaine jusqu&apos;au jour J</li>
              <li className="flex items-start gap-3"><span className="w-1 h-1 bg-[#d4ff00] rounded-full mt-2 shrink-0" />Suivi et ajustements par ton coach</li>
              <li className="flex items-start gap-3"><span className="w-1 h-1 bg-[#d4ff00] rounded-full mt-2 shrink-0" />App mobile avec vidéos et chrono</li>
            </ul>
            <Link
              href="/signup/athlete"
              className="block w-full py-3.5 bg-[#d4ff00] text-black font-extrabold rounded-full hover:shadow-[0_0_30px_rgba(212,255,0,0.2)] transition-all duration-500 text-sm"
            >
              Préparer mon objectif
            </Link>
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
            Ta course.<br />
            Ton niveau.<br />
            <span className="text-[#d4ff00]">Ton plan.</span>
          </h2>
          <p className="mt-6 text-[#666] max-w-md mx-auto">
            Décris ta course. Un coach construit ta préparation jusqu&apos;au jour J.
          </p>
          <Link
            href="/signup/athlete"
            className="inline-flex items-center justify-center mt-8 px-10 py-4 bg-[#d4ff00] text-black font-extrabold rounded-full text-base hover:shadow-[0_0_50px_rgba(212,255,0,0.25)] transition-all duration-500"
            style={{ fontFamily: 'Bricolage Grotesque' }}
          >
            Préparer mon objectif — 69€
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
          <div className="flex items-center gap-4">
            <Link href="/pour-les-coachs" className="text-xs text-[#555] hover:text-[#888] transition-colors">Je suis coach</Link>
            <p className="text-[11px] text-[#333]">© 2026 KTRY. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
