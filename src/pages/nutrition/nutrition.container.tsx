// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useState } from 'react'
import { useAppData } from '../../context/app-data'
import { NutritionView } from './nutrition.view'

type SubTab = 'log' | 'weight' | 'insights' | 'tips'

export function NutritionContainer() {
  const {
    foodEntries,
    waterEntries,
    weightEntries,
    activityEntries,
    nutritionGoal: goal,
    addFood: onAddFood,
    deleteFood: onDeleteFood,
    addWater: onAddWater,
    deleteWater: onDeleteWater,
    addWeight: onAddWeight,
    deleteWeight: onDeleteWeight,
    addActivity: onAddActivity,
    deleteActivity: onDeleteActivity,
    updateGoal: onUpdateGoal,
  } = useAppData()
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
