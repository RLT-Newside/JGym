// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { BookOpen, Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog'
import { ExerciseDetail } from '../../components/exercise-detail/exercise-detail'
import { MuscleGroupFilter } from '../../components/muscle-group-filter/muscle-group-filter'
import { MuscleTags } from '../../components/muscle-tags/muscle-tags'
import { SearchBar } from '../../components/search-bar/search-bar'
import type { Exercise, MuscleGroup, SavedPlan, Session } from '../../types'
import type { calculatePR } from '../../utils/pr'
import { formatPR } from '../../utils/pr'
import { ExerciseForm } from './components/exercise-form/exercise-form'
import { Wiki } from './components/wiki/wiki'

type SubTab = 'mine' | 'wiki'

interface Props {
  exercises: Exercise[]
  sessions: Session[]
  savedPlans: SavedPlan[]
  subTab: SubTab
  search: string
  filterGroups: MuscleGroup[]
  formOpen: boolean
  editing: Exercise | null
  detailExercise: Exercise | null
  deleteId: string | null
  prMap: Map<string, ReturnType<typeof calculatePR>>
  filtered: Exercise[]
  onSubTabChange: (tab: SubTab) => void
  onSearchChange: (v: string) => void
  onFilterGroupsChange: (groups: MuscleGroup[]) => void
  onFormOpen: () => void
  onFormClose: () => void
  onEdit: (ex: Exercise) => void
  onDetailOpen: (ex: Exercise) => void
  onDetailClose: () => void
  onDeleteRequest: (id: string) => void
  onDeleteCancel: () => void
  onSave: (exercise: Exercise) => void
  onDelete: (id: string) => void
  onStartWith: (exercise: Exercise) => void
  onResetProgress: (exercise: Exercise) => void
  onSavePlan: (plan: SavedPlan) => void
  onUpdatePlan: (plan: SavedPlan) => void
  onDeletePlan: (id: string) => void
}

export function ExercisesView({
  exercises,
  sessions,
  savedPlans,
  subTab,
  search,
  filterGroups,
  formOpen,
  editing,
  detailExercise,
  deleteId,
  prMap,
  filtered,
  onSubTabChange,
  onSearchChange,
  onFilterGroupsChange,
  onFormOpen,
  onFormClose,
  onEdit,
  onDetailOpen,
  onDetailClose,
  onDeleteRequest,
  onDeleteCancel,
  onSave,
  onDelete,
  onStartWith,
  onResetProgress,
  onSavePlan,
  onUpdatePlan,
  onDeletePlan,
}: Props) {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex glass rounded-xl p-0.5">
        <button
          onClick={() => onSubTabChange('mine')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            subTab === 'mine' ? 'bg-white/[0.08] text-white' : 'text-white/40'
          }`}
        >
          <Dumbbell size={14} /> My Exercises
        </button>
        <button
          onClick={() => onSubTabChange('wiki')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            subTab === 'wiki' ? 'bg-white/[0.08] text-white' : 'text-white/40'
          }`}
        >
          <BookOpen size={14} /> Wiki & Plans
        </button>
      </div>

      {subTab === 'wiki' ? (
        <Wiki
          exercises={exercises}
          savedPlans={savedPlans}
          onAddExercise={onSave}
          onSavePlan={onSavePlan}
          onUpdatePlan={onUpdatePlan}
          onDeletePlan={onDeletePlan}
        />
      ) : (
        <>
          <SearchBar value={search} onChange={onSearchChange} placeholder="Search exercises..." />
          <MuscleGroupFilter selected={filterGroups} onChange={onFilterGroupsChange} />

          <div className="space-y-2">
            {filtered.length === 0 && (
              <p className="text-sm text-white/30 py-8 text-center">
                {exercises.length === 0 ? 'No exercises yet. Add one!' : 'No matches.'}
              </p>
            )}
            {filtered.map((ex) => {
              const pr = prMap.get(ex.id)
              return (
                <div
                  key={ex.id}
                  className="glass rounded-xl p-3 flex items-center gap-3 group hover:bg-white/[0.06] transition-all"
                >
                  <button className="flex-1 text-left min-w-0" onClick={() => onDetailOpen(ex)}>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-lg truncate">{ex.name}</span>
                      {pr && <span className="text-brand text-xs font-heading">{formatPR(pr)}</span>}
                    </div>
                    <div className="mt-1">
                      <MuscleTags exercise={ex} />
                    </div>
                  </button>
                  <button
                    onClick={() => onEdit(ex)}
                    className="p-2 hover:bg-white/10 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteRequest(ex.id)}
                    className="p-2 hover:bg-red-900/30 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              )
            })}
          </div>

          <button
            onClick={onFormOpen}
            className="fixed right-4 bottom-20 z-30 w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-[0_0_24px_var(--color-brand)] shadow-brand/30 hover:shadow-brand/50 transition-shadow press-scale"
          >
            <Plus size={24} className="text-black" />
          </button>

          <ExerciseForm
            key={editing?.id ?? 'new'}
            open={formOpen || !!editing}
            onClose={onFormClose}
            onSave={onSave}
            exercise={editing}
          />

          <ExerciseDetail
            open={!!detailExercise}
            onClose={onDetailClose}
            exercise={detailExercise}
            sessions={sessions}
            onStartWith={onStartWith}
            onEdit={(ex) => {
              onDetailClose()
              onEdit(ex)
            }}
            onResetProgress={onResetProgress}
          />

          <ConfirmDialog
            open={!!deleteId}
            onClose={onDeleteCancel}
            onConfirm={() => {
              if (deleteId) onDelete(deleteId)
            }}
            title="Delete Exercise"
            message="This will permanently delete this exercise. Sessions that used it will still be visible."
            confirmLabel="Delete"
            danger
          />
        </>
      )}
    </div>
  )
}
