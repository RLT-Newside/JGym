// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { Exercise, Session, SetEntry } from '../types'

export interface PR {
  weight: number
  reps: number
  unit: 'kg' | 'lbs'
}

export function calculatePR(exerciseId: string, sessions: Session[], progressResetAt?: string): PR | null {
  const resetTime = progressResetAt ? new Date(progressResetAt).getTime() : 0
  let best: PR | null = null

  for (const session of sessions) {
    if (resetTime > 0 && new Date(session.date).getTime() <= resetTime) continue
    for (const entry of session.entries) {
      if (entry.exerciseId !== exerciseId) continue
      for (const set of entry.sets) {
        if (!best || set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
          best = { weight: set.weight, reps: set.reps, unit: set.unit }
        }
      }
    }
  }

  return best
}

export function formatPR(pr: PR | null): string {
  if (!pr) return '—'
  return `${pr.reps} × ${pr.weight}${pr.unit}`
}

export function getLastSession(
  exerciseId: string,
  sessions: Session[],
  progressResetAt?: string,
): { date: string; sets: SetEntry[] } | null {
  const resetTime = progressResetAt ? new Date(progressResetAt).getTime() : 0
  const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  for (const session of sorted) {
    if (resetTime > 0 && new Date(session.date).getTime() <= resetTime) continue
    const entry = session.entries.find((e) => e.exerciseId === exerciseId)
    if (entry) return { date: session.date, sets: entry.sets }
  }
  return null
}

// Counts how many sessions each exercise appears in.
export function getExerciseFrequency(sessions: Session[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const session of sessions) {
    const seen = new Set<string>()
    for (const entry of session.entries) {
      if (seen.has(entry.exerciseId)) continue
      seen.add(entry.exerciseId)
      counts.set(entry.exerciseId, (counts.get(entry.exerciseId) ?? 0) + 1)
    }
  }
  return counts
}

// Orders exercises by how often they are trained (most frequent first),
// keeping the original order as a stable tiebreaker for equal counts.
export function sortExercisesByFrequency(exercises: Exercise[], sessions: Session[]): Exercise[] {
  const counts = getExerciseFrequency(sessions)
  return exercises
    .map((exercise, index) => ({ exercise, index, count: counts.get(exercise.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.index - b.index)
    .map((item) => item.exercise)
}
