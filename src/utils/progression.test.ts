import { describe, expect, it } from 'vitest'
import {
  DEFAULT_REP_RANGES,
  getProgressionTip,
  getRepRange,
  isValidRepString,
  validateRepRangeEntry,
} from './progression'

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

describe('validateRepRangeEntry', () => {
  it('returns null for valid entry', () => {
    expect(validateRepRangeEntry(10, 6, 12)).toBeNull()
  })

  it('rejects min > max', () => {
    expect(validateRepRangeEntry(10, 12, 6)).toBe('Min cannot exceed max')
  })

  it('rejects values below 1', () => {
    expect(validateRepRangeEntry(0, 5, 10)).toBe('Values must be at least 1')
    expect(validateRepRangeEntry(10, -1, 10)).toBe('Values must be at least 1')
    expect(validateRepRangeEntry(10, 5, 0)).toBe('Values must be at least 1')
  })

  it('rejects values above 100', () => {
    expect(validateRepRangeEntry(101, 5, 10)).toBe('Values must be 100 or less')
    expect(validateRepRangeEntry(10, 5, 101)).toBe('Values must be 100 or less')
  })

  it('rejects non-integers', () => {
    expect(validateRepRangeEntry(10.5, 5, 10)).toBe('Values must be whole numbers')
  })

  it('accepts boundary values', () => {
    expect(validateRepRangeEntry(1, 1, 1)).toBeNull()
    expect(validateRepRangeEntry(100, 1, 100)).toBeNull()
  })
})

describe('isValidRepString', () => {
  it('accepts single numbers', () => {
    expect(isValidRepString('5')).toBe(true)
    expect(isValidRepString('12')).toBe(true)
  })

  it('accepts ranges', () => {
    expect(isValidRepString('8-12')).toBe(true)
    expect(isValidRepString('6–10')).toBe(true)
  })

  it('accepts keywords', () => {
    expect(isValidRepString('max')).toBe(true)
    expect(isValidRepString('AMRAP')).toBe(true)
  })

  it('rejects empty strings', () => {
    expect(isValidRepString('')).toBe(false)
    expect(isValidRepString('  ')).toBe(false)
  })

  it('rejects invalid formats', () => {
    expect(isValidRepString('abc')).toBe(false)
    expect(isValidRepString('8-12-15')).toBe(false)
    expect(isValidRepString('0')).toBe(false)
  })

  it('rejects inverted ranges', () => {
    expect(isValidRepString('12-8')).toBe(false)
  })

  it('rejects out-of-bounds values', () => {
    expect(isValidRepString('101')).toBe(false)
    expect(isValidRepString('1-101')).toBe(false)
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
