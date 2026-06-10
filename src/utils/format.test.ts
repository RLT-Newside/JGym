import { describe, expect, it } from 'vitest'
import { formatDate, formatRelativeDate, formatSetsSummary, formatTimer, todayISO } from './format'

describe('formatTimer', () => {
  it('formats seconds under one hour as MM:SS', () => {
    expect(formatTimer(0)).toBe('00:00')
    expect(formatTimer(59)).toBe('00:59')
    expect(formatTimer(60)).toBe('01:00')
    expect(formatTimer(3599)).toBe('59:59')
  })

  it('formats seconds over one hour as H:MM:SS', () => {
    expect(formatTimer(3600)).toBe('1:00:00')
    expect(formatTimer(3661)).toBe('1:01:01')
    expect(formatTimer(7322)).toBe('2:02:02')
  })
})

describe('formatSetsSummary', () => {
  it('formats single set', () => {
    expect(formatSetsSummary([{ reps: 10, weight: 60, unit: 'kg' }])).toBe('10×60kg')
  })

  it('formats multiple sets joined by comma', () => {
    expect(
      formatSetsSummary([
        { reps: 10, weight: 60, unit: 'kg' },
        { reps: 8, weight: 65, unit: 'kg' },
      ]),
    ).toBe('10×60kg, 8×65kg')
  })

  it('returns empty string for no sets', () => {
    expect(formatSetsSummary([])).toBe('')
  })

  it('handles lbs unit', () => {
    expect(formatSetsSummary([{ reps: 5, weight: 135, unit: 'lbs' }])).toBe('5×135lbs')
  })
})

describe('todayISO', () => {
  it('returns today in YYYY-MM-DD format', () => {
    const result = todayISO()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result).toBe(new Date().toISOString().split('T')[0])
  })
})

describe('formatRelativeDate', () => {
  it('returns Today for today', () => {
    const today = new Date().toISOString()
    expect(formatRelativeDate(today)).toBe('Today')
  })

  it('returns Yesterday for 1 day ago', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    expect(formatRelativeDate(d.toISOString())).toBe('Yesterday')
  })

  it('returns N days ago for 2–6 days ago', () => {
    const d = new Date()
    d.setDate(d.getDate() - 3)
    expect(formatRelativeDate(d.toISOString())).toBe('3 days ago')
  })

  it('returns Nw ago for 7+ days', () => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    expect(formatRelativeDate(d.toISOString())).toBe('2w ago')
  })
})

describe('formatDate', () => {
  it('returns localized short date', () => {
    const result = formatDate('2024-06-15T00:00:00.000Z')
    expect(result).toContain('Jun')
  })
})
