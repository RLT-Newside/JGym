import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Session } from '../types'
import { usePR, useStreak } from './usePR'

const makeSession = (id: string, daysAgo: number, exerciseId?: string, weight = 60): Session => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id,
    date: d.toISOString(),
    label: '',
    entries: exerciseId ? [{ exerciseId, sets: [{ reps: 10, weight, unit: 'kg' }] }] : [],
  }
}

describe('usePR', () => {
  it('returns null when no sessions', () => {
    const { result } = renderHook(() => usePR('ex1', []))
    expect(result.current).toBeNull()
  })

  it('returns PR for exercise', () => {
    const sessions = [makeSession('s1', 1, 'ex1', 80)]
    const { result } = renderHook(() => usePR('ex1', sessions))
    expect(result.current?.weight).toBe(80)
  })
})

describe('useStreak', () => {
  it('returns 0 for no sessions', () => {
    const { result } = renderHook(() => useStreak([]))
    expect(result.current).toBe(0)
  })

  it('returns 1 for session today only', () => {
    const { result } = renderHook(() => useStreak([makeSession('s1', 0)]))
    expect(result.current).toBe(1)
  })

  it('returns 0 when most recent session is 2+ days ago', () => {
    const sessions = [makeSession('s1', 2), makeSession('s2', 3)]
    const { result } = renderHook(() => useStreak(sessions))
    expect(result.current).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const sessions = [makeSession('s1', 0), makeSession('s2', 1), makeSession('s3', 2)]
    const { result } = renderHook(() => useStreak(sessions))
    expect(result.current).toBe(3)
  })

  it('counts consecutive days ending yesterday', () => {
    const sessions = [makeSession('s1', 1), makeSession('s2', 2), makeSession('s3', 3)]
    const { result } = renderHook(() => useStreak(sessions))
    expect(result.current).toBe(3)
  })

  it('stops counting at gap in streak', () => {
    const sessions = [
      makeSession('s1', 0),
      makeSession('s2', 1),
      makeSession('s3', 5), // gap — breaks streak
    ]
    const { result } = renderHook(() => useStreak(sessions))
    expect(result.current).toBe(2)
  })

  it('deduplicates multiple sessions on same day', () => {
    const sessions = [
      makeSession('s1', 0),
      makeSession('s2', 0), // same day
      makeSession('s3', 1),
    ]
    const { result } = renderHook(() => useStreak(sessions))
    expect(result.current).toBe(2)
  })
})
