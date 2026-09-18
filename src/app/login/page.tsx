// Page de connexion — point d'entrée de l'application
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Coach JB</h1>
        <p className="text-gray-500 mt-2">Coaching sportif personnalisé</p>
      </div>
      <LoginForm />
    </main>
  )
}
