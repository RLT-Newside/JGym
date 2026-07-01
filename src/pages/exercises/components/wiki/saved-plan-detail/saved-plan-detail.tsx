// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ArrowLeft, ArrowUpDown, Dumbbell, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../../../components/button/button'
import { Modal } from '../../../../../components/modal/modal'
import { MuscleTags } from '../../../../../components/muscle-tags/muscle-tags'
import { SearchBar } from '../../../../../components/search-bar/search-bar'
import type { Exercise, MuscleGroup, SavedPlan, SavedPlanDay } from '../../../../../types'
import { isValidRepString } from '../../../../../utils/progression'

interface Props {
  plan: SavedPlan
  exercises: Exercise[]
  onBack: () => void
  onUpdatePlan: (plan: SavedPlan) => void
}

export function SavedPlanDetail({ plan, exercises, onBack, onUpdatePlan }: Props) {
  const [swapTarget, setSwapTarget] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null)
  const [addTarget, setAddTarget] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [editingSets, setEditingSets] = useState<{ dayIndex: number; exIndex: number } | null>(null)
  const [editSets, setEditSets] = useState(3)
  const [editReps, setEditReps] = useState('8-12')
  const [editingName, setEditingName] = useState(false)
  const [planName, setPlanName] = useState(plan.name)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [dayLabel, setDayLabel] = useState('')
  const [dayFocus, setDayFocus] = useState('')
  const [repsError, setRepsError] = useState(false)

  const getExercise = (id: string) => exercises.find((e) => e.id === id)

  const handleSaveName = () => {
    if (planName.trim()) {
      onUpdatePlan({ ...plan, name: planName.trim() })
    }
    setEditingName(false)
  }

  const handleAddDay = () => {
    const newDays = [
      ...plan.days,
      {
        label: `Day ${plan.days.length + 1}`,
        focus: '',
        exerciseIds: [],
        defaults: [],
      },
    ]
    onUpdatePlan({ ...plan, days: newDays })
  }

  const handleRemoveDay = (dayIndex: number) => {
    if (plan.days.length <= 1) return
    const newDays = plan.days.filter((_, i) => i !== dayIndex)
    const newCurrentDay = Math.min(plan.currentDayIndex, newDays.length - 1)
    onUpdatePlan({ ...plan, days: newDays, currentDayIndex: newCurrentDay })
  }

  const handleOpenDayEdit = (dayIndex: number) => {
    setDayLabel(plan.days[dayIndex].label)
    setDayFocus(plan.days[dayIndex].focus)
    setEditingDay(dayIndex)
  }

  const handleSaveDayEdit = () => {
    if (editingDay === null) return
    const newDays = [...plan.days]
    newDays[editingDay] = {
      ...newDays[editingDay],
      label: dayLabel.trim() || `Day ${editingDay + 1}`,
      focus: dayFocus.trim(),
    }
    onUpdatePlan({ ...plan, days: newDays })
    setEditingDay(null)
  }

  const handleSwapExercise = (dayIndex: number, exIndex: number, newExercise: Exercise) => {
    const newDays = [...plan.days]
    const day = { ...newDays[dayIndex] }
    const oldId = day.exerciseIds[exIndex]

    const newExerciseIds = [...day.exerciseIds]
    newExerciseIds[exIndex] = newExercise.id

    const newDefaults = day.defaults.map((d) => (d.exerciseId === oldId ? { ...d, exerciseId: newExercise.id } : d))

    newDays[dayIndex] = { ...day, exerciseIds: newExerciseIds, defaults: newDefaults }
    onUpdatePlan({ ...plan, days: newDays })
    setSwapTarget(null)
    setSearch('')
  }

  const handleAddExercise = (dayIndex: number, exercise: Exercise) => {
    const newDays = [...plan.days]
    const day = { ...newDays[dayIndex] }

    if (day.exerciseIds.includes(exercise.id)) return

    newDays[dayIndex] = {
      ...day,
      exerciseIds: [...day.exerciseIds, exercise.id],
      defaults: [...day.defaults, { exerciseId: exercise.id, sets: 3, reps: '8-12' }],
    }
    onUpdatePlan({ ...plan, days: newDays })
    setAddTarget(null)
    setSearch('')
  }

  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
    const newDays = [...plan.days]
    const day = { ...newDays[dayIndex] }
    const removedId = day.exerciseIds[exIndex]

    newDays[dayIndex] = {
      ...day,
      exerciseIds: day.exerciseIds.filter((_, i) => i !== exIndex),
      defaults: day.defaults.filter((d) => d.exerciseId !== removedId),
    }
    onUpdatePlan({ ...plan, days: newDays })
  }

  const handleMoveExercise = (dayIndex: number, exIndex: number, direction: -1 | 1) => {
    const newDays = [...plan.days]
    const day = { ...newDays[dayIndex] }
    const newIds = [...day.exerciseIds]
    const targetIndex = exIndex + direction
    if (targetIndex < 0 || targetIndex >= newIds.length) return

    ;[newIds[exIndex], newIds[targetIndex]] = [newIds[targetIndex], newIds[exIndex]]
    newDays[dayIndex] = { ...day, exerciseIds: newIds }
    onUpdatePlan({ ...plan, days: newDays })
  }

  const handleSaveSetConfig = () => {
    if (!editingSets) return
    if (!isValidRepString(editReps)) {
      setRepsError(true)
      return
    }
    setRepsError(false)
    const { dayIndex, exIndex } = editingSets
    const newDays = [...plan.days]
    const day = { ...newDays[dayIndex] }
    const exId = day.exerciseIds[exIndex]

    const newDefaults = day.defaults.map((d) => (d.exerciseId === exId ? { ...d, sets: editSets, reps: editReps } : d))
    // If no default existed, add one
    if (!newDefaults.some((d) => d.exerciseId === exId)) {
      newDefaults.push({ exerciseId: exId, sets: editSets, reps: editReps })
    }

    newDays[dayIndex] = { ...day, defaults: newDefaults }
    onUpdatePlan({ ...plan, days: newDays })
    setEditingSets(null)
  }

  const openSetsEditor = (dayIndex: number, exIndex: number) => {
    const day = plan.days[dayIndex]
    const exId = day.exerciseIds[exIndex]
    const def = day.defaults.find((d) => d.exerciseId === exId)
    setEditSets(def?.sets ?? 3)
    setEditReps(def?.reps ?? '8-12')
    setEditingSets({ dayIndex, exIndex })
  }

  const handleRegenerate = () => {
    const newDays: SavedPlanDay[] = plan.days.map((day) => {
      // For each exercise in the day, find the best match from user's exercises
      // based on primary muscle overlap
      const newExerciseIds: string[] = []
      const newDefaults: SavedPlanDay['defaults'] = []
      const usedIds = new Set<string>()

      for (let i = 0; i < day.exerciseIds.length; i++) {
        const origId = day.exerciseIds[i]
        const origEx = getExercise(origId)
        const origDef = day.defaults.find((d) => d.exerciseId === origId)

        if (!origEx) continue

        // Find best replacement: same primary muscles, not already used
        const targetMuscles = origEx.primaryMuscles
        const candidates = exercises
          .filter((e) => !usedIds.has(e.id))
          .map((e) => ({
            exercise: e,
            score: countOverlap(e.primaryMuscles, targetMuscles),
          }))
          .filter((c) => c.score > 0)
          .sort((a, b) => b.score - a.score)

        const best = candidates[0]?.exercise
        if (best) {
          newExerciseIds.push(best.id)
          newDefaults.push({
            exerciseId: best.id,
            sets: origDef?.sets ?? 3,
            reps: origDef?.reps ?? '8-12',
          })
          usedIds.add(best.id)
        }
      }

      return { ...day, exerciseIds: newExerciseIds, defaults: newDefaults }
    })

    onUpdatePlan({ ...plan, days: newDays })
  }

  // Picker exercises (filtered, excluding already in day)
  const getPickerExercises = (excludeIds: string[]) => {
    const excludeSet = new Set(excludeIds)
    return exercises.filter((e) => !excludeSet.has(e.id) && e.name.toLowerCase().includes(search.toLowerCase()))
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={14} /> Back to plans
      </button>

      <div className="flex items-center justify-between">
        {editingName ? (
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            className="font-heading text-2xl bg-transparent border-b border-brand/40 focus:outline-none w-full mr-3"
            autoFocus
          />
        ) : (
          <button
            onClick={() => {
              setPlanName(plan.name)
              setEditingName(true)
            }}
            className="font-heading text-2xl flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            {plan.name}
            <Pencil size={14} className="text-white/20" />
          </button>
        )}
        <Button
          variant="secondary"
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 text-[10px] shrink-0"
        >
          <RefreshCw size={12} /> Regenerate
        </Button>
      </div>

      <div className="space-y-3">
        {plan.days.map((day, di) => (
          <div key={di} className="glass rounded-lg overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/5 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{day.label}</p>
                {day.focus && <p className="text-[10px] text-white/30">{day.focus}</p>}
              </div>
              <button
                onClick={() => handleOpenDayEdit(di)}
                className="p-1.5 hover:bg-white/10 rounded opacity-40 hover:opacity-100 transition-opacity"
                title="Edit day"
              >
                <Pencil size={11} />
              </button>
              {plan.days.length > 1 && (
                <button
                  onClick={() => handleRemoveDay(di)}
                  className="p-1.5 hover:bg-red-900/30 rounded opacity-40 hover:opacity-100 transition-opacity"
                  title="Remove day"
                >
                  <Trash2 size={11} className="text-red-400" />
                </button>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {day.exerciseIds.map((exId, ei) => {
                const ex = getExercise(exId)
                const def = day.defaults.find((d) => d.exerciseId === exId)
                if (!ex) return null
                return (
                  <div key={exId} className="px-3 py-2 flex items-center gap-2">
                    {/* Reorder */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveExercise(di, ei, -1)}
                        disabled={ei === 0}
                        className="text-white/15 hover:text-white/40 disabled:opacity-20 text-[8px]"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveExercise(di, ei, 1)}
                        disabled={ei === day.exerciseIds.length - 1}
                        className="text-white/15 hover:text-white/40 disabled:opacity-20 text-[8px]"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Exercise info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{ex.name}</p>
                      <div className="mt-0.5">
                        <MuscleTags exercise={ex} />
                      </div>
                    </div>

                    {/* Sets/reps (clickable to edit) */}
                    <button
                      onClick={() => openSetsEditor(di, ei)}
                      className="text-[10px] text-white/40 hover:text-white/70 whitespace-nowrap px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
                    >
                      {def ? `${def.sets}×${def.reps}` : '3×8-12'}
                    </button>

                    {/* Swap */}
                    <button
                      onClick={() => {
                        setSwapTarget({ dayIndex: di, exerciseIndex: ei })
                        setSearch('')
                      }}
                      className="p-1.5 hover:bg-white/10 rounded opacity-40 hover:opacity-100"
                      title="Swap exercise"
                    >
                      <ArrowUpDown size={12} />
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveExercise(di, ei)}
                      className="p-1.5 hover:bg-red-900/30 rounded opacity-40 hover:opacity-100"
                    >
                      <Trash2 size={12} className="text-red-400" />
                    </button>
                  </div>
                )
              })}
            </div>
            {/* Add exercise to day */}
            <button
              onClick={() => {
                setAddTarget(di)
                setSearch('')
              }}
              className="w-full px-3 py-2 text-[10px] text-white/30 hover:text-white/50 hover:bg-white/5 flex items-center justify-center gap-1 transition-colors"
            >
              <Plus size={10} /> Add exercise
            </button>
          </div>
        ))}
      </div>

      {/* Add day */}
      <button
        onClick={handleAddDay}
        className="w-full glass rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-colors border border-dashed border-white/10"
      >
        <Plus size={14} /> Add Day
      </button>

      {/* Swap exercise modal */}
      {swapTarget && (
        <Modal
          open={!!swapTarget}
          onClose={() => {
            setSwapTarget(null)
            setSearch('')
          }}
          title="Swap Exercise"
        >
          <SwapHint
            currentExercise={getExercise(plan.days[swapTarget.dayIndex].exerciseIds[swapTarget.exerciseIndex])}
          />
          <div className="space-y-3 mt-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search your exercises..." />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {getPickerExercises(plan.days[swapTarget.dayIndex].exerciseIds).map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleSwapExercise(swapTarget.dayIndex, swapTarget.exerciseIndex, ex)}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm">{ex.name}</span>
                  <div className="mt-0.5">
                    <MuscleTags exercise={ex} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Add exercise modal */}
      {addTarget !== null && (
        <Modal
          open={addTarget !== null}
          onClose={() => {
            setAddTarget(null)
            setSearch('')
          }}
          title={`Add to ${plan.days[addTarget].label}`}
        >
          <div className="space-y-3">
            <SearchBar value={search} onChange={setSearch} placeholder="Search your exercises..." />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {getPickerExercises(plan.days[addTarget].exerciseIds).map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => handleAddExercise(addTarget, ex)}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm">{ex.name}</span>
                  <div className="mt-0.5">
                    <MuscleTags exercise={ex} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit day label/focus modal */}
      {editingDay !== null && (
        <Modal open={editingDay !== null} onClose={() => setEditingDay(null)} title="Edit Day">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Day Name</label>
              <input
                type="text"
                value={dayLabel}
                onChange={(e) => setDayLabel(e.target.value)}
                placeholder="e.g. Push Day, Upper Body, Day 1"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Focus (optional)</label>
              <input
                type="text"
                value={dayFocus}
                onChange={(e) => setDayFocus(e.target.value)}
                placeholder="e.g. Chest, Back, Shoulders"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
              />
            </div>
            <Button onClick={handleSaveDayEdit} className="w-full">
              Save
            </Button>
          </div>
        </Modal>
      )}

      {/* Edit sets/reps modal */}
      {editingSets && (
        <Modal open={!!editingSets} onClose={() => setEditingSets(null)} title="Sets & Reps">
          <div className="space-y-4">
            <p className="text-xs text-white/40">
              {getExercise(plan.days[editingSets.dayIndex].exerciseIds[editingSets.exIndex])?.name}
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Sets</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={editSets}
                  onChange={(e) => setEditSets(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Reps</label>
                <input
                  type="text"
                  value={editReps}
                  onChange={(e) => {
                    setEditReps(e.target.value)
                    setRepsError(false)
                  }}
                  placeholder="e.g. 8-12, 5, max"
                  className={`w-full bg-white/[0.03] border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06] ${repsError ? 'border-red-400/60' : 'border-white/[0.08]'}`}
                />
              </div>
            </div>
            {repsError && (
              <p className="text-[10px] text-red-400/80">Enter a number (e.g. 5), range (e.g. 8-12), or "max"</p>
            )}
            <Button onClick={handleSaveSetConfig} className="w-full">
              Save
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function countOverlap(a: MuscleGroup[], b: MuscleGroup[]): number {
  const set = new Set(b)
  return a.filter((m) => set.has(m)).length
}

function SwapHint({ currentExercise }: { currentExercise?: Exercise }) {
  if (!currentExercise) return null
  return (
    <div className="bg-white/[0.03] rounded-lg p-2.5 flex items-center gap-2">
      <Dumbbell size={12} className="text-white/20" />
      <div className="min-w-0">
        <p className="text-[10px] text-white/30">Replacing</p>
        <p className="text-xs truncate">{currentExercise.name}</p>
      </div>
    </div>
  )
}
