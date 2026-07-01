// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { loadLibrary } from '../data/freeExerciseDb'
import { useBackButton } from '../hooks/useBackButton'
import { useSharedImport } from '../hooks/useSharedImport'
import { useStorage } from '../hooks/useStorage'
import { type Theme, useTheme } from '../hooks/useTheme'
import {
  type ActivityEntry,
  type Exercise,
  type FoodEntry,
  migrateExercise,
  type NutritionGoal,
  type SavedPlan,
  type Session,
  type Tab,
  type WaterEntry,
  type WeightEntry,
} from '../types'
import { mergeBackup } from '../utils/backup'
import { relinkLibraryIds } from '../utils/relinkImages'

export interface AppData {
  // Persisted domain data.
  exercises: Exercise[]
  sessions: Session[]
  savedPlans: SavedPlan[]
  foodEntries: FoodEntry[]
  waterEntries: WaterEntry[]
  weightEntries: WeightEntry[]
  activityEntries: ActivityEntry[]
  nutritionGoal: NutritionGoal
  musicPopupDisabled: boolean
  // Theme / supporter (from useTheme).
  theme: Theme
  setTheme: (t: Theme) => void
  isSupporter: boolean
  tryActivate: (code: string) => Promise<boolean>
  revoke: () => void
  // Navigation / cross-page UI state.
  tab: Tab
  setTab: (t: Tab) => void
  settingsOpen: boolean
  setSettingsOpen: (v: boolean) => void
  detailExercise: Exercise | null
  setDetailExercise: (e: Exercise | null) => void
  preSelectedExercise: Exercise | null
  sharedImport: Record<string, unknown> | null
  setSharedImport: (d: Record<string, unknown> | null) => void
  startWith: (exercise: Exercise) => void
  navigateToExercises: () => void
  clearPreSelected: () => void
  exerciseClick: (exercise: Exercise) => void
  // CRUD handlers.
  saveExercise: (exercise: Exercise) => void
  deleteExercise: (id: string) => void
  importExercises: (incoming: Exercise[], mode: 'merge' | 'replace') => void
  sessionSave: (session: Session) => void
  deleteSession: (id: string) => void
  updateSession: (session: Session) => void
  savePlan: (plan: SavedPlan) => void
  updatePlan: (plan: SavedPlan) => void
  deletePlan: (id: string) => void
  advancePlanDay: (planId: string, nextIndex: number) => void
  addFood: (entry: FoodEntry) => void
  deleteFood: (id: string) => void
  addWater: (entry: WaterEntry) => void
  deleteWater: (id: string) => void
  addWeight: (entry: WeightEntry) => void
  deleteWeight: (id: string) => void
  addActivity: (entry: ActivityEntry) => void
  deleteActivity: (id: string) => void
  updateGoal: (goal: NutritionGoal) => void
  setMusicPopupDisabled: (v: boolean) => void
  importBackup: (data: Record<string, unknown>, mode: 'merge' | 'replace') => void
}

export const AppDataContext = createContext<AppData | null>(null)

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider')
  return ctx
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, isSupporter, tryActivate, revoke } = useTheme()

  const [exercises, setExercises] = useStorage<Exercise[]>('gym_exercises', [])
  const [sessions, setSessions] = useStorage<Session[]>('gym_sessions', [])
  const [savedPlans, setSavedPlans] = useStorage<SavedPlan[]>('gym_plans', [])
  const [foodEntries, setFoodEntries] = useStorage<FoodEntry[]>('gym_food', [])
  const [waterEntries, setWaterEntries] = useStorage<WaterEntry[]>('gym_water', [])
  const [weightEntries, setWeightEntries] = useStorage<WeightEntry[]>('gym_weight', [])
  const [nutritionGoal, setNutritionGoal] = useStorage<NutritionGoal>('gym_nutrition_goal', {
    dailyCalories: 2300,
    dailyProtein: 150,
    dailyCarbs: 250,
    dailyFat: 75,
    dailyWaterMl: 2000,
    goalType: 'maintain',
    eatBackPerc: 50,
  })
  const [activityEntries, setActivityEntries] = useStorage<ActivityEntry[]>('gym_activity', [])
  const [musicPopupDisabled, setMusicPopupDisabled] = useStorage<boolean>('gym_music_popup_disabled', false)

  const [tab, setTab] = useState<Tab>(() => {
    try {
      return localStorage.getItem('gym_active_session') ? 'train' : 'dashboard'
    } catch {
      return 'dashboard'
    }
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [preSelectedExercise, setPreSelectedExercise] = useState<Exercise | null>(null)
  const [sharedImport, setSharedImport] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const needsMigration = exercises.some((ex) => !ex.primaryMuscles)
    if (needsMigration) {
      setExercises((prev) => prev.map(migrateExercise))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // One-time forced backfill: link existing exercises to the registry so they
  // gain dataset images. Previously only newly-added exercises got a libraryId.
  // Gated by a flag so it runs once per user; bump the key to re-run. JGYM-10.
  useEffect(() => {
    if (localStorage.getItem('gym_relink_images_v1')) return
    let cancelled = false
    loadLibrary().then((library) => {
      if (cancelled) return
      setExercises((prev) => relinkLibraryIds(prev, library, { force: true }).exercises)
      localStorage.setItem('gym_relink_images_v1', '1')
    })
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useSharedImport(useCallback((data: Record<string, unknown>) => setSharedImport(data), []))

  useBackButton([
    () => {
      if (settingsOpen) {
        setSettingsOpen(false)
        return true
      }
      return false
    },
    () => {
      if (detailExercise) {
        setDetailExercise(null)
        return true
      }
      return false
    },
    () => {
      if (tab !== 'dashboard') {
        setTab('dashboard')
        return true
      }
      return false
    },
  ])

  const saveExercise = useCallback(
    (exercise: Exercise) => {
      setExercises((prev) => {
        const idx = prev.findIndex((e) => e.id === exercise.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = exercise
          return next
        }
        return [...prev, exercise]
      })
    },
    [setExercises],
  )

  const deleteExercise = useCallback(
    (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id)),
    [setExercises],
  )

  const importExercises = useCallback(
    (incoming: Exercise[], mode: 'merge' | 'replace') => {
      if (mode === 'replace') {
        setExercises(incoming)
      } else {
        setExercises((prev) => {
          const existingIds = new Set(prev.map((e) => e.id))
          return [...prev, ...incoming.filter((e) => !existingIds.has(e.id))]
        })
      }
    },
    [setExercises],
  )

  const sessionSave = useCallback((session: Session) => setSessions((prev) => [...prev, session]), [setSessions])
  const deleteSession = useCallback(
    (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    [setSessions],
  )
  const updateSession = useCallback(
    (session: Session) => setSessions((prev) => prev.map((s) => (s.id === session.id ? session : s))),
    [setSessions],
  )

  const savePlan = useCallback((plan: SavedPlan) => setSavedPlans((prev) => [...prev, plan]), [setSavedPlans])
  const deletePlan = useCallback(
    (id: string) => setSavedPlans((prev) => prev.filter((p) => p.id !== id)),
    [setSavedPlans],
  )
  const updatePlan = useCallback(
    (plan: SavedPlan) => setSavedPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p))),
    [setSavedPlans],
  )
  const advancePlanDay = useCallback(
    (planId: string, nextIndex: number) =>
      setSavedPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, currentDayIndex: nextIndex } : p))),
    [setSavedPlans],
  )

  const addFood = useCallback(
    (entry: FoodEntry) => {
      setFoodEntries((prev) => {
        const idx = prev.findIndex((e) => e.id === entry.id)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = entry
          return next
        }
        return [...prev, entry]
      })
    },
    [setFoodEntries],
  )
  const deleteFood = useCallback(
    (id: string) => setFoodEntries((prev) => prev.filter((e) => e.id !== id)),
    [setFoodEntries],
  )

  const addWater = useCallback((entry: WaterEntry) => setWaterEntries((prev) => [...prev, entry]), [setWaterEntries])
  const deleteWater = useCallback(
    (id: string) => setWaterEntries((prev) => prev.filter((e) => e.id !== id)),
    [setWaterEntries],
  )

  const addWeight = useCallback(
    (entry: WeightEntry) => setWeightEntries((prev) => [...prev, entry]),
    [setWeightEntries],
  )
  const deleteWeight = useCallback(
    (id: string) => setWeightEntries((prev) => prev.filter((e) => e.id !== id)),
    [setWeightEntries],
  )

  const updateGoal = useCallback((goal: NutritionGoal) => setNutritionGoal(goal), [setNutritionGoal])

  const addActivity = useCallback(
    (entry: ActivityEntry) => setActivityEntries((prev) => [...prev, entry]),
    [setActivityEntries],
  )
  const deleteActivity = useCallback(
    (id: string) => setActivityEntries((prev) => prev.filter((e) => e.id !== id)),
    [setActivityEntries],
  )

  const importBackup = useCallback(
    (data: Record<string, unknown>, mode: 'merge' | 'replace') => {
      const { exercises: ex, sessions: sess } = mergeBackup(data, mode)
      setExercises(ex as Exercise[])
      setSessions(sess as Session[])
    },
    [setExercises, setSessions],
  )

  const startWith = useCallback((exercise: Exercise) => {
    setPreSelectedExercise(exercise)
    setTab('train')
  }, [])
  const navigateToExercises = useCallback(() => setTab('exercises'), [])
  const clearPreSelected = useCallback(() => setPreSelectedExercise(null), [])
  const exerciseClick = useCallback((exercise: Exercise) => setDetailExercise(exercise), [])

  const value: AppData = {
    exercises,
    sessions,
    savedPlans,
    foodEntries,
    waterEntries,
    weightEntries,
    activityEntries,
    nutritionGoal,
    musicPopupDisabled,
    theme,
    setTheme,
    isSupporter,
    tryActivate,
    revoke,
    tab,
    setTab,
    settingsOpen,
    setSettingsOpen,
    detailExercise,
    setDetailExercise,
    preSelectedExercise,
    sharedImport,
    setSharedImport,
    startWith,
    navigateToExercises,
    clearPreSelected,
    exerciseClick,
    saveExercise,
    deleteExercise,
    importExercises,
    sessionSave,
    deleteSession,
    updateSession,
    savePlan,
    updatePlan,
    deletePlan,
    advancePlanDay,
    addFood,
    deleteFood,
    addWater,
    deleteWater,
    addWeight,
    deleteWeight,
    addActivity,
    deleteActivity,
    updateGoal,
    setMusicPopupDisabled,
    importBackup,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}
