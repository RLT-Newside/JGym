// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../../../../components/modal/modal'
import { MuscleTags } from '../../../../components/muscle-tags/muscle-tags'
import { SearchBar } from '../../../../components/search-bar/search-bar'
import { loadLibrary } from '../../../../data/freeExerciseDb'
import type { Exercise, LibraryExercise } from '../../../../types'

const MUSCLE_CATEGORIES = [
  { label: 'Chest', muscles: ['Upper Chest', 'Mid Chest', 'Lower Chest', 'Serratus Anterior'] },
  {
    label: 'Back',
    muscles: [
      'Upper Traps',
      'Mid Traps',
      'Lower Traps',
      'Rhomboids',
      'Upper Lats',
      'Lower Lats',
      'Erector Spinae',
      'Teres Major',
      'Infraspinatus',
    ],
  },
  { label: 'Shoulders', muscles: ['Front Delts', 'Side Delts', 'Rear Delts', 'Rotator Cuff'] },
  {
    label: 'Arms',
    muscles: [
      'Biceps Long Head',
      'Biceps Short Head',
      'Brachialis',
      'Triceps Long Head',
      'Triceps Lateral Head',
      'Triceps Medial Head',
      'Brachioradialis',
      'Wrist Flexors',
      'Wrist Extensors',
    ],
  },
  {
    label: 'Core',
    muscles: ['Upper Abs', 'Lower Abs', 'External Obliques', 'Internal Obliques', 'Transverse Abdominis'],
  },
  {
    label: 'Legs',
    muscles: [
      'Rectus Femoris',
      'Vastus Lateralis',
      'Vastus Medialis',
      'Vastus Intermedius',
      'Biceps Femoris',
      'Semitendinosus',
      'Semimembranosus',
      'Gluteus Maximus',
      'Gluteus Medius',
      'Gluteus Minimus',
      'Hip Flexors',
      'Adductors',
      'TFL',
      'Gastrocnemius',
      'Soleus',
      'Tibialis Anterior',
    ],
  },
] as const

interface Props {
  open: boolean
  onClose: () => void
  exercises: Exercise[]
  onSelect: (exercise: Exercise) => void
  title?: string
}

export function ExercisePicker({ open, onClose, exercises, onSelect, title = 'Add Exercise' }: Props) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [library, setLibrary] = useState<LibraryExercise[]>([])

  useEffect(() => {
    if (open) loadLibrary().then(setLibrary)
  }, [open])

  const equipmentByLibraryId = useMemo(() => {
    const m = new Map<string, string>()
    for (const e of library) if (e.equipment) m.set(e.id, e.equipment)
    return m
  }, [library])

  const equipmentOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const ex of exercises) {
      if (ex.libraryId) {
        const eq = equipmentByLibraryId.get(ex.libraryId)
        if (eq) seen.add(eq)
      }
    }
    return [...seen].sort()
  }, [exercises, equipmentByLibraryId])

  const filtered = useMemo(
    () =>
      exercises.filter((ex) => {
        const matchesSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase())
        if (!matchesSearch) return false
        if (selectedCategory) {
          const cat = MUSCLE_CATEGORIES.find((c) => c.label === selectedCategory)
          if (cat && !ex.primaryMuscles.some((m) => (cat.muscles as readonly string[]).includes(m))) return false
        }
        if (selectedEquipment) {
          if (!ex.libraryId) return false
          if (equipmentByLibraryId.get(ex.libraryId) !== selectedEquipment) return false
        }
        return true
      }),
    [exercises, search, selectedCategory, selectedEquipment, equipmentByLibraryId],
  )

  const handleClose = () => {
    onClose()
    setSearch('')
    setSelectedCategory(null)
    setSelectedEquipment(null)
  }

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div className="space-y-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search exercises..." />
        <div className="flex gap-1.5 flex-wrap">
          {MUSCLE_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(selectedCategory === cat.label ? null : cat.label)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                selectedCategory === cat.label
                  ? 'bg-brand text-black'
                  : 'glass text-white/40 hover:bg-white/[0.06] hover:text-white/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {equipmentOptions.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {equipmentOptions.map((eq) => (
              <button
                key={eq}
                onClick={() => setSelectedEquipment(selectedEquipment === eq ? null : eq)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors capitalize ${
                  selectedEquipment === eq
                    ? 'bg-brand text-black'
                    : 'glass text-white/40 hover:bg-white/[0.06] hover:text-white/60'
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        )}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filtered.length === 0 && <p className="text-sm text-white/30 text-center py-4">No exercises found.</p>}
          {filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                onSelect(ex)
                handleClose()
              }}
              className="w-full text-left px-3 py-2.5 rounded hover:bg-white/5 transition-colors"
            >
              <span className="font-heading text-base">{ex.name}</span>
              <div className="mt-0.5">
                <MuscleTags exercise={ex} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )
}
