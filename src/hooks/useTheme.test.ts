import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTheme } from './useTheme'

vi.mock('../utils/supporter', () => ({
  activateCode: vi.fn(),
  deactivateSupporter: vi.fn(),
  isActivated: () => false,
  prefetchHashes: vi.fn(),
}))

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
})

describe('useTheme', () => {
  it('persists and applies the green theme', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('green'))

    expect(result.current.theme).toBe('green')
    expect(localStorage.getItem('gym_theme')).toBe('green')
    expect(document.documentElement.getAttribute('data-theme')).toBe('green')
  })

  it('drops the data-theme attribute for the default yellow theme', () => {
    localStorage.setItem('gym_theme', 'green')
    const { result } = renderHook(() => useTheme())
    act(() => result.current.setTheme('yellow'))

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })
})
