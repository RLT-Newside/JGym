// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { MuscleTags } from '../../../../components/muscle-tags/muscle-tags'
import type { Exercise, Session } from '../../../../types'
import { formatRelativeDate } from '../../../../utils/format'
import { calculatePR, formatPR, getLastSession } from '../../../../utils/pr'

interface Props {
  exercise: Exercise
  sessions: Session[]
  onClick: () => void
}

export function ExerciseCard({ exercise, sessions, onClick }: Props) {
  const pr = calculatePR(exercise.id, sessions)
  const last = getLastSession(exercise.id, sessions)

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 h-40 glass rounded-xl p-3 text-left hover:bg-white/[0.06] hover:border-brand/20 hover:shadow-[0_0_20px_var(--color-brand)] hover:shadow-brand/10 transition-all press-scale flex flex-col"
    >
      <h3 className="font-heading text-base truncate w-full">{exercise.name}</h3>
      <div className="mt-1 overflow-hidden max-h-5">
        <MuscleTags exercise={exercise} />
      </div>
      <div className="mt-auto space-y-0.5 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase text-white/30 tracking-wider">PR</span>
          <span className="text-brand font-heading text-sm truncate ml-2">{formatPR(pr)}</span>
        </div>
        {last && (
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase text-white/30 tracking-wider">Last</span>
            <span className="text-[10px] text-white/50 truncate ml-2">{formatRelativeDate(last.date)}</span>
          </div>
        )}
      </div>
    </button>
  )
}
