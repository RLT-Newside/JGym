// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useCallback, useEffect, useState } from 'react'
import type { UpdateInfo } from './useUpdateCheck'

interface ListenerHandle {
  remove: () => Promise<void>
}

// Native side: android/app/src/main/java/com/rltnewside/jgym/AppUpdatePlugin.java
interface AppUpdatePlugin {
  canInstall: () => Promise<{ allowed: boolean }>
  download: (options: { url: string; fileName: string; sha256?: string }) => Promise<void>
  install: () => Promise<void>
  addListener: (
    event: 'progress',
    callback: (progress: { bytes: number; total: number }) => void,
  ) => ListenerHandle | Promise<ListenerHandle>
}

export type InstallState =
  | { phase: 'idle' }
  | { phase: 'downloading'; progress: number | null }
  | { phase: 'installer' }
  | { phase: 'error' }

export interface UpdateInstaller {
  supported: boolean
  state: InstallState
  needsPermission: boolean
  start: () => Promise<void>
}

function getPlugin(): AppUpdatePlugin | null {
  if (!Capacitor.isNativePlatform()) return null
  const plugins = (window as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor?.Plugins
  return (plugins?.AppUpdate as AppUpdatePlugin) ?? null
}

// Downloads the release APK natively, verifies it against GitHub's checksum and
// hands it to Android's package installer — the user only confirms the system dialog.
export function useUpdateInstall(update: UpdateInfo | null): UpdateInstaller {
  const [state, setState] = useState<InstallState>({ phase: 'idle' })
  const [needsPermission, setNeedsPermission] = useState(false)

  // Android asks once to allow installs from JGym. Re-check when the user comes
  // back from that settings screen so the hint disappears once granted.
  useEffect(() => {
    const plugin = getPlugin()
    if (!plugin) return

    const refresh = () => {
      plugin
        .canInstall()
        .then(({ allowed }) => setNeedsPermission(!allowed))
        .catch(() => {
          // Unknown — keep the hint state as it is.
        })
    }

    refresh()
    const listener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) refresh()
    })

    return () => {
      Promise.resolve(listener).then((l) => l.remove())
    }
  }, [])

  const start = useCallback(async () => {
    const plugin = getPlugin()
    if (!plugin || !update) return

    setState({ phase: 'downloading', progress: null })
    try {
      const progress = await plugin.addListener('progress', ({ bytes, total }) => {
        setState({ phase: 'downloading', progress: total > 0 ? bytes / total : null })
      })
      try {
        await plugin.download({ url: update.url, fileName: `JGym-${update.version}.apk`, sha256: update.sha256 })
      } finally {
        progress.remove()
      }
      await plugin.install()
      setState({ phase: 'installer' })
    } catch {
      setState({ phase: 'error' })
    }
  }, [update])

  return { supported: getPlugin() !== null, state, needsPermission, start }
}
