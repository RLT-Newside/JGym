// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

/**
 * Sample data for demo mode. Built fresh (with dates relative to "now") each
 * time demo mode is entered, so the app always looks lived-in for a demo:
 * populated dashboard stats, exercise history, PRs, progression charts, a saved
 * plan, and nutrition/weight logs.
 *
 * Nothing here is written to the user's real storage — see src/data/store.ts.
 */

import type {
  ActivityEntry,
  Exercise,
  FoodEntry,
  MuscleGroup,
  NutritionGoal,
  SavedPlan,
  Session,
  WaterEntry,
  WeightEntry,
} from '../types'
import { STORAGE_KEYS } from './storage'

const DAY_MS = 24 * 60 * 60 * 1000

function daysAgo(n: number, hour = 18): string {
  const d = new Date(Date.now() - n * DAY_MS)
  d.setHours(hour, 15, 0, 0)
  return d.toISOString()
}

// ─── Exercises (real library ids → bundled images) ───

type DemoExercise = Pick<Exercise, 'id' | 'name' | 'primaryMuscles' | 'secondaryMuscles'>

const DEMO_EXERCISES: DemoExercise[] = [
  {
    id: 'Dumbbell_Bench_Press',
    name: 'Dumbbell Bench Press',
    primaryMuscles: ['Mid Chest', 'Lower Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps Long Head', 'Triceps Lateral Head'],
  },
  {
    id: 'Standing_Military_Press',
    name: 'Standing Military Press',
    primaryMuscles: ['Front Delts', 'Side Delts'],
    secondaryMuscles: ['Triceps Long Head', 'Triceps Lateral Head'],
  },
  {
    id: 'Triceps_Pushdown',
    name: 'Triceps Pushdown',
    primaryMuscles: ['Triceps Long Head', 'Triceps Lateral Head', 'Triceps Medial Head'],
    secondaryMuscles: [],
  },
  {
    id: 'Pullups',
    name: 'Pullups',
    primaryMuscles: ['Upper Lats', 'Lower Lats'],
    secondaryMuscles: ['Biceps Long Head', 'Biceps Short Head', 'Rhomboids', 'Mid Traps'],
  },
  {
    id: 'Bent_Over_Barbell_Row',
    name: 'Bent Over Barbell Row',
    primaryMuscles: ['Rhomboids', 'Mid Traps'],
    secondaryMuscles: ['Upper Lats', 'Lower Lats', 'Biceps Long Head'],
  },
  {
    id: 'Barbell_Curl',
    name: 'Barbell Curl',
    primaryMuscles: ['Biceps Long Head', 'Biceps Short Head'],
    secondaryMuscles: ['Brachioradialis', 'Wrist Flexors'],
  },
  {
    id: 'Barbell_Squat',
    name: 'Barbell Squat',
    primaryMuscles: ['Rectus Femoris', 'Vastus Lateralis', 'Vastus Medialis'],
    secondaryMuscles: ['Gluteus Maximus', 'Biceps Femoris', 'Erector Spinae'],
  },
  {
    id: 'Barbell_Deadlift',
    name: 'Barbell Deadlift',
    primaryMuscles: ['Erector Spinae'],
    secondaryMuscles: ['Gluteus Maximus', 'Biceps Femoris', 'Upper Lats', 'Upper Traps'],
  },
]

function buildExercises(): Exercise[] {
  return DEMO_EXERCISES.map((e) => ({
    id: e.id,
    name: e.name,
    muscleGroups: [...e.primaryMuscles, ...e.secondaryMuscles] as MuscleGroup[],
    primaryMuscles: e.primaryMuscles,
    secondaryMuscles: e.secondaryMuscles,
    notes: '',
    createdAt: daysAgo(45),
    libraryId: e.id,
  }))
}

// ─── Sessions (progressive, so PRs and progression charts populate) ───

const KG = 'kg' as const

function set(reps: number, weight: number) {
  return { reps, weight, unit: KG, done: true, type: 'normal' as const }
}

function entry(
  exerciseId: string,
  sets: { reps: number; weight: number; unit: 'kg'; done: boolean; type: 'normal' }[],
) {
  return { exerciseId, sets, finished: true }
}

interface DemoSessionSpec {
  day: number
  label: string
  entries: ReturnType<typeof entry>[]
  durationSeconds: number
}

// Three-day Push / Pull / Legs rotation across ~18 days, weights creeping up.
const SESSION_SPECS: DemoSessionSpec[] = [
  {
    day: 18,
    label: 'Push Day',
    durationSeconds: 3720,
    entries: [
      entry('Dumbbell_Bench_Press', [set(10, 28), set(9, 28), set(8, 30)]),
      entry('Standing_Military_Press', [set(10, 40), set(9, 40), set(8, 42.5)]),
      entry('Triceps_Pushdown', [set(14, 25), set(12, 27.5), set(11, 27.5)]),
    ],
  },
  {
    day: 16,
    label: 'Pull Day',
    durationSeconds: 3540,
    entries: [
      entry('Pullups', [set(9, 0), set(8, 0), set(7, 0)]),
      entry('Bent_Over_Barbell_Row', [set(10, 60), set(10, 60), set(9, 65)]),
      entry('Barbell_Curl', [set(12, 30), set(10, 32.5), set(9, 32.5)]),
    ],
  },
  {
    day: 14,
    label: 'Leg Day',
    durationSeconds: 4020,
    entries: [
      entry('Barbell_Squat', [set(8, 90), set(8, 90), set(7, 95)]),
      entry('Barbell_Deadlift', [set(6, 120), set(5, 125), set(5, 125)]),
    ],
  },
  {
    day: 11,
    label: 'Push Day',
    durationSeconds: 3660,
    entries: [
      entry('Dumbbell_Bench_Press', [set(10, 30), set(9, 30), set(8, 32)]),
      entry('Standing_Military_Press', [set(10, 42.5), set(9, 42.5), set(8, 45)]),
      entry('Triceps_Pushdown', [set(14, 27.5), set(12, 30), set(11, 30)]),
    ],
  },
  {
    day: 9,
    label: 'Pull Day',
    durationSeconds: 3480,
    entries: [
      entry('Pullups', [set(10, 0), set(9, 0), set(8, 0)]),
      entry('Bent_Over_Barbell_Row', [set(10, 65), set(10, 65), set(9, 70)]),
      entry('Barbell_Curl', [set(12, 32.5), set(10, 35), set(9, 35)]),
    ],
  },
  {
    day: 6,
    label: 'Leg Day',
    durationSeconds: 4140,
    entries: [
      entry('Barbell_Squat', [set(8, 95), set(8, 97.5), set(7, 100)]),
      entry('Barbell_Deadlift', [set(6, 125), set(5, 130), set(5, 132.5)]),
    ],
  },
  {
    day: 2,
    label: 'Push Day',
    durationSeconds: 3600,
    entries: [
      entry('Dumbbell_Bench_Press', [set(10, 32), set(9, 32), set(8, 34)]),
      entry('Standing_Military_Press', [set(10, 45), set(9, 45), set(8, 47.5)]),
      entry('Triceps_Pushdown', [set(15, 30), set(13, 32.5), set(11, 32.5)]),
    ],
  },
]

function buildSessions(): Session[] {
  return SESSION_SPECS.map((spec, i) => ({
    id: `demo-session-${i}`,
    date: daysAgo(spec.day),
    label: spec.label,
    entries: spec.entries,
    durationSeconds: spec.durationSeconds,
  }))
}

// ─── Saved plan (Push / Pull / Legs) ───

function buildPlans(): SavedPlan[] {
  return [
    {
      id: 'demo-plan-ppl',
      name: 'Push / Pull / Legs',
      currentDayIndex: 1,
      createdAt: daysAgo(45),
      days: [
        {
          label: 'Push',
          focus: 'Chest · Shoulders · Triceps',
          exerciseIds: ['Dumbbell_Bench_Press', 'Standing_Military_Press', 'Triceps_Pushdown'],
          defaults: [
            { exerciseId: 'Dumbbell_Bench_Press', sets: 3, reps: '8-10' },
            { exerciseId: 'Standing_Military_Press', sets: 3, reps: '8-10' },
            { exerciseId: 'Triceps_Pushdown', sets: 3, reps: '12-15' },
          ],
        },
        {
          label: 'Pull',
          focus: 'Back · Biceps',
          exerciseIds: ['Pullups', 'Bent_Over_Barbell_Row', 'Barbell_Curl'],
          defaults: [
            { exerciseId: 'Pullups', sets: 3, reps: '8-10' },
            { exerciseId: 'Bent_Over_Barbell_Row', sets: 3, reps: '8-10' },
            { exerciseId: 'Barbell_Curl', sets: 3, reps: '10-12' },
          ],
        },
        {
          label: 'Legs',
          focus: 'Quads · Hamstrings · Glutes',
          exerciseIds: ['Barbell_Squat', 'Barbell_Deadlift'],
          defaults: [
            { exerciseId: 'Barbell_Squat', sets: 3, reps: '6-8' },
            { exerciseId: 'Barbell_Deadlift', sets: 3, reps: '5' },
          ],
        },
      ],
    },
  ]
}

// ─── Weight (gentle downtrend over ~6 weeks) ───

function buildWeights(): WeightEntry[] {
  const points: [number, number][] = [
    [42, 82.4],
    [35, 82.0],
    [28, 81.6],
    [21, 81.3],
    [14, 80.9],
    [9, 80.6],
    [4, 80.3],
    [1, 80.1],
  ]
  return points.map(([day, weight], i) => ({
    id: `demo-weight-${i}`,
    weight,
    unit: KG,
    date: daysAgo(day, 8),
    createdAt: daysAgo(day, 8),
  }))
}

// ─── Nutrition (today + yesterday) ───

function buildFood(): FoodEntry[] {
  const mk = (
    i: number,
    name: string,
    cals: number,
    p: number,
    c: number,
    f: number,
    meal: FoodEntry['mealType'],
    day: number,
  ): FoodEntry => ({
    id: `demo-food-${day}-${i}`,
    name,
    calories: cals,
    protein: p,
    carbs: c,
    fat: f,
    mealType: meal,
    date: daysAgo(day, 12),
    createdAt: daysAgo(day, 12),
  })
  return [
    mk(0, 'Oats & Whey', 480, 38, 62, 10, 'breakfast', 0),
    mk(1, 'Chicken Rice Bowl', 620, 52, 70, 14, 'lunch', 0),
    mk(2, 'Greek Yogurt', 180, 20, 12, 4, 'snack', 0),
    mk(3, 'Salmon & Potatoes', 640, 44, 48, 26, 'dinner', 0),
    mk(0, 'Eggs & Toast', 420, 26, 34, 18, 'breakfast', 1),
    mk(1, 'Turkey Wrap', 540, 40, 52, 16, 'lunch', 1),
    mk(2, 'Beef Stir-fry', 610, 46, 44, 24, 'dinner', 1),
  ]
}

function buildWater(): WaterEntry[] {
  return [
    { id: 'demo-water-0', amountMl: 500, date: daysAgo(0, 9), createdAt: daysAgo(0, 9) },
    { id: 'demo-water-1', amountMl: 500, date: daysAgo(0, 13), createdAt: daysAgo(0, 13) },
    { id: 'demo-water-2', amountMl: 750, date: daysAgo(0, 17), createdAt: daysAgo(0, 17) },
  ]
}

function buildActivity(): ActivityEntry[] {
  return [
    {
      id: 'demo-activity-0',
      name: 'Morning Run',
      caloriesBurned: 320,
      durationMins: 32,
      date: daysAgo(0, 7),
      createdAt: daysAgo(0, 7),
    },
  ]
}

const DEMO_GOAL: NutritionGoal = {
  dailyCalories: 2100,
  dailyProtein: 165,
  dailyCarbs: 210,
  dailyFat: 65,
  dailyWaterMl: 2500,
  goalType: 'cut',
  eatBackPerc: 50,
  proteinPerKg: 2,
}

/** Build the full demo dataset as a map of storage keys → JSON strings. */
export function buildDemoSeed(): Record<string, string> {
  return {
    [STORAGE_KEYS.exercises]: JSON.stringify(buildExercises()),
    [STORAGE_KEYS.sessions]: JSON.stringify(buildSessions()),
    [STORAGE_KEYS.plans]: JSON.stringify(buildPlans()),
    [STORAGE_KEYS.food]: JSON.stringify(buildFood()),
    [STORAGE_KEYS.water]: JSON.stringify(buildWater()),
    [STORAGE_KEYS.weight]: JSON.stringify(buildWeights()),
    [STORAGE_KEYS.activity]: JSON.stringify(buildActivity()),
    [STORAGE_KEYS.nutritionGoal]: JSON.stringify(DEMO_GOAL),
    // Skip the one-time image relink migration in demo so it doesn't run.
    [STORAGE_KEYS.relinkImagesV1]: '1',
  }
}
