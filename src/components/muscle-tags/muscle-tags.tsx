// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import type { Exercise } from '../../types'

interface Props {
  exercise: Exercise
  size?: 'sm' | 'xs'
}

export function MuscleTags({ exercise, size = 'xs' }: Props) {
  const primary = exercise.primaryMuscles ?? exercise.muscleGroups ?? []
  const secondary = exercise.secondaryMuscles ?? []

  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[9px]'
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-1 py-0.5'

  return (
    <div className="flex flex-wrap gap-0.5">
      {primary.map((g) => (
        <span key={g} className={`${textSize} ${padding} bg-red-600/12 rounded text-red-400/70`}>
          {g}
        </span>
      ))}
      {secondary.map((g) => (
        <span key={g} className={`${textSize} ${padding} bg-orange-600/10 rounded text-orange-400/40`}>
          {g}
        </span>
      ))}
    </div>
  )
}
