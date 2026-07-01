// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useState } from 'react'
import { useAppData } from '../../context/app-data'
import { HistoryView } from './history.view'

export function HistoryContainer() {
  const { sessions, exercises, deleteSession: onDeleteSession, updateSession: onUpdateSession } = useAppData()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editDurationId, setEditDurationId] = useState<string | null>(null)

  const sorted = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const displayed = selectedDate
    ? sorted.filter((s) => new Date(s.date).toISOString().split('T')[0] === selectedDate)
    : sorted

  const handleDurationSave = (sessionId: string, durationSeconds: number) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) onUpdateSession({ ...session, durationSeconds })
    setEditDurationId(null)
  }

  return (
    <HistoryView
      sessions={sessions}
      exercises={exercises}
      selectedDate={selectedDate}
      deleteId={deleteId}
      editDurationId={editDurationId}
      displayed={displayed}
      onSelectDate={setSelectedDate}
      onClearDate={() => setSelectedDate(null)}
      onDeleteRequest={setDeleteId}
      onDeleteCancel={() => setDeleteId(null)}
      onDeleteConfirm={() => {
        if (deleteId) onDeleteSession(deleteId)
      }}
      onEditDuration={setEditDurationId}
      onEditDurationCancel={() => setEditDurationId(null)}
      onDurationSave={handleDurationSave}
    />
  )
}
