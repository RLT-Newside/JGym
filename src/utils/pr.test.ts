import { describe, expect, it } from 'vitest'
import type { Exercise, Session } from '../types'
import { calculatePR, formatPR, getExerciseFrequency, getLastSession, sortExercisesByFrequency } from './pr'

const makeExercise = (id: string): Exercise => ({
  id,
  name: id,
  primaryMuscles: [],
  secondaryMuscles: [],
  muscleGroups: [],
  notes: '',
  createdAt: '2024-01-01',
})

const makeMultiSession = (id: string, exerciseIds: string[]): Session => ({
  id,
  date: '2024-01-01',
  label: '',
  entries: exerciseIds.map((exerciseId) => ({ exerciseId, sets: [{ reps: 5, weight: 50, unit: 'kg' as const }] })),
})

const makeSession = (
  id: string,
  date: string,
  exerciseId: string,
  sets: { reps: number; weight: number }[],
): Session => ({
  id,
  date,
  label: '',
  entries: [{ exerciseId, sets: sets.map((s) => ({ ...s, unit: 'kg' as const })) }],
})

describe('calculatePR', () => {
  it('returns null for empty sessions', () => {
    expect(calculatePR('ex1', [])).toBeNull()
  })

  it('returns null when exercise not in sessions', () => {
    const sessions = [makeSession('s1', '2024-01-01', 'ex2', [{ reps: 10, weight: 50 }])]
    expect(calculatePR('ex1', sessions)).toBeNull()
  })

  it('picks heaviest set as PR', () => {
    const sessions = [
      makeSession('s1', '2024-01-01', 'ex1', [
        { reps: 10, weight: 50 },
        { reps: 8, weight: 60 },
      ]),
    ]
    expect(calculatePR('ex1', sessions)).toEqual({ weight: 60, reps: 8, unit: 'kg' })
  })

  it('picks more reps as tiebreaker when weight equal', () => {
    const sessions = [
      makeSession('s1', '2024-01-01', 'ex1', [{ reps: 8, weight: 60 }]),
      makeSession('s2', '2024-01-02', 'ex1', [{ reps: 12, weight: 60 }]),
    ]
    expect(calculatePR('ex1', sessions)).toEqual({ weight: 60, reps: 12, unit: 'kg' })
  })

  it('finds PR across multiple sessions', () => {
    const sessions = [
      makeSession('s1', '2024-01-01', 'ex1', [{ reps: 10, weight: 50 }]),
      makeSession('s2', '2024-01-02', 'ex1', [{ reps: 8, weight: 80 }]),
      makeSession('s3', '2024-01-03', 'ex1', [{ reps: 6, weight: 70 }]),
    ]
    expect(calculatePR('ex1', sessions)).toEqual({ weight: 80, reps: 8, unit: 'kg' })
  })
})

describe('formatPR', () => {
  it('returns dash for null', () => {
    expect(formatPR(null)).toBe('—')
  })

  it('formats PR as reps × weightunit', () => {
    expect(formatPR({ weight: 100, reps: 5, unit: 'kg' })).toBe('5 × 100kg')
    expect(formatPR({ weight: 225, reps: 3, unit: 'lbs' })).toBe('3 × 225lbs')
  })
})

describe('getLastSession', () => {
  it('returns null when no sessions contain exercise', () => {
    const sessions = [makeSession('s1', '2024-01-01', 'ex2', [{ reps: 5, weight: 50 }])]
    expect(getLastSession('ex1', sessions)).toBeNull()
  })

  it('returns most recent session with exercise', () => {
    const sessions = [
      makeSession('s1', '2024-01-01', 'ex1', [{ reps: 5, weight: 50 }]),
      makeSession('s2', '2024-01-03', 'ex1', [{ reps: 8, weight: 60 }]),
      makeSession('s3', '2024-01-02', 'ex1', [{ reps: 6, weight: 55 }]),
    ]
    const result = getLastSession('ex1', sessions)
    expect(result?.date).toBe('2024-01-03')
    expect(result?.sets[0].weight).toBe(60)
  })
})

describe('getExerciseFrequency', () => {
  it('returns empty map for no sessions', () => {
    expect(getExerciseFrequency([]).size).toBe(0)
  })

  it('counts sessions per exercise', () => {
    const sessions = [
      makeMultiSession('s1', ['ex1', 'ex2']),
      makeMultiSession('s2', ['ex1']),
      makeMultiSession('s3', ['ex1', 'ex3']),
    ]
    const counts = getExerciseFrequency(sessions)
    expect(counts.get('ex1')).toBe(3)
    expect(counts.get('ex2')).toBe(1)
    expect(counts.get('ex3')).toBe(1)
  })

  it('counts an exercise once per session even if it appears in multiple entries', () => {
    const sessions = [makeMultiSession('s1', ['ex1', 'ex1'])]
    expect(getExerciseFrequency(sessions).get('ex1')).toBe(1)
  })
})

describe('sortExercisesByFrequency', () => {
  it('orders most-trained exercises first', () => {
    const exercises = [makeExercise('ex1'), makeExercise('ex2'), makeExercise('ex3')]
    const sessions = [makeMultiSession('s1', ['ex2']), makeMultiSession('s2', ['ex2']), makeMultiSession('s3', ['ex3'])]
    const sorted = sortExercisesByFrequency(exercises, sessions)
    expect(sorted.map((e) => e.id)).toEqual(['ex2', 'ex3', 'ex1'])
  })

  it('keeps original order for exercises with equal frequency', () => {
    const exercises = [makeExercise('ex1'), makeExercise('ex2')]
    const sorted = sortExercisesByFrequency(exercises, [])
    expect(sorted.map((e) => e.id)).toEqual(['ex1', 'ex2'])
  })

  it('does not mutate the input array', () => {
    const exercises = [makeExercise('ex1'), makeExercise('ex2')]
    const sessions = [makeMultiSession('s1', ['ex2'])]
    sortExercisesByFrequency(exercises, sessions)
    expect(exercises.map((e) => e.id)).toEqual(['ex1', 'ex2'])
  })
})
