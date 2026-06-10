// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ArrowLeft, Download, Dumbbell, RefreshCw } from 'lucide-react'
import { Button } from '../../../../../components/button/button'
import type { WikiPlan } from '../../../../../types'

interface Props {
  plan: WikiPlan
  onBack: () => void
  onImportDefault: (plan: WikiPlan) => void
  onImportGenerated: (plan: WikiPlan) => void
  isImported: boolean
}

export function PlanDetail({ plan, onBack, onImportDefault, onImportGenerated, isImported }: Props) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={14} /> Back to plans
      </button>

      <div>
        <div className="flex items-center gap-2 mb-1">
          {plan.shortName && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand/15 text-brand font-medium">
              {plan.shortName}
            </span>
          )}
          <span className="text-[10px] text-white/30">{plan.frequency}</span>
          <span className="text-[10px] text-white/30">{plan.level}</span>
        </div>
        <h3 className="font-heading text-2xl">{plan.name}</h3>
        <p className="text-xs text-white/40 mt-1">{plan.description}</p>
      </div>

      {isImported ? (
        <div className="bg-green-900/10 border border-green-900/20 rounded-lg p-3 text-center">
          <p className="text-xs text-green-400/70">Plan already imported</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Button onClick={() => onImportDefault(plan)} className="w-full flex items-center justify-center gap-2">
            <Download size={14} /> Import Default Plan
          </Button>
          <p className="text-[9px] text-white/20 text-center">Adds all exercises from this plan to your library</p>

          <Button
            variant="secondary"
            onClick={() => onImportGenerated(plan)}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Generate with My Exercises
          </Button>
          <p className="text-[9px] text-white/20 text-center">
            Builds this plan using exercises you already have, matched by muscle groups
          </p>
        </div>
      )}

      <div className="space-y-3">
        {plan.days.map((day, di) => (
          <div key={di} className="glass rounded-lg overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/5">
              <p className="text-sm font-medium">{day.label}</p>
              <p className="text-[10px] text-white/30">{day.focus}</p>
            </div>
            <div className="divide-y divide-white/5">
              {day.exercises.map((ex, ei) => (
                <div key={ei} className="px-3 py-2 flex items-center gap-3">
                  <Dumbbell size={12} className="text-white/20 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{ex.name}</p>
                    {ex.notes && <p className="text-[9px] text-white/25">{ex.notes}</p>}
                  </div>
                  <span className="text-[10px] text-white/40 whitespace-nowrap">
                    {ex.sets}×{ex.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
