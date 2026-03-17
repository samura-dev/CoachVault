export interface sd_BaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface sd_User extends sd_BaseRecord {
  email: string;
  name: string;
  avatar?: string;
  role: 'coach' | 'admin';
  emailVisibility: boolean;
  verified: boolean;
  custom_set_columns?: string[];
}

export interface sd_Athlete extends sd_BaseRecord {
  coach_id: string; // Relation to users (coach)
  name: string;
  gender: 'male' | 'female';
  height?: number;
  height_cm?: number;
  goal: 'cutting' | 'bulking' | 'maintenance' | 'recomp';
  start_weight: number;
  target_weight: number;
  status: 'active' | 'archived' | 'paused';
  is_coach_self: boolean;
  notes?: string;
  tags?: string[];
  competition_type?: sd_CompetitionType | null;
  nutrition_plan?: {
    tdee: number;
    target_calories: number;
    macros: { p: number; f: number; c: number };
    formula: string;
  };
}

export interface sd_Metric extends sd_BaseRecord {
  athlete_id: string; // Relation to athletes
  weight: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicep?: number;
  bicep_left?: number;
  bicep_right?: number;
  neck?: number;
  body_fat?: number;
  measured_at: string;
  note?: string;
}

export interface sd_Note extends sd_BaseRecord {
  athlete_id: string;
  content: string;
  type: 'general' | 'training' | 'nutrition' | 'medical' | 'injury' | 'diet' | 'mood';
  importance?: 'low' | 'medium' | 'high';
  is_private?: boolean;
}

export interface sd_Photo extends sd_BaseRecord {
  athlete_id: string;
  image: string; // Image url/filename
  label: 'front' | 'side' | 'back' | 'other';
  note?: string;
  taken_at: string;
}

export interface sd_Reminder extends sd_BaseRecord {
  coach_id: string;
  athlete_id?: string;
  title: string;
  description?: string;
  due_date: string;
  is_completed: boolean;
  type: 'measurement' | 'nutrition' | 'training' | 'payment' | 'photo' | 'other' | 'check_in';
  priority?: 'low' | 'medium' | 'high';
}

export type sd_CompetitionType = 'bodybuilding' | 'powerlifting' | 'triathlon' | 'weightlifting' | 'other' | '';

export interface sd_ShareLink extends sd_BaseRecord {
  athlete_id: string;
  token: string;
  expires_at?: string;
}

export type sd_AuthResponse = {
  token: string;
  record: sd_User;
};

export interface sd_SetData {
  id: string;
  reps?: string;
  weight?: string;
  [key: string]: string | number | undefined;
}

export interface sd_ProgramWorkoutRecord extends sd_BaseRecord {
  program_id: string;
  day_number: number;
  name: string;
  expand?: {
    program_exercises_via_workout_id?: sd_ProgramExerciseRecord[];
  };
}

export interface sd_ProgramExerciseRecord extends sd_BaseRecord {
  workout_id: string;
  exercise_name: string;
  order: number;
  sets: number;
  reps: string;
  rest_time?: string;
  sets_data?: sd_SetData[];
}

export interface sd_ProgramRecord extends sd_BaseRecord {
  coach_id: string;
  name: string;
  description?: string;
  specialization?: string;
  goals?: string;
  duration_weeks: number;
  expand?: {
    program_workouts_via_program_id?: sd_ProgramWorkoutRecord[];
  };
}

export interface sd_ClientProgramRecord extends sd_BaseRecord {
  athlete_id: string;
  program_id: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  expand?: {
    program_id?: sd_ProgramRecord;
    athlete_id?: sd_Athlete;
  };
}
