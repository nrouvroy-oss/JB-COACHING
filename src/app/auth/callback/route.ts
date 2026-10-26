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
  const type = searchParams.get('type')

  if (code) {
    const cookieStore = await cookies()

    // Stocker les cookies setés pendant l'échange pour les reporter sur la redirection
    const responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              responseCookies.push({ name, value, options: options as Record<string, unknown> })
            })
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
          // Valider le rôle — seuls 'coach' et 'client' sont acceptés
          const rawRole = user.user_metadata?.role as string
          const role = rawRole === 'coach' ? 'coach' : 'client'
          await admin.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || '',
            role,
          })
        }

        // Déterminer la destination selon le type de lien
        let destination = next

        if (type === 'reset' || type === 'invite') {
          // Reset mdp ou invitation client → choisir/créer un mot de passe
          destination = '/auth/set-password'
        } else if (type === 'signup' || type === 'email_change') {
          // Confirmation email d'inscription → rediriger vers le bon espace
          const { data: profile } = await admin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          destination = profile?.role === 'coach' ? '/coach' : '/client'
        } else if (next === '/auth/set-password') {
          // Fallback pour les anciens liens sans type → page set-password
          destination = '/auth/set-password'
        }

        // Pour les clients sans coach_id, assigner au coach par défaut
        const { data: profileCheck } = await admin
          .from('profiles')
          .select('role, coach_id')
          .eq('id', user.id)
          .single()

        if (profileCheck?.role === 'client' && !profileCheck.coach_id) {
          const { data: defaultCoach } = await admin
            .from('profiles')
            .select('id')
            .eq('role', 'coach')
            .order('created_at', { ascending: true })
            .limit(1)
            .single()

          if (defaultCoach) {
            await admin
              .from('profiles')
              .update({ coach_id: defaultCoach.id })
              .eq('id', user.id)
          }
        }

        // Créer la redirection avec les cookies de session
        const response = NextResponse.redirect(`${origin}${destination}`)
        responseCookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
        return response
      }

      const response = NextResponse.redirect(`${origin}${next}`)
      responseCookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options)
      })
      return response
    }
  }

  // En cas d'erreur, rediriger vers la page de login
  return NextResponse.redirect(`${origin}/login?error=invalid_link`)
}
