import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useStorage } from './useStorage'

describe('useStorage', () => {
  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useStorage('test_key', 42))
    expect(result.current[0]).toBe(42)
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test_key', JSON.stringify(99))
    const { result } = renderHook(() => useStorage('test_key', 0))
    expect(result.current[0]).toBe(99)
  })

  it('persists value to localStorage on set', () => {
    const { result } = renderHook(() => useStorage('test_key', 0))
    act(() => result.current[1](123))
    expect(result.current[0]).toBe(123)
    expect(JSON.parse(localStorage.getItem('test_key')!)).toBe(123)
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useStorage('test_key', 10))
    act(() => result.current[1]((prev) => prev + 5))
    expect(result.current[0]).toBe(15)
  })

  it('handles arrays', () => {
    const { result } = renderHook(() => useStorage<number[]>('test_arr', []))
    act(() => result.current[1]([1, 2, 3]))
    expect(result.current[0]).toEqual([1, 2, 3])
    expect(JSON.parse(localStorage.getItem('test_arr')!)).toEqual([1, 2, 3])
  })

  it('handles objects', () => {
    const { result } = renderHook(() => useStorage('test_obj', { a: 1 }))
    act(() => result.current[1]({ a: 2 }))
    expect(result.current[0]).toEqual({ a: 2 })
  })

  it('falls back to initial value when localStorage has invalid JSON', () => {
    localStorage.setItem('bad_key', 'not-json{{{')
    const { result } = renderHook(() => useStorage('bad_key', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })
})
