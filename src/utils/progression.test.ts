import { describe, expect, it } from 'vitest'
import { DEFAULT_REP_RANGES, getProgressionTip, getRepRange } from './progression'

describe('getRepRange', () => {
  it('returns exact match for known target', () => {
    const result = getRepRange(8, DEFAULT_REP_RANGES)
    expect(result).toEqual({ min: 5, max: 8 })
  })

  it('returns closest match within 2 reps', () => {
    const result = getRepRange(9, DEFAULT_REP_RANGES)
    expect(result).not.toBeNull()
  })

  it('returns null for target far from all ranges', () => {
    const result = getRepRange(50, DEFAULT_REP_RANGES)
    expect(result).toBeNull()
  })
})

describe('getProgressionTip', () => {
  it('returns null for 0 reps', () => {
    expect(getProgressionTip(0, { min: 6, max: 12 })).toBeNull()
  })

  it('returns success when reps hit max', () => {
    const tip = getProgressionTip(12, { min: 6, max: 12 })
    expect(tip?.type).toBe('success')
  })

  it('returns success when reps exceed max', () => {
    const tip = getProgressionTip(15, { min: 6, max: 12 })
    expect(tip?.type).toBe('success')
  })

  it('returns warning when reps below min', () => {
    const tip = getProgressionTip(3, { min: 6, max: 12 })
    expect(tip?.type).toBe('warning')
  })

  it('returns null when reps in range but not at max', () => {
    const tip = getProgressionTip(9, { min: 6, max: 12 })
    expect(tip).toBeNull()
  })
})
