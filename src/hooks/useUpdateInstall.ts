// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { isAllowedApkUrl } from '../utils/app-update'
import type { UpdateInfo } from './useUpdateCheck'

export type InstallStatus = 'idle' | 'downloading' | 'installer' | 'error'

interface ProgressEvent {
  received: number
  total: number
}

interface AppUpdatePlugin {
  canInstall: () => Promise<{ allowed: boolean }>
  openInstallSettings: () => Promise<void>
  downloadAndInstall: (o: { url: string; sha256: string }) => Promise<void>
  addListener: (event: 'downloadProgress', cb: (e: ProgressEvent) => void) => Promise<{ remove: () => Promise<void> }>
}

function getPlugin(): AppUpdatePlugin | null {
  if (!Capacitor.isNativePlatform()) return null
  const plugins = (window as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor?.Plugins
  return (plugins?.AppUpdate as AppUpdatePlugin) ?? null
}

// Drives the native in-app update: download APK → verify SHA-256 → system installer.
// `supported` is false on web/PWA, without the native plugin (older APKs), or when the
// release has no usable digest/URL — callers fall back to the manual download link.
export function useUpdateInstall(update: UpdateInfo | null) {
  const [status, setStatus] = useState<InstallStatus>('idle')
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [canInstall, setCanInstall] = useState<boolean | null>(null)
  const runningRef = useRef(false)

  const plugin = getPlugin()
  const supported = !!plugin && !!update?.sha256 && isAllowedApkUrl(update.url)

  // Re-check the "install unknown apps" permission whenever the app returns to the
  // foreground — the user may have just granted it in system settings.
  useEffect(() => {
    if (!supported || !plugin) return
    const refresh = () => {
      plugin
        .canInstall()
        .then(({ allowed }) => setCanInstall(allowed))
        .catch(() => setCanInstall(null))
    }
    refresh()
    const listener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) refresh()
    })
    return () => {
      listener.then((l) => l.remove())
    }
  }, [supported, plugin])

  const start = useCallback(async () => {
    if (!plugin || !update?.sha256 || !isAllowedApkUrl(update.url) || runningRef.current) return
    runningRef.current = true
    setStatus('downloading')
    setProgress(null)
    setError(null)
    const sub = await plugin
      .addListener('downloadProgress', ({ received, total }) => {
        setProgress(total > 0 ? Math.min(1, received / total) : null)
      })
      .catch(() => null)
    try {
      await plugin.downloadAndInstall({ url: update.url, sha256: update.sha256 })
      setStatus('installer')
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Download failed')
      setStatus('error')
    } finally {
      runningRef.current = false
      sub?.remove()
    }
  }, [plugin, update])

  const openInstallSettings = useCallback(() => {
    plugin?.openInstallSettings().catch(() => {})
  }, [plugin])

  return { supported, status, progress, error, canInstall, start, openInstallSettings }
}
