// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { FoodEntry, WeightEntry } from '../types'

export function getDateStr(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

export function getDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return getDateStr(d)
}

export function getDailyTotals(entries: FoodEntry[], date: string) {
  const dayEntries = entries.filter((e) => e.date === date)
  return {
    calories: dayEntries.reduce((sum, e) => sum + e.calories, 0),
    protein: dayEntries.reduce((sum, e) => sum + e.protein, 0),
    carbs: dayEntries.reduce((sum, e) => sum + e.carbs, 0),
    fat: dayEntries.reduce((sum, e) => sum + e.fat, 0),
    count: dayEntries.length,
  }
}

export function getEntriesByMeal(entries: FoodEntry[], date: string) {
  const dayEntries = entries.filter((e) => e.date === date)
  return {
    breakfast: dayEntries.filter((e) => e.mealType === 'breakfast'),
    lunch: dayEntries.filter((e) => e.mealType === 'lunch'),
    dinner: dayEntries.filter((e) => e.mealType === 'dinner'),
    snack: dayEntries.filter((e) => e.mealType === 'snack'),
    drink: dayEntries.filter((e) => e.mealType === 'drink'),
  }
}

export function getAverageDailyIntake(entries: FoodEntry[], days: number) {
  const start = getDaysAgo(days)
  const relevant = entries.filter((e) => e.date >= start)
  if (relevant.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0, daysTracked: 0 }

  const byDate = new Map<string, { cal: number; pro: number; carb: number; fat: number }>()
  for (const e of relevant) {
    const prev = byDate.get(e.date) ?? { cal: 0, pro: 0, carb: 0, fat: 0 }
    byDate.set(e.date, {
      cal: prev.cal + e.calories,
      pro: prev.pro + e.protein,
      carb: prev.carb + e.carbs,
      fat: prev.fat + e.fat,
    })
  }

  const daysTracked = byDate.size
  if (daysTracked === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0, daysTracked: 0 }

  let totalCal = 0,
    totalPro = 0,
    totalCarb = 0,
    totalFat = 0
  for (const v of byDate.values()) {
    totalCal += v.cal
    totalPro += v.pro
    totalCarb += v.carb
    totalFat += v.fat
  }

  return {
    calories: Math.round(totalCal / daysTracked),
    protein: Math.round(totalPro / daysTracked),
    carbs: Math.round(totalCarb / daysTracked),
    fat: Math.round(totalFat / daysTracked),
    daysTracked,
  }
}

function normalizeWeightToKg(weight: number, unit: 'kg' | 'lbs'): number {
  return unit === 'lbs' ? weight * 0.453592 : weight
}

export function getWeightTrend(weights: WeightEntry[], days: number) {
  const start = getDaysAgo(days)
  const relevant = weights.filter((w) => w.date >= start).sort((a, b) => a.date.localeCompare(b.date))

  if (relevant.length < 2) return null

  const first = relevant[0]
  const last = relevant[relevant.length - 1]
  const firstKg = normalizeWeightToKg(first.weight, first.unit)
  const lastKg = normalizeWeightToKg(last.weight, last.unit)
  const changeKg = lastKg - firstKg
  const daysBetween = Math.max(
    1,
    (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24),
  )
  const weeklyChangeKg = (changeKg / daysBetween) * 7

  return {
    firstWeight: first.weight,
    lastWeight: last.weight,
    unit: last.unit,
    changeKg,
    weeklyChangeKg,
    daysBetween: Math.round(daysBetween),
    entries: relevant.length,
  }
}

/**
 * TDEE estimation algorithm.
 *
 * Uses the energy balance equation:
 * Weight change (kg) = (Intake - TDEE) × days / 7700
 * Therefore: TDEE = Intake - (Weight change in kg × 7700 / days)
 *
 * 1 kg of body weight ≈ 7700 kcal
 *
 * Requires at least 14 days of food + weight data for a reasonable estimate.
 */
export function estimateTDEE(
  foodEntries: FoodEntry[],
  weightEntries: WeightEntry[],
): {
  tdee: number
  confidence: 'low' | 'medium' | 'high'
  avgIntake: number
  weightChangeKgPerWeek: number
  daysOfData: number
} | null {
  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length < 2) return null

  const firstDate = sorted[0].date
  const lastDate = sorted[sorted.length - 1].date
  const daySpan = Math.max(1, (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24))

  if (daySpan < 7) return null

  const firstKg = normalizeWeightToKg(sorted[0].weight, sorted[0].unit)
  const lastKg = normalizeWeightToKg(sorted[sorted.length - 1].weight, sorted[sorted.length - 1].unit)
  const weightChangeKg = lastKg - firstKg

  const relevantFood = foodEntries.filter((e) => e.date >= firstDate && e.date <= lastDate)
  const foodByDate = new Map<string, number>()
  for (const e of relevantFood) {
    foodByDate.set(e.date, (foodByDate.get(e.date) ?? 0) + e.calories)
  }

  const daysTracked = foodByDate.size
  if (daysTracked < 5) return null

  let totalCalories = 0
  for (const cal of foodByDate.values()) totalCalories += cal
  const avgDailyIntake = totalCalories / daysTracked

  // TDEE = Average Intake - (Weight Change in kg × 7700 / days)
  const tdee = Math.round(avgDailyIntake - (weightChangeKg * 7700) / daySpan)
  const weeklyChange = (weightChangeKg / daySpan) * 7

  let confidence: 'low' | 'medium' | 'high' = 'low'
  if (daysTracked >= 28 && sorted.length >= 8) confidence = 'high'
  else if (daysTracked >= 14 && sorted.length >= 4) confidence = 'medium'

  if (tdee < 800 || tdee > 6000) return null

  return {
    tdee,
    confidence,
    avgIntake: Math.round(avgDailyIntake),
    weightChangeKgPerWeek: Math.round(weeklyChange * 100) / 100,
    daysOfData: Math.round(daySpan),
  }
}

export function getWeeklyAverages(weights: WeightEntry[], weeks: number = 8) {
  const result: { week: string; avg: number; unit: 'kg' | 'lbs'; count: number }[] = []
  const now = new Date()

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (w + 1) * 7)
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() - w * 7)

    const startStr = getDateStr(weekStart)
    const endStr = getDateStr(weekEnd)

    const weekWeights = weights.filter((e) => e.date > startStr && e.date <= endStr)
    if (weekWeights.length === 0) continue

    const unit = weekWeights[0].unit
    const avg = weekWeights.reduce((sum, e) => sum + e.weight, 0) / weekWeights.length

    result.push({
      week: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avg: Math.round(avg * 10) / 10,
      unit,
      count: weekWeights.length,
    })
  }

  return result
}

export const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  drink: 'Drinks',
}

export const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
  drink: '🥤',
}
