// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Check, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { SearchBar } from '../../../../../components/search-bar/search-bar'
import { loadLibrary } from '../../../../../data/freeExerciseDb'
import { useExerciseImage } from '../../../../../hooks/useExerciseImage'
import type { Exercise, LibraryExercise } from '../../../../../types'

interface Props {
  userExercises: Exercise[]
  onAddExercise: (exercise: Exercise) => void
}

export function ExerciseLibrary({ userExercises, onAddExercise }: Props) {
  const [library, setLibrary] = useState<LibraryExercise[]>([])
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [activeEquip, setActiveEquip] = useState<string | null>(null)
  const [activeLevel, setActiveLevel] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadLibrary().then(setLibrary)
  }, [])

  const userLibraryIds = useMemo(
    () => new Set(userExercises.map((e) => e.libraryId).filter((v): v is string => !!v)),
    [userExercises],
  )
  const userExerciseNames = useMemo(() => new Set(userExercises.map((e) => e.name.toLowerCase())), [userExercises])

  const categories = useMemo(() => [...new Set(library.map((e) => e.category).filter(Boolean))].sort(), [library])
  const equipments = useMemo(
    () => [...new Set(library.map((e) => e.equipment).filter((v): v is string => !!v))].sort(),
    [library],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return library.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false
      if (activeCat && ex.category !== activeCat) return false
      if (activeEquip && ex.equipment !== activeEquip) return false
      if (activeLevel && ex.level !== activeLevel) return false
      return true
    })
  }, [library, search, activeCat, activeEquip, activeLevel])

  const handleAdd = (entry: LibraryExercise) => {
    const exercise: Exercise = {
      id: uuid(),
      name: entry.name,
      muscleGroups: [...entry.primaryMuscles, ...entry.secondaryMuscles],
      primaryMuscles: [...entry.primaryMuscles],
      secondaryMuscles: [...entry.secondaryMuscles],
      notes: '',
      createdAt: new Date().toISOString(),
      libraryId: entry.id,
    }
    onAddExercise(exercise)
    setAddedIds((prev) => new Set(prev).add(entry.id))
  }

  const isOwned = (entry: LibraryExercise) =>
    userLibraryIds.has(entry.id) || userExerciseNames.has(entry.name.toLowerCase()) || addedIds.has(entry.id)

  return (
    <div className="space-y-3">
      <SearchBar value={search} onChange={setSearch} placeholder="Search exercises..." />

      <FilterRow label="Category" value={activeCat} options={categories} onChange={setActiveCat} />
      <FilterRow label="Equipment" value={activeEquip} options={equipments} onChange={setActiveEquip} />
      <FilterRow
        label="Level"
        value={activeLevel}
        options={['beginner', 'intermediate', 'expert']}
        onChange={setActiveLevel}
      />

      <p className="text-[10px] text-white/25">{filtered.length} exercises</p>

      <div className="space-y-1.5">
        {filtered.slice(0, 200).map((ex) => (
          <LibraryRow key={ex.id} entry={ex} owned={isOwned(ex)} onAdd={() => handleAdd(ex)} />
        ))}
        {filtered.length > 200 && (
          <p className="text-[10px] text-white/30 text-center py-2">
            Showing first 200 — refine filters to narrow down.
          </p>
        )}
      </div>
    </div>
  )
}

interface FilterRowProps {
  label: string
  value: string | null
  options: string[]
  onChange: (next: string | null) => void
}

function FilterRow({ label, value, options, onChange }: FilterRowProps) {
  if (options.length === 0) return null
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">{label}</p>
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => onChange(null)}
          className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors ${
            !value ? 'bg-brand text-black' : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1]'
          }`}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? null : opt)}
            className={`px-2.5 py-1.5 rounded text-[10px] font-medium transition-colors capitalize ${
              value === opt ? 'bg-brand text-black' : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.1]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

interface LibraryRowProps {
  entry: LibraryExercise
  owned: boolean
  onAdd: () => void
}

function LibraryRow({ entry, owned, onAdd }: LibraryRowProps) {
  const { src } = useExerciseImage(entry.imageFolder, 0)
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white/[0.04] overflow-hidden flex items-center justify-center">
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-[8px] text-white/20">no img</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{entry.name}</p>
        <div className="flex flex-wrap gap-0.5 mt-1">
          {entry.primaryMuscles.map((m) => (
            <span key={m} className="text-[9px] px-1 py-0.5 bg-red-600/12 rounded text-red-400/70">
              {m}
            </span>
          ))}
          {entry.secondaryMuscles.map((m) => (
            <span key={`s-${m}`} className="text-[9px] px-1 py-0.5 bg-orange-600/10 rounded text-orange-400/40">
              {m}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => !owned && onAdd()}
        disabled={owned}
        className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
          owned ? 'bg-green-900/20 text-green-400/60' : 'bg-brand/10 text-brand hover:bg-brand/20'
        }`}
      >
        {owned ? <Check size={14} /> : <Plus size={14} />}
      </button>
    </div>
  )
}
