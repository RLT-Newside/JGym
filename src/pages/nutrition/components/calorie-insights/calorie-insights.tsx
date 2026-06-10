// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Activity, Flame, Minus, Scale, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import type { FoodEntry, NutritionGoal, WeightEntry } from '../../../../types'
import { estimateTDEE, getAverageDailyIntake, getWeightTrend } from '../../../../utils/nutrition'

interface Props {
  foodEntries: FoodEntry[]
  weightEntries: WeightEntry[]
  goal: NutritionGoal
  onUpdateGoal: (goal: NutritionGoal) => void
}

export function CalorieInsights({ foodEntries, weightEntries, goal, onUpdateGoal }: Props) {
  const { avg7, avg30, trend30, tdee } = useMemo(
    () => ({
      avg7: getAverageDailyIntake(foodEntries, 7),
      avg30: getAverageDailyIntake(foodEntries, 30),
      trend30: getWeightTrend(weightEntries, 30),
      tdee: estimateTDEE(foodEntries, weightEntries),
    }),
    [foodEntries, weightEntries],
  )

  const hasAnyData = foodEntries.length > 0 || weightEntries.length > 0

  if (!hasAnyData) {
    return (
      <div className="text-center py-12 space-y-2">
        <Activity size={32} className="text-white/10 mx-auto" />
        <p className="text-sm text-white/30">No data yet</p>
        <p className="text-[10px] text-white/15 max-w-xs mx-auto">
          Start logging your food and weight to see calorie insights, TDEE estimation, and projections
        </p>
      </div>
    )
  }

  const dailyBalance = tdee ? avg7.calories - tdee.tdee : null
  const projectedWeeklyKg = dailyBalance ? (dailyBalance * 7) / 7700 : null

  return (
    <div className="space-y-4">
      {/* TDEE Estimate */}
      {tdee && (
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-brand" />
            <h3 className="text-sm font-medium">Your TDEE Estimate</h3>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded ${
                tdee.confidence === 'high'
                  ? 'bg-green-900/20 text-green-400/60'
                  : tdee.confidence === 'medium'
                    ? 'bg-yellow-900/20 text-yellow-400/60'
                    : 'bg-white/5 text-white/30'
              }`}
            >
              {tdee.confidence} confidence
            </span>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-heading text-brand">{tdee.tdee}</p>
              <p className="text-[10px] text-white/25">kcal/day burned</p>
            </div>
            <div className="text-right flex-1">
              <p className="text-xs text-white/40">Avg intake: {tdee.avgIntake} kcal</p>
              <p className="text-xs text-white/40">
                Weight: {tdee.weightChangeKgPerWeek > 0 ? '+' : ''}
                {tdee.weightChangeKgPerWeek} kg/wk
              </p>
              <p className="text-[10px] text-white/20">{tdee.daysOfData} days of data</p>
            </div>
          </div>
          <p className="text-[10px] text-white/20">
            Based on your food intake and weight changes. More data = better accuracy.
          </p>
        </div>
      )}

      {/* TDEE update prompt — shown when confidence is high and goal differs by >100 kcal */}
      {tdee && tdee.confidence === 'high' && Math.abs(tdee.tdee - goal.dailyCalories) > 100 && (
        <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Flame size={16} className="text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-400 mb-1">Real metabolism found</p>
              <p className="text-[10px] text-white/40 mb-3">
                Your data shows you actually burn <span className="text-white/60">{tdee.tdee} kcal/day</span>, but your
                goal is set to {goal.dailyCalories} kcal.
                {tdee.tdee > goal.dailyCalories
                  ? ` You have ${tdee.tdee - goal.dailyCalories} kcal more room than you think.`
                  : ` Your target may be ${goal.dailyCalories - tdee.tdee} kcal too high.`}
              </p>
              <button
                onClick={() => onUpdateGoal({ ...goal, dailyCalories: tdee.tdee })}
                className="text-[10px] font-medium px-3 py-1.5 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Update base goal to {tdee.tdee} kcal
              </button>
            </div>
          </div>
        </div>
      )}

      {tdee === null && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-white/20" />
            <h3 className="text-sm font-medium text-white/40">TDEE Estimate</h3>
          </div>
          <p className="text-[10px] text-white/25">
            Need at least 7 days of food tracking + 2 weight entries to estimate your daily calorie burn.
            {foodEntries.length > 0 && ` You have ${new Set(foodEntries.map((e) => e.date)).size} days of food data.`}
            {weightEntries.length > 0 && ` You have ${weightEntries.length} weigh-in(s).`}
          </p>
        </div>
      )}

      {/* Current balance */}
      {dailyBalance !== null && projectedWeeklyKg !== null && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Scale size={16} className="text-white/40" />
            <h3 className="text-sm font-medium">Energy Balance (7-day avg)</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-xl font-heading ${
                  dailyBalance > 100 ? 'text-red-400' : dailyBalance < -100 ? 'text-green-400' : 'text-white/50'
                }`}
              >
                {dailyBalance > 0 ? '+' : ''}
                {Math.round(dailyBalance)} kcal/day
              </p>
              <p className="text-[10px] text-white/25">
                {dailyBalance > 100
                  ? 'Surplus (gaining)'
                  : dailyBalance < -100
                    ? 'Deficit (losing)'
                    : 'Near maintenance'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                {projectedWeeklyKg > 0.05 ? (
                  <TrendingUp size={14} className="text-red-400/60" />
                ) : projectedWeeklyKg < -0.05 ? (
                  <TrendingDown size={14} className="text-green-400/60" />
                ) : (
                  <Minus size={14} className="text-white/20" />
                )}
                <span className="text-xs text-white/40">
                  {projectedWeeklyKg > 0 ? '+' : ''}
                  {Math.round(projectedWeeklyKg * 100) / 100} kg/wk
                </span>
              </div>
              <p className="text-[10px] text-white/15">projected</p>
            </div>
          </div>
        </div>
      )}

      {/* Average intake stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="7-Day Average"
          value={avg7.daysTracked > 0 ? `${avg7.calories}` : '—'}
          unit="kcal"
          subtitle={avg7.daysTracked > 0 ? `${avg7.daysTracked} days tracked` : 'No data'}
          highlight={avg7.calories > goal.dailyCalories}
        />
        <StatCard
          title="30-Day Average"
          value={avg30.daysTracked > 0 ? `${avg30.calories}` : '—'}
          unit="kcal"
          subtitle={avg30.daysTracked > 0 ? `${avg30.daysTracked} days tracked` : 'No data'}
          highlight={avg30.calories > goal.dailyCalories}
        />
      </div>

      {/* Macro averages */}
      {avg7.daysTracked > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">7-Day Macro Averages</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-heading text-blue-400">{avg7.protein}g</p>
              <p className="text-[10px] text-white/25">Protein</p>
              <p className="text-[9px] text-white/15">Goal: {goal.dailyProtein}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading text-amber-400">{avg7.carbs}g</p>
              <p className="text-[10px] text-white/25">Carbs</p>
              <p className="text-[9px] text-white/15">Goal: {goal.dailyCarbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-heading text-pink-400">{avg7.fat}g</p>
              <p className="text-[10px] text-white/25">Fat</p>
              <p className="text-[9px] text-white/15">Goal: {goal.dailyFat}g</p>
            </div>
          </div>
        </div>
      )}

      {/* Goal comparison */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-white/40" />
          <h3 className="text-sm font-medium">
            Goal: {goal.goalType === 'cut' ? 'Lose Fat' : goal.goalType === 'bulk' ? 'Build Muscle' : 'Maintain'}
          </h3>
        </div>
        <div className="space-y-2 text-xs text-white/40">
          <p>Target: {goal.dailyCalories} kcal/day</p>
          {tdee && (
            <p>
              {goal.goalType === 'cut' && tdee.tdee > goal.dailyCalories
                ? `Your target creates a ${tdee.tdee - goal.dailyCalories} kcal deficit — aim for 0.5 kg/week loss.`
                : goal.goalType === 'bulk' && goal.dailyCalories > tdee.tdee
                  ? `Your target creates a ${goal.dailyCalories - tdee.tdee} kcal surplus — aim for 0.25 kg/week gain.`
                  : goal.goalType === 'maintain'
                    ? `Your TDEE is ~${tdee.tdee} kcal. Stay close to this for maintenance.`
                    : 'Adjust your calorie target to match your goal.'}
            </p>
          )}
        </div>
      </div>

      {/* Weight trend summary */}
      {trend30 && (
        <div className="glass rounded-xl p-4">
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">30-Day Weight Summary</h3>
          <p className="text-xs text-white/40">
            Started at {trend30.firstWeight} {trend30.unit}, now at {trend30.lastWeight} {trend30.unit}.{' '}
            {Math.abs(trend30.weeklyChangeKg) < 0.05
              ? 'Weight is stable.'
              : trend30.weeklyChangeKg > 0
                ? `Gaining ~${Math.round(trend30.weeklyChangeKg * 100) / 100} kg/week.`
                : `Losing ~${Math.round(Math.abs(trend30.weeklyChangeKg) * 100) / 100} kg/week.`}
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  unit,
  subtitle,
  highlight,
}: {
  title: string
  value: string
  unit: string
  subtitle: string
  highlight: boolean
}) {
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-[10px] text-white/30 mb-1">{title}</p>
      <p className={`text-xl font-heading ${highlight ? 'text-red-400' : ''}`}>
        {value} <span className="text-xs text-white/25">{unit}</span>
      </p>
      <p className="text-[10px] text-white/20">{subtitle}</p>
    </div>
  )
}
