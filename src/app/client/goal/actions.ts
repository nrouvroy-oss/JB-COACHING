'use server'

// Actions pour les objectifs course du sportif
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRaceGoal(formData: FormData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  // Récupérer le coach_id du sportif
  const { data: profile } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('id', user.id)
    .single()

  // Vérifier qu’il n’a pas déjà un objectif actif
  const { data: existing } = await supabase
    .from('race_goals')
    .select('id')
    .eq('client_id', user.id)
    .in('status', ['draft', 'pending', 'active'])
    .limit(1)

  if (existing && existing.length > 0) {
    return { error: 'Tu as déjà un objectif en cours.' }
  }

  // Créer le race_goal
  const { data: goal, error: goalError } = await supabase
    .from('race_goals')
    .insert({
      client_id: user.id,
      coach_id: profile?.coach_id ?? null,
      sport: 'running',
      discipline: 'trail',
      race_name: formData.get('race_name') as string,
      race_date: formData.get('race_date') as string,
      distance_km: parseFloat(formData.get('distance_km') as string),
      elevation_gain_m: parseInt(formData.get('elevation_gain_m') as string),
      elevation_loss_m: formData.get('elevation_loss_m') ? parseInt(formData.get('elevation_loss_m') as string) : null,
      terrain_type: formData.get('terrain_type') as string || null,
      max_altitude_m: formData.get('max_altitude_m') ? parseInt(formData.get('max_altitude_m') as string) : null,
      goal_type: formData.get('goal_type') as string || 'finish',
      target_time_minutes: formData.get('target_time_minutes') ? parseInt(formData.get('target_time_minutes') as string) : null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (goalError || !goal) return { error: 'Erreur lors de la création' }

  // Créer le profil trail
  const availability: Record<string, { available: boolean; max_minutes?: number }> = {}
  for (const day of ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']) {
    const avail = formData.get(`avail_${day}`) === 'true'
    const minutes = formData.get(`minutes_${day}`) ? parseInt(formData.get(`minutes_${day}`) as string) : undefined
    availability[day] = { available: avail, ...(minutes ? { max_minutes: minutes } : {}) }
  }

  const terrainAccess = formData.getAll('terrain_access') as string[]

  const { error: profileError } = await supabase
    .from('athlete_trail_profiles')
    .insert({
      race_goal_id: goal.id,
      declared_level: formData.get('declared_level') as string || null,
      running_experience: formData.get('running_experience') as string || null,
      trail_experience: formData.get('trail_experience') as string || null,
      longest_trail_km: formData.get('longest_trail_km') ? parseFloat(formData.get('longest_trail_km') as string) : null,
      longest_trail_elevation_m: formData.get('longest_trail_elevation_m') ? parseInt(formData.get('longest_trail_elevation_m') as string) : null,
      longest_trail_date: formData.get('longest_trail_date') as string || null,
      sessions_per_week: formData.get('sessions_per_week') ? parseInt(formData.get('sessions_per_week') as string) : null,
      weekly_distance_km: formData.get('weekly_distance_km') ? parseFloat(formData.get('weekly_distance_km') as string) : null,
      weekly_duration_minutes: formData.get('weekly_duration_minutes') ? parseInt(formData.get('weekly_duration_minutes') as string) : null,
      weekly_elevation_gain_m: formData.get('weekly_elevation_gain_m') ? parseInt(formData.get('weekly_elevation_gain_m') as string) : null,
      longest_run_minutes: formData.get('longest_run_minutes') ? parseInt(formData.get('longest_run_minutes') as string) : null,
      longest_run_km: formData.get('longest_run_km') ? parseFloat(formData.get('longest_run_km') as string) : null,
      longest_run_elevation_m: formData.get('longest_run_elevation_m') ? parseInt(formData.get('longest_run_elevation_m') as string) : null,
      availability,
      preferred_long_run_day: formData.get('preferred_long_run_day') as string || null,
      terrain_access: terrainAccess.length > 0 ? terrainAccess : null,
      has_strength_access: formData.get('has_strength_access') === 'true',
      strength_location: formData.get('strength_location') as string || null,
      constraints_notes: formData.get('constraints_notes') as string || null,
    })

  if (profileError) return { error: 'Erreur lors de la création du profil' }

  revalidatePath('/client')
  return { id: goal.id }
}
