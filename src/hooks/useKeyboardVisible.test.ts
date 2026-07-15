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
})
