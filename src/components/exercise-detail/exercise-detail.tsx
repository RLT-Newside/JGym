// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useState } from 'react'
import { useExerciseImage } from '../../hooks/useExerciseImage'
import { useLibraryEntry } from '../../hooks/useLibraryEntry'
import type { Exercise, LibraryExercise, Session } from '../../types'
import { formatDate, formatSetsSummary } from '../../utils/format'
import { calculatePR, formatPR } from '../../utils/pr'
import { Button } from '../button/button'
import { Modal } from '../modal/modal'
import { MuscleTags } from '../muscle-tags/muscle-tags'
import { ProgressionChart } from './progression-chart'

interface Props {
  open: boolean
  onClose: () => void
  exercise: Exercise | null
  sessions: Session[]
  onStartWith: (exercise: Exercise) => void
}

export function ExerciseDetail({ open, onClose, exercise, sessions, onStartWith }: Props) {
  const library = useLibraryEntry(exercise?.libraryId)
  if (!exercise) return null

  const pr = calculatePR(exercise.id, sessions)
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((s) => s.entries.some((e) => e.exerciseId === exercise.id))
    .slice(0, 5)

  return (
    <Modal open={open} onClose={onClose} title={exercise.name}>
      <div className="space-y-4">
        <MuscleTags exercise={exercise} size="sm" />

        {library && <LibrarySection entry={library} />}

        <div className="bg-white/[0.04] rounded-xl p-4 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Personal Record</p>
          <p className="font-heading text-3xl text-brand">{formatPR(pr)}</p>
        </div>

        <ProgressionChart exerciseId={exercise.id} sessions={sessions} />

        {recentSessions.length > 0 && (
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Recent Sessions</h3>
            <div className="space-y-2">
              {recentSessions.map((session) => {
                const entry = session.entries.find((e) => e.exerciseId === exercise.id)!
                return (
                  <div key={session.id} className="flex items-center justify-between bg-white/[0.04] rounded px-3 py-2">
                    <span className="text-xs text-white/50">{formatDate(session.date)}</span>
                    <span className="text-xs">
                      {entry.sets.length} sets: {formatSetsSummary(entry.sets)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <Button
          onClick={() => {
            onStartWith(exercise)
            onClose()
          }}
          className="w-full"
        >
          Start with this exercise
        </Button>
      </div>
    </Modal>
  )
}

function LibrarySection({ entry }: { entry: LibraryExercise }) {
  const [imgIdx, setImgIdx] = useState(0)
  const { src, error, loading } = useExerciseImage(entry.imageFolder, imgIdx)
  const hasMultiple = entry.imageCount > 1

  return (
    <div className="space-y-3">
      <div className="bg-white/[0.04] rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
        {loading && <span className="text-[10px] text-white/30">loading…</span>}
        {error && !src && <span className="text-[10px] text-white/30">image unavailable offline</span>}
        {src && <img src={src} alt={entry.name} className="w-full h-full object-cover" />}
        {hasMultiple && src && (
          <button
            onClick={() => setImgIdx((i) => (i + 1) % entry.imageCount)}
            className="absolute bottom-2 right-2 bg-black/50 text-white/80 text-[10px] px-2 py-1 rounded"
          >
            {imgIdx + 1}/{entry.imageCount}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {entry.equipment && <Badge label={entry.equipment} />}
        <Badge label={entry.level} />
        {entry.mechanic && <Badge label={entry.mechanic} />}
        {entry.force && <Badge label={entry.force} />}
      </div>

      {entry.instructions.length > 0 && (
        <div>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Instructions</h3>
          <ol className="space-y-2 list-decimal list-inside text-xs text-white/70 leading-relaxed">
            {entry.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60 capitalize">{label}</span>
}
