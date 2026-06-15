// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useCallback, useEffect, useState } from 'react'
import { ExerciseDetail } from './components/exercise-detail/exercise-detail'
import { Modal } from './components/modal/modal'
import { PrivacyConsent } from './components/privacy-consent/privacy-consent'
import { SettingsModal } from './components/settings-modal/settings-modal'
import { UpdateBanner } from './components/update-banner/update-banner'
import { useBackButton } from './hooks/useBackButton'
import { useSharedImport } from './hooks/useSharedImport'
import { useStorage } from './hooks/useStorage'
import { useTheme } from './hooks/useTheme'
import { useUpdateCheck } from './hooks/useUpdateCheck'
import { BottomNav } from './layout/bottom-nav/bottom-nav'
import { Header } from './layout/header/header'
import { AppRouter } from './router/router'
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
} from './types'

export default function App() {
  const [privacyAccepted, setPrivacyAccepted] = useState(() => localStorage.getItem('gym_privacy_consent') === 'true')
  const { update, checkNow, checking } = useUpdateCheck()
  const { theme, setTheme, isSupporter, tryActivate, revoke } = useTheme()
  const [tab, setTab] = useState<Tab>(() => {
    try {
      return localStorage.getItem('gym_active_session') ? 'train' : 'dashboard'
    } catch {
      return 'dashboard'
    }
  })
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

  useEffect(() => {
    const needsMigration = exercises.some((ex) => !ex.primaryMuscles)
    if (needsMigration) {
      setExercises((prev) => prev.map(migrateExercise))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [preSelectedExercise, setPreSelectedExercise] = useState<Exercise | null>(null)
  const [sharedImport, setSharedImport] = useState<Record<string, unknown> | null>(null)

  const sharedKeyCount = sharedImport ? Object.keys(sharedImport).filter((k) => k.startsWith('gym_')).length : 0

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

  const handleSaveExercise = useCallback(
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

  const handleDeleteExercise = useCallback(
    (id: string) => setExercises((prev) => prev.filter((e) => e.id !== id)),
    [setExercises],
  )

  const handleSessionSave = useCallback((session: Session) => setSessions((prev) => [...prev, session]), [setSessions])

  const handleDeleteSession = useCallback(
    (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    [setSessions],
  )

  const handleStartWith = useCallback((exercise: Exercise) => {
    setPreSelectedExercise(exercise)
    setTab('train')
  }, [])

  const handleImport = useCallback(
    (data: Record<string, unknown>, mode: 'merge' | 'replace') => {
      if (mode === 'replace') {
        const gymKeys = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('gym_')) gymKeys.push(key)
        }
        gymKeys.forEach((k) => localStorage.removeItem(k))
      }

      for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith('gym_')) continue
        if (mode === 'merge' && (key === 'gym_exercises' || key === 'gym_sessions')) {
          const existing = (() => {
            try {
              return JSON.parse(localStorage.getItem(key) ?? '[]')
            } catch {
              return []
            }
          })()
          const incoming = value as unknown[]
          const existingIds = new Set(existing.map((e: { id: string }) => e.id))
          const merged = [...existing, ...incoming.filter((e: unknown) => !existingIds.has((e as { id: string }).id))]
          localStorage.setItem(key, JSON.stringify(merged))
        } else {
          localStorage.setItem(key, JSON.stringify(value))
        }
      }

      try {
        const ex = JSON.parse(localStorage.getItem('gym_exercises') ?? '[]')
        const sess = JSON.parse(localStorage.getItem('gym_sessions') ?? '[]')
        setExercises(Array.isArray(ex) ? ex : [])
        setSessions(Array.isArray(sess) ? sess : [])
      } catch {
        setExercises([])
        setSessions([])
      }
    },
    [setExercises, setSessions],
  )

  const applySharedImport = useCallback(
    (mode: 'merge' | 'replace') => {
      if (!sharedImport) return
      handleImport(sharedImport, mode)
      setSharedImport(null)
      // handleImport only re-syncs exercises/sessions state; reload so every
      // gym_* key (plans, food, water, weight, goals, activity) re-initializes.
      window.location.reload()
    },
    [sharedImport, handleImport],
  )

  const handleSavePlan = useCallback((plan: SavedPlan) => setSavedPlans((prev) => [...prev, plan]), [setSavedPlans])

  const handleDeletePlan = useCallback(
    (id: string) => setSavedPlans((prev) => prev.filter((p) => p.id !== id)),
    [setSavedPlans],
  )

  const handleUpdatePlan = useCallback(
    (plan: SavedPlan) => setSavedPlans((prev) => prev.map((p) => (p.id === plan.id ? plan : p))),
    [setSavedPlans],
  )

  const handleAdvancePlanDay = useCallback(
    (planId: string, nextIndex: number) =>
      setSavedPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, currentDayIndex: nextIndex } : p))),
    [setSavedPlans],
  )

  const handleImportExercises = useCallback(
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

  const handleAddFood = useCallback(
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

  const handleDeleteFood = useCallback(
    (id: string) => setFoodEntries((prev) => prev.filter((e) => e.id !== id)),
    [setFoodEntries],
  )

  const handleAddWater = useCallback(
    (entry: WaterEntry) => setWaterEntries((prev) => [...prev, entry]),
    [setWaterEntries],
  )

  const handleDeleteWater = useCallback(
    (id: string) => setWaterEntries((prev) => prev.filter((e) => e.id !== id)),
    [setWaterEntries],
  )

  const handleAddWeight = useCallback(
    (entry: WeightEntry) => setWeightEntries((prev) => [...prev, entry]),
    [setWeightEntries],
  )

  const handleDeleteWeight = useCallback(
    (id: string) => setWeightEntries((prev) => prev.filter((e) => e.id !== id)),
    [setWeightEntries],
  )

  const handleUpdateGoal = useCallback((goal: NutritionGoal) => setNutritionGoal(goal), [setNutritionGoal])

  const handleAddActivity = useCallback(
    (entry: ActivityEntry) => setActivityEntries((prev) => [...prev, entry]),
    [setActivityEntries],
  )

  const handleDeleteActivity = useCallback(
    (id: string) => setActivityEntries((prev) => prev.filter((e) => e.id !== id)),
    [setActivityEntries],
  )

  if (!privacyAccepted) {
    return (
      <PrivacyConsent
        onAccept={() => {
          localStorage.setItem('gym_privacy_consent', 'true')
          setPrivacyAccepted(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e8e4dc] pb-16 max-w-lg mx-auto">
      {update && <UpdateBanner version={update.version} url={update.url} />}
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <AppRouter
        tab={tab}
        exercises={exercises}
        sessions={sessions}
        savedPlans={savedPlans}
        foodEntries={foodEntries}
        waterEntries={waterEntries}
        weightEntries={weightEntries}
        activityEntries={activityEntries}
        nutritionGoal={nutritionGoal}
        isSupporter={isSupporter}
        preSelectedExercise={preSelectedExercise}
        onSaveExercise={handleSaveExercise}
        onDeleteExercise={handleDeleteExercise}
        onSessionSave={handleSessionSave}
        onDeleteSession={handleDeleteSession}
        onStartWith={handleStartWith}
        onAdvancePlanDay={handleAdvancePlanDay}
        onNavigateToExercises={() => setTab('exercises')}
        onClearPreSelected={() => setPreSelectedExercise(null)}
        onSavePlan={handleSavePlan}
        onUpdatePlan={handleUpdatePlan}
        onDeletePlan={handleDeletePlan}
        onAddFood={handleAddFood}
        onDeleteFood={handleDeleteFood}
        onAddWater={handleAddWater}
        onDeleteWater={handleDeleteWater}
        onAddWeight={handleAddWeight}
        onDeleteWeight={handleDeleteWeight}
        onAddActivity={handleAddActivity}
        onDeleteActivity={handleDeleteActivity}
        onUpdateGoal={handleUpdateGoal}
        onExerciseClick={setDetailExercise}
      />

      <BottomNav active={tab} onChange={setTab} />

      <ExerciseDetail
        open={!!detailExercise}
        onClose={() => setDetailExercise(null)}
        exercise={detailExercise}
        sessions={sessions}
        onStartWith={handleStartWith}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onImport={handleImport}
        exercises={exercises}
        onImportExercises={handleImportExercises}
        theme={theme}
        onThemeChange={setTheme}
        isSupporter={isSupporter}
        onActivateCode={tryActivate}
        onRevoke={revoke}
        update={update}
        onCheckUpdate={checkNow}
        checkingUpdate={checking}
      />

      <Modal open={!!sharedImport} onClose={() => setSharedImport(null)} title="Import Backup">
        <div className="space-y-4">
          <p className="text-sm text-white/70 leading-relaxed">
            Received a backup with {sharedKeyCount} data {sharedKeyCount === 1 ? 'section' : 'sections'}. Merge keeps
            your current data and adds new entries. Replace overwrites everything with the backup.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applySharedImport('merge')}
              className="flex-1 py-2.5 rounded-xl bg-brand text-black text-sm font-medium hover:opacity-90 transition-opacity press-scale"
            >
              Merge
            </button>
            <button
              type="button"
              onClick={() => applySharedImport('replace')}
              className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors press-scale"
            >
              Replace
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSharedImport(null)}
            className="w-full py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
