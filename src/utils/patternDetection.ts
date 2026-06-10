// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { Exercise, SavedPlan, Session } from '../types'

const DISMISSED_KEY = 'gym_pattern_dismissed'
const MIN_OCCURRENCES = 3
const LOOKBACK_DAYS = 60

function clusterKey(ids: string[]): string {
  return [...ids].sort().join(',')
}

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function dismissPattern(exerciseIds: string[]): void {
  const dismissed = getDismissed()
  dismissed.add(clusterKey(exerciseIds))
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]))
}

export function detectPattern(
  sessions: Session[],
  savedPlans: SavedPlan[],
  exercises: Exercise[],
): { exerciseIds: string[]; exerciseNames: string[] } | null {
  const cutoff = Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  const recent = sessions.filter((s) => new Date(s.date).getTime() >= cutoff)

  if (recent.length < MIN_OCCURRENCES) return null

  // Count frequency of each exercise cluster
  const freq = new Map<string, string[]>()
  for (const session of recent) {
    const ids = session.entries.map((e) => e.exerciseId)
    if (ids.length < 2) continue
    const key = clusterKey(ids)
    if (!freq.has(key)) freq.set(key, ids)
  }

  const counts = new Map<string, number>()
  for (const session of recent) {
    const ids = session.entries.map((e) => e.exerciseId)
    if (ids.length < 2) continue
    const key = clusterKey(ids)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  // Find most frequent cluster that meets threshold
  let bestKey: string | null = null
  let bestCount = 0
  for (const [key, count] of counts) {
    if (count >= MIN_OCCURRENCES && count > bestCount) {
      bestKey = key
      bestCount = count
    }
  }

  if (!bestKey) return null

  const exerciseIds = freq.get(bestKey)!
  const dismissed = getDismissed()
  if (dismissed.has(bestKey)) return null

  // Check if already covered by a saved plan
  const planExerciseSets = savedPlans.map((p) => new Set(p.days.flatMap((d) => d.exerciseIds)))
  const _clusterSet = new Set(exerciseIds)
  for (const planSet of planExerciseSets) {
    const overlap = exerciseIds.filter((id) => planSet.has(id)).length
    if (overlap / exerciseIds.length >= 0.8) return null
  }

  const exerciseNames = exerciseIds
    .map((id) => exercises.find((e) => e.id === id)?.name)
    .filter((n): n is string => !!n)

  return { exerciseIds, exerciseNames }
}
