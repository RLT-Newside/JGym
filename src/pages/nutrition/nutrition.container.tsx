// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useState } from 'react'
import type { ActivityEntry, FoodEntry, NutritionGoal, WaterEntry, WeightEntry } from '../../types'
import { NutritionView } from './nutrition.view'

interface Props {
  foodEntries: FoodEntry[]
  waterEntries: WaterEntry[]
  weightEntries: WeightEntry[]
  activityEntries: ActivityEntry[]
  goal: NutritionGoal
  onAddFood: (entry: FoodEntry) => void
  onDeleteFood: (id: string) => void
  onAddWater: (entry: WaterEntry) => void
  onDeleteWater: (id: string) => void
  onAddWeight: (entry: WeightEntry) => void
  onDeleteWeight: (id: string) => void
  onAddActivity: (entry: ActivityEntry) => void
  onDeleteActivity: (id: string) => void
  onUpdateGoal: (goal: NutritionGoal) => void
}

type SubTab = 'log' | 'weight' | 'insights' | 'tips'

export function NutritionContainer({
  foodEntries,
  waterEntries,
  weightEntries,
  activityEntries,
  goal,
  onAddFood,
  onDeleteFood,
  onAddWater,
  onDeleteWater,
  onAddWeight,
  onDeleteWeight,
  onAddActivity,
  onDeleteActivity,
  onUpdateGoal,
}: Props) {
  const [subTab, setSubTab] = useState<SubTab>('log')
  const [goalOpen, setGoalOpen] = useState(false)

  return (
    <NutritionView
      subTab={subTab}
      goalOpen={goalOpen}
      foodEntries={foodEntries}
      waterEntries={waterEntries}
      weightEntries={weightEntries}
      activityEntries={activityEntries}
      goal={goal}
      onSubTabChange={setSubTab}
      onGoalOpen={() => setGoalOpen(true)}
      onGoalClose={() => setGoalOpen(false)}
      onAddFood={onAddFood}
      onDeleteFood={onDeleteFood}
      onAddWater={onAddWater}
      onDeleteWater={onDeleteWater}
      onAddWeight={onAddWeight}
      onDeleteWeight={onDeleteWeight}
      onAddActivity={onAddActivity}
      onDeleteActivity={onDeleteActivity}
      onUpdateGoal={onUpdateGoal}
    />
  )
}
