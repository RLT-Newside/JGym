import { describe, expect, it } from 'vitest'
import type { FoodEntry, WeightEntry } from '../types'
import {
  estimateTDEE,
  getAverageDailyIntake,
  getDailyTotals,
  getDateStr,
  getDaysAgo,
  getEntriesByMeal,
  getWeeklyAverages,
  getWeightTrend,
} from './nutrition'

const makeFood = (date: string, calories: number, mealType: FoodEntry['mealType'] = 'lunch'): FoodEntry => ({
  id: Math.random().toString(),
  date,
  name: 'Test',
  calories,
  protein: 20,
  carbs: 30,
  fat: 10,
  mealType,
  createdAt: new Date().toISOString(),
})

const makeWeight = (date: string, weight: number, unit: 'kg' | 'lbs' = 'kg'): WeightEntry => ({
  id: Math.random().toString(),
  date,
  weight,
  unit,
  createdAt: new Date().toISOString(),
})

describe('getDateStr', () => {
  it('returns today in YYYY-MM-DD', () => {
    expect(getDateStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns given date in YYYY-MM-DD', () => {
    expect(getDateStr(new Date('2024-06-15'))).toBe('2024-06-15')
  })
})

describe('getDaysAgo', () => {
  it('returns valid date string', () => {
    expect(getDaysAgo(7)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns a date in the past', () => {
    const today = getDateStr()
    expect(getDaysAgo(1) < today).toBe(true)
  })
})

describe('getDailyTotals', () => {
  it('returns zeros for no entries', () => {
    const result = getDailyTotals([], '2024-06-15')
    expect(result.calories).toBe(0)
    expect(result.count).toBe(0)
  })

  it('sums only entries matching date', () => {
    const entries = [makeFood('2024-06-15', 500), makeFood('2024-06-15', 300), makeFood('2024-06-16', 400)]
    const result = getDailyTotals(entries, '2024-06-15')
    expect(result.calories).toBe(800)
    expect(result.count).toBe(2)
  })

  it('sums protein, carbs, fat', () => {
    const entries = [makeFood('2024-06-15', 500), makeFood('2024-06-15', 300)]
    const result = getDailyTotals(entries, '2024-06-15')
    expect(result.protein).toBe(40)
    expect(result.carbs).toBe(60)
    expect(result.fat).toBe(20)
  })
})

describe('getEntriesByMeal', () => {
  it('groups entries by meal type', () => {
    const entries = [
      makeFood('2024-06-15', 300, 'breakfast'),
      makeFood('2024-06-15', 500, 'lunch'),
      makeFood('2024-06-15', 200, 'snack'),
      makeFood('2024-06-16', 400, 'breakfast'),
    ]
    const result = getEntriesByMeal(entries, '2024-06-15')
    expect(result.breakfast).toHaveLength(1)
    expect(result.lunch).toHaveLength(1)
    expect(result.snack).toHaveLength(1)
    expect(result.dinner).toHaveLength(0)
  })
})

describe('getAverageDailyIntake', () => {
  it('returns zeros for no entries', () => {
    const result = getAverageDailyIntake([], 7)
    expect(result.calories).toBe(0)
    expect(result.daysTracked).toBe(0)
  })

  it('averages calories across days', () => {
    const today = getDateStr()
    const yesterday = getDaysAgo(1)
    const entries = [makeFood(today, 2000), makeFood(yesterday, 1000)]
    const result = getAverageDailyIntake(entries, 7)
    expect(result.calories).toBe(1500)
    expect(result.daysTracked).toBe(2)
  })

  it('excludes entries older than lookback period', () => {
    const today = getDateStr()
    const oldDate = getDaysAgo(30)
    const entries = [makeFood(today, 2000), makeFood(oldDate, 5000)]
    const result = getAverageDailyIntake(entries, 7)
    expect(result.calories).toBe(2000)
    expect(result.daysTracked).toBe(1)
  })
})

describe('getWeightTrend', () => {
  it('returns null for fewer than 2 entries', () => {
    const today = getDateStr()
    expect(getWeightTrend([makeWeight(today, 80)], 30)).toBeNull()
    expect(getWeightTrend([], 30)).toBeNull()
  })

  it('calculates weight change correctly', () => {
    const today = getDateStr()
    const weekAgo = getDaysAgo(7)
    const weights = [makeWeight(weekAgo, 80), makeWeight(today, 79)]
    const result = getWeightTrend(weights, 30)
    expect(result?.changeKg).toBeCloseTo(-1, 1)
    expect(result?.lastWeight).toBe(79)
  })

  it('normalizes lbs to kg for changeKg', () => {
    const today = getDateStr()
    const weekAgo = getDaysAgo(7)
    const weights = [makeWeight(weekAgo, 176, 'lbs'), makeWeight(today, 174, 'lbs')]
    const result = getWeightTrend(weights, 30)
    expect(result?.changeKg).toBeCloseTo(-0.91, 1)
  })
})

describe('estimateTDEE', () => {
  it('returns null with fewer than 2 weight entries', () => {
    expect(estimateTDEE([], [makeWeight('2024-06-01', 80)])).toBeNull()
  })

  it('returns null when data span is less than 7 days', () => {
    const weights = [makeWeight('2024-06-01', 80), makeWeight('2024-06-05', 79.5)]
    expect(estimateTDEE([], weights)).toBeNull()
  })

  it('returns estimate when sufficient data exists', () => {
    const weights = Array.from({ length: 10 }, (_, i) =>
      makeWeight(`2024-06-${String(i + 1).padStart(2, '0')}`, 80 - i * 0.05),
    )
    const food = Array.from({ length: 10 }, (_, i) => makeFood(`2024-06-${String(i + 1).padStart(2, '0')}`, 2200))
    const result = estimateTDEE(food, weights)
    expect(result).not.toBeNull()
    expect(result?.tdee).toBeGreaterThan(800)
    expect(result?.tdee).toBeLessThan(6000)
  })
})

describe('getWeeklyAverages', () => {
  it('returns empty array when no weights', () => {
    expect(getWeeklyAverages([])).toEqual([])
  })

  it('groups weights by week', () => {
    const today = getDateStr()
    const weights = [makeWeight(today, 80), makeWeight(today, 81)]
    const result = getWeeklyAverages(weights, 4)
    expect(result.length).toBeGreaterThan(0)
    expect(result[result.length - 1].avg).toBeCloseTo(80.5, 1)
  })
})
