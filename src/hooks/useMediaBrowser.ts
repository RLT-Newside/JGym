// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { FullMediaMetadata, MediaItem, QueueItem } from '../types'

interface UseMediaBrowserResult {
  metadata: FullMediaMetadata | null
  browserAvailable: boolean
  items: MediaItem[]
  queue: QueueItem[]
  queueTitle: string | null
  loading: boolean
  hasPermission: boolean
  isNative: boolean
  isAppInstalled: boolean | null
  connect: () => Promise<void>
  browse: (mediaId?: string) => Promise<void>
  playFromMediaId: (mediaId: string) => Promise<void>
  seekTo: (position: number) => Promise<void>
  sendCommand: (action: 'play_pause' | 'next' | 'previous') => void
  setShuffle: (enabled: boolean) => void
  setRepeat: (mode: 'off' | 'one' | 'all') => void
  removeQueueItem: (mediaId: string, title: string) => Promise<void>
  addToQueue: (item: MediaItem) => Promise<void>
  moveQueueItem: (item: QueueItem, toIndex: number) => Promise<void>
  refreshQueue: () => Promise<void>
  requestPermission: () => void
}

const METADATA_POLL_MS = 1000

function getPlugin(): Record<string, (o?: Record<string, unknown>) => Promise<Record<string, unknown>>> | null {
  const cap = (window as any).Capacitor
  if (!cap?.isNativePlatform()) return null
  return cap.Plugins?.MediaBridge ?? null
}

export function useMediaBrowser(active: boolean): UseMediaBrowserResult {
  const [metadata, setMetadata] = useState<FullMediaMetadata | null>(null)
  const [browserAvailable, setBrowserAvailable] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [queueTitle, setQueueTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [isAppInstalled, setIsAppInstalled] = useState<boolean | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const connectedRef = useRef(false)
  const isNative = getPlugin() !== null

  const pollMetadata = useCallback(async () => {
    const plugin = getPlugin()
    if (!plugin) return
    try {
      const info = (await plugin.getMediaInfo()) as any
      setHasPermission(info.hasPermission ?? false)
      if (!info.hasPermission) return

      const full = (await plugin.getFullMetadata()) as any
      setMetadata({
        title: full.title ?? null,
        artist: full.artist ?? null,
        album: full.album ?? null,
        duration: full.duration ?? 0,
        position: full.position ?? 0,
        albumArtUri: full.albumArtUri ?? null,
        isPlaying: full.isPlaying ?? false,
        hasPermission: true,
        shuffleMode: full.shuffleMode ?? false,
        repeatMode: full.repeatMode ?? 'off',
      })
    } catch {
      // plugin unavailable
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const plugin = getPlugin()
    if (plugin) {
      plugin
        .isAppInstalled()
        .then((result: any) => {
          setIsAppInstalled(result.installed ?? false)
        })
        .catch(() => setIsAppInstalled(false))
    } else {
      setIsAppInstalled(false)
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    pollMetadata()
    intervalRef.current = setInterval(pollMetadata, METADATA_POLL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active, pollMetadata])

  const connect = useCallback(async () => {
    const plugin = getPlugin()
    if (!plugin) return
    try {
      const result = (await plugin.connectBrowser()) as any
      setBrowserAvailable(result.available ?? false)
      connectedRef.current = result.available ?? false
    } catch {
      setBrowserAvailable(false)
    }
  }, [])

  useEffect(() => {
    if (active && hasPermission && !connectedRef.current) {
      connect()
    }
  }, [active, hasPermission, connect])

  const browse = useCallback(async (mediaId?: string) => {
    const plugin = getPlugin()
    if (!plugin) return
    setLoading(true)
    try {
      const result = (await plugin.browse({ mediaId: mediaId ?? '' })) as any
      setItems((result.items ?? []) as MediaItem[])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshQueue = useCallback(async () => {
    const plugin = getPlugin()
    if (!plugin) return
    try {
      const result = (await plugin.getQueue()) as any
      setQueue((result.queue ?? []) as QueueItem[])
      setQueueTitle(result.queueTitle ?? null)
    } catch {
      setQueue([])
    }
  }, [])

  const playFromMediaId = useCallback(
    async (mediaId: string) => {
      const plugin = getPlugin()
      if (!plugin) return
      try {
        await plugin.playFromMediaId({ mediaId })
        pollMetadata()
        setTimeout(() => refreshQueue(), 1500)
      } catch {
        // fallback — ignore
      }
    },
    [pollMetadata, refreshQueue],
  )

  const seekTo = useCallback(async (position: number) => {
    const plugin = getPlugin()
    if (!plugin) return
    try {
      await plugin.seekTo({ position })
    } catch {
      // ignore
    }
  }, [])

  const sendCommand = useCallback(
    (action: 'play_pause' | 'next' | 'previous') => {
      getPlugin()?.sendCommand({ action })
      if (action === 'next' || action === 'previous') {
        setTimeout(() => refreshQueue(), 500)
      }
    },
    [refreshQueue],
  )

  // Auto-refresh queue once the MediaBrowser connection is established
  useEffect(() => {
    if (active && browserAvailable) {
      refreshQueue()
    }
  }, [active, browserAvailable, refreshQueue])

  const setShuffle = useCallback((enabled: boolean) => {
    getPlugin()?.setShuffleMode({ enabled })
  }, [])

  const setRepeat = useCallback((mode: 'off' | 'one' | 'all') => {
    getPlugin()?.setRepeatMode({ mode })
  }, [])

  const removeQueueItem = useCallback(async (mediaId: string, title: string) => {
    const plugin = getPlugin()
    if (!plugin) return
    try {
      await plugin.removeQueueItem({ mediaId, title })
      setQueue((prev) => prev.filter((i) => i.mediaId !== mediaId))
    } catch {
      // ignore
    }
  }, [])

  const addToQueue = useCallback(
    async (item: MediaItem) => {
      const plugin = getPlugin()
      if (!plugin) return
      try {
        await plugin.addToQueue({
          mediaId: item.mediaId,
          title: item.title ?? '',
          subtitle: item.subtitle ?? '',
        })
        setTimeout(() => refreshQueue(), 800)
      } catch {
        // ignore
      }
    },
    [refreshQueue],
  )

  const moveQueueItem = useCallback(
    async (item: QueueItem, toIndex: number) => {
      const plugin = getPlugin()
      if (!plugin) return
      try {
        await plugin.moveQueueItem({
          mediaId: item.mediaId ?? '',
          title: item.title ?? '',
          subtitle: item.subtitle ?? '',
          toIndex,
        })
        setTimeout(() => refreshQueue(), 800)
      } catch {
        // ignore
      }
    },
    [refreshQueue],
  )

  const requestPermission = useCallback(() => {
    getPlugin()?.requestPermission()
  }, [])

  return {
    metadata,
    browserAvailable,
    items,
    queue,
    queueTitle,
    loading,
    hasPermission,
    isNative,
    isAppInstalled,
    connect,
    browse,
    playFromMediaId,
    seekTo,
    sendCommand,
    setShuffle,
    setRepeat,
    removeQueueItem,
    addToQueue,
    moveQueueItem,
    refreshQueue,
    requestPermission,
  }
}
