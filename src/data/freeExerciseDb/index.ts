// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Lazy singleton loader for the bundled free-exercise-db dataset.
// Dynamic import keeps the JSON in its own Vite chunk — only fetched when
// the user actually opens the library or picker.

import type { LibraryExercise } from '../../types'

let cache: LibraryExercise[] | null = null
let pending: Promise<LibraryExercise[]> | null = null

export async function loadLibrary(): Promise<LibraryExercise[]> {
  if (cache) return cache
  if (pending) return pending
  pending = (async () => {
    try {
      const mod = await import('./exercises.json')
      cache = (mod.default ?? (mod as unknown)) as LibraryExercise[]
      return cache
    } catch {
      cache = []
      return cache
    } finally {
      pending = null
    }
  })()
  return pending
}

export async function findLibraryEntry(libraryId: string): Promise<LibraryExercise | null> {
  const list = await loadLibrary()
  return list.find((e) => e.id === libraryId) ?? null
}
