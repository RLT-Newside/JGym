import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useActiveSession } from './useSession'

describe('useActiveSession', () => {
  it('starts with no active session', () => {
    const { result } = renderHook(() => useActiveSession())
    expect(result.current.active).toBeNull()
    expect(result.current.elapsed).toBe(0)
  })

  it('starts a session', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('Push Day'))
    expect(result.current.active).not.toBeNull()
    expect(result.current.active?.label).toBe('Push Day')
    expect(result.current.active?.entries).toEqual([])
  })

  it('starts a session with initial entries', () => {
    const { result } = renderHook(() => useActiveSession())
    const entries = [{ exerciseId: 'ex1', sets: [{ reps: 10, weight: 60, unit: 'kg' as const }] }]
    act(() => result.current.startSession('Push', entries))
    expect(result.current.active?.entries).toHaveLength(1)
    expect(result.current.active?.entries[0].exerciseId).toBe('ex1')
  })

  it('persists active session to localStorage', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('Test'))
    expect(localStorage.getItem('gym_active_session')).not.toBeNull()
  })

  it('updates entries', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('Test'))
    const entries = [{ exerciseId: 'ex1', sets: [{ reps: 5, weight: 100, unit: 'kg' as const }] }]
    act(() => result.current.updateEntries(entries))
    expect(result.current.active?.entries).toHaveLength(1)
  })

  it('finishes session and returns it', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('Leg Day'))
    act(() => {
      result.current.updateEntries([{ exerciseId: 'ex1', sets: [{ reps: 8, weight: 80, unit: 'kg' }] }])
    })
    let session!: ReturnType<typeof result.current.finishSession>
    act(() => {
      session = result.current.finishSession()
    })
    expect(session).not.toBeNull()
    expect(session?.label).toBe('Leg Day')
    expect(session?.entries).toHaveLength(1)
    expect(result.current.active).toBeNull()
    expect(localStorage.getItem('gym_active_session')).toBeNull()
  })

  it('finishSession filters out entries with no sets', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('Test'))
    act(() => {
      result.current.updateEntries([
        { exerciseId: 'ex1', sets: [] },
        { exerciseId: 'ex2', sets: [{ reps: 5, weight: 50, unit: 'kg' }] },
      ])
    })
    let session!: ReturnType<typeof result.current.finishSession>
    act(() => {
      session = result.current.finishSession()
    })
    expect(session?.entries).toHaveLength(1)
    expect(session?.entries[0].exerciseId).toBe('ex2')
  })

  it('cancels session', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('Test'))
    act(() => result.current.cancelSession())
    expect(result.current.active).toBeNull()
    expect(localStorage.getItem('gym_active_session')).toBeNull()
  })

  it('restores active session from localStorage on mount', () => {
    const stored = {
      id: 'test-id',
      label: 'Restored Session',
      startTime: Date.now() - 60000,
      entries: [],
    }
    localStorage.setItem('gym_active_session', JSON.stringify(stored))
    const { result } = renderHook(() => useActiveSession())
    expect(result.current.active?.label).toBe('Restored Session')
  })

  it('stores the plan link when started from a plan day', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('PPL – Push', [], { id: 'plan1', nextIndex: 1 }))
    expect(result.current.active?.planId).toBe('plan1')
    expect(result.current.active?.planNextIndex).toBe(1)
  })

  it('persists the plan link so it survives a restart (re-mount)', () => {
    const { result, unmount } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('PPL – Push', [], { id: 'plan1', nextIndex: 2 }))
    unmount()
    // Simulate an app restart/update: a fresh hook re-reads localStorage.
    const { result: restored } = renderHook(() => useActiveSession())
    expect(restored.current.active?.planId).toBe('plan1')
    expect(restored.current.active?.planNextIndex).toBe(2)
  })

  it('leaves the plan link undefined for a non-plan session', () => {
    const { result } = renderHook(() => useActiveSession())
    act(() => result.current.startSession('Freestyle'))
    expect(result.current.active?.planId).toBeUndefined()
    expect(result.current.active?.planNextIndex).toBeUndefined()
  })
})

describe('useActiveSession in demo mode', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.resetModules()
  })

  // The demo flag is read once at module load, so load a fresh copy of the
  // store (and the hook) with demo mode switched on.
  async function loadDemoHook() {
    sessionStorage.setItem('jgym_demo', '1')
    vi.resetModules()
    return (await import('./useSession')).useActiveSession
  }

  it('keeps a demo session out of real localStorage', async () => {
    const useDemoSession = await loadDemoHook()
    const { result } = renderHook(() => useDemoSession())
    act(() => result.current.startSession('Demo Push'))
    expect(localStorage.getItem('gym_active_session')).toBeNull()
    expect(sessionStorage.getItem('demo::gym_active_session')).not.toBeNull()
  })

  it('does not resume a demo session after leaving demo mode', async () => {
    const useDemoSession = await loadDemoHook()
    const { result, unmount } = renderHook(() => useDemoSession())
    act(() => result.current.startSession('Demo Push'))
    unmount()
    // Leaving demo mode clears the overlay and reloads into real data.
    sessionStorage.clear()
    vi.resetModules()
    const { useActiveSession: useRealSession } = await import('./useSession')
    const { result: real } = renderHook(() => useRealSession())
    expect(real.current.active).toBeNull()
  })
})
