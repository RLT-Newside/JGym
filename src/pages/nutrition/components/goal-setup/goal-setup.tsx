// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useMemo, useState } from 'react'
import { Button } from '../../../../components/button/button'
import { Modal } from '../../../../components/modal/modal'
import type { GoalType, NutritionGoal, WeightEntry } from '../../../../types'

const GOAL_PRESETS: Record<GoalType, { label: string; desc: string; cals: number; carbs: number; fat: number }> = {
  cut: { label: 'Lose Fat', desc: '~500 kcal deficit', cals: 1800, carbs: 150, fat: 60 },
  maintain: { label: 'Maintain', desc: 'Stay at weight', cals: 2300, carbs: 250, fat: 75 },
  bulk: { label: 'Build Muscle', desc: '~300 kcal surplus', cals: 2800, carbs: 350, fat: 80 },
}

const PROTEIN_LEVELS = [
  { label: 'Lean (1.6g/kg)', value: 1.6 },
  { label: 'Optimal (2.0g/kg)', value: 2.0 },
  { label: 'High (2.4g/kg)', value: 2.4 },
]

const EAT_BACK_OPTIONS = [
  { label: '25%', value: 25, desc: 'Conservative' },
  { label: '50%', value: 50, desc: 'Recommended' },
  { label: '75%', value: 75, desc: 'Aggressive' },
]

interface Props {
  open: boolean
  onClose: () => void
  goal: NutritionGoal
  weightEntries: WeightEntry[]
  onSave: (goal: NutritionGoal) => void
}

export function GoalSetup({ open, onClose, goal, weightEntries, onSave }: Props) {
  const [goalType, setGoalType] = useState<GoalType>(goal.goalType)
  const [calories, setCalories] = useState(goal.dailyCalories.toString())
  const [protein, setProtein] = useState(goal.dailyProtein.toString())
  const [carbs, setCarbs] = useState(goal.dailyCarbs.toString())
  const [fat, setFat] = useState(goal.dailyFat.toString())
  const [water, setWater] = useState((goal.dailyWaterMl ?? 2000).toString())
  const [proteinPerKg, setProteinPerKg] = useState(goal.proteinPerKg ?? 2.0)
  const [eatBackPerc, setEatBackPerc] = useState(goal.eatBackPerc ?? 50)

  const latestWeightKg = useMemo(() => {
    if (weightEntries.length === 0) return null
    const sorted = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date))
    const w = sorted[0]
    return w.unit === 'lbs' ? w.weight * 0.453592 : w.weight
  }, [weightEntries])

  const suggestedProtein = latestWeightKg ? Math.round(latestWeightKg * proteinPerKg) : null

  const handlePreset = (type: GoalType) => {
    const p = GOAL_PRESETS[type]
    setGoalType(type)
    setCalories(p.cals.toString())
    setCarbs(p.carbs.toString())
    setFat(p.fat.toString())
    if (suggestedProtein) setProtein(suggestedProtein.toString())
  }

  const handleProteinLevel = (pkgValue: number) => {
    setProteinPerKg(pkgValue)
    if (latestWeightKg) {
      setProtein(Math.round(latestWeightKg * pkgValue).toString())
    }
  }

  const handleSave = () => {
    onSave({
      goalType,
      dailyCalories: Number(calories) || 2000,
      dailyProtein: Number(protein) || 150,
      dailyCarbs: Number(carbs) || 200,
      dailyFat: Number(fat) || 65,
      dailyWaterMl: Number(water) || 2000,
      eatBackPerc,
      proteinPerKg,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nutrition Goal">
      <div className="space-y-4">
        {/* Goal type */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Goal Type</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(GOAL_PRESETS) as [GoalType, typeof GOAL_PRESETS.cut][]).map(([type, preset]) => (
              <button
                key={type}
                onClick={() => handlePreset(type)}
                className={`py-3 px-2 rounded-lg text-center transition-colors ${
                  goalType === type
                    ? 'bg-brand/15 border border-brand/30 text-brand'
                    : 'bg-white/[0.03] text-white/40 hover:glass'
                }`}
              >
                <p className="text-xs font-medium">{preset.label}</p>
                <p className="text-[9px] text-white/25 mt-0.5">{preset.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Calories */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Daily Calories (kcal)</label>
          <input
            type="number"
            min="0"
            max="50000"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
            inputMode="numeric"
          />
        </div>

        {/* Protein per kg */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">Protein Target</label>
            {latestWeightKg && (
              <span className="text-[10px] text-white/25">based on {Math.round(latestWeightKg * 10) / 10} kg</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {PROTEIN_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => handleProteinLevel(level.value)}
                className={`py-2 rounded-lg text-[10px] font-medium transition-colors text-center ${
                  proteinPerKg === level.value
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-white/[0.03] text-white/40 hover:glass'
                }`}
              >
                {level.label}
                {latestWeightKg && (
                  <span className="block text-[9px] text-white/25 mt-0.5">
                    {Math.round(latestWeightKg * level.value)}g
                  </span>
                )}
              </button>
            ))}
          </div>
          {!latestWeightKg && (
            <p className="text-[10px] text-white/20 mb-2">Log a weight entry to auto-calculate from body weight.</p>
          )}
          <div>
            <span className="text-[10px] text-blue-400/60 block mb-1">Protein (g)</span>
            <input
              type="number"
              min="0"
              max="50000"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Carbs + Fat */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Carbs & Fat</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-amber-400/60 block mb-1">Carbs (g)</span>
              <input
                type="number"
                min="0"
                max="50000"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                inputMode="numeric"
              />
            </div>
            <div>
              <span className="text-[10px] text-pink-400/60 block mb-1">Fat (g)</span>
              <input
                type="number"
                min="0"
                max="50000"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        {/* Eat-back percentage */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-xs text-white/40 uppercase tracking-wider">Exercise Calories Eat-Back</label>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {EAT_BACK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEatBackPerc(opt.value)}
                className={`py-2.5 rounded-lg text-center text-[10px] font-medium transition-colors ${
                  eatBackPerc === opt.value
                    ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                    : 'bg-white/[0.03] text-white/40 hover:glass'
                }`}
              >
                <span className="block text-sm font-heading">{opt.label}</span>
                <span className="text-white/25">{opt.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/20 mt-2">
            Fitness trackers overestimate calories burned. 50% is a safe buffer — if you log 600 kcal burned, only 300
            are added to your allowance.
          </p>
        </div>

        {/* Water */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Daily Water (ml)</label>
          <input
            type="number"
            min="0"
            max="50000"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.06]"
            inputMode="numeric"
          />
          <p className="text-[10px] text-white/20 mt-1">Recommended: 2000–3000ml per day</p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Goal</Button>
        </div>
      </div>
    </Modal>
  )
}
