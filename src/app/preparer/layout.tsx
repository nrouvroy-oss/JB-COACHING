// Layout du wizard public — fond sombre KTRY, centré, sans nav
import Link from 'next/link'

export default function PreparerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header minimal */}
      <div className="px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#d4ff00] rounded-lg flex items-center justify-center">
              <span className="text-black font-extrabold text-[10px]" style={{ fontFamily: 'Bricolage Grotesque' }}>K</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white" style={{ fontFamily: 'Bricolage Grotesque' }}>KTRY</span>
          </Link>
          <Link href="/" className="text-xs text-[#666] hover:text-white transition-colors min-h-[44px] flex items-center">
            Retour
          </Link>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-5 pb-8">
        {children}
      </main>
    </div>
  )
}
