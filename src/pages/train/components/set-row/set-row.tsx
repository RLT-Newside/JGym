// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Check, X } from 'lucide-react'
import { useState } from 'react'
import type { SetEntry, SetType } from '../../../../types'
import { getProgressionTip, getRepRange } from '../../../../utils/progression'

const SET_TYPE_CYCLE: SetType[] = ['normal', 'warmup', 'drop', 'failure']
const SET_TYPE_LABEL: Record<SetType, string> = { normal: '', warmup: 'W', drop: 'D', failure: 'F' }
const SET_TYPE_CLASS: Record<SetType, string> = {
  normal: 'text-white/20',
  warmup: 'text-sky-400',
  drop: 'text-orange-400',
  failure: 'text-red-400',
}

interface Props {
  index: number
  set: SetEntry
  repRange?: string
  onChange: (set: SetEntry) => void
  onDelete: () => void
}

function getRepTip(reps: number, rangeStr: string): { text: string; type: 'success' | 'warning' | 'info' } | null {
  if (reps < 1) return null
  const match = rangeStr.match(/^(\d+)(?:[–-](\d+))?$/)
  if (!match) return null
  const target = match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10)
  const range = getRepRange(target)
  if (!range) {
    const min = parseInt(match[1], 10)
    const max = match[2] ? parseInt(match[2], 10) : min
    return getProgressionTip(reps, { min, max })
  }
  return getProgressionTip(reps, range)
}

export function SetRow({ index, set, repRange, onChange, onDelete }: Props) {
  const [weightText, setWeightText] = useState(set.weight ? String(set.weight) : '')
  const [repsText, setRepsText] = useState(set.reps ? String(set.reps) : '')

  const handleWeightChange = (val: string) => {
    const normalized = val.replace(',', '.')
    setWeightText(normalized)
    const n = parseFloat(normalized)
    if (!Number.isNaN(n)) onChange({ ...set, weight: n })
  }

  const handleWeightBlur = () => {
    const n = parseFloat(weightText)
    if (!Number.isNaN(n)) {
      setWeightText(String(n))
      onChange({ ...set, weight: n })
    } else {
      setWeightText('')
      onChange({ ...set, weight: 0 })
    }
  }

  const handleRepsChange = (val: string) => {
    setRepsText(val)
    const n = parseInt(val, 10)
    if (!Number.isNaN(n)) onChange({ ...set, reps: n })
  }

  const handleRepsBlur = () => {
    const n = parseInt(repsText, 10)
    if (!Number.isNaN(n)) {
      setRepsText(String(n))
      onChange({ ...set, reps: n })
    } else {
      setRepsText('')
      onChange({ ...set, reps: 0 })
    }
  }

  const currentType: SetType = set.type ?? 'normal'
  const cycleType = () => {
    const next = SET_TYPE_CYCLE[(SET_TYPE_CYCLE.indexOf(currentType) + 1) % SET_TYPE_CYCLE.length]
    onChange({ ...set, type: next })
  }

  const repTip = repRange && set.reps > 0 && currentType !== 'warmup' ? getRepTip(set.reps, repRange) : null

  return (
    <div className={`${set.done ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2 py-1.5">
        <button
          onClick={cycleType}
          title={currentType}
          className={`w-6 text-center text-[10px] font-bold font-heading ${SET_TYPE_CLASS[currentType]} hover:opacity-80`}
        >
          {SET_TYPE_LABEL[currentType] || String(index + 1)}
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={repsText}
          onChange={(e) => handleRepsChange(e.target.value)}
          onBlur={handleRepsBlur}
          placeholder="Reps"
          className="w-16 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
        />
        <input
          type="text"
          inputMode="decimal"
          value={weightText}
          onChange={(e) => handleWeightChange(e.target.value)}
          onBlur={handleWeightBlur}
          placeholder="Weight"
          className="w-20 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
        />
        <button
          onClick={() => onChange({ ...set, unit: set.unit === 'kg' ? 'lbs' : 'kg' })}
          className="text-[10px] px-1.5 py-1 bg-white/[0.06] rounded text-white/50 hover:text-white/80 min-w-[32px]"
        >
          {set.unit}
        </button>
        <button
          onClick={() => {
            if (!set.done && (!set.reps || set.reps < 1)) return
            onChange({ ...set, done: !set.done })
          }}
          className={`p-1.5 rounded ${set.done ? 'bg-brand/20 text-brand' : (!set.reps || set.reps < 1) ? 'bg-white/[0.06] text-white/10 cursor-not-allowed' : 'bg-white/[0.06] text-white/30 hover:text-white/60'}`}
        >
          <Check size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-900/30 text-white/20 hover:text-red-400">
          <X size={14} />
        </button>
      </div>
      {repTip && (
        <p
          className={`text-[10px] pl-8 pb-0.5 ${repTip.type === 'success' ? 'text-green-400/80' : repTip.type === 'warning' ? 'text-orange-400/80' : 'text-white/40'}`}
        >
          {repTip.text}
        </p>
      )}
    </div>
  )
}
