// Types principaux de l'application KTRY

export type UserRole = 'coach' | 'client'
export type ProgramStatus = 'active' | 'completed'

export interface Profile {
  id: string
  email: string
  full_name: string   // Conservé pour compatibilité ascendante
  first_name?: string | null
  last_name?: string | null
  role: UserRole
  created_at: string
  // Champs optionnels du profil client
  phone?: string | null
  birth_date?: string | null
  gender?: string | null
  height_cm?: number | null
  weight_kg?: number | null
  objective?: string | null
  notes?: string | null
  coach_id?: string | null
}

export interface Exercise {
  id: string
  name: string
  description: string
  video_url: string
  category: string
  coach_id: string | null  // NULL = bibliothèque de démarrage
  equipment: string
  muscle_group: string
  instructions: string
  difficulty: string
  created_at: string
}

export interface Program {
  id: string
  name: string
  client_id: string
  coach_id: string
  status: ProgramStatus
  created_at: string
  // Champs trail optionnels (ajoutés par migration 017)
  race_goal_id?: string | null
  phase?: string | null
}

export interface Week {
  id: string
  program_id: string
  week_number: number
  // Objectifs de volume hebdomadaires (ajoutés par migration 017)
  target_distance_km?: number | null
  target_duration_minutes?: number | null
  target_elevation_gain_m?: number | null
}

export interface Session {
  id: string
  week_id: string
  name: string
  day_of_week: string
  order_index: number
  details?: string
  recovery?: string
  // Champs trail optionnels (ajoutés par migration 017)
  session_type?: string | null
  duration_minutes?: number | null
  distance_km?: number | null
  elevation_gain_m?: number | null
  intensity?: string | null
  objective?: string | null
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  duration_seconds?: number | null
  coach_notes: string
  order_index: number
}

// Programme réutilisable (Muscu 3, TRX, Vélo...)
export interface Workout {
  id: string
  name: string
  coach_id: string
  description: string
  created_at: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  order_index: number
  coach_notes: string
}

export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise: Exercise
}

export interface WorkoutWithExercises extends Workout {
  workout_exercises: WorkoutExerciseWithDetails[]
}

export interface ExerciseLog {
  id: string
  session_exercise_id: string
  client_id: string
  completed: boolean
  feedback: string | null
  completed_at: string | null
}

// Types enrichis (avec relations jointes)
export interface SessionExerciseWithDetails extends SessionExercise {
  exercise: Exercise
  exercise_log?: ExerciseLog | null
}

export interface SessionWithExercises extends Session {
  session_exercises: SessionExerciseWithDetails[]
}

export interface WeekWithSessions extends Week {
  sessions: SessionWithExercises[]
}

export interface ProgramWithWeeks extends Program {
  weeks: WeekWithSessions[]
  client: Profile
}

// ── Race Goal ────────────────────────────────────────────────────────────────

export type RaceGoalStatus = 'draft' | 'pending' | 'active' | 'completed'
export type GoalType = 'finish' | 'comfortable' | 'improve' | 'target_time' | 'performance'
export type SessionType = 'easy_run' | 'endurance' | 'recovery_run' | 'tempo' | 'threshold' | 'intervals' | 'hill_repeats' | 'uphill_training' | 'downhill_training' | 'technical_trail' | 'long_run' | 'long_trail' | 'race_specific' | 'strength_training' | 'mobility' | 'cross_training' | 'rest' | 'taper' | 'race'
export type Completion = 'yes' | 'partial' | 'no'
export type Feeling = 'great' | 'good' | 'tired' | 'very_tired' | 'pain'

export interface RaceGoal {
  id: string
  client_id: string
  coach_id: string | null
  sport: string
  discipline: string
  race_name: string
  race_date: string
  distance_km: number
  elevation_gain_m: number
  elevation_loss_m: number | null
  terrain_type: string | null
  max_altitude_m: number | null
  goal_type: GoalType
  target_time_minutes: number | null
  status: RaceGoalStatus
  created_at: string
  updated_at: string
}

export interface AthleteTrailProfile {
  id: string
  race_goal_id: string
  declared_level: string | null
  running_experience: string | null
  trail_experience: string | null
  longest_trail_km: number | null
  longest_trail_elevation_m: number | null
  longest_trail_date: string | null
  sessions_per_week: number | null
  weekly_distance_km: number | null
  weekly_duration_minutes: number | null
  weekly_elevation_gain_m: number | null
  longest_run_minutes: number | null
  longest_run_km: number | null
  longest_run_elevation_m: number | null
  availability: Record<string, { available: boolean; max_minutes?: number }> | null
  preferred_long_run_day: string | null
  terrain_access: string[] | null
  has_strength_access: boolean
  strength_location: string | null
  constraints_notes: string | null
  created_at: string
}

export interface SessionFeedback {
  id: string
  session_id: string
  client_id: string
  completion: Completion
  difficulty_rpe: number | null
  feeling: Feeling | null
  comment: string | null
  actual_duration_minutes: number | null
  actual_distance_km: number | null
  actual_elevation_m: number | null
  created_at: string
}

export interface RaceGoalWithProfile extends RaceGoal {
  athlete_trail_profile: AthleteTrailProfile | null
  client?: Profile
}
