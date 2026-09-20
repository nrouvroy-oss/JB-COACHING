// Types principaux de l'application Coach JB

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
  coach_id: string
  created_at: string
}

export interface Program {
  id: string
  name: string
  client_id: string
  coach_id: string
  status: ProgramStatus
  created_at: string
}

export interface Week {
  id: string
  program_id: string
  week_number: number
}

export interface Session {
  id: string
  week_id: string
  name: string
  day_of_week: string
  order_index: number
  details?: string
  recovery?: string
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
