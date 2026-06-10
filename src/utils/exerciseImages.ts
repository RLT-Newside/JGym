// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Exercise image URL resolver.
// - Bundled folders ship inside the APK at /exercise-images/<folder>/<idx>.jpg
// - Non-bundled folders are lazy-fetched from raw.githubusercontent.com by
//   useExerciseImage and stored in caches.open('exercise-images').

import { BUNDLED_FOLDERS } from '../data/freeExerciseDb/bundledFolders'

const REMOTE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'
const BUNDLED_BASE = '/exercise-images'

export const EXERCISE_IMAGE_CACHE = 'exercise-images'

export function localImageUrl(folder: string, idx: number): string | null {
  return BUNDLED_FOLDERS.has(folder) ? `${BUNDLED_BASE}/${folder}/${idx}.jpg` : null
}

export function remoteImageUrl(folder: string, idx: number): string {
  return `${REMOTE_BASE}/${folder}/${idx}.jpg`
}

export function isBundled(folder: string): boolean {
  return BUNDLED_FOLDERS.has(folder)
}
