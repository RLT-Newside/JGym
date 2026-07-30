// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../data/storage'
import { isDemoMode, isDemoPremium, setDemoPremium, storeGet, storeSet } from '../data/store'
import { activateCode, deactivateSupporter, isActivated, prefetchHashes } from '../utils/supporter'

export type Theme = 'yellow' | 'cyan' | 'purple' | 'coral' | 'green'

function readTheme(): Theme {
  return (storeGet(STORAGE_KEYS.theme) as Theme) || 'yellow'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme)
  // In demo mode, supporter status is driven by the in-demo premium toggle
  // (activate the full version without a code) rather than a real activation.
  const [isSupporter, setIsSupporterState] = useState(() => (isDemoMode() ? isDemoPremium() : isActivated()))

  useEffect(() => {
    prefetchHashes()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'yellow') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (t: Theme) => {
    storeSet(STORAGE_KEYS.theme, t)
    setThemeState(t)
  }

  // Demo-only: unlock/lock the full (supporter) version without an activation
  // code, so the free → premium upgrade can be shown live.
  const toggleDemoPremium = () => {
    const next = !isDemoPremium()
    setDemoPremium(next)
    setIsSupporterState(next)
    if (!next) setTheme('yellow')
  }

  const tryActivate = async (code: string): Promise<boolean> => {
    const ok = await activateCode(code)
    if (ok) setIsSupporterState(true)
    return ok
  }

  const revoke = () => {
    deactivateSupporter()
    setIsSupporterState(false)
    setTheme('yellow')
  }

  return { theme, setTheme, isSupporter, tryActivate, revoke, toggleDemoPremium }
}
