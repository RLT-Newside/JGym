// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Lightbulb, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type { GoalType } from '../../../../types'

interface Props {
  goalType: GoalType
}

const TIPS: Record<GoalType, { title: string; tips: string[] }> = {
  cut: {
    title: 'Fat Loss Tips',
    tips: [
      'Aim for a 300-500 kcal daily deficit — aggressive cuts lead to muscle loss.',
      'Keep protein high (1.6-2.2g per kg bodyweight) to preserve muscle during a cut.',
      'Prioritize whole foods — they keep you fuller for fewer calories.',
      'Drink water before meals. Thirst is often mistaken for hunger.',
      'Sleep 7-9 hours. Poor sleep increases hunger hormones (ghrelin) by up to 28%.',
      "Don't eliminate any food group. Sustainability beats perfection.",
      "Track consistently, not perfectly. Missing a day is fine — stopping isn't.",
      'Eat more fiber (25-30g/day) from vegetables, fruits, and whole grains.',
      'Weigh yourself at the same time daily (morning, after bathroom) for accuracy.',
      'A stall lasting 2+ weeks? Reduce by another 100-200 kcal or add 10 min cardio.',
    ],
  },
  maintain: {
    title: 'Maintenance Tips',
    tips: [
      'Your TDEE changes with activity, stress, and seasons — check in monthly.',
      'Protein should stay at 1.4-1.8g per kg to maintain muscle mass.',
      'Weight fluctuates 1-2 kg daily from water, food volume, and sodium — this is normal.',
      'Focus on food quality: 80% whole foods, 20% what you enjoy.',
      'Consistent meal timing helps regulate hunger hormones.',
      "Keep training intensity up — maintenance calories doesn't mean maintenance effort.",
      'If your weight creeps up 2+ kg above target over 2 weeks, cut back slightly.',
      'Use weekly averages, not daily weigh-ins, to assess your trend.',
      'Maintenance is a skill. Learning to eat intuitively after tracking is the goal.',
    ],
  },
  bulk: {
    title: 'Muscle Building Tips',
    tips: [
      'Aim for a 200-350 kcal surplus. More ≠ more muscle — just more fat.',
      'Protein: 1.6-2.2g per kg bodyweight. Spread across 4+ meals for optimal synthesis.',
      'Time carbs around your workouts for better performance and recovery.',
      'Progressive overload in the gym matters more than any supplement.',
      'Gaining 0.25-0.5 kg/week is ideal for muscle gain with minimal fat.',
      "If gaining faster than 0.5 kg/week, you're likely adding unnecessary fat.",
      'Sleep is when muscle rebuilds. Prioritize 7-9 hours.',
      'Creatine (3-5g/day) is the most researched and effective supplement for muscle growth.',
      "Don't dirty bulk — gaining 1+ kg/week means a longer, harder cut later.",
      "Track your training too. If lifts aren't going up, the surplus is going to fat.",
    ],
  },
}

const GENERAL_TIPS = [
  {
    title: 'Calorie Counting 101',
    text: '1 kg of body fat ≈ 7,700 kcal. A 500 kcal daily deficit = ~0.5 kg/week loss. A 300 kcal surplus = ~0.25 kg/week gain.',
  },
  {
    title: 'The TDEE Algorithm',
    text: 'Your TDEE (Total Daily Energy Expenditure) is estimated from your calorie intake + weight changes over time. The more consistently you track, the more accurate it becomes.',
  },
  {
    title: 'Macros Matter',
    text: 'Protein builds and repairs muscle (4 kcal/g). Carbs fuel performance (4 kcal/g). Fat supports hormones (9 kcal/g). Hit your protein target first, then split the rest.',
  },
  {
    title: 'Consistency > Perfection',
    text: 'Tracking 5 out of 7 days consistently beats tracking perfectly for 2 weeks then quitting. Build the habit first, optimize later.',
  },
  {
    title: 'Weight Fluctuations',
    text: 'Your weight can swing 1-3 kg in a single day from water, sodium, food volume, and hormones. Always look at the weekly trend, not individual weigh-ins.',
  },
]

export function NutritionTips({ goalType }: Props) {
  const goalTips = TIPS[goalType]

  return (
    <div className="space-y-4">
      {/* Goal-specific tips */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          {goalType === 'cut' ? (
            <TrendingDown size={16} className="text-green-400" />
          ) : goalType === 'bulk' ? (
            <TrendingUp size={16} className="text-blue-400" />
          ) : (
            <Minus size={16} className="text-white/40" />
          )}
          <h3 className="text-sm font-medium">{goalTips.title}</h3>
        </div>
        <div className="space-y-2.5">
          {goalTips.tips.map((tip, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[10px] text-brand/40 mt-0.5 shrink-0">{i + 1}.</span>
              <p className="text-xs text-white/50 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* General knowledge */}
      <div>
        <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">How It Works</h3>
        <div className="space-y-2">
          {GENERAL_TIPS.map((tip, i) => (
            <div key={i} className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={12} className="text-brand/40" />
                <h4 className="text-xs font-medium">{tip.title}</h4>
              </div>
              <p className="text-[10px] text-white/35 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
