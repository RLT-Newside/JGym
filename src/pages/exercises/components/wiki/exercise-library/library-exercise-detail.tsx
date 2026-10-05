// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Check, Plus } from 'lucide-react'
import { Button } from '../../../../../components/button/button'
import { LibrarySection } from '../../../../../components/exercise-detail/exercise-detail'
import { Modal } from '../../../../../components/modal/modal'
import type { LibraryExercise } from '../../../../../types'

interface Props {
  entry: LibraryExercise | null
  owned: boolean
  onClose: () => void
  onAdd: () => void
}

/** Read-only preview of a library exercise, so it can be inspected before (or without) adding it. */
export function LibraryExerciseDetail({ entry, owned, onClose, onAdd }: Props) {
  if (!entry) return null
  return (
    <Modal open onClose={onClose} title={entry.name}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-0.5">
          {entry.primaryMuscles.map((m) => (
            <span key={m} className="text-[10px] px-1.5 py-0.5 bg-red-600/12 rounded text-red-400/70">
              {m}
            </span>
          ))}
          {entry.secondaryMuscles.map((m) => (
            <span key={`s-${m}`} className="text-[10px] px-1.5 py-0.5 bg-orange-600/10 rounded text-orange-400/40">
              {m}
            </span>
          ))}
        </div>

        <LibrarySection entry={entry} />

        <Button
          onClick={() => !owned && onAdd()}
          disabled={owned}
          className="w-full flex items-center justify-center gap-2"
        >
          {owned ? (
            <>
              <Check size={14} /> In your exercises
            </>
          ) : (
            <>
              <Plus size={14} /> Add to my exercises
            </>
          )}
        </Button>
      </div>
    </Modal>
  )
}
