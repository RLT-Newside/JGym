// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ChevronLeft, ChevronRight, Droplets, Flame, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../../../../components/button/button'
import type { ActivityEntry, FoodEntry, MealType, NutritionGoal, WaterEntry } from '../../../../types'
import { getDailyTotals, getDateStr, getEntriesByMeal, MEAL_ICONS, MEAL_LABELS } from '../../../../utils/nutrition'
import { ActivityEntryForm } from '../activity-entry-form/activity-entry-form'
import { FoodEntryForm } from '../food-entry-form/food-entry-form'

interface Props {
  foodEntries: FoodEntry[]
  waterEntries: WaterEntry[]
  activityEntries: ActivityEntry[]
  goal: NutritionGoal
  onAddFood: (entry: FoodEntry) => void
  onDeleteFood: (id: string) => void
  onAddWater: (entry: WaterEntry) => void
  onDeleteWater: (id: string) => void
  onAddActivity: (entry: ActivityEntry) => void
  onDeleteActivity: (id: string) => void
}

export function DailyLog({
  foodEntries,
  waterEntries,
  activityEntries,
  goal,
  onAddFood,
  onDeleteFood,
  onAddWater,
  onDeleteWater,
  onAddActivity,
  onDeleteActivity,
}: Props) {
  const [selectedDate, setSelectedDate] = useState(getDateStr())
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [defaultMeal, setDefaultMeal] = useState<MealType>('lunch')
  const [activityFormOpen, setActivityFormOpen] = useState(false)

  const [customWater, setCustomWater] = useState('')
  const [waterError, setWaterError] = useState(false)

  const {
    totals,
    meals,
    dailyWater,
    totalWaterMl,
    totalDrinkMl,
    totalFluidMl,
    waterGoal,
    waterPercent,
    dailyActivity,
    earnedCalories,
    totalAllowance,
  } = useMemo(() => {
    const totals = getDailyTotals(foodEntries, selectedDate)
    const meals = getEntriesByMeal(foodEntries, selectedDate)
    const dailyWater = waterEntries.filter((e) => e.date === selectedDate)
    const totalWaterMl = dailyWater.reduce((s, e) => s + e.amountMl, 0)
    const totalDrinkMl = meals.drink.reduce((s, e) => s + (e.volumeMl ?? 0), 0)
    const totalFluidMl = totalWaterMl + totalDrinkMl
    const waterGoal = goal.dailyWaterMl ?? 2000
    const waterPercent = Math.min(100, (totalFluidMl / waterGoal) * 100)
    const dailyActivity = activityEntries.filter((e) => e.date === selectedDate)
    const totalBurned = dailyActivity.reduce((s, e) => s + e.caloriesBurned, 0)
    const eatBackPerc = goal.eatBackPerc ?? 50
    const earnedCalories = Math.round(totalBurned * (eatBackPerc / 100))
    const totalAllowance = goal.dailyCalories + earnedCalories
    return {
      totals,
      meals,
      dailyWater,
      totalWaterMl,
      totalDrinkMl,
      totalFluidMl,
      waterGoal,
      waterPercent,
      dailyActivity,
      earnedCalories,
      totalAllowance,
    }
  }, [
    foodEntries,
    waterEntries,
    activityEntries,
    selectedDate,
    goal.dailyWaterMl,
    goal.dailyCalories,
    goal.eatBackPerc,
  ])

  const addWater = (ml: number) => {
    onAddWater({ id: uuidv4(), amountMl: ml, date: selectedDate, createdAt: new Date().toISOString() })
  }

  const handleCustomWater = () => {
    const ml = Number(customWater)
    if (ml > 0) {
      addWater(ml)
      setCustomWater('')
      setWaterError(false)
    } else {
      setWaterError(true)
    }
  }
  const isToday = selectedDate === getDateStr()

  const prevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`)
    d.setDate(d.getDate() - 1)
    setSelectedDate(getDateStr(d))
  }

  const nextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`)
    d.setDate(d.getDate() + 1)
    setSelectedDate(getDateStr(d))
  }

  const calPercent = totalAllowance > 0 ? Math.min(100, (totals.calories / totalAllowance) * 100) : 0
  const proPercent = goal.dailyProtein > 0 ? Math.min(100, (totals.protein / goal.dailyProtein) * 100) : 0
  const carbPercent = goal.dailyCarbs > 0 ? Math.min(100, (totals.carbs / goal.dailyCarbs) * 100) : 0
  const fatPercent = goal.dailyFat > 0 ? Math.min(100, (totals.fat / goal.dailyFat) * 100) : 0

  const dateLabel = isToday
    ? 'Today'
    : new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })

  const handleAddForMeal = (meal: MealType) => {
    setDefaultMeal(meal)
    setEditingEntry(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Date navigator */}
      <div className="flex items-center justify-between">
        <button onClick={prevDay} className="p-2 hover:bg-white/10 rounded transition-colors">
          <ChevronLeft size={18} className="text-white/50" />
        </button>
        <button
          onClick={() => setSelectedDate(getDateStr())}
          className="text-sm font-medium px-3 py-1 rounded hover:bg-white/10 transition-colors"
        >
          {dateLabel}
        </button>
        <button onClick={nextDay} className="p-2 hover:bg-white/10 rounded transition-colors">
          <ChevronRight size={18} className="text-white/50" />
        </button>
      </div>

      {/* Calorie progress */}
      <div className="glass rounded-xl p-4 space-y-3">
        {/* Net equation row — only shown when exercise earned calories */}
        {earnedCalories > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/30 flex-wrap">
            <span>{goal.dailyCalories}</span>
            <span className="text-white/15">goal</span>
            <span className="text-white/20">+</span>
            <span className="text-green-400/70">{earnedCalories}</span>
            <span className="text-white/15">exercise ({goal.eatBackPerc ?? 50}%)</span>
            <span className="text-white/20">=</span>
            <span className="text-white/60 font-medium">{totalAllowance} kcal</span>
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-heading">{totals.calories}</p>
            <p className="text-[10px] text-white/30">
              of {totalAllowance} kcal{earnedCalories > 0 ? ' allowance' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-lg font-heading ${totals.calories > totalAllowance ? 'text-red-400' : 'text-brand'}`}>
              {totalAllowance - totals.calories > 0 ? totalAllowance - totals.calories : 0}
            </p>
            <p className="text-[10px] text-white/30">remaining</p>
          </div>
        </div>
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              totals.calories > totalAllowance ? 'bg-red-500' : 'bg-brand'
            }`}
            style={{ width: `${calPercent}%` }}
          />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <MacroBar
            label="Protein"
            current={totals.protein}
            target={goal.dailyProtein}
            percent={proPercent}
            color="bg-blue-500"
          />
          <MacroBar
            label="Carbs"
            current={totals.carbs}
            target={goal.dailyCarbs}
            percent={carbPercent}
            color="bg-amber-500"
          />
          <MacroBar label="Fat" current={totals.fat} target={goal.dailyFat} percent={fatPercent} color="bg-pink-500" />
        </div>
      </div>

      {/* Meals + Drinks */}
      {(['breakfast', 'lunch', 'dinner', 'snack', 'drink'] as MealType[]).map((meal) => {
        const items = meals[meal]
        const mealCals = items.reduce((s, e) => s + e.calories, 0)
        return (
          <div key={meal} className="glass rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{MEAL_ICONS[meal]}</span>
                <span className="text-sm font-medium">{MEAL_LABELS[meal]}</span>
                {mealCals > 0 && <span className="text-[10px] text-white/30">{mealCals} kcal</span>}
              </div>
              <button
                onClick={() => handleAddForMeal(meal)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <Plus size={14} className="text-brand" />
              </button>
            </div>
            {items.length > 0 && (
              <div className="divide-y divide-white/5">
                {items.map((item) => (
                  <div key={item.id} className="px-3 py-2 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{item.name}</p>
                      <div className="flex gap-2 text-[10px] text-white/25 mt-0.5">
                        {item.volumeMl && (
                          <span className="text-cyan-400/50">
                            {item.volumeMl >= 1000 ? `${item.volumeMl / 1000}L` : `${item.volumeMl}ml`}
                          </span>
                        )}
                        {item.protein > 0 && <span>P:{item.protein}g</span>}
                        {item.carbs > 0 && <span>C:{item.carbs}g</span>}
                        {item.fat > 0 && <span>F:{item.fat}g</span>}
                      </div>
                    </div>
                    <span className="text-xs text-white/50 whitespace-nowrap">{item.calories} kcal</span>
                    <button
                      onClick={() => {
                        setEditingEntry(item)
                        setFormOpen(true)
                      }}
                      className="p-1 hover:bg-white/10 rounded opacity-40 hover:opacity-100"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteFood(item.id)}
                      className="p-1 hover:bg-red-900/30 rounded opacity-40 hover:opacity-100"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Activity section */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-orange-400" />
            <span className="text-sm font-medium">Activity</span>
            {dailyActivity.length > 0 && (
              <span className="text-[10px] text-orange-400/60">
                +{dailyActivity.reduce((s, e) => s + e.caloriesBurned, 0)} kcal burned
              </span>
            )}
          </div>
          <button
            onClick={() => setActivityFormOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <Plus size={14} className="text-brand" />
          </button>
        </div>
        {dailyActivity.length > 0 && (
          <div className="divide-y divide-white/5">
            {dailyActivity.map((item) => (
              <div key={item.id} className="px-3 py-2 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{item.name}</p>
                  {item.durationMins > 0 && <p className="text-[10px] text-white/25 mt-0.5">{item.durationMins} min</p>}
                </div>
                <span className="text-xs text-orange-400/70 whitespace-nowrap">−{item.caloriesBurned} kcal</span>
                <button
                  onClick={() => onDeleteActivity(item.id)}
                  className="p-1 hover:bg-red-900/30 rounded opacity-40 hover:opacity-100"
                >
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
        {dailyActivity.length === 0 && (
          <p className="text-[11px] text-white/20 text-center py-3">Log exercise to earn extra calories</p>
        )}
      </div>

      {/* Water tracker */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={14} className="text-cyan-400" />
            <span className="text-sm font-medium">Water</span>
          </div>
          <span className="text-xs text-white/40">
            {totalFluidMl >= 1000 ? `${(totalFluidMl / 1000).toFixed(1)}L` : `${totalFluidMl}ml`}
            {' / '}
            {waterGoal >= 1000 ? `${(waterGoal / 1000).toFixed(1)}L` : `${waterGoal}ml`}
            {totalDrinkMl > 0 && (
              <span className="text-white/25">
                {' '}
                (💧{totalWaterMl >= 1000 ? `${(totalWaterMl / 1000).toFixed(1)}L` : `${totalWaterMl}ml`} + 🥤
                {totalDrinkMl >= 1000 ? `${(totalDrinkMl / 1000).toFixed(1)}L` : `${totalDrinkMl}ml`})
              </span>
            )}
          </span>
        </div>

        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-cyan-500"
            style={{ width: `${waterPercent}%` }}
          />
        </div>

        <div className="flex gap-2">
          {[150, 250, 500, 1000].map((ml) => (
            <button
              key={ml}
              onClick={() => addWater(ml)}
              className="flex-1 py-1.5 rounded-lg bg-white/[0.03] text-[10px] text-white/50 hover:bg-cyan-500/15 hover:text-cyan-400 transition-colors"
            >
              {ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Custom ml"
            value={customWater}
            onChange={(e) => {
              setCustomWater(e.target.value)
              setWaterError(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomWater()}
            inputMode="numeric"
            className={`flex-1 bg-white/[0.04] border rounded-xl px-3 py-1.5 text-xs focus:outline-none transition-all ${waterError ? 'border-red-500/60 focus:border-red-500/80' : 'border-white/[0.08] focus:border-cyan-500/50 focus:bg-white/[0.06]'}`}
          />
          <button
            onClick={handleCustomWater}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 text-xs hover:bg-cyan-500/25 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
        {waterError && <p className="text-[10px] text-red-400/80">Amount must be greater than 0</p>}

        {dailyWater.length > 0 && (
          <div className="space-y-1 pt-1">
            {dailyWater.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-[11px] text-white/30">
                <span>{entry.amountMl >= 1000 ? `${entry.amountMl / 1000}L` : `${entry.amountMl}ml`}</span>
                <span className="text-[10px]">
                  {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => onDeleteWater(entry.id)}
                  className="p-1 hover:bg-red-900/30 rounded opacity-40 hover:opacity-100"
                >
                  <Trash2 size={11} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add food button */}
      <Button
        onClick={() => {
          setEditingEntry(null)
          setFormOpen(true)
        }}
        className="w-full flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Food or Drink
      </Button>

      <FoodEntryForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingEntry(null)
        }}
        onSave={onAddFood}
        entry={editingEntry}
        defaultMeal={defaultMeal}
        defaultDate={selectedDate}
      />

      <ActivityEntryForm
        open={activityFormOpen}
        onClose={() => setActivityFormOpen(false)}
        onSave={onAddActivity}
        defaultDate={selectedDate}
      />
    </div>
  )
}

function MacroBar({
  label,
  current,
  target,
  percent,
  color,
}: {
  label: string
  current: number
  target: number
  percent: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-white/40">{label}</span>
        <span className="text-white/25">
          {current}/{target}g
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
