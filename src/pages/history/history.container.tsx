// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useState } from 'react'
import type { Exercise, Session } from '../../types'
import { HistoryView } from './history.view'

interface Props {
  sessions: Session[]
  exercises: Exercise[]
  onDeleteSession: (id: string) => void
}

export function HistoryContainer({ sessions, exercises, onDeleteSession }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const displayed = selectedDate
    ? sorted.filter((s) => new Date(s.date).toISOString().split('T')[0] === selectedDate)
    : sorted

  return (
    <HistoryView
      sessions={sessions}
      exercises={exercises}
      selectedDate={selectedDate}
      deleteId={deleteId}
      displayed={displayed}
      onSelectDate={setSelectedDate}
      onClearDate={() => setSelectedDate(null)}
      onDeleteRequest={setDeleteId}
      onDeleteCancel={() => setDeleteId(null)}
      onDeleteConfirm={() => {
        if (deleteId) onDeleteSession(deleteId)
      }}
    />
  )
}
