import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Exercise } from '../types'
import { useExerciseForm } from './useExerciseForm'

const base: Exercise = {
  id: 'ex1',
  name: 'Bench Press',
  muscleGroups: [],
  primaryMuscles: [],
  secondaryMuscles: [],
  notes: 'some notes',
  createdAt: '2026-01-01',
  description: 'Keep back flat',
  defaultWarmup: true,
}

describe('useExerciseForm', () => {
  it('initializes with exercise values', () => {
    const { result } = renderHook(() => useExerciseForm(base))
    expect(result.current.name).toBe('Bench Press')
    expect(result.current.notes).toBe('some notes')
    expect(result.current.description).toBe('Keep back flat')
    expect(result.current.defaultWarmup).toBe(true)
  })

  it('initializes with empty values when no exercise provided', () => {
    const { result } = renderHook(() => useExerciseForm(null))
    expect(result.current.name).toBe('')
    expect(result.current.notes).toBe('')
    expect(result.current.description).toBe('')
    expect(result.current.defaultWarmup).toBe(false)
    expect(result.current.canSave).toBe(false)
  })

  it('canSave is true when name is non-empty', () => {
    const { result } = renderHook(() => useExerciseForm(base))
    expect(result.current.canSave).toBe(true)
  })

  it('canSave becomes false when name is cleared', () => {
    const { result } = renderHook(() => useExerciseForm(base))
    act(() => result.current.setName(''))
    expect(result.current.canSave).toBe(false)
  })

  it('buildExercise returns correctly shaped exercise', () => {
    const { result } = renderHook(() => useExerciseForm(base))
    const built = result.current.buildExercise()
    expect(built.id).toBe('ex1')
    expect(built.name).toBe('Bench Press')
    expect(built.description).toBe('Keep back flat')
    expect(built.defaultWarmup).toBe(true)
    expect(built.notes).toBe('some notes')
  })

  it('buildExercise omits description when empty', () => {
    const { result } = renderHook(() => useExerciseForm({ ...base, description: undefined }))
    const built = result.current.buildExercise()
    expect(built.description).toBeUndefined()
  })

  it('buildExercise omits defaultWarmup when false', () => {
    const { result } = renderHook(() => useExerciseForm({ ...base, defaultWarmup: false }))
    const built = result.current.buildExercise()
    expect(built.defaultWarmup).toBeUndefined()
  })

  it('reset restores values to original exercise', () => {
    const { result } = renderHook(() => useExerciseForm(base))
    act(() => {
      result.current.setName('Modified')
      result.current.setDescription('New description')
    })
    expect(result.current.name).toBe('Modified')
    act(() => result.current.reset())
    expect(result.current.name).toBe('Bench Press')
    expect(result.current.description).toBe('Keep back flat')
  })

  it('handleToggleMuscle adds to primary muscles when in primary mode', () => {
    const { result } = renderHook(() => useExerciseForm(null))
    act(() => result.current.handleToggleMuscle('Upper Chest'))
    expect(result.current.primaryMuscles).toContain('Upper Chest')
    expect(result.current.secondaryMuscles).not.toContain('Upper Chest')
  })

  it('handleToggleMuscle removes from primary muscles when already selected', () => {
    const { result } = renderHook(() =>
      useExerciseForm({ ...base, primaryMuscles: ['Upper Chest'] as Exercise['primaryMuscles'] }),
    )
    act(() => result.current.handleToggleMuscle('Upper Chest'))
    expect(result.current.primaryMuscles).not.toContain('Upper Chest')
  })

  it('handleToggleMuscle moves muscle from primary to secondary when switching modes', () => {
    const { result } = renderHook(() => useExerciseForm(null))
    act(() => result.current.handleToggleMuscle('Upper Chest'))
    act(() => result.current.setSelectionMode('secondary'))
    act(() => result.current.handleToggleMuscle('Upper Chest'))
    expect(result.current.primaryMuscles).not.toContain('Upper Chest')
    expect(result.current.secondaryMuscles).toContain('Upper Chest')
  })
})
