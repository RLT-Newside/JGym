// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useEffect, useState } from 'react'
import { findLibraryEntry } from '../data/freeExerciseDb'
import type { LibraryExercise } from '../types'

export function useLibraryEntry(libraryId: string | null | undefined): LibraryExercise | null {
  const [entry, setEntry] = useState<LibraryExercise | null>(null)

  useEffect(() => {
    if (!libraryId) {
      setEntry(null)
      return
    }
    let cancelled = false
    findLibraryEntry(libraryId).then((e) => {
      if (!cancelled) setEntry(e)
    })
    return () => {
      cancelled = true
    }
  }, [libraryId])

  return entry
}
