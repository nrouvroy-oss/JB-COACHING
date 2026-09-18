// Middleware de protection des routes — vérifie l'authentification et le rôle utilisateur
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  // Initialiser le client Supabase avec gestion des cookies de session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Pas connecté → rediriger vers la page de connexion
  if (!user && (request.nextUrl.pathname.startsWith('/coach') || request.nextUrl.pathname.startsWith('/client'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Connecté → vérifier le rôle et rediriger si nécessaire
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Déjà connecté sur /login → rediriger vers le bon espace
    if (request.nextUrl.pathname === '/login') {
      const target = profile?.role === 'coach' ? '/coach' : '/client'
      return NextResponse.redirect(new URL(target, request.url))
    }

    // Coach qui tente d'accéder à l'espace client → rediriger vers son espace
    if (profile?.role === 'coach' && request.nextUrl.pathname.startsWith('/client')) {
      return NextResponse.redirect(new URL('/coach', request.url))
    }

    // Client qui tente d'accéder à l'espace coach → rediriger vers son espace
    if (profile?.role === 'client' && request.nextUrl.pathname.startsWith('/coach')) {
      return NextResponse.redirect(new URL('/client', request.url))
    }
  }

  return response
}

// Appliquer le middleware uniquement sur les routes protégées
export const config = {
  matcher: ['/coach/:path*', '/client/:path*', '/login'],
}
