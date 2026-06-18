// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Exercise, Session } from '../../../../types'
import { formatDate } from '../../../../utils/format'
import { calculatePR } from '../../../../utils/pr'

interface Props {
  session: Session
  sessions: Session[]
  exercises: Exercise[]
  onDelete: (id: string) => void
}

function totalVolume(session: Session): number {
  return session.entries.reduce((sum, e) => sum + e.sets.reduce((s2, set) => s2 + set.reps * set.weight, 0), 0)
}

function totalSets(session: Session): number {
  return session.entries.reduce((sum, e) => sum + e.sets.length, 0)
}

export function SessionCard({ session, sessions, exercises, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)

  const vol = totalVolume(session)
  const sets = totalSets(session)
  const unit = session.entries[0]?.sets[0]?.unit ?? 'kg'

  const newPRExerciseIds = useMemo(() => {
    const sessionTime = new Date(session.date).getTime()
    const priorSessions = sessions.filter((s) => s.id !== session.id && new Date(s.date).getTime() < sessionTime)
    const ids = new Set<string>()
    for (const entry of session.entries) {
      const prBefore = calculatePR(entry.exerciseId, priorSessions)
      const sessionMax = entry.sets.reduce(
        (best, s) => (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps) ? s : best),
        null as (typeof entry.sets)[0] | null,
      )
      if (!sessionMax || sessionMax.weight === 0) continue
      const isNew =
        !prBefore ||
        sessionMax.weight > prBefore.weight ||
        (sessionMax.weight === prBefore.weight && sessionMax.reps > prBefore.reps)
      if (isNew) ids.add(entry.exerciseId)
    }
    return ids
  }, [session, sessions])

  return (
    <div className="glass rounded-xl p-3">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">{formatDate(session.date)}</span>
            {session.label && (
              <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/40">{session.label}</span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            {vol.toLocaleString()} {unit} · {sets} sets
            {newPRExerciseIds.size > 0 && <span className="text-brand"> · 🏆 {newPRExerciseIds.size} PR</span>}
          </p>
          <div className="mt-1 space-y-0.5">
            {session.entries.map((entry) => {
              const ex = exercises.find((e) => e.id === entry.exerciseId)
              return (
                <p key={entry.exerciseId} className="text-xs text-white/60">
                  {ex ? ex.name : <span className="text-white/20 italic">deleted exercise</span>}: {entry.sets.length}{' '}
                  sets
                </p>
              )
            })}
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
          {session.entries.map((entry) => {
            const ex = exercises.find((e) => e.id === entry.exerciseId)
            const isNewPR = newPRExerciseIds.has(entry.exerciseId)
            return (
              <div key={entry.exerciseId}>
                <p className="font-heading text-sm mb-1 flex items-center gap-2">
                  {ex?.name ?? <span className="text-white/20 italic font-sans">deleted exercise</span>}
                  {isNewPR && <span className="text-[10px] text-brand font-heading">🏆 PR!</span>}
                </p>
                {entry.sets.map((set, j) => (
                  <p key={j} className="text-xs text-white/40 pl-2">
                    Set {j + 1}: {set.reps} × {set.weight}
                    {set.unit}
                  </p>
                ))}
              </div>
            )
          })}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onDelete(session.id)}
              className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 px-2 py-1"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
