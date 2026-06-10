// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useState } from 'react'
import { useMediaSession } from '../../hooks/useMediaSession'
import { useActiveSession } from '../../hooks/useSession'
import type { Exercise, SavedPlan, Session, SessionExerciseEntry } from '../../types'
import { TrainView } from './train.view'

interface Props {
  exercises: Exercise[]
  sessions: Session[]
  savedPlans: SavedPlan[]
  onSessionSave: (session: Session) => void
  onAdvancePlanDay: (planId: string, nextIndex: number) => void
  onNavigateToExercises?: () => void
  preSelectedExercise?: Exercise | null
  onClearPreSelected?: () => void
  isSupporter?: boolean
}

export function TrainContainer({
  exercises,
  sessions,
  savedPlans,
  onSessionSave,
  onAdvancePlanDay,
  onNavigateToExercises,
  preSelectedExercise,
  onClearPreSelected,
  isSupporter = false,
}: Props) {
  const { active, elapsed, startSession, updateEntries, finishSession, cancelSession } = useActiveSession()
  const media = useMediaSession(!!active)
  const [label, setLabel] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [finishConfirm, setFinishConfirm] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [dayPickerPlan, setDayPickerPlan] = useState<SavedPlan | null>(null)
  const [pendingPlanAdvance, setPendingPlanAdvance] = useState<{ planId: string; nextIndex: number } | null>(null)
  const [unfinishedWarning, setUnfinishedWarning] = useState<string[]>([])
  const [summarySession, setSummarySession] = useState<Session | null>(null)
  const [summaryElapsed, setSummaryElapsed] = useState(0)

  const handleStart = () => {
    if (preSelectedExercise) {
      const entry: SessionExerciseEntry = {
        exerciseId: preSelectedExercise.id,
        sets: [{ reps: 0, weight: 0, unit: 'kg' }],
      }
      startSession(label, [entry])
      onClearPreSelected?.()
    } else {
      startSession(label)
    }
    setLabel('')
  }

  const handleStartFromPlanDay = (plan: SavedPlan, dayIndex: number) => {
    const day = plan.days[dayIndex]
    const entries: SessionExerciseEntry[] = day.exerciseIds
      .filter((id) => exercises.some((e) => e.id === id))
      .map((id) => {
        const def = day.defaults.find((d) => d.exerciseId === id)
        const numSets = def?.sets ?? 3
        return {
          exerciseId: id,
          sets: Array.from({ length: numSets }, () => ({ reps: 0, weight: 0, unit: 'kg' as const })),
          repRange: def?.reps,
        }
      })
    startSession(`${plan.name} – ${day.label}`, entries)
    setDayPickerPlan(null)
    setPendingPlanAdvance({ planId: plan.id, nextIndex: (dayIndex + 1) % plan.days.length })
  }

  const handleAddExercise = (exercise: Exercise) => {
    if (!active) return
    const exists = active.entries.some((e) => e.exerciseId === exercise.id)
    if (exists) return
    const entry: SessionExerciseEntry = {
      exerciseId: exercise.id,
      sets: [{ reps: 0, weight: 0, unit: 'kg' }],
    }
    updateEntries([...active.entries, entry])
  }

  const handleEntryChange = (index: number, entry: SessionExerciseEntry) => {
    if (!active) return
    const entries = [...active.entries]
    entries[index] = entry
    updateEntries(entries)
  }

  const handleRemoveEntry = (index: number) => {
    if (!active) return
    updateEntries(active.entries.filter((_, i) => i !== index))
  }

  const handleFinish = () => {
    if (!active) return
    const problemExercises = active.entries
      .filter((entry) => entry.sets.some((s) => s.reps < 1))
      .map((entry) => exercises.find((e) => e.id === entry.exerciseId)?.name ?? 'Unknown')
    if (problemExercises.length > 0) {
      setFinishConfirm(false)
      setUnfinishedWarning(problemExercises)
      return
    }
    const session = finishSession()
    if (session && session.entries.length > 0) {
      onSessionSave(session)
      setSummarySession(session)
      setSummaryElapsed(elapsed)
      if (pendingPlanAdvance) {
        onAdvancePlanDay(pendingPlanAdvance.planId, pendingPlanAdvance.nextIndex)
        setPendingPlanAdvance(null)
      }
    }
  }

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <TrainView
      active={active}
      elapsed={elapsed}
      exercises={exercises}
      sessions={sessions}
      savedPlans={savedPlans}
      label={label}
      pickerOpen={pickerOpen}
      finishConfirm={finishConfirm}
      cancelConfirm={cancelConfirm}
      dayPickerPlan={dayPickerPlan}
      unfinishedWarning={unfinishedWarning}
      summarySession={summarySession}
      summaryElapsed={summaryElapsed}
      recentSessions={recentSessions}
      media={media}
      isSupporter={isSupporter}
      onLabelChange={setLabel}
      onStart={handleStart}
      onStartFromPlanDay={handleStartFromPlanDay}
      onAddExercise={handleAddExercise}
      onEntryChange={handleEntryChange}
      onRemoveEntry={handleRemoveEntry}
      onFinish={handleFinish}
      onPickerOpen={() => setPickerOpen(true)}
      onPickerClose={() => setPickerOpen(false)}
      onFinishConfirmOpen={() => setFinishConfirm(true)}
      onFinishConfirmClose={() => setFinishConfirm(false)}
      onCancelConfirmOpen={() => setCancelConfirm(true)}
      onCancelConfirmClose={() => setCancelConfirm(false)}
      onDayPickerOpen={setDayPickerPlan}
      onDayPickerClose={() => setDayPickerPlan(null)}
      onUnfinishedWarningClose={() => setUnfinishedWarning([])}
      onSummaryClose={() => setSummarySession(null)}
      onCancelSession={cancelSession}
      onNavigateToExercises={onNavigateToExercises}
    />
  )
}
