// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
// ─── Full anatomical muscle list ───
export const MUSCLE_GROUPS = [
  // Chest
  'Upper Chest',
  'Mid Chest',
  'Lower Chest',
  'Serratus Anterior',
  // Back
  'Upper Traps',
  'Mid Traps',
  'Lower Traps',
  'Rhomboids',
  'Upper Lats',
  'Lower Lats',
  'Erector Spinae',
  'Teres Major',
  'Infraspinatus',
  // Shoulders
  'Front Delts',
  'Side Delts',
  'Rear Delts',
  'Rotator Cuff',
  // Biceps
  'Biceps Long Head',
  'Biceps Short Head',
  'Brachialis',
  // Triceps
  'Triceps Long Head',
  'Triceps Lateral Head',
  'Triceps Medial Head',
  // Forearms
  'Brachioradialis',
  'Wrist Flexors',
  'Wrist Extensors',
  // Core
  'Upper Abs',
  'Lower Abs',
  'External Obliques',
  'Internal Obliques',
  'Transverse Abdominis',
  // Quads
  'Rectus Femoris',
  'Vastus Lateralis',
  'Vastus Medialis',
  'Vastus Intermedius',
  // Hamstrings
  'Biceps Femoris',
  'Semitendinosus',
  'Semimembranosus',
  // Glutes
  'Gluteus Maximus',
  'Gluteus Medius',
  'Gluteus Minimus',
  // Hip
  'Hip Flexors',
  'Adductors',
  'TFL',
  // Calves
  'Gastrocnemius',
  'Soleus',
  'Tibialis Anterior',
  // Other
  'Cardio',
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

/** Categories for filter UI + chip grouping */
export const MUSCLE_CATEGORIES: Record<string, MuscleGroup[]> = {
  Chest: ['Upper Chest', 'Mid Chest', 'Lower Chest', 'Serratus Anterior'],
  Back: [
    'Upper Traps',
    'Mid Traps',
    'Lower Traps',
    'Rhomboids',
    'Upper Lats',
    'Lower Lats',
    'Erector Spinae',
    'Teres Major',
    'Infraspinatus',
  ],
  Shoulders: ['Front Delts', 'Side Delts', 'Rear Delts', 'Rotator Cuff'],
  Biceps: ['Biceps Long Head', 'Biceps Short Head', 'Brachialis'],
  Triceps: ['Triceps Long Head', 'Triceps Lateral Head', 'Triceps Medial Head'],
  Forearms: ['Brachioradialis', 'Wrist Flexors', 'Wrist Extensors'],
  Core: ['Upper Abs', 'Lower Abs', 'External Obliques', 'Internal Obliques', 'Transverse Abdominis'],
  Quads: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis', 'Vastus Intermedius'],
  Hamstrings: ['Biceps Femoris', 'Semitendinosus', 'Semimembranosus'],
  Glutes: ['Gluteus Maximus', 'Gluteus Medius', 'Gluteus Minimus'],
  'Hip/Adductors': ['Hip Flexors', 'Adductors', 'TFL'],
  Calves: ['Gastrocnemius', 'Soleus', 'Tibialis Anterior'],
}

/** Map old names from previous versions to new specific muscles */
const MIGRATION_MAP: Record<string, MuscleGroup[]> = {
  // Original 9 broad groups
  Chest: ['Mid Chest'],
  Back: ['Upper Lats', 'Lower Lats'],
  Shoulders: ['Front Delts', 'Side Delts', 'Rear Delts'],
  Biceps: ['Biceps Long Head', 'Biceps Short Head'],
  Triceps: ['Triceps Long Head', 'Triceps Lateral Head'],
  Forearms: ['Brachioradialis', 'Wrist Flexors'],
  Core: ['Upper Abs', 'Lower Abs'],
  Abs: ['Upper Abs', 'Lower Abs'],
  Obliques: ['External Obliques'],
  Legs: ['Rectus Femoris', 'Vastus Lateralis'],
  Quads: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
  Hamstrings: ['Biceps Femoris', 'Semitendinosus'],
  Glutes: ['Gluteus Maximus'],
  Calves: ['Gastrocnemius', 'Soleus'],
  Adductors: ['Adductors'],
  Abductors: ['TFL'],
  // Second iteration names
  'Upper Back': ['Upper Traps', 'Rhomboids'],
  Lats: ['Upper Lats', 'Lower Lats'],
  'Lower Back': ['Erector Spinae'],
  'Front Delts': ['Front Delts'],
  'Side Delts': ['Side Delts'],
  'Rear Delts': ['Rear Delts'],
  Traps: ['Upper Traps', 'Mid Traps'],
  Neck: [],
}

export interface Exercise {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  notes: string
  createdAt: string
  libraryId?: string
  description?: string
  customImages?: string[]
}

export interface LibraryExercise {
  id: string
  name: string
  category: string
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  instructions: string[]
  equipment: string | null
  level: 'beginner' | 'intermediate' | 'expert'
  force: 'push' | 'pull' | 'static' | null
  mechanic: 'compound' | 'isolation' | null
  imageFolder: string
  imageCount: number
}

function expandMuscle(name: string): MuscleGroup[] {
  if (name in MIGRATION_MAP) return MIGRATION_MAP[name]
  if (MUSCLE_GROUPS.includes(name as MuscleGroup)) return [name as MuscleGroup]
  return []
}

export function migrateExercise(ex: Exercise): Exercise {
  const needsMigration =
    !ex.primaryMuscles ||
    ex.primaryMuscles.some((m) => !MUSCLE_GROUPS.includes(m)) ||
    (ex.muscleGroups ?? []).some((m) => !MUSCLE_GROUPS.includes(m))

  if (!needsMigration) return ex

  const oldPrimary = ex.primaryMuscles ?? ex.muscleGroups ?? []
  const oldSecondary = ex.secondaryMuscles ?? []

  const newPrimary = [...new Set(oldPrimary.flatMap((m) => expandMuscle(m)))]
  const newSecondary = [...new Set(oldSecondary.flatMap((m) => expandMuscle(m)))]

  return {
    ...ex,
    primaryMuscles: newPrimary,
    secondaryMuscles: newSecondary,
    muscleGroups: [...newPrimary, ...newSecondary],
  }
}

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure'

export interface SetEntry {
  reps: number
  weight: number
  unit: 'kg' | 'lbs'
  done?: boolean
  type?: SetType
}

export interface SessionExerciseEntry {
  exerciseId: string
  sets: SetEntry[]
  repRange?: string
  finished?: boolean
}

export interface Session {
  id: string
  date: string
  label: string
  entries: SessionExerciseEntry[]
  durationSeconds?: number
}

export type Tab = 'dashboard' | 'exercises' | 'train' | 'history' | 'nutrition'

// ─── Music types ───

export interface MediaItem {
  mediaId: string
  title: string | null
  subtitle: string | null
  iconUri: string | null
  browsable: boolean
  playable: boolean
}

export interface QueueItem {
  queueId: number
  mediaId: string | null
  title: string | null
  subtitle: string | null
}

export interface FullMediaMetadata {
  title: string | null
  artist: string | null
  album: string | null
  duration: number
  position: number
  albumArtUri: string | null
  isPlaying: boolean
  hasPermission: boolean
  shuffleMode: boolean
  repeatMode: 'off' | 'one' | 'all'
}

// ─── Wiki / Library types ───

export interface WikiExerciseTemplate {
  name: string
  category: string
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  notes?: string
}

export interface WikiPlanExercise {
  name: string
  sets: number
  reps: string
  notes?: string
}

export interface WikiPlanDay {
  label: string
  focus: string
  exercises: WikiPlanExercise[]
}

export interface WikiPlan {
  id: string
  name: string
  shortName: string
  description: string
  frequency: string
  level: string
  days: WikiPlanDay[]
}

// ─── Saved plans ───

export interface SavedPlanDay {
  label: string
  focus: string
  exerciseIds: string[]
  defaults: { exerciseId: string; sets: number; reps: string }[]
}

export interface SavedPlan {
  id: string
  name: string
  days: SavedPlanDay[]
  currentDayIndex: number
  createdAt: string
}

// ─── Shareable plan format ───

export interface ShareablePlan {
  version: 1
  plan: {
    name: string
    description: string
    frequency: string
    level: string
    days: WikiPlanDay[]
  }
  exercises: WikiExerciseTemplate[]
}

// ─── Nutrition / Calorie tracking ───

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'
export type GoalType = 'cut' | 'maintain' | 'bulk'

export interface FoodEntry {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  mealType: MealType
  volumeMl?: number
  date: string
  createdAt: string
}

export interface WeightEntry {
  id: string
  weight: number
  unit: 'kg' | 'lbs'
  date: string
  createdAt: string
}

export interface WaterEntry {
  id: string
  amountMl: number
  date: string
  createdAt: string
}

export interface NutritionGoal {
  dailyCalories: number
  dailyProtein: number
  dailyCarbs: number
  dailyFat: number
  dailyWaterMl: number
  goalType: GoalType
  eatBackPerc: number // % of exercise calories to add back (default 50)
  proteinPerKg?: number // e.g. 2.0 — stored for GoalSetup to recalculate on weight change
}

export interface ActivityEntry {
  id: string
  name: string
  caloriesBurned: number
  durationMins: number
  date: string
  createdAt: string
}
