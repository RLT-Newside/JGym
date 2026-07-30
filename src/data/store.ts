// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

/**
 * Storage facade with a demo overlay.
 *
 * Normal mode: reads/writes go straight to localStorage (real user data).
 *
 * Demo mode: reads/writes are redirected to sessionStorage under a `demo::`
 * prefix. sessionStorage is tab-scoped and cleared when the tab closes, so the
 * user's real localStorage data is never touched or overwritten while showing
 * the app. Entering/leaving demo mode reloads the page so every `useStorage`
 * hook re-initialises from the correct source.
 */

const DEMO_FLAG = 'jgym_demo' // sessionStorage marker: demo mode is active
const DEMO_PREMIUM = 'jgym_demo_premium' // sessionStorage marker: premium unlocked in demo
const DEMO_PREFIX = 'demo::' // namespace for overlaid gym_ keys in sessionStorage

function session(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

// Resolved once at module load — stable for the lifetime of the page. Changing
// it always goes through enter/exitDemoMode, which reload the page.
let demoActive = (() => {
  const s = session()
  return s ? s.getItem(DEMO_FLAG) === '1' : false
})()

export function isDemoMode(): boolean {
  return demoActive
}

export function storeGet(key: string): string | null {
  if (demoActive) {
    const s = session()
    return s ? s.getItem(DEMO_PREFIX + key) : null
  }
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function storeSet(key: string, value: string): void {
  if (demoActive) {
    const s = session()
    if (s) {
      try {
        s.setItem(DEMO_PREFIX + key, value)
      } catch {
        console.error('sessionStorage quota exceeded — demo data not saved')
      }
    }
    return
  }
  try {
    localStorage.setItem(key, value)
  } catch {
    console.error('localStorage quota exceeded — data not saved')
  }
}

export function storeRemove(key: string): void {
  if (demoActive) {
    session()?.removeItem(DEMO_PREFIX + key)
    return
  }
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

// ─── Demo premium (activate the full version without a code, demo only) ───

export function isDemoPremium(): boolean {
  if (!demoActive) return false
  return session()?.getItem(DEMO_PREMIUM) === '1'
}

export function setDemoPremium(on: boolean): void {
  const s = session()
  if (!s) return
  if (on) s.setItem(DEMO_PREMIUM, '1')
  else s.removeItem(DEMO_PREMIUM)
}

// ─── Enter / exit ───

function clearDemoKeys(s: Storage): void {
  const toRemove: string[] = []
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i)
    if (k?.startsWith(DEMO_PREFIX)) toRemove.push(k)
  }
  for (const k of toRemove) s.removeItem(k)
}

/**
 * Seed the demo overlay with sample data and reload into demo mode. `seed` maps
 * real storage keys (e.g. `gym_exercises`) to their JSON string values.
 */
export function enterDemoMode(seed: Record<string, string>): void {
  const s = session()
  if (!s) return
  clearDemoKeys(s)
  s.removeItem(DEMO_PREMIUM)
  for (const [key, value] of Object.entries(seed)) {
    s.setItem(DEMO_PREFIX + key, value)
  }
  s.setItem(DEMO_FLAG, '1')
  demoActive = true
  window.location.reload()
}

/** Discard all demo state and reload back into the user's real data. */
export function exitDemoMode(): void {
  const s = session()
  if (s) {
    clearDemoKeys(s)
    s.removeItem(DEMO_FLAG)
    s.removeItem(DEMO_PREMIUM)
  }
  demoActive = false
  window.location.reload()
}
