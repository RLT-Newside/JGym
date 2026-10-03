// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useCallback, useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../data/storage'
import { parseSha256Digest } from '../utils/app-update'
import { isNewer } from '../utils/version'

declare const __APP_VERSION__: string

const REPO = 'RLT-Newside/JGym'
const CHECK_KEY = STORAGE_KEYS.updateLastCheck
const CACHE_KEY = STORAGE_KEYS.updateCached
const DAY_MS = 24 * 60 * 60 * 1000

export interface UpdateInfo {
  version: string
  url: string
  // SHA-256 of the APK from the GitHub asset digest; required for in-app install.
  sha256?: string
}

export type CheckResult = 'update' | 'latest' | 'error'

function currentVersion(): string {
  return typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0'
}

// Hits the GitHub releases API and resolves the newest applicable update, if any.
async function fetchLatest(current: string, signal?: AbortSignal): Promise<UpdateInfo | null> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { signal })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const data = await r.json()
  const latest = data.tag_name?.replace(/^v/, '')
  if (!latest || !isNewer(latest, current)) return null
  const apk = data.assets?.find((a: { name: string; browser_download_url: string; digest?: string }) =>
    a.name.endsWith('.apk'),
  )
  if (!apk) return null
  const info: UpdateInfo = {
    version: data.tag_name,
    url: apk.browser_download_url ?? `https://github.com/${REPO}/releases/latest`,
  }
  const sha256 = parseSha256Digest(apk.digest)
  if (sha256) info.sha256 = sha256
  return info
}

export function useUpdateCheck() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null)
  const [checking, setChecking] = useState(false)

  // Automatic check on mount, throttled to one API call per 24h to stay under
  // the unauthenticated rate limit. Serves the cached result inside the window.
  useEffect(() => {
    const current = currentVersion()
    if (current === '0.0.0') return

    const last = Number(localStorage.getItem(CHECK_KEY) ?? 0)
    if (Date.now() - last < DAY_MS) {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const info = JSON.parse(cached) as UpdateInfo
        if (isNewer(info.version.replace(/^v/, ''), current)) {
          setUpdate(info)
        } else {
          localStorage.removeItem(CACHE_KEY)
        }
      }
      return
    }
    localStorage.setItem(CHECK_KEY, String(Date.now()))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    fetchLatest(current, controller.signal)
      .then((next) => {
        if (next) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next))
          setUpdate(next)
        } else {
          localStorage.removeItem(CACHE_KEY)
        }
      })
      .catch(() => {
        // Network/abort/rate-limit: stay silent, retry next window.
      })
      .finally(() => clearTimeout(timeoutId))

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  // Manual check that bypasses the 24h throttle (for a "Check for updates" button).
  const checkNow = useCallback(async (): Promise<CheckResult> => {
    const current = currentVersion()
    if (current === '0.0.0') return 'error'
    setChecking(true)
    localStorage.setItem(CHECK_KEY, String(Date.now()))
    try {
      const next = await fetchLatest(current)
      if (next) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next))
        setUpdate(next)
        return 'update'
      }
      localStorage.removeItem(CACHE_KEY)
      setUpdate(null)
      return 'latest'
    } catch {
      return 'error'
    } finally {
      setChecking(false)
    }
  }, [])

  return { update, checkNow, checking }
}
