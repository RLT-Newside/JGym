// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

/** Result of applying a backup: the re-synced exercise and session arrays. */
export interface BackupSync {
  exercises: unknown[]
  sessions: unknown[]
}

function readArray(key: string): unknown[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Apply a backup blob to localStorage.
 * - `replace` clears every existing `gym_*` key first, then writes the backup.
 * - `merge` keeps current data and appends new exercises/sessions (deduped by
 *   id); all other `gym_*` keys are overwritten with the backup value.
 * Non-`gym_` keys in the blob are ignored.
 * Returns the re-synced `gym_exercises` / `gym_sessions` arrays so the caller
 * can push them into React state.
 */
export function mergeBackup(data: Record<string, unknown>, mode: 'merge' | 'replace'): BackupSync {
  if (mode === 'replace') {
    const gymKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('gym_')) gymKeys.push(key)
    }
    gymKeys.forEach((k) => localStorage.removeItem(k))
  }

  for (const [key, value] of Object.entries(data)) {
    if (!key.startsWith('gym_')) continue
    if (mode === 'merge' && (key === 'gym_exercises' || key === 'gym_sessions')) {
      const existing = readArray(key)
      const incoming = Array.isArray(value) ? value : []
      const existingIds = new Set(existing.map((e) => (e as { id: string }).id))
      const merged = [...existing, ...incoming.filter((e) => !existingIds.has((e as { id: string }).id))]
      localStorage.setItem(key, JSON.stringify(merged))
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  return { exercises: readArray('gym_exercises'), sessions: readArray('gym_sessions') }
}
