// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'

interface ImportBridge {
  getPendingImport: () => Promise<{ json: string | null }>
}

function getPlugin(): ImportBridge | null {
  if (!Capacitor.isNativePlatform()) return null
  const plugins = (window as { Capacitor?: { Plugins?: Record<string, unknown> } }).Capacitor?.Plugins
  return (plugins?.ImportBridge as ImportBridge) ?? null
}

// Watches for backup JSON delivered via Android share-target / open-with intents
// (e.g. JuMa Export → Share → JGym). Invokes onShared with the parsed object;
// the caller is responsible for confirming and applying the import.
export function useSharedImport(onShared: (data: Record<string, unknown>) => void) {
  useEffect(() => {
    const plugin = getPlugin()
    if (!plugin) return

    const consume = async () => {
      try {
        const { json } = await plugin.getPendingImport()
        if (!json) return
        const data = JSON.parse(json)
        if (typeof data === 'object' && data !== null) {
          onShared(data as Record<string, unknown>)
        }
      } catch {
        // Malformed or absent payload — ignore.
      }
    }

    consume()
    const listener = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) consume()
    })

    return () => {
      listener.then((l) => l.remove())
    }
  }, [onShared])
}
