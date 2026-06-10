// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useMemo } from 'react'
import { useStreak } from '../../hooks/usePR'
import type { Exercise, Session } from '../../types'
import { todayISO } from '../../utils/format'
import { sortExercisesByFrequency } from '../../utils/pr'
import { DashboardView } from './dashboard.view'

interface Props {
  exercises: Exercise[]
  sessions: Session[]
  onExerciseClick: (exercise: Exercise) => void
}

export function Dashboard({ exercises, sessions, onExerciseClick }: Props) {
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
      onExerciseClick={onExerciseClick}
    />
  )
}
