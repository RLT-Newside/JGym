// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useEffect, useState } from 'react'

// Threshold ratio: if the visual viewport is this much smaller than the layout
// viewport, we consider the software keyboard to be open.
const KEYBOARD_THRESHOLD = 0.75

export function useKeyboardVisible(): boolean {
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      setKeyboardVisible(vv.height < window.innerHeight * KEYBOARD_THRESHOLD)
    }

    vv.addEventListener('resize', update)
    update()
    return () => vv.removeEventListener('resize', update)
  }, [])

  return keyboardVisible
}
