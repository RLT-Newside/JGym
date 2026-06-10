// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useMemo } from 'react'
import type { Session } from '../types'
import { calculatePR, type PR } from '../utils/pr'

export function usePR(exerciseId: string, sessions: Session[]): PR | null {
  return useMemo(() => calculatePR(exerciseId, sessions), [exerciseId, sessions])
}

export function useStreak(sessions: Session[]): number {
  return useMemo(() => {
    if (sessions.length === 0) return 0

    const dates = new Set(sessions.map((s) => new Date(s.date).toISOString().split('T')[0]))
    const sortedDates = [...dates].sort().reverse()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkDate = new Date(sortedDates[0])
    checkDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 1 || diffDays < 0) return 0

    let streak = 1
    for (let i = 1; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i - 1])
      const prev = new Date(sortedDates[i])
      const diff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) streak++
      else break
    }
    return streak
  }, [sessions])
}
