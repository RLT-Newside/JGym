// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Session, SessionExerciseEntry } from '../types'

interface ActiveSession {
  id: string
  label: string
  startTime: number
  entries: SessionExerciseEntry[]
}

const ACTIVE_SESSION_KEY = 'gym_active_session'

function loadActive(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveActive(session: ActiveSession | null) {
  if (session) {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  }
}

export function useActiveSession() {
  const [active, setActive] = useState<ActiveSession | null>(loadActive)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  useEffect(() => {
    if (active) {
      const update = () => setElapsed(Math.floor((Date.now() - active.startTime) / 1000))
      update()
      timerRef.current = setInterval(update, 1000)
      return () => clearInterval(timerRef.current)
    } else {
      setElapsed(0)
    }
  }, [active])

  const startSession = (label: string, initialEntries?: SessionExerciseEntry[]) => {
    const session: ActiveSession = {
      id: uuid(),
      label,
      startTime: Date.now(),
      entries: initialEntries ?? [],
    }
    setActive(session)
    saveActive(session)
  }

  const updateEntries = (entries: SessionExerciseEntry[]) => {
    if (!active) return
    const updated = { ...active, entries }
    setActive(updated)
    saveActive(updated)
  }

  const finishSession = (): Session | null => {
    if (!active) return null
    const session: Session = {
      id: active.id,
      date: new Date(active.startTime).toISOString(),
      label: active.label,
      entries: active.entries.filter((e) => e.sets.length > 0),
    }
    setActive(null)
    saveActive(null)
    return session
  }

  const cancelSession = () => {
    setActive(null)
    saveActive(null)
  }

  return { active, elapsed, startSession, updateEntries, finishSession, cancelSession }
}
