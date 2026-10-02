import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getKeyboardInset, KEYBOARD_INSET_VAR, shouldPreserveFocus, useKeyboardAvoidance } from './useKeyboardAvoidance'

function makeVisualViewport(height: number, offsetTop = 0) {
  const listeners: Record<string, (() => void)[]> = {}
  return {
    height,
    offsetTop,
    addEventListener: vi.fn((event: string, cb: () => void) => {
      listeners[event] = listeners[event] ?? []
      listeners[event].push(cb)
    }),
    removeEventListener: vi.fn((event: string, cb: () => void) => {
      listeners[event] = (listeners[event] ?? []).filter((l) => l !== cb)
    }),
    _trigger: (event: string) => {
      for (const cb of listeners[event] ?? []) cb()
    },
  }
}

function textInput() {
  const input = document.createElement('input')
  input.type = 'text'
  document.body.appendChild(input)
  return input
}

describe('shouldPreserveFocus', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps focus when a button is tapped while a text field is focused', () => {
    const input = textInput()
    const button = document.createElement('button')
    expect(shouldPreserveFocus(button, input)).toBe(true)
  })

  it('keeps focus when tapping an icon nested inside a button', () => {
    const input = textInput()
    const button = document.createElement('button')
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    button.appendChild(icon)
    expect(shouldPreserveFocus(icon, input)).toBe(true)
  })

  it('does nothing when no text field is focused', () => {
    const button = document.createElement('button')
    expect(shouldPreserveFocus(button, document.body)).toBe(false)
    expect(shouldPreserveFocus(button, null)).toBe(false)
  })

  it('lets focus move to another text field', () => {
    const a = textInput()
    const b = textInput()
    expect(shouldPreserveFocus(b, a)).toBe(false)
  })

  it('ignores taps on non-actionable elements and disabled buttons', () => {
    const input = textInput()
    expect(shouldPreserveFocus(document.createElement('div'), input)).toBe(false)
    const disabled = document.createElement('button')
    disabled.disabled = true
    expect(shouldPreserveFocus(disabled, input)).toBe(false)
  })
})

describe('getKeyboardInset', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })

  it('returns the height covered by the keyboard', () => {
    expect(getKeyboardInset(makeVisualViewport(500) as unknown as VisualViewport)).toBe(300)
    expect(getKeyboardInset(makeVisualViewport(500, 50) as unknown as VisualViewport)).toBe(250)
  })

  it('never goes negative', () => {
    expect(getKeyboardInset(makeVisualViewport(900) as unknown as VisualViewport)).toBe(0)
  })
})

describe('useKeyboardAvoidance', () => {
  let originalVV: VisualViewport | null

  beforeEach(() => {
    originalVV = window.visualViewport
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', { value: originalVV, configurable: true })
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('prevents the blur-causing mousedown so the button click fires on the first tap', () => {
    Object.defineProperty(window, 'visualViewport', { value: null, configurable: true })
    renderHook(() => useKeyboardAvoidance())
    const input = textInput()
    const button = document.createElement('button')
    document.body.appendChild(button)
    input.focus()

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    button.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('does not interfere with mousedown when no field is focused', () => {
    Object.defineProperty(window, 'visualViewport', { value: null, configurable: true })
    renderHook(() => useKeyboardAvoidance())
    const button = document.createElement('button')
    document.body.appendChild(button)

    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    button.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })

  it('publishes the keyboard inset and scrolls the focused field into view', () => {
    const vv = makeVisualViewport(800)
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    const input = textInput()
    const scrollSpy = vi.fn()
    input.scrollIntoView = scrollSpy
    input.focus()

    const { unmount } = renderHook(() => useKeyboardAvoidance())
    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_VAR)).toBe('0px')
    expect(scrollSpy).not.toHaveBeenCalled()

    act(() => {
      ;(vv as unknown as { height: number }).height = 450
      vv._trigger('resize')
    })
    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_VAR)).toBe('350px')
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' })

    unmount()
    expect(document.documentElement.style.getPropertyValue(KEYBOARD_INSET_VAR)).toBe('')
  })
})
