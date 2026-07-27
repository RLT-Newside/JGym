// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useEffect, useState } from 'react'

// Threshold ratio: if the visual viewport is this much smaller than the layout
// viewport, we consider the software keyboard to be open.
const KEYBOARD_THRESHOLD = 0.75

// On iOS/Android (Capacitor), the visual viewport may not shrink when the
// software keyboard opens (the keyboard overlays content instead). Tracking
// focus on text inputs gives a reliable fallback for all platforms.
function isTextInput(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.tagName === 'TEXTAREA') return true
  if (el.tagName === 'INPUT') {
    const type = (el as HTMLInputElement).type
    return !['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'range', 'color', 'hidden'].includes(type)
  }
  return false
}

export function useKeyboardVisible(): boolean {
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [fieldFocused, setFieldFocused] = useState(false)

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

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (isTextInput(e.target)) setFieldFocused(true)
    }
    const onFocusOut = (e: FocusEvent) => {
      // relatedTarget is the element receiving focus next; keep the bar hidden
      // if focus moves to another text input (e.g. tabbing between reps/weight).
      if (!isTextInput(e.relatedTarget)) setFieldFocused(false)
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  return keyboardVisible || fieldFocused
}
