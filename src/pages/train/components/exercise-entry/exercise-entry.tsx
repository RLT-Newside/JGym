// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ArrowLeftRight, Check, CheckCircle2, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ConfirmDialog } from '../../../../components/confirm-dialog/confirm-dialog'
import type { Exercise, Session, SessionExerciseEntry, SetEntry } from '../../../../types'
import { formatSetsSummary } from '../../../../utils/format'
import { calculatePR, formatPR, getLastSession } from '../../../../utils/pr'
import { isValidRepString } from '../../../../utils/progression'
import { SetRow } from '../set-row/set-row'

interface Props {
  exercise: Exercise
  entry: SessionExerciseEntry
  sessions: Session[]
  onChange: (entry: SessionExerciseEntry) => void
  onRemove: () => void
  onOpenDetail?: () => void
  onReplace?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onUpdateExercise?: (exercise: Exercise) => void
}

export function ExerciseEntryComponent({
  exercise,
  entry,
  sessions,
  onChange,
  onRemove,
  onOpenDetail,
  onReplace,
  onMoveUp,
  onMoveDown,
  onUpdateExercise,
}: Props) {
  const [warmupDefaultPrompt, setWarmupDefaultPrompt] = useState(false)
  const [editingRepRange, setEditingRepRange] = useState(false)
  const [repRangeInput, setRepRangeInput] = useState('')
  const repRangeInputRef = useRef<HTMLInputElement>(null)
  const lastSession = getLastSession(exercise.id, sessions, exercise.progressResetAt)
  const pr = calculatePR(exercise.id, sessions, exercise.progressResetAt)

  const addSet = (type?: 'warmup') => {
    const lastSet = entry.sets[entry.sets.length - 1]
    const newSet: SetEntry = lastSet
      ? { reps: lastSet.reps, weight: lastSet.weight, unit: lastSet.unit, type: type ?? lastSet.type }
      : { reps: 0, weight: 0, unit: 'kg', type }
    if (type === 'warmup') {
      const firstWorkingIdx = entry.sets.findIndex((s) => s.type !== 'warmup')
      const insertAt = firstWorkingIdx === -1 ? entry.sets.length : firstWorkingIdx
      const sets = [...entry.sets]
      sets.splice(insertAt, 0, newSet)
      onChange({ ...entry, sets })
      if (!exercise.defaultWarmup && onUpdateExercise) {
        setWarmupDefaultPrompt(true)
      }
    } else {
      onChange({ ...entry, sets: [...entry.sets, newSet] })
    }
  }

  const updateSet = (i: number, set: SetEntry) => {
    const sets = [...entry.sets]
    sets[i] = set
    onChange({ ...entry, sets })
  }

  const deleteSet = (i: number) => {
    onChange({ ...entry, sets: entry.sets.filter((_, idx) => idx !== i) })
  }

  const openRepRangeEdit = () => {
    setRepRangeInput(entry.repRange ?? '')
    setEditingRepRange(true)
    setTimeout(() => repRangeInputRef.current?.select(), 0)
  }

  const commitRepRange = () => {
    const trimmed = repRangeInput.trim()
    if (trimmed === '') {
      onChange({ ...entry, repRange: undefined })
    } else if (isValidRepString(trimmed)) {
      onChange({ ...entry, repRange: trimmed })
    }
    setEditingRepRange(false)
  }

  const finishExercise = () => {
    const sets = entry.sets.filter((s) => s.reps >= 1)
    onChange({ ...entry, sets, finished: true })
  }

  const editExercise = () => {
    onChange({ ...entry, finished: false })
  }

  if (entry.finished) {
    return (
      <div className="relative glass rounded-xl p-3 border border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
            <button
              onClick={onOpenDetail}
              className="font-heading text-lg truncate text-left hover:text-brand transition-colors"
            >
              {exercise.name}
            </button>
          </div>
          <button
            onClick={editExercise}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 px-2 py-1 transition-colors flex-shrink-0"
          >
            <Pencil size={12} /> Edit
          </button>
        </div>
        <p className="text-[11px] text-white/40 mt-1 pl-7">{formatSetsSummary(entry.sets)}</p>
      </div>
    )
  }

  return (
    <div className="relative glass rounded-xl p-3">
      <div className="flex items-center justify-between mb-1">
        <button onClick={onOpenDetail} className="font-heading text-lg text-left hover:text-brand transition-colors">
          {exercise.name}
        </button>
        <div className="flex items-center gap-1">
          {(onMoveUp || onMoveDown) && (
            <div className="flex flex-col">
              <button
                onClick={onMoveUp}
                disabled={!onMoveUp}
                title="Move exercise up"
                className="p-1 hover:bg-white/10 rounded text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition-colors"
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!onMoveDown}
                title="Move exercise down"
                className="p-1 hover:bg-white/10 rounded text-white/30 hover:text-white/60 disabled:opacity-20 disabled:cursor-default transition-colors"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          )}
          {onReplace && (
            <button
              onClick={onReplace}
              title="Replace exercise"
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white/60 transition-colors"
            >
              <ArrowLeftRight size={14} />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-red-900/30 rounded-lg text-white/30 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2">
        {pr && <p className="text-[10px] text-brand/60">PR: {formatPR(pr)}</p>}
        {lastSession && (
          <p className="text-[10px] text-white/40">
            Last: {lastSession.sets.map((s) => `${s.reps}×${s.weight}${s.unit}`).join(' / ')}
          </p>
        )}
        <div className="ml-auto flex items-center gap-1">
          {editingRepRange ? (
            <>
              <input
                ref={repRangeInputRef}
                type="text"
                value={repRangeInput}
                onChange={(e) => setRepRangeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRepRange()
                  if (e.key === 'Escape') setEditingRepRange(false)
                }}
                placeholder="e.g. 8-12"
                aria-label="Rep range target"
                className="w-20 bg-white/[0.04] border border-brand/30 rounded px-1.5 py-0.5 text-[10px] text-center focus:outline-none focus:border-brand/60"
              />
              <button
                onClick={commitRepRange}
                title="Save target"
                className="p-0.5 text-green-400/70 hover:text-green-400 transition-colors"
              >
                <Check size={11} />
              </button>
              <button
                onClick={() => setEditingRepRange(false)}
                title="Cancel"
                className="p-0.5 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={11} />
              </button>
            </>
          ) : entry.repRange ? (
            <button
              onClick={openRepRangeEdit}
              title="Edit rep range target"
              className="flex items-center gap-1 text-[10px] text-brand/60 hover:text-brand transition-colors"
            >
              Target: {entry.repRange} reps
              <Pencil size={9} />
            </button>
          ) : (
            <button
              onClick={openRepRangeEdit}
              title="Set rep range target"
              className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              <Plus size={9} /> Set target
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1 px-0">
        <span className="w-10 text-center text-[10px] text-white/20">#</span>
        <span className="w-16 text-center text-[10px] text-white/20">Reps</span>
        <span className="w-20 text-center text-[10px] text-white/20">Weight</span>
      </div>

      {entry.sets.map((set, i) => (
        <SetRow
          key={i}
          index={i}
          set={set}
          repRange={entry.repRange}
          onChange={(s) => updateSet(i, s)}
          onDelete={() => deleteSet(i)}
        />
      ))}

      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => addSet()}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 px-2 py-1 transition-colors"
        >
          <Plus size={12} /> Add Set
        </button>
        <button
          onClick={() => addSet('warmup')}
          className="flex items-center gap-1 text-xs text-sky-400/60 hover:text-sky-400 px-2 py-1 transition-colors"
        >
          <Plus size={12} /> Warmup
        </button>
        <button
          onClick={finishExercise}
          className="flex items-center gap-1 text-xs text-green-400/70 hover:text-green-400 px-2 py-1 ml-auto transition-colors"
        >
          <Check size={12} /> Finish Exercise
        </button>
      </div>

      <ConfirmDialog
        open={warmupDefaultPrompt}
        onClose={() => setWarmupDefaultPrompt(false)}
        onConfirm={() => onUpdateExercise?.({ ...exercise, defaultWarmup: true })}
        title="Default Warmup"
        message="Always start this exercise with a warmup set by default?"
        confirmLabel="Make default"
      />
    </div>
  )
}
