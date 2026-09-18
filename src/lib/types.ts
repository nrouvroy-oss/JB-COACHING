// Types principaux de l'application Coach JB

export type UserRole = 'coach' | 'client'
export type ProgramStatus = 'active' | 'completed'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
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
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  sets: number
  reps: string
  rest_seconds: number
  coach_notes: string
  order_index: number
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
