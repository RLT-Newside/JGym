// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useEffect, useState } from 'react'
import { activateCode, deactivateSupporter, isActivated, prefetchHashes } from '../utils/supporter'

export type Theme = 'yellow' | 'cyan' | 'purple' | 'coral' | 'green'

function readTheme(): Theme {
  return (localStorage.getItem('gym_theme') as Theme) || 'yellow'
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme)
  const [isSupporter, setIsSupporterState] = useState(isActivated)

  useEffect(() => {
    prefetchHashes()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'yellow') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = (t: Theme) => {
    localStorage.setItem('gym_theme', t)
    setThemeState(t)
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

  return { theme, setTheme, isSupporter, tryActivate, revoke }
}
