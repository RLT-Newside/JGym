// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { BodyMap } from '../../../../components/body-map/body-map'
import { Button } from '../../../../components/button/button'
import { Modal } from '../../../../components/modal/modal'
import type { Exercise, MuscleGroup } from '../../../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (exercise: Exercise) => void
  exercise?: Exercise | null
}

export function ExerciseForm({ open, onClose, onSave, exercise }: Props) {
  const [name, setName] = useState(exercise?.name ?? '')
  const [primaryMuscles, setPrimaryMuscles] = useState<MuscleGroup[]>(
    exercise?.primaryMuscles ?? exercise?.muscleGroups ?? [],
  )
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>(exercise?.secondaryMuscles ?? [])
  const [notes, setNotes] = useState(exercise?.notes ?? '')
  const [selectionMode, setSelectionMode] = useState<'primary' | 'secondary'>('primary')

  const handleToggle = (muscle: MuscleGroup) => {
    if (selectionMode === 'primary') {
      if (primaryMuscles.includes(muscle)) {
        setPrimaryMuscles((prev) => prev.filter((m) => m !== muscle))
      } else {
        // Remove from secondary if switching to primary
        setSecondaryMuscles((prev) => prev.filter((m) => m !== muscle))
        setPrimaryMuscles((prev) => [...prev, muscle])
      }
    } else {
      if (secondaryMuscles.includes(muscle)) {
        setSecondaryMuscles((prev) => prev.filter((m) => m !== muscle))
      } else {
        // Remove from primary if switching to secondary
        setPrimaryMuscles((prev) => prev.filter((m) => m !== muscle))
        setSecondaryMuscles((prev) => [...prev, muscle])
      }
    }
  }

  const handleSave = () => {
    if (!name.trim()) return
    const allMuscles = [...primaryMuscles, ...secondaryMuscles]
    onSave({
      id: exercise?.id ?? uuid(),
      name: name.trim(),
      muscleGroups: allMuscles,
      primaryMuscles,
      secondaryMuscles,
      notes: notes.trim(),
      createdAt: exercise?.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={exercise ? 'Edit Exercise' : 'Add Exercise'}>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bench Press"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Muscle Groups</label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSelectionMode('primary')}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                selectionMode === 'primary'
                  ? 'bg-brand text-black'
                  : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1]'
              }`}
            >
              Primary
            </button>
            <button
              onClick={() => setSelectionMode('secondary')}
              className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                selectionMode === 'secondary'
                  ? 'bg-brand/30 text-brand'
                  : 'bg-white/[0.06] text-white/40 hover:bg-white/[0.1]'
              }`}
            >
              Secondary
            </button>
          </div>
          <BodyMap
            primaryMuscles={primaryMuscles}
            secondaryMuscles={secondaryMuscles}
            onToggle={handleToggle}
            mode={selectionMode}
          />
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  )
}
