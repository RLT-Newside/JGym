// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

export interface RepRangeMap {
  target: number
  min: number
  max: number
}

export const DEFAULT_REP_RANGES: RepRangeMap[] = [
  { target: 8, min: 5, max: 8 },
  { target: 10, min: 6, max: 10 },
  { target: 12, min: 6, max: 12 },
  { target: 15, min: 12, max: 15 },
]

const STORAGE_KEY = 'gym_rep_ranges'

export function loadRepRanges(): RepRangeMap[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_REP_RANGES
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REP_RANGES
  } catch {
    return DEFAULT_REP_RANGES
  }
}

export function saveRepRanges(ranges: RepRangeMap[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges))
}

export function getRepRange(targetReps: number, ranges?: RepRangeMap[]): { min: number; max: number } | null {
  const list = ranges ?? loadRepRanges()
  const match = list.find((r) => r.target === targetReps)
  if (match) return { min: match.min, max: match.max }
  const closest = list.reduce((prev, curr) =>
    Math.abs(curr.target - targetReps) < Math.abs(prev.target - targetReps) ? curr : prev,
  )
  if (Math.abs(closest.target - targetReps) <= 2) return { min: closest.min, max: closest.max }
  return null
}

export function getProgressionTip(
  reps: number,
  range: { min: number; max: number },
): { text: string; type: 'success' | 'warning' | 'info' } | null {
  if (reps < 1) return null
  if (reps >= range.max) return { text: 'Hit target! Increase weight next session', type: 'success' }
  if (reps < range.min) return { text: 'Below range – try lighter weight', type: 'warning' }
  return null
}
