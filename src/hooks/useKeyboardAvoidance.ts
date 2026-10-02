// Copyright (C) 2024-2026 Justin Marty (RLT-Newside). Licensed under GPL-3.0.

import { useEffect } from 'react'
import { isTextInput } from './useKeyboardVisible'

// CSS custom property holding how many pixels of the layout viewport are covered
// by the software keyboard. Consumed by `.keyboard-pad` / `.modal-panel` in index.css.
export const KEYBOARD_INSET_VAR = '--keyboard-inset'

const ACTIONABLE = 'button, [role="button"], a[href], input[type="button"], input[type="submit"], input[type="reset"]'

// When a text field holds focus and the user taps a button, the mousedown would
// first blur the field: the keyboard starts closing, keyboard-aware UI (tab bar,
// session bar) re-renders and the layout jumps, so the click never reaches the
// button — it only animates (JGYM-43). Keeping focus on the field for that tap
// lets the button's onClick fire on the first tap.
export function shouldPreserveFocus(target: EventTarget | null, active: Element | null): boolean {
  if (!isTextInput(active)) return false
  if (!(target instanceof Element)) return false
  if (isTextInput(target) || target.tagName === 'SELECT') return false
  const actionable = target.closest(ACTIONABLE)
  if (!actionable || (actionable as HTMLButtonElement).disabled) return false
  return !actionable.contains(active)
}

export function getKeyboardInset(vv: VisualViewport): number {
  return Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
}

export function useKeyboardAvoidance(): void {
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (shouldPreserveFocus(e.target, document.activeElement)) e.preventDefault()
    }
    document.addEventListener('mousedown', onMouseDown, true)
    return () => document.removeEventListener('mousedown', onMouseDown, true)
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement

    const update = () => {
      const inset = getKeyboardInset(vv)
      root.style.setProperty(KEYBOARD_INSET_VAR, `${inset}px`)
      // Once the keyboard has opened, bring the focused field into the visible area.
      const active = document.activeElement
      if (inset > 0 && isTextInput(active)) {
        ;(active as HTMLElement).scrollIntoView?.({ block: 'center', behavior: 'smooth' })
      }
    }

    vv.addEventListener('resize', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      root.style.removeProperty(KEYBOARD_INSET_VAR)
    }
  }, [])
}
