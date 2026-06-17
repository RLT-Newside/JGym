// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Backfills Exercise.libraryId from the bundled free-exercise-db registry so
// existing exercises gain the dataset's images (the animated 0.jpg/1.jpg pair
// resolved via the linked LibraryExercise.imageFolder). Without a libraryId an
// exercise shows no pictures, which is why only freshly-added exercises had
// them. JGYM-10.

import { getLibraryIdForName } from '../data/freeExerciseDb/nameAlias'
import type { Exercise, LibraryExercise } from '../types'

interface RelinkResult {
  exercises: Exercise[]
  changed: number
}

// Resolves a library slug for an exercise name: alias map first, then a direct
// (case-insensitive) match against dataset names. Returns null if unmatched.
function resolveLibraryId(name: string, byId: Set<string>, byName: Map<string, string>): string | null {
  const alias = getLibraryIdForName(name)
  if (alias && byId.has(alias)) return alias
  return byName.get(name.toLowerCase()) ?? null
}

// Links exercises to the registry. With `force`, re-links every exercise
// (correcting/overwriting existing links); otherwise only fills missing ones.
export function relinkLibraryIds(
  exercises: Exercise[],
  library: LibraryExercise[],
  opts: { force?: boolean } = {},
): RelinkResult {
  const byId = new Set(library.map((l) => l.id))
  const byName = new Map<string, string>()
  for (const l of library) byName.set(l.name.toLowerCase(), l.id)

  let changed = 0
  const next = exercises.map((ex) => {
    if (ex.libraryId && !opts.force) return ex
    const candidate = resolveLibraryId(ex.name, byId, byName)
    if (!candidate || candidate === ex.libraryId) return ex
    changed++
    return { ...ex, libraryId: candidate }
  })

  return { exercises: changed ? next : exercises, changed }
}
