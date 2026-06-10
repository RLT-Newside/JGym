// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useEffect, useRef, useState } from 'react'

interface MediaInfo {
  title: string | null
  artist: string | null
  isPlaying: boolean
  hasPermission: boolean
}

interface UseMediaSessionResult extends MediaInfo {
  sendCommand: (action: 'play_pause' | 'next' | 'previous') => void
  requestPermission: () => void
}

const POLL_INTERVAL_MS = 2000

declare global {
  interface Window {
    Capacitor?: { isNativePlatform: () => boolean; Plugins?: Record<string, unknown> }
  }
}

function getPlugin(): {
  getMediaInfo: () => Promise<MediaInfo>
  sendCommand: (o: { action: string }) => Promise<void>
  requestPermission: () => Promise<void>
} | null {
  const cap = window.Capacitor
  if (!cap?.isNativePlatform()) return null
  const plugin = cap.Plugins?.MediaBridge as ReturnType<typeof getPlugin>
  return plugin ?? null
}

export function useMediaSession(active: boolean): UseMediaSessionResult {
  const [info, setInfo] = useState<MediaInfo>({
    title: null,
    artist: null,
    isPlaying: false,
    hasPermission: false,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const plugin = getPlugin()
    if (!plugin || !active) return

    const poll = async () => {
      try {
        const result = await plugin.getMediaInfo()
        setInfo(result)
      } catch {
        // ignore — app may be in background or plugin unavailable
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active])

  const sendCommand = (action: 'play_pause' | 'next' | 'previous') => {
    getPlugin()?.sendCommand({ action })
  }

  const requestPermission = () => {
    getPlugin()?.requestPermission()
  }

  return { ...info, sendCommand, requestPermission }
}
