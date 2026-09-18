// Page d'accueil - redirige vers la page de connexion
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/login')
}
