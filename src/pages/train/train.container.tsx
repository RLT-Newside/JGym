// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useCallback, useRef, useState } from 'react'
import { useMediaSession } from '../../hooks/useMediaSession'
import { useActiveSession } from '../../hooks/useSession'
import type { Exercise, SavedPlan, Session, SessionExerciseEntry, SetEntry } from '../../types'
import { calculatePR } from '../../utils/pr'
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
  const [unfinishedWarning, setUnfinishedWarning] = useState<string[]>([])
  const [summarySession, setSummarySession] = useState<Session | null>(null)
  const [summaryElapsed, setSummaryElapsed] = useState(0)
  const [prPopup, setPrPopup] = useState<{ name: string; key: number } | null>(null)
  const celebratedRef = useRef<Set<string>>(new Set())
  const handlePrPopupDone = useCallback(() => setPrPopup(null), [])

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
    celebratedRef.current = new Set()
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
    startSession(`${plan.name} – ${day.label}`, entries, {
      id: plan.id,
      nextIndex: (dayIndex + 1) % plan.days.length,
    })
    celebratedRef.current = new Set()
    setDayPickerPlan(null)
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
    maybeCelebratePR(entry)
  }

  // Fire a live PR popup the first time a set in this entry beats the
  // exercise's all-time PR from saved history. Once per exercise per session.
  const maybeCelebratePR = (entry: SessionExerciseEntry) => {
    if (celebratedRef.current.has(entry.exerciseId)) return
    const best = entry.sets.reduce<SetEntry | null>(
      (b, s) => (!b || s.weight > b.weight || (s.weight === b.weight && s.reps > b.reps) ? s : b),
      null,
    )
    if (!best || best.weight <= 0 || best.reps <= 0) return
    const prBefore = calculatePR(entry.exerciseId, sessions)
    if (!prBefore) return
    const beats = best.weight > prBefore.weight || (best.weight === prBefore.weight && best.reps > prBefore.reps)
    if (!beats) return
    celebratedRef.current.add(entry.exerciseId)
    const name = exercises.find((e) => e.id === entry.exerciseId)?.name ?? 'New PR'
    setPrPopup({ name, key: Date.now() })
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
    // Capture the plan link before finishSession() clears the active session.
    const planId = active.planId
    const planNextIndex = active.planNextIndex
    const session = finishSession()
    if (session && session.entries.length > 0) {
      onSessionSave(session)
      setSummarySession(session)
      setSummaryElapsed(elapsed)
      if (planId !== undefined && planNextIndex !== undefined) {
        onAdvancePlanDay(planId, planNextIndex)
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
      prPopup={prPopup}
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
      onPrPopupDone={handlePrPopupDone}
      onCancelSession={cancelSession}
      onNavigateToExercises={onNavigateToExercises}
    />
  )
}
