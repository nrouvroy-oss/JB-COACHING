// Page pour définir ou réinitialiser son mot de passe
import { SetPasswordForm } from './set-password-form'

export default function SetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg viewBox="0 0 28 28" className="w-10 h-10 mb-3" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
            <rect x="21.5" y="9" width="4.5" height="10" rx="1.5" fill="#d4ff00"/>
            <rect x="5.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
            <rect x="19.5" y="7.5" width="3" height="13" rx="1" fill="#d4ff00" opacity="0.7"/>
            <rect x="8.5" y="12" width="11" height="4" rx="1" fill="#d4ff00" opacity="0.5"/>
          </svg>
          <h1 className="text-white font-extrabold text-lg">JB COACHING</h1>
          <p className="text-[#888] text-sm mt-1">Choisis ton mot de passe</p>
        </div>

        <SetPasswordForm />
      </div>
    </div>
  )
}
