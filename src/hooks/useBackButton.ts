// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useEffect, useRef } from 'react'

type BackHandler = () => boolean

const handlers: BackHandler[] = []

export function registerBackHandler(handler: BackHandler) {
  handlers.push(handler)
  return () => {
    const idx = handlers.indexOf(handler)
    if (idx >= 0) handlers.splice(idx, 1)
  }
}

export function useBackHandler(handler: BackHandler, active = true) {
  const ref = useRef(handler)
  ref.current = handler

  useEffect(() => {
    if (!active) return
    const wrapped: BackHandler = () => ref.current()
    return registerBackHandler(wrapped)
  }, [active])
}

export function useBackButton(fallbacks: BackHandler[]) {
  const ref = useRef(fallbacks)
  ref.current = fallbacks

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = App.addListener('backButton', ({ canGoBack }) => {
        for (let i = handlers.length - 1; i >= 0; i--) {
          if (handlers[i]()) return
        }
        for (let i = ref.current.length - 1; i >= 0; i--) {
          if (ref.current[i]()) return
        }
        if (canGoBack) {
          window.history.back()
        } else {
          App.exitApp()
        }
      })
      return () => {
        listener.then((l) => l.remove())
      }
    }

    // Web fallback: use popstate with re-pushed history state
    const ensureHistory = () => {
      window.history.pushState({ app: true }, '')
    }

    const onPopState = () => {
      for (let i = handlers.length - 1; i >= 0; i--) {
        if (handlers[i]()) {
          ensureHistory()
          return
        }
      }
      for (let i = ref.current.length - 1; i >= 0; i--) {
        if (ref.current[i]()) {
          ensureHistory()
          return
        }
      }
    }

    ensureHistory()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
}
