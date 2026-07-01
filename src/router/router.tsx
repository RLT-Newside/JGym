// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useAppData } from '../context/app-data'
import { Dashboard } from '../pages/dashboard/dashboard.container'
import { ExerciseList } from '../pages/exercises/exercises.container'
import { HistoryContainer } from '../pages/history/history.container'
import { NutritionContainer } from '../pages/nutrition/nutrition.container'
import { TrainContainer } from '../pages/train/train.container'

export function AppRouter() {
  const { tab } = useAppData()
  return (
    <main>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'exercises' && <ExerciseList />}
      {tab === 'train' && <TrainContainer />}
      {tab === 'history' && <HistoryContainer />}
      {tab === 'nutrition' && <NutritionContainer />}
    </main>
  )
}
