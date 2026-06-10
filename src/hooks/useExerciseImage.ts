// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
//
// Resolves an exercise image URL.
// - Bundled folder → returns the local /exercise-images/... URL synchronously.
// - Otherwise → cache-first fetch from raw.githubusercontent.com, stored in
//   the dedicated 'exercise-images' Cache API store.

import { useEffect, useState } from 'react'
import { EXERCISE_IMAGE_CACHE, localImageUrl, remoteImageUrl } from '../utils/exerciseImages'

interface ImageState {
  src: string | null
  error: boolean
  loading: boolean
}

export function useExerciseImage(folder: string | null | undefined, idx = 0): ImageState {
  const initialLocal = folder ? localImageUrl(folder, idx) : null
  const [state, setState] = useState<ImageState>({
    src: initialLocal,
    error: false,
    loading: !initialLocal && !!folder,
  })

  useEffect(() => {
    if (!folder) {
      setState({ src: null, error: false, loading: false })
      return
    }
    const local = localImageUrl(folder, idx)
    if (local) {
      setState({ src: local, error: false, loading: false })
      return
    }
    if (typeof caches === 'undefined') {
      setState({ src: remoteImageUrl(folder, idx), error: false, loading: false })
      return
    }

    let cancelled = false
    let createdObjectUrl: string | null = null
    setState({ src: null, error: false, loading: true })

    const remote = remoteImageUrl(folder, idx)
    ;(async () => {
      try {
        const cache = await caches.open(EXERCISE_IMAGE_CACHE)
        const hit = await cache.match(remote)
        if (hit) {
          const blob = await hit.blob()
          if (cancelled) return
          createdObjectUrl = URL.createObjectURL(blob)
          setState({ src: createdObjectUrl, error: false, loading: false })
          return
        }
        const res = await fetch(remote)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await cache.put(remote, res.clone())
        const blob = await res.blob()
        if (cancelled) return
        createdObjectUrl = URL.createObjectURL(blob)
        setState({ src: createdObjectUrl, error: false, loading: false })
      } catch {
        if (!cancelled) setState({ src: null, error: true, loading: false })
      }
    })()

    return () => {
      cancelled = true
      if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl)
    }
  }, [folder, idx])

  return state
}
