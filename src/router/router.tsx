// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Dashboard } from '../pages/dashboard/dashboard.container'
import { ExerciseList } from '../pages/exercises/exercises.container'
import { HistoryContainer } from '../pages/history/history.container'
import { NutritionContainer } from '../pages/nutrition/nutrition.container'
import { TrainContainer } from '../pages/train/train.container'
import type {
  ActivityEntry,
  Exercise,
  FoodEntry,
  NutritionGoal,
  SavedPlan,
  Session,
  Tab,
  WaterEntry,
  WeightEntry,
} from '../types'

interface Props {
  tab: Tab
  exercises: Exercise[]
  sessions: Session[]
  savedPlans: SavedPlan[]
  foodEntries: FoodEntry[]
  waterEntries: WaterEntry[]
  weightEntries: WeightEntry[]
  activityEntries: ActivityEntry[]
  nutritionGoal: NutritionGoal
  isSupporter: boolean
  preSelectedExercise: Exercise | null
  onSaveExercise: (exercise: Exercise) => void
  onDeleteExercise: (id: string) => void
  onSessionSave: (session: Session) => void
  onDeleteSession: (id: string) => void
  onStartWith: (exercise: Exercise) => void
  onAdvancePlanDay: (planId: string, nextIndex: number) => void
  onNavigateToExercises: () => void
  onClearPreSelected: () => void
  onSavePlan: (plan: SavedPlan) => void
  onUpdatePlan: (plan: SavedPlan) => void
  onDeletePlan: (id: string) => void
  onAddFood: (entry: FoodEntry) => void
  onDeleteFood: (id: string) => void
  onAddWater: (entry: WaterEntry) => void
  onDeleteWater: (id: string) => void
  onAddWeight: (entry: WeightEntry) => void
  onDeleteWeight: (id: string) => void
  onAddActivity: (entry: ActivityEntry) => void
  onDeleteActivity: (id: string) => void
  onUpdateGoal: (goal: NutritionGoal) => void
  onExerciseClick: (exercise: Exercise) => void
}

export function AppRouter({
  tab,
  exercises,
  sessions,
  savedPlans,
  foodEntries,
  waterEntries,
  weightEntries,
  activityEntries,
  nutritionGoal,
  isSupporter,
  preSelectedExercise,
  onSaveExercise,
  onDeleteExercise,
  onSessionSave,
  onDeleteSession,
  onStartWith,
  onAdvancePlanDay,
  onNavigateToExercises,
  onClearPreSelected,
  onSavePlan,
  onUpdatePlan,
  onDeletePlan,
  onAddFood,
  onDeleteFood,
  onAddWater,
  onDeleteWater,
  onAddWeight,
  onDeleteWeight,
  onAddActivity,
  onDeleteActivity,
  onUpdateGoal,
  onExerciseClick,
}: Props) {
  return (
    <main>
      {tab === 'dashboard' && <Dashboard exercises={exercises} sessions={sessions} onExerciseClick={onExerciseClick} />}
      {tab === 'exercises' && (
        <ExerciseList
          exercises={exercises}
          sessions={sessions}
          savedPlans={savedPlans}
          onSave={onSaveExercise}
          onDelete={onDeleteExercise}
          onStartWith={onStartWith}
          onSavePlan={onSavePlan}
          onUpdatePlan={onUpdatePlan}
          onDeletePlan={onDeletePlan}
        />
      )}
      {tab === 'train' && (
        <TrainContainer
          exercises={exercises}
          sessions={sessions}
          savedPlans={savedPlans}
          onSessionSave={onSessionSave}
          onAdvancePlanDay={onAdvancePlanDay}
          onNavigateToExercises={onNavigateToExercises}
          preSelectedExercise={preSelectedExercise}
          onClearPreSelected={onClearPreSelected}
          isSupporter={isSupporter}
          onExerciseClick={onExerciseClick}
        />
      )}
      {tab === 'history' && (
        <HistoryContainer sessions={sessions} exercises={exercises} onDeleteSession={onDeleteSession} />
      )}
      {tab === 'nutrition' && (
        <NutritionContainer
          foodEntries={foodEntries}
          waterEntries={waterEntries}
          weightEntries={weightEntries}
          activityEntries={activityEntries}
          goal={nutritionGoal}
          onAddFood={onAddFood}
          onDeleteFood={onDeleteFood}
          onAddWater={onAddWater}
          onDeleteWater={onDeleteWater}
          onAddWeight={onAddWeight}
          onDeleteWeight={onDeleteWeight}
          onAddActivity={onAddActivity}
          onDeleteActivity={onDeleteActivity}
          onUpdateGoal={onUpdateGoal}
        />
      )}
    </main>
  )
}
