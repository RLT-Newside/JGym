// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useMemo } from 'react'
import { useAppData } from '../../context/app-data'
import { useStreak } from '../../hooks/usePR'
import { todayISO } from '../../utils/format'
import { sortExercisesByFrequency } from '../../utils/pr'
import { DashboardView } from './dashboard.view'

export function Dashboard() {
  const { exercises, sessions, exerciseClick } = useAppData()
  const streak = useStreak(sessions)
  const totalExerciseSets = sessions.reduce((sum, s) => sum + s.entries.reduce((es, e) => es + e.sets.length, 0), 0)
  const sortedExercises = useMemo(() => sortExercisesByFrequency(exercises, sessions), [exercises, sessions])

  return (
    <DashboardView
      exercises={sortedExercises}
      sessions={sessions}
      streak={streak}
      totalExerciseSets={totalExerciseSets}
      todayISO={todayISO()}
      onExerciseClick={exerciseClick}
    />
  )
}
