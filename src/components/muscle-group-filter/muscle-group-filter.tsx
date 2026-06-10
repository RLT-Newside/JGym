// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { MUSCLE_CATEGORIES, type MuscleGroup } from '../../types'

interface Props {
  selected: MuscleGroup[]
  onChange: (groups: MuscleGroup[]) => void
}

export function MuscleGroupFilter({ selected, onChange }: Props) {
  const toggleCategory = (muscles: MuscleGroup[]) => {
    const allSelected = muscles.every((m) => selected.includes(m))
    if (allSelected) {
      onChange(selected.filter((m) => !muscles.includes(m)))
    } else {
      onChange([...new Set([...selected, ...muscles])])
    }
  }

  const removeMuscle = (m: MuscleGroup) => {
    onChange(selected.filter((x) => x !== m))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => onChange([])}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            selected.length === 0 ? 'bg-brand text-black' : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1]'
          }`}
        >
          All
        </button>
        {Object.entries(MUSCLE_CATEGORIES).map(([cat, muscles]) => {
          const count = muscles.filter((m) => selected.includes(m)).length
          const allActive = count === muscles.length
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(muscles)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                allActive
                  ? 'bg-brand text-black'
                  : count > 0
                    ? 'bg-brand/20 text-brand'
                    : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1]'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {selected.map((g) => (
            <button
              key={g}
              onClick={() => removeMuscle(g)}
              className="px-2 py-0.5 rounded text-[9px] font-medium bg-brand/10 text-brand/80 hover:bg-brand/20 transition-colors"
            >
              {g} ×
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
