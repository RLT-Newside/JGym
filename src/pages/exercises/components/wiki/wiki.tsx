// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Calendar, ChevronRight, Download, Dumbbell, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { ConfirmDialog } from '../../../../components/confirm-dialog/confirm-dialog'
import { getLibraryIdForName } from '../../../../data/freeExerciseDb/nameAlias'
import { WIKI_EXERCISES } from '../../../../data/wikiExercises'
import { WIKI_PLANS } from '../../../../data/wikiPlans'
import { useBackHandler } from '../../../../hooks/useBackButton'
import type { Exercise, MuscleGroup, SavedPlan, ShareablePlan, WikiPlan } from '../../../../types'
import { exportJsonFile } from '../../../../utils/fileExport'
import { ExerciseLibrary } from './exercise-library/exercise-library'
import { PlanDetail } from './plan-detail/plan-detail'
import { SavedPlanDetail } from './saved-plan-detail/saved-plan-detail'

interface Props {
  exercises: Exercise[]
  savedPlans: SavedPlan[]
  onAddExercise: (exercise: Exercise) => void
  onSavePlan: (plan: SavedPlan) => void
  onUpdatePlan: (plan: SavedPlan) => void
  onDeletePlan: (id: string) => void
}

type SubTab = 'plans' | 'exercises'

export function Wiki({ exercises, savedPlans, onAddExercise, onSavePlan, onUpdatePlan, onDeletePlan }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('plans')
  const [selectedPlan, setSelectedPlan] = useState<WikiPlan | null>(null)
  const [editingPlan, setEditingPlan] = useState<SavedPlan | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null)
  const [confirmImport, setConfirmImport] = useState<{ message: string; onConfirm: () => void } | null>(null)

  useBackHandler(() => {
    if (editingPlan) {
      setEditingPlan(null)
      return true
    }
    if (selectedPlan) {
      setSelectedPlan(null)
      return true
    }
    return false
  }, !!editingPlan || !!selectedPlan)

  const savedPlanIds = new Set(savedPlans.map((p) => p.name))

  const handleCreatePlan = () => {
    const newPlan: SavedPlan = {
      id: uuid(),
      name: 'My Plan',
      currentDayIndex: 0,
      createdAt: new Date().toISOString(),
      days: [{ label: 'Day 1', focus: '', exerciseIds: [], defaults: [] }],
    }
    onSavePlan(newPlan)
    setEditingPlan(newPlan)
  }

  const handleImportPlan = (plan: WikiPlan) => {
    // Create exercises that don't exist yet
    const userNames = new Set(exercises.map((e) => e.name.toLowerCase()))
    const exerciseIdMap: Record<string, string> = {}

    // Map existing exercises
    exercises.forEach((e) => {
      exerciseIdMap[e.name.toLowerCase()] = e.id
    })

    // Create missing exercises
    for (const day of plan.days) {
      for (const planEx of day.exercises) {
        const lowerName = planEx.name.toLowerCase()
        if (!userNames.has(lowerName) && !exerciseIdMap[lowerName]) {
          const template =
            fileTemplates.get(lowerName) ?? WIKI_EXERCISES.find((w) => w.name.toLowerCase() === lowerName)
          const id = uuid()
          const libraryId = getLibraryIdForName(template?.name ?? planEx.name) ?? undefined
          if (template) {
            onAddExercise({
              id,
              name: template.name,
              muscleGroups: [...template.primaryMuscles, ...template.secondaryMuscles],
              primaryMuscles: [...template.primaryMuscles],
              secondaryMuscles: [...template.secondaryMuscles],
              notes: '',
              createdAt: new Date().toISOString(),
              libraryId,
            })
          } else {
            onAddExercise({
              id,
              name: planEx.name,
              muscleGroups: [],
              primaryMuscles: [],
              secondaryMuscles: [],
              notes: '',
              createdAt: new Date().toISOString(),
              libraryId,
            })
          }
          exerciseIdMap[lowerName] = id
          userNames.add(lowerName)
        }
      }
    }

    // Build saved plan
    const savedPlan: SavedPlan = {
      id: uuid(),
      name: plan.name,
      currentDayIndex: 0,
      createdAt: new Date().toISOString(),
      days: plan.days.map((day) => ({
        label: day.label,
        focus: day.focus,
        exerciseIds: day.exercises.map((e) => exerciseIdMap[e.name.toLowerCase()]).filter(Boolean),
        defaults: day.exercises
          .filter((e) => exerciseIdMap[e.name.toLowerCase()])
          .map((e) => ({
            exerciseId: exerciseIdMap[e.name.toLowerCase()],
            sets: e.sets,
            reps: e.reps,
          })),
      })),
    }

    onSavePlan(savedPlan)
    setFileTemplates(new Map())
    setSelectedPlan(null)
  }

  const handleImportGeneratedPlan = (plan: WikiPlan) => {
    // Build plan using only user's existing exercises, matched by muscle groups
    const exerciseIdMap: Record<string, string> = {}
    exercises.forEach((e) => {
      exerciseIdMap[e.name.toLowerCase()] = e.id
    })

    // For each exercise in the plan, find best match from user's library by primary muscles
    const usedIdsGlobal = new Set<string>()

    const days = plan.days.map((day) => {
      const usedIdsDay = new Set<string>(usedIdsGlobal)
      const exerciseIds: string[] = []
      const defaults: { exerciseId: string; sets: number; reps: string }[] = []

      for (const planEx of day.exercises) {
        // First check exact name match
        const exactId = exerciseIdMap[planEx.name.toLowerCase()]
        if (exactId && !usedIdsDay.has(exactId)) {
          exerciseIds.push(exactId)
          defaults.push({ exerciseId: exactId, sets: planEx.sets, reps: planEx.reps })
          usedIdsDay.add(exactId)
          usedIdsGlobal.add(exactId)
          continue
        }

        // Otherwise match by primary muscles from wiki template or bundled file templates
        const template =
          fileTemplates.get(planEx.name.toLowerCase()) ??
          WIKI_EXERCISES.find((w) => w.name.toLowerCase() === planEx.name.toLowerCase())
        const targetMuscles = template?.primaryMuscles ?? []

        if (targetMuscles.length > 0) {
          const candidates = exercises
            .filter((e) => !usedIdsDay.has(e.id))
            .map((e) => ({
              exercise: e,
              score: countMuscleOverlap(e.primaryMuscles, targetMuscles),
            }))
            .filter((c) => c.score > 0)
            .sort((a, b) => b.score - a.score)

          const best = candidates[0]?.exercise
          if (best) {
            exerciseIds.push(best.id)
            defaults.push({ exerciseId: best.id, sets: planEx.sets, reps: planEx.reps })
            usedIdsDay.add(best.id)
            usedIdsGlobal.add(best.id)
          }
        }
      }

      return { label: day.label, focus: day.focus, exerciseIds, defaults }
    })

    const emptyDays = days.filter((d) => d.exerciseIds.length === 0).length
    if (days.every((d) => d.exerciseIds.length === 0)) {
      setAlertDialog({
        title: 'No Matches',
        message:
          'None of your exercises match this plan. Try importing the default plan first, or add exercises from the Wiki library.',
      })
      return
    }

    const totalOriginal = plan.days.reduce((sum, d) => sum + d.exercises.length, 0)
    const totalMatched = days.reduce((sum, d) => sum + d.exerciseIds.length, 0)

    const doSave = () => {
      onSavePlan({ id: uuid(), name: plan.name, currentDayIndex: 0, createdAt: new Date().toISOString(), days })
      setFileTemplates(new Map())
      setSelectedPlan(null)
    }

    if (totalMatched < totalOriginal && emptyDays > 0) {
      setConfirmImport({
        message: `Matched ${totalMatched}/${totalOriginal} exercises. ${emptyDays} day(s) have no matches. Import anyway?`,
        onConfirm: doSave,
      })
      return
    }

    doSave()
  }

  const handleExportSavedPlan = (plan: SavedPlan) => {
    // Convert saved plan back to shareable format using exercise names
    const shareable: ShareablePlan = {
      version: 1,
      plan: {
        name: plan.name,
        description: '',
        frequency: `${plan.days.length} days`,
        level: '',
        days: plan.days.map((day) => ({
          label: day.label,
          focus: day.focus,
          exercises: day.defaults
            .map((def) => {
              const ex = exercises.find((e) => e.id === def.exerciseId)
              return {
                name: ex?.name ?? 'Unknown',
                sets: def.sets,
                reps: def.reps,
              }
            })
            .filter((e) => e.name !== 'Unknown'),
        })),
      },
      exercises: [...new Set(plan.days.flatMap((d) => d.exerciseIds))]
        .map((id) => {
          const ex = exercises.find((e) => e.id === id)
          if (!ex) return null
          return {
            name: ex.name,
            category: '',
            primaryMuscles: [...ex.primaryMuscles],
            secondaryMuscles: [...ex.secondaryMuscles],
          }
        })
        .filter(Boolean) as ShareablePlan['exercises'],
    }

    const slug = plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    exportJsonFile(shareable, `jgym-plan-${slug}.json`, plan.name)
  }

  // Store bundled exercise templates from imported files for use during default import
  const [fileTemplates, setFileTemplates] = useState<Map<string, ShareablePlan['exercises'][number]>>(new Map())

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data?.version === 1 && data?.plan?.name && Array.isArray(data?.plan?.days)) {
          const shareable = data as ShareablePlan
          const wikiPlan: WikiPlan = {
            id: uuid(),
            name: shareable.plan.name,
            shortName: '',
            description: shareable.plan.description ?? '',
            frequency: shareable.plan.frequency ?? '',
            level: shareable.plan.level ?? '',
            days: shareable.plan.days,
          }
          // Store bundled templates for later use by handleImportPlan
          if (shareable.exercises?.length) {
            setFileTemplates(new Map(shareable.exercises.map((t) => [t.name.toLowerCase(), t])))
          }
          // Open in PlanDetail so user can choose default vs generated
          setSelectedPlan(wikiPlan)
        } else {
          setAlertDialog({ title: 'Invalid File', message: 'Invalid plan file. Expected a shared JGym plan.' })
        }
      } catch {
        setAlertDialog({
          title: 'Parse Error',
          message: 'Could not parse file. Make sure it is a valid JSON plan file.',
        })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  if (editingPlan) {
    // Get latest version from savedPlans in case it was updated
    const latestPlan = savedPlans.find((p) => p.id === editingPlan.id) ?? editingPlan
    return (
      <div className="px-4 py-4">
        <SavedPlanDetail
          plan={latestPlan}
          exercises={exercises}
          onBack={() => setEditingPlan(null)}
          onUpdatePlan={onUpdatePlan}
        />
      </div>
    )
  }

  if (selectedPlan) {
    return (
      <div className="px-4 py-4">
        <PlanDetail
          plan={selectedPlan}
          onBack={() => setSelectedPlan(null)}
          onImportDefault={handleImportPlan}
          onImportGenerated={handleImportGeneratedPlan}
          isImported={savedPlanIds.has(selectedPlan.name)}
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Sub-tab toggle */}
      <div className="flex glass rounded-xl p-0.5">
        <button
          onClick={() => setSubTab('plans')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            subTab === 'plans' ? 'bg-white/[0.08] text-white' : 'text-white/40'
          }`}
        >
          <Calendar size={14} /> Training Plans
        </button>
        <button
          onClick={() => setSubTab('exercises')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-medium transition-colors ${
            subTab === 'exercises' ? 'bg-white/[0.08] text-white' : 'text-white/40'
          }`}
        >
          <Dumbbell size={14} /> Exercises
        </button>
      </div>

      {subTab === 'plans' && (
        <div className="space-y-4">
          {/* Create + Import */}
          <div className="flex gap-2">
            <button
              onClick={handleCreatePlan}
              className="flex-1 bg-brand text-black rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-brand/90 transition-colors"
            >
              <Plus size={14} /> Create Plan
            </button>
            <button
              onClick={() => importFileRef.current?.click()}
              className="flex-1 glass rounded-xl p-3 flex items-center justify-center gap-2 text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-colors border border-dashed border-white/10"
            >
              <Upload size={14} /> Import File
            </button>
            <input ref={importFileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </div>

          {/* Saved plans */}
          {savedPlans.length > 0 && (
            <div>
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">My Plans</h3>
              <div className="space-y-2">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="glass rounded-xl p-3 flex items-center gap-3">
                    <button onClick={() => setEditingPlan(plan)} className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium">{plan.name}</p>
                      <p className="text-[10px] text-white/30">
                        {plan.days.length} days &middot; Day {plan.currentDayIndex + 1} next
                      </p>
                    </button>
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="p-2 hover:bg-white/10 rounded opacity-50 hover:opacity-100"
                      title="Edit plan"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleExportSavedPlan(plan)}
                      className="p-2 hover:bg-white/10 rounded opacity-50 hover:opacity-100"
                      title="Share plan"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => onDeletePlan(plan.id)}
                      className="p-2 hover:bg-red-900/30 rounded opacity-50 hover:opacity-100"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Browse plans */}
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Browse Plans</h3>
            <div className="space-y-2">
              {WIKI_PLANS.map((plan) => {
                const imported = savedPlanIds.has(plan.name)
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{plan.name}</span>
                        {imported && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-900/20 text-green-400/60">
                            saved
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-brand/70">{plan.shortName}</span>
                        <span className="text-[10px] text-white/25">{plan.frequency}</span>
                        <span className="text-[10px] text-white/25">{plan.level}</span>
                      </div>
                      <p className="text-[10px] text-white/30 mt-1 line-clamp-2">{plan.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-white/20 flex-shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'exercises' && <ExerciseLibrary userExercises={exercises} onAddExercise={onAddExercise} />}
      <ConfirmDialog
        open={!!alertDialog}
        onClose={() => setAlertDialog(null)}
        onConfirm={() => setAlertDialog(null)}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        confirmLabel="OK"
      />
      <ConfirmDialog
        open={!!confirmImport}
        onClose={() => setConfirmImport(null)}
        onConfirm={() => {
          confirmImport?.onConfirm()
          setConfirmImport(null)
        }}
        title="Partial Match"
        message={confirmImport?.message ?? ''}
        confirmLabel="Import Anyway"
      />
    </div>
  )
}

function countMuscleOverlap(a: MuscleGroup[], b: MuscleGroup[]): number {
  const set = new Set(b)
  return a.filter((m) => set.has(m)).length
}
