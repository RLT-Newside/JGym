// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog'
import type { Exercise, Session } from '../../types'
import { CalendarGrid } from './components/calendar-grid/calendar-grid'
import { SessionCard } from './components/session-card/session-card'

interface Props {
  sessions: Session[]
  exercises: Exercise[]
  selectedDate: string | null
  deleteId: string | null
  displayed: Session[]
  onSelectDate: (date: string | null) => void
  onClearDate: () => void
  onDeleteRequest: (id: string) => void
  onDeleteCancel: () => void
  onDeleteConfirm: () => void
}

export function HistoryView({
  sessions,
  exercises,
  selectedDate,
  deleteId,
  displayed,
  onSelectDate,
  onClearDate,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: Props) {
  return (
    <div className="px-4 py-4 space-y-4">
      <CalendarGrid sessions={sessions} selectedDate={selectedDate} onSelectDate={onSelectDate} />

      {selectedDate && (
        <button onClick={onClearDate} className="text-xs text-brand hover:underline">
          Show all sessions
        </button>
      )}

      <div className="space-y-2">
        {displayed.length === 0 && (
          <p className="text-sm text-white/30 text-center py-8">
            {sessions.length === 0 ? 'No sessions yet. Start training!' : 'No sessions on this day.'}
          </p>
        )}
        {displayed.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            sessions={sessions}
            exercises={exercises}
            onDelete={onDeleteRequest}
          />
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={onDeleteCancel}
        onConfirm={onDeleteConfirm}
        title="Delete Session"
        message="Permanently delete this training session?"
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
