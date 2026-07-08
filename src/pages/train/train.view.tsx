// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { Calendar, ChevronRight, Play, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/button/button'
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog'
import { Modal } from '../../components/modal/modal'
import type { Exercise, SavedPlan, Session, SessionExerciseEntry } from '../../types'
import { formatDate, formatSetsSummary } from '../../utils/format'
import { ExerciseEntryComponent } from './components/exercise-entry/exercise-entry'
import { ExercisePicker } from './components/exercise-picker/exercise-picker'
import { MediaBar } from './components/media-bar/media-bar'
import { PRPopup } from './components/pr-popup/pr-popup'
import { SessionTimer } from './components/session-timer/session-timer'
import { WorkoutSummaryModal } from './components/workout-summary-modal/workout-summary-modal'

interface ActiveSession {
  label: string
  entries: SessionExerciseEntry[]
}

interface MediaState {
  title: string | null
  artist: string | null
  isPlaying: boolean
  hasPermission: boolean
  sendCommand: (action: 'play_pause' | 'next' | 'previous') => void
  requestPermission: () => void
}

interface Props {
  active: ActiveSession | null
  elapsed: number
  exercises: Exercise[]
  sessions: Session[]
  savedPlans: SavedPlan[]
  label: string
  pickerOpen: boolean
  finishConfirm: boolean
  cancelConfirm: boolean
  dayPickerPlan: SavedPlan | null
  unfinishedWarning: string[]
  summarySession: Session | null
  summaryElapsed: number
  prPopup: { name: string; key: number } | null
  recentSessions: Session[]
  media: MediaState
  musicPopupDisabled: boolean
  isSupporter: boolean
  onLabelChange: (v: string) => void
  onStart: () => void
  onStartFromPlanDay: (plan: SavedPlan, dayIndex: number) => void
  onAddExercise: (exercise: Exercise) => void
  onReplaceExercise: (index: number, replacement: Exercise) => void
  onEntryChange: (index: number, entry: SessionExerciseEntry) => void
  onRemoveEntry: (index: number) => void
  onFinish: () => void
  onPickerOpen: () => void
  onPickerClose: () => void
  onFinishConfirmOpen: () => void
  onFinishConfirmClose: () => void
  onCancelConfirmOpen: () => void
  onCancelConfirmClose: () => void
  onDayPickerOpen: (plan: SavedPlan) => void
  onDayPickerClose: () => void
  onUnfinishedWarningClose: () => void
  onSummaryClose: () => void
  onPrPopupDone: () => void
  onCancelSession: () => void
  onNavigateToExercises?: () => void
  onExerciseClick?: (exercise: Exercise) => void
}

export function TrainView({
  active,
  elapsed,
  exercises,
  sessions,
  savedPlans,
  label,
  pickerOpen,
  finishConfirm,
  cancelConfirm,
  dayPickerPlan,
  unfinishedWarning,
  summarySession,
  summaryElapsed,
  prPopup,
  recentSessions,
  media,
  musicPopupDisabled,
  isSupporter,
  onLabelChange,
  onStart,
  onStartFromPlanDay,
  onAddExercise,
  onReplaceExercise,
  onEntryChange,
  onRemoveEntry,
  onFinish,
  onPickerOpen,
  onPickerClose,
  onFinishConfirmOpen,
  onFinishConfirmClose,
  onCancelConfirmOpen,
  onCancelConfirmClose,
  onDayPickerOpen,
  onDayPickerClose,
  onUnfinishedWarningClose,
  onSummaryClose,
  onPrPopupDone,
  onCancelSession,
  onNavigateToExercises,
  onExerciseClick,
}: Props) {
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  const replaceTarget =
    replaceIndex !== null ? exercises.find((e) => e.id === active?.entries[replaceIndex]?.exerciseId) : null
  const exercisesForReplace = replaceTarget
    ? [...exercises]
        .filter((e) => e.id !== replaceTarget.id)
        .sort(
          (a, b) =>
            b.primaryMuscles.filter((m) => replaceTarget.primaryMuscles.includes(m)).length -
            a.primaryMuscles.filter((m) => replaceTarget.primaryMuscles.includes(m)).length,
        )
    : []

  if (!active) {
    return (
      <>
        <WorkoutSummaryModal
          session={summarySession}
          sessions={sessions}
          exercises={exercises}
          savedPlans={savedPlans}
          elapsed={summaryElapsed}
          onClose={onSummaryClose}
          onNavigateToExercises={onNavigateToExercises}
          isSupporter={isSupporter}
        />
        <div className="px-4 py-4 space-y-6">
          <div className="space-y-3">
            <input
              type="text"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder='Session label (e.g. "Push Day")'
              className="w-full glass rounded-xl px-3 py-2.5 text-sm placeholder:text-white/30 focus:outline-none focus:border-brand/40 focus:bg-white/[0.06] transition-all"
            />
            <Button onClick={onStart} className="w-full flex items-center justify-center gap-2">
              <Play size={16} /> Start Training
            </Button>
          </div>

          {savedPlans.length > 0 && (
            <div>
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">My Plans</h3>
              <div className="space-y-2">
                {savedPlans.map((plan) => {
                  const day = plan.days[plan.currentDayIndex]
                  return (
                    <button
                      key={plan.id}
                      onClick={() => onDayPickerOpen(plan)}
                      className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="p-2 bg-brand/10 rounded-xl">
                        <Calendar size={16} className="text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{plan.name}</p>
                        <p className="text-[10px] text-white/40">
                          Next: <span className="text-brand/70">{day.label}</span>
                          <span className="text-white/20 ml-1">({day.focus})</span>
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {dayPickerPlan && (
            <Modal open={!!dayPickerPlan} onClose={onDayPickerClose} title={dayPickerPlan.name}>
              <div className="space-y-2">
                <p className="text-xs text-white/40 mb-3">Select which day to train</p>
                {dayPickerPlan.days.map((day, i) => {
                  const isNext = i === dayPickerPlan.currentDayIndex
                  return (
                    <button
                      key={i}
                      onClick={() => onStartFromPlanDay(dayPickerPlan, i)}
                      className={`w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors ${
                        isNext ? 'bg-brand/10 border border-brand/20 hover:bg-brand/15' : 'bg-white/[0.03] hover:glass'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{day.label}</span>
                          {isNext && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand/20 text-brand font-medium">
                              next
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/30 mt-0.5">{day.focus}</p>
                        <p className="text-[10px] text-white/20 mt-0.5">
                          {day.exerciseIds.length} exercises &middot;{' '}
                          {day.exerciseIds
                            .map((id) => exercises.find((e) => e.id === id)?.name)
                            .filter(Boolean)
                            .slice(0, 3)
                            .join(', ')}
                          {day.exerciseIds.length > 3 && '...'}
                        </p>
                      </div>
                      <Play size={14} className="text-brand flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
            </Modal>
          )}

          {recentSessions.length > 0 && (
            <div>
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Recent Sessions</h3>
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <div key={s.id} className="glass rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/50">{formatDate(s.date)}</span>
                      {s.label && <span className="text-xs text-white/30">{s.label}</span>}
                    </div>
                    {s.entries.map((entry, i) => {
                      const ex = exercises.find((e) => e.id === entry.exerciseId)
                      return (
                        <p key={i} className="text-xs text-white/40">
                          {ex?.name ?? 'Unknown'}: {formatSetsSummary(entry.sets)}
                        </p>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4 pb-24">
      <PRPopup pr={prPopup} onDone={onPrPopupDone} />
      <SessionTimer label={active.label} elapsed={elapsed} />

      {active.entries.map((entry, i) => {
        const exercise = exercises.find((e) => e.id === entry.exerciseId)
        if (!exercise) return null
        return (
          <ExerciseEntryComponent
            key={entry.exerciseId}
            exercise={exercise}
            entry={entry}
            sessions={sessions}
            onChange={(e) => onEntryChange(i, e)}
            onRemove={() => onRemoveEntry(i)}
            onOpenDetail={onExerciseClick ? () => onExerciseClick(exercise) : undefined}
            onReplace={() => setReplaceIndex(i)}
          />
        )
      })}

      <Button variant="secondary" onClick={onPickerOpen} className="w-full flex items-center justify-center gap-2">
        <Plus size={16} /> Add Exercise
      </Button>

      <ExercisePicker open={pickerOpen} onClose={onPickerClose} exercises={exercises} onSelect={onAddExercise} />

      <ExercisePicker
        open={replaceIndex !== null}
        title="Replace Exercise"
        exercises={exercisesForReplace}
        onClose={() => setReplaceIndex(null)}
        onSelect={(ex) => {
          if (replaceIndex !== null) onReplaceExercise(replaceIndex, ex)
          setReplaceIndex(null)
        }}
      />

      <div className="fixed bottom-16 left-0 right-0 glass-nav border-t">
        <MediaBar
          title={media.title}
          artist={media.artist}
          isPlaying={media.isPlaying}
          hasPermission={media.hasPermission}
          hidePrompt={musicPopupDisabled}
          onCommand={media.sendCommand}
          onRequestPermission={media.requestPermission}
        />
        <div className="px-4 py-3 flex gap-3">
          <Button variant="danger" onClick={onCancelConfirmOpen} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onFinishConfirmOpen} className="flex-1">
            Finish Session
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={finishConfirm}
        onClose={onFinishConfirmClose}
        onConfirm={onFinish}
        title="Finish Session"
        message={`Save this session with ${active.entries.length} exercise(s)?`}
        confirmLabel="Save & Finish"
      />

      <ConfirmDialog
        open={cancelConfirm}
        onClose={onCancelConfirmClose}
        onConfirm={onCancelSession}
        title="Cancel Session"
        message="Discard this session? All data will be lost."
        confirmLabel="Discard"
        danger
      />

      <Modal open={unfinishedWarning.length > 0} onClose={onUnfinishedWarningClose} title="Unfinished Sets">
        <div className="space-y-3">
          <p className="text-sm text-white/60">Fix or delete the incomplete sets before saving:</p>
          <ul className="space-y-1">
            {unfinishedWarning.map((name) => (
              <li key={name} className="text-sm text-brand font-heading">
                {name}
              </li>
            ))}
          </ul>
          <Button onClick={onUnfinishedWarningClose} className="w-full mt-2">
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  )
}
