import { describe, expect, it } from 'vitest'
import type { Session } from '../types'
import { detectPattern, dismissPattern } from './patternDetection'

const makeSession = (id: string, daysAgo: number, exerciseIds: string[]): Session => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id,
    date: d.toISOString(),
    label: '',
    entries: exerciseIds.map((exerciseId) => ({ exerciseId, sets: [] })),
  }
}

describe('detectPattern', () => {
  it('returns null when fewer than 3 sessions', () => {
    const sessions = [makeSession('s1', 1, ['ex1', 'ex2']), makeSession('s2', 3, ['ex1', 'ex2'])]
    expect(detectPattern(sessions, [], [])).toBeNull()
  })

  it('returns null when no cluster repeats 3+ times', () => {
    const sessions = [
      makeSession('s1', 1, ['ex1', 'ex2']),
      makeSession('s2', 3, ['ex3', 'ex4']),
      makeSession('s3', 5, ['ex5', 'ex6']),
    ]
    expect(detectPattern(sessions, [], [])).toBeNull()
  })

  it('detects repeated exercise cluster', () => {
    const sessions = [
      makeSession('s1', 2, ['ex1', 'ex2']),
      makeSession('s2', 5, ['ex1', 'ex2']),
      makeSession('s3', 8, ['ex1', 'ex2']),
    ]
    const exercises = [
      { id: 'ex1', name: 'Bench', primaryMuscles: [], secondaryMuscles: [], muscleGroups: [] },
      { id: 'ex2', name: 'Squat', primaryMuscles: [], secondaryMuscles: [], muscleGroups: [] },
    ]
    const result = detectPattern(sessions, [], exercises as any)
    expect(result).not.toBeNull()
    expect(result?.exerciseIds.sort()).toEqual(['ex1', 'ex2'].sort())
  })

  it('returns null for dismissed pattern', () => {
    const sessions = [
      makeSession('s1', 2, ['ex1', 'ex2']),
      makeSession('s2', 5, ['ex1', 'ex2']),
      makeSession('s3', 8, ['ex1', 'ex2']),
    ]
    dismissPattern(['ex1', 'ex2'])
    expect(detectPattern(sessions, [], [])).toBeNull()
  })

  it('returns null when pattern already in a saved plan', () => {
    const sessions = [
      makeSession('s1', 2, ['ex1', 'ex2']),
      makeSession('s2', 5, ['ex1', 'ex2']),
      makeSession('s3', 8, ['ex1', 'ex2']),
    ]
    const plans = [
      {
        id: 'p1',
        name: 'My Plan',
        currentDayIndex: 0,
        days: [{ label: 'Day 1', focus: '', exerciseIds: ['ex1', 'ex2'], defaults: [] }],
      },
    ]
    expect(detectPattern(sessions, plans as any, [])).toBeNull()
  })
})

describe('dismissPattern', () => {
  it('persists dismissed pattern to localStorage', () => {
    dismissPattern(['ex1', 'ex2'])
    const raw = localStorage.getItem('gym_pattern_dismissed')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).toContain('ex1,ex2')
  })

  it('dismissing same pattern twice does not duplicate', () => {
    dismissPattern(['ex1', 'ex2'])
    dismissPattern(['ex1', 'ex2'])
    const raw = JSON.parse(localStorage.getItem('gym_pattern_dismissed') ?? '[]')
    expect(raw.filter((k: string) => k === 'ex1,ex2')).toHaveLength(1)
  })
})
