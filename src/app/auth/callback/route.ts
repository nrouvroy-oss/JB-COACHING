// Route callback — échange le code d'authentification Supabase contre une session
// Utilisé pour les confirmations email, invitations et réinitialisations de mot de passe
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/set-password'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Créer le profil si le trigger DB n'a pas fonctionné
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = createAdminClient()
        const { data: existing } = await admin
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existing) {
          const role = (user.user_metadata?.role as string) || 'client'
          await admin.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || '',
            role,
          })
        }

        // Rediriger vers le bon espace selon le rôle (sauf si next est spécifié)
        if (next === '/auth/set-password') {
          const { data: profile } = await admin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          const target = profile?.role === 'coach' ? '/coach' : '/client'
          return NextResponse.redirect(`${origin}${target}`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // En cas d'erreur, rediriger vers la page de login
  return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}
