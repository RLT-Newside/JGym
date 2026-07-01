// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useMemo, useState } from 'react'
import { useAppData } from '../../context/app-data'
import { useBackHandler } from '../../hooks/useBackButton'
import type { Exercise, MuscleGroup } from '../../types'
import { calculatePR } from '../../utils/pr'
import { ExercisesView } from './exercises.view'

type SubTab = 'mine' | 'wiki'

export function ExerciseList() {
  const {
    exercises,
    sessions,
    savedPlans,
    saveExercise: onSave,
    deleteExercise: onDelete,
    startWith: onStartWith,
    savePlan: onSavePlan,
    updatePlan: onUpdatePlan,
    deletePlan: onDeletePlan,
  } = useAppData()
  const [subTab, setSubTab] = useState<SubTab>('mine')
  const [search, setSearch] = useState('')
  const [filterGroups, setFilterGroups] = useState<MuscleGroup[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useBackHandler(() => {
    if (subTab === 'wiki') {
      setSubTab('mine')
      return true
    }
    return false
  }, subTab === 'wiki')

  const prMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculatePR>>()
    for (const ex of exercises) map.set(ex.id, calculatePR(ex.id, sessions))
    return map
  }, [exercises, sessions])

  const filtered = useMemo(
    () =>
      exercises.filter((ex) => {
        const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase())
        const allMuscles = [...(ex.primaryMuscles ?? []), ...(ex.secondaryMuscles ?? []), ...(ex.muscleGroups ?? [])]
        const matchGroup = filterGroups.length === 0 || allMuscles.some((g) => filterGroups.includes(g))
        return matchSearch && matchGroup
      }),
    [exercises, sessions, search, filterGroups],
  )

  return (
    <ExercisesView
      exercises={exercises}
      sessions={sessions}
      savedPlans={savedPlans}
      subTab={subTab}
      search={search}
      filterGroups={filterGroups}
      formOpen={formOpen}
      editing={editing}
      detailExercise={detailExercise}
      deleteId={deleteId}
      prMap={prMap}
      filtered={filtered}
      onSubTabChange={setSubTab}
      onSearchChange={setSearch}
      onFilterGroupsChange={setFilterGroups}
      onFormOpen={() => setFormOpen(true)}
      onFormClose={() => {
        setFormOpen(false)
        setEditing(null)
      }}
      onEdit={setEditing}
      onDetailOpen={setDetailExercise}
      onDetailClose={() => setDetailExercise(null)}
      onDeleteRequest={setDeleteId}
      onDeleteCancel={() => setDeleteId(null)}
      onSave={onSave}
      onDelete={onDelete}
      onStartWith={onStartWith}
      onSavePlan={onSavePlan}
      onUpdatePlan={onUpdatePlan}
      onDeletePlan={onDeletePlan}
    />
  )
}
