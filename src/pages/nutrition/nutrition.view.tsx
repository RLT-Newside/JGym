// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Lightbulb, Scale, Settings, TrendingUp, UtensilsCrossed } from 'lucide-react'
import type { ActivityEntry, FoodEntry, NutritionGoal, WaterEntry, WeightEntry } from '../../types'
import { CalorieInsights } from './components/calorie-insights/calorie-insights'
import { DailyLog } from './components/daily-log/daily-log'
import { GoalSetup } from './components/goal-setup/goal-setup'
import { NutritionTips } from './components/nutrition-tips/nutrition-tips'
import { WeightTracker } from './components/weight-tracker/weight-tracker'

type SubTab = 'log' | 'weight' | 'insights' | 'tips'

interface Props {
  subTab: SubTab
  goalOpen: boolean
  foodEntries: FoodEntry[]
  waterEntries: WaterEntry[]
  weightEntries: WeightEntry[]
  activityEntries: ActivityEntry[]
  goal: NutritionGoal
  onSubTabChange: (tab: SubTab) => void
  onGoalOpen: () => void
  onGoalClose: () => void
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

const tabs: { id: SubTab; label: string; icon: typeof UtensilsCrossed }[] = [
  { id: 'log', label: 'Log', icon: UtensilsCrossed },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'tips', label: 'Tips', icon: Lightbulb },
]

export function NutritionView({
  subTab,
  goalOpen,
  foodEntries,
  waterEntries,
  weightEntries,
  activityEntries,
  goal,
  onSubTabChange,
  onGoalOpen,
  onGoalClose,
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
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex glass rounded-lg p-0.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onSubTabChange(id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded text-[10px] font-medium transition-colors ${
                subTab === id ? 'bg-white/[0.08] text-white' : 'text-white/40'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
        <button onClick={onGoalOpen} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit goal">
          <Settings size={16} className="text-white/30" />
        </button>
      </div>

      {subTab === 'log' && (
        <DailyLog
          foodEntries={foodEntries}
          waterEntries={waterEntries}
          activityEntries={activityEntries}
          goal={goal}
          onAddFood={onAddFood}
          onDeleteFood={onDeleteFood}
          onAddWater={onAddWater}
          onDeleteWater={onDeleteWater}
          onAddActivity={onAddActivity}
          onDeleteActivity={onDeleteActivity}
        />
      )}

      {subTab === 'weight' && (
        <WeightTracker weights={weightEntries} onAddWeight={onAddWeight} onDeleteWeight={onDeleteWeight} />
      )}

      {subTab === 'insights' && (
        <CalorieInsights
          foodEntries={foodEntries}
          weightEntries={weightEntries}
          goal={goal}
          onUpdateGoal={onUpdateGoal}
        />
      )}

      {subTab === 'tips' && <NutritionTips goalType={goal.goalType} />}

      <GoalSetup
        open={goalOpen}
        onClose={onGoalClose}
        goal={goal}
        weightEntries={weightEntries}
        onSave={onUpdateGoal}
      />
    </div>
  )
}
