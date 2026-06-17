// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { ImagePlus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { BodyMap } from '../../../../components/body-map/body-map'
import { Button } from '../../../../components/button/button'
import { Modal } from '../../../../components/modal/modal'
import type { Exercise, MuscleGroup } from '../../../../types'
import { resizeImageFile } from '../../../../utils/imageResize'

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
  const [description, setDescription] = useState(exercise?.description ?? '')
  const [customImages, setCustomImages] = useState<string[]>(exercise?.customImages ?? [])
  const [selectionMode, setSelectionMode] = useState<'primary' | 'secondary'>('primary')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleAddImages = async (files: FileList) => {
    const newImages: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        newImages.push(await resizeImageFile(file))
      } catch {
        /* skip unreadable files */
      }
    }
    setCustomImages((prev) => [...prev, ...newImages])
  }

  const handleRemoveImage = (index: number) => {
    setCustomImages((prev) => prev.filter((_, i) => i !== index))
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
      libraryId: exercise?.libraryId,
      description: description.trim() || undefined,
      customImages: customImages.length > 0 ? customImages : undefined,
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
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="How to perform this exercise..."
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-brand/40 focus:bg-white/[0.06]"
          />
        </div>

        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Images</label>
          {customImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {customImages.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-white/[0.04]">
                  <img src={src} alt={`Custom ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white/80 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleAddImages(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors px-2 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg"
          >
            <ImagePlus size={14} /> Add image
          </button>
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
