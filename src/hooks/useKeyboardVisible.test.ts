import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useKeyboardVisible } from './useKeyboardVisible'

function makeVisualViewport(height: number) {
  const listeners: Record<string, (() => void)[]> = {}
  return {
    height,
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
    _setHeight: (_h: number) => {
      ;(listeners as unknown as { _vv: { height: number } })._vv
      // mutate via closure; callers set vv.height directly then _trigger
    },
  }
}

function makeFocusEvent(type: string, target: EventTarget, relatedTarget: EventTarget | null = null) {
  const event = new FocusEvent(type, { bubbles: true, cancelable: true, relatedTarget: relatedTarget as EventTarget })
  Object.defineProperty(event, 'target', { get: () => target, configurable: true })
  return event
}

function fireFocusIn(target: EventTarget, relatedTarget: EventTarget | null = null) {
  document.dispatchEvent(makeFocusEvent('focusin', target, relatedTarget))
}

function fireFocusOut(target: EventTarget, relatedTarget: EventTarget | null = null) {
  document.dispatchEvent(makeFocusEvent('focusout', target, relatedTarget))
}

describe('useKeyboardVisible', () => {
  let originalVV: VisualViewport | null
  let vv: ReturnType<typeof makeVisualViewport>

  beforeEach(() => {
    originalVV = window.visualViewport
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(window, 'visualViewport', { value: originalVV, configurable: true })
    vi.restoreAllMocks()
  })

  it('returns false when visual viewport height matches window height', () => {
    vv = makeVisualViewport(800)
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    const { result } = renderHook(() => useKeyboardVisible())
    expect(result.current).toBe(false)
  })

  it('returns true when visual viewport is significantly shorter (keyboard open)', () => {
    vv = makeVisualViewport(400)
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    const { result } = renderHook(() => useKeyboardVisible())
    expect(result.current).toBe(true)
  })

  it('updates when visualViewport fires a resize event', () => {
    vv = makeVisualViewport(800)
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    const { result } = renderHook(() => useKeyboardVisible())
    expect(result.current).toBe(false)

    act(() => {
      ;(vv as unknown as { height: number }).height = 350
      vv._trigger('resize')
    })
    expect(result.current).toBe(true)
  })

  it('returns false when visualViewport is not available', () => {
    Object.defineProperty(window, 'visualViewport', { value: null, configurable: true })
    const { result } = renderHook(() => useKeyboardVisible())
    expect(result.current).toBe(false)
  })

  it('removes the resize listener on unmount', () => {
    vv = makeVisualViewport(800)
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    const { unmount } = renderHook(() => useKeyboardVisible())
    unmount()
    expect(vv.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  describe('field focus detection', () => {
    beforeEach(() => {
      vv = makeVisualViewport(800)
      Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
    })

    it('returns true when a text input receives focus', () => {
      const { result } = renderHook(() => useKeyboardVisible())
      expect(result.current).toBe(false)

      const input = document.createElement('input')
      input.type = 'text'
      act(() => {
        fireFocusIn(input)
      })
      expect(result.current).toBe(true)
    })

    it('returns true when a numeric input receives focus', () => {
      const { result } = renderHook(() => useKeyboardVisible())
      const input = document.createElement('input')
      input.type = 'number'
      act(() => {
        fireFocusIn(input)
      })
      expect(result.current).toBe(true)
    })

    it('returns true when a textarea receives focus', () => {
      const { result } = renderHook(() => useKeyboardVisible())
      const textarea = document.createElement('textarea')
      act(() => {
        fireFocusIn(textarea)
      })
      expect(result.current).toBe(true)
    })

    it('returns false when a button receives focus', () => {
      const { result } = renderHook(() => useKeyboardVisible())
      const button = document.createElement('button')
      act(() => {
        fireFocusIn(button)
      })
      expect(result.current).toBe(false)
    })

    it('returns false after input loses focus to a non-input element', () => {
      const { result } = renderHook(() => useKeyboardVisible())
      const input = document.createElement('input')
      input.type = 'text'
      const button = document.createElement('button')

      act(() => {
        fireFocusIn(input)
      })
      expect(result.current).toBe(true)

      act(() => {
        fireFocusOut(input, button)
      })
      expect(result.current).toBe(false)
    })

    it('stays true when focus moves between two text inputs', () => {
      const { result } = renderHook(() => useKeyboardVisible())
      const reps = document.createElement('input')
      reps.type = 'text'
      const weight = document.createElement('input')
      weight.type = 'text'

      act(() => {
        fireFocusIn(reps)
      })
      expect(result.current).toBe(true)

      act(() => {
        fireFocusOut(reps, weight)
      })
      expect(result.current).toBe(true)
    })

    it('cleans up focus listeners on unmount', () => {
      const addSpy = vi.spyOn(document, 'addEventListener')
      const removeSpy = vi.spyOn(document, 'removeEventListener')
      const { unmount } = renderHook(() => useKeyboardVisible())
      unmount()
      expect(addSpy).toHaveBeenCalledWith('focusin', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('focusin', expect.any(Function))
      expect(removeSpy).toHaveBeenCalledWith('focusout', expect.any(Function))
    })
  })
})
