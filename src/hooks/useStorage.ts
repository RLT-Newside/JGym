// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.
import { useCallback, useState } from 'react'
import { storeGet, storeSet } from '../data/store'

export function useStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storeGet(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        // storeGet/storeSet route to the demo overlay when demo mode is active,
        // so real localStorage is never touched during a demo.
        storeSet(key, JSON.stringify(nextValue))
        return nextValue
      })
    },
    [key],
  )

  return [storedValue, setValue]
}
