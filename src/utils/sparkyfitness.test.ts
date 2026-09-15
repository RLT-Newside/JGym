// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Exercise, Session } from '../types'
import {
  buildWorkoutPayload,
  disconnectSparkyFitness,
  isSparkyFitnessConfigured,
  readSparkyConfig,
  saveSparkyConfig,
} from './sparkyfitness'

const MOCK_CONFIG = { baseUrl: 'https://sparky.example.com', apiKey: 'test-key-abc' }

const MOCK_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Bench Press',
    muscleGroups: ['Mid Chest'],
    primaryMuscles: ['Mid Chest'],
    secondaryMuscles: ['Triceps Lateral Head'],
    notes: '',
    createdAt: '2026-01-01T00:00:00Z',
  },
]

const MOCK_SESSION: Session = {
  id: 'sess-1',
  date: '2026-09-15T10:00:00Z',
  label: 'Push Day',
  durationSeconds: 3600,
  entries: [
    {
      exerciseId: 'ex-1',
      sets: [
        { reps: 8, weight: 80, unit: 'kg' },
        { reps: 6, weight: 85, unit: 'kg' },
      ],
    },
  ],
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('isSparkyFitnessConfigured', () => {
  it('returns false when nothing is stored', () => {
    expect(isSparkyFitnessConfigured()).toBe(false)
  })

  it('returns true after saving a valid config', () => {
    saveSparkyConfig(MOCK_CONFIG)
    expect(isSparkyFitnessConfigured()).toBe(true)
  })

  it('returns false when baseUrl is empty', () => {
    saveSparkyConfig({ baseUrl: '', apiKey: 'key' })
    expect(isSparkyFitnessConfigured()).toBe(false)
  })

  it('returns false when apiKey is empty', () => {
    saveSparkyConfig({ baseUrl: 'https://sparky.example.com', apiKey: '' })
    expect(isSparkyFitnessConfigured()).toBe(false)
  })
})

describe('saveSparkyConfig / readSparkyConfig', () => {
  it('round-trips config through localStorage', () => {
    saveSparkyConfig(MOCK_CONFIG)
    expect(readSparkyConfig()).toEqual(MOCK_CONFIG)
  })

  it('returns null when localStorage is corrupt', () => {
    localStorage.setItem('gym_sparkyfitness_config', '{bad json}')
    expect(readSparkyConfig()).toBeNull()
  })
})

describe('disconnectSparkyFitness', () => {
  it('clears stored config', () => {
    saveSparkyConfig(MOCK_CONFIG)
    disconnectSparkyFitness()
    expect(readSparkyConfig()).toBeNull()
    expect(isSparkyFitnessConfigured()).toBe(false)
  })
})

describe('buildWorkoutPayload', () => {
  it('maps session fields to the SparkyFitness payload shape', () => {
    const payload = buildWorkoutPayload(MOCK_SESSION, MOCK_EXERCISES)
    expect(payload.title).toBe('Push Day')
    expect(payload.date).toBe('2026-09-15T10:00:00Z')
    expect(payload.duration_seconds).toBe(3600)
    expect(payload.source).toBe('jgym')
    expect(payload.exercises).toHaveLength(1)
    expect(payload.exercises[0].name).toBe('Bench Press')
    expect(payload.exercises[0].sets).toHaveLength(2)
    expect(payload.exercises[0].sets[0]).toEqual({ reps: 8, weight: 80, unit: 'kg' })
  })

  it('uses "Strength Session" as default title when label is empty', () => {
    const payload = buildWorkoutPayload({ ...MOCK_SESSION, label: '' }, MOCK_EXERCISES)
    expect(payload.title).toBe('Strength Session')
  })

  it('falls back to "Exercise" for unknown exercise ids', () => {
    const payload = buildWorkoutPayload(
      { ...MOCK_SESSION, entries: [{ exerciseId: 'unknown', sets: [{ reps: 5, weight: 60, unit: 'kg' }] }] },
      MOCK_EXERCISES,
    )
    expect(payload.exercises[0].name).toBe('Exercise')
  })

  it('skips sets with 0 reps', () => {
    const payload = buildWorkoutPayload(
      {
        ...MOCK_SESSION,
        entries: [
          {
            exerciseId: 'ex-1',
            sets: [
              { reps: 0, weight: 80, unit: 'kg' },
              { reps: 5, weight: 80, unit: 'kg' },
            ],
          },
        ],
      },
      MOCK_EXERCISES,
    )
    expect(payload.exercises[0].sets).toHaveLength(1)
    expect(payload.exercises[0].sets[0].reps).toBe(5)
  })

  it('defaults duration_seconds to 0 when not provided', () => {
    const payload = buildWorkoutPayload({ ...MOCK_SESSION, durationSeconds: undefined }, MOCK_EXERCISES)
    expect(payload.duration_seconds).toBe(0)
  })
})
