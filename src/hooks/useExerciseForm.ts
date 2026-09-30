// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useCallback, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Exercise, MuscleGroup } from '../types'

export interface ExerciseFormState {
  name: string
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  notes: string
  description: string
  customImages: string[]
  defaultWarmup: boolean
  selectionMode: 'primary' | 'secondary'
  canSave: boolean
  setName: (v: string) => void
  setNotes: (v: string) => void
  setDescription: (v: string) => void
  setCustomImages: React.Dispatch<React.SetStateAction<string[]>>
  setDefaultWarmup: (v: boolean) => void
  setSelectionMode: (v: 'primary' | 'secondary') => void
  handleToggleMuscle: (muscle: MuscleGroup) => void
  buildExercise: () => Exercise
  reset: () => void
}

export function useExerciseForm(exercise: Exercise | null | undefined): ExerciseFormState {
  const [name, setName] = useState(exercise?.name ?? '')
  const [primaryMuscles, setPrimaryMuscles] = useState<MuscleGroup[]>(
    exercise?.primaryMuscles ?? exercise?.muscleGroups ?? [],
  )
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>(exercise?.secondaryMuscles ?? [])
  const [notes, setNotes] = useState(exercise?.notes ?? '')
  const [description, setDescription] = useState(exercise?.description ?? '')
  const [customImages, setCustomImages] = useState<string[]>(exercise?.customImages ?? [])
  const [defaultWarmup, setDefaultWarmup] = useState(exercise?.defaultWarmup ?? false)
  const [selectionMode, setSelectionMode] = useState<'primary' | 'secondary'>('primary')

  const handleToggleMuscle = useCallback(
    (muscle: MuscleGroup) => {
      if (selectionMode === 'primary') {
        if (primaryMuscles.includes(muscle)) {
          setPrimaryMuscles((prev) => prev.filter((m) => m !== muscle))
        } else {
          setSecondaryMuscles((prev) => prev.filter((m) => m !== muscle))
          setPrimaryMuscles((prev) => [...prev, muscle])
        }
      } else {
        if (secondaryMuscles.includes(muscle)) {
          setSecondaryMuscles((prev) => prev.filter((m) => m !== muscle))
        } else {
          setPrimaryMuscles((prev) => prev.filter((m) => m !== muscle))
          setSecondaryMuscles((prev) => [...prev, muscle])
        }
      }
    },
    [selectionMode, primaryMuscles, secondaryMuscles],
  )

  const buildExercise = useCallback(
    (): Exercise => ({
      id: exercise?.id ?? uuid(),
      name: name.trim(),
      muscleGroups: [...primaryMuscles, ...secondaryMuscles],
      primaryMuscles,
      secondaryMuscles,
      notes: notes.trim(),
      createdAt: exercise?.createdAt ?? new Date().toISOString(),
      libraryId: exercise?.libraryId,
      description: description.trim() || undefined,
      customImages: customImages.length > 0 ? customImages : undefined,
      defaultWarmup: defaultWarmup || undefined,
      progressResetAt: exercise?.progressResetAt,
    }),
    [exercise, name, primaryMuscles, secondaryMuscles, notes, description, customImages, defaultWarmup],
  )

  const reset = useCallback(() => {
    setName(exercise?.name ?? '')
    setPrimaryMuscles(exercise?.primaryMuscles ?? exercise?.muscleGroups ?? [])
    setSecondaryMuscles(exercise?.secondaryMuscles ?? [])
    setNotes(exercise?.notes ?? '')
    setDescription(exercise?.description ?? '')
    setCustomImages(exercise?.customImages ?? [])
    setDefaultWarmup(exercise?.defaultWarmup ?? false)
    setSelectionMode('primary')
  }, [exercise])

  return {
    name,
    primaryMuscles,
    secondaryMuscles,
    notes,
    description,
    customImages,
    defaultWarmup,
    selectionMode,
    canSave: name.trim().length > 0,
    setName,
    setNotes,
    setDescription,
    setCustomImages,
    setDefaultWarmup,
    setSelectionMode,
    handleToggleMuscle,
    buildExercise,
    reset,
  }
}
