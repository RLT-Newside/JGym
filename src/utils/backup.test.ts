import { beforeEach, describe, expect, it } from 'vitest'
import { mergeBackup } from './backup'

beforeEach(() => {
  localStorage.clear()
})

describe('mergeBackup', () => {
  it('merge appends new exercises and dedupes by id', () => {
    localStorage.setItem('gym_exercises', JSON.stringify([{ id: 'a', name: 'A' }]))
    const result = mergeBackup(
      {
        gym_exercises: [
          { id: 'a', name: 'A-dup' },
          { id: 'b', name: 'B' },
        ],
      },
      'merge',
    )
    expect(result.exercises).toEqual([
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ])
    expect(JSON.parse(localStorage.getItem('gym_exercises') ?? '[]')).toHaveLength(2)
  })

  it('merge overwrites non exercise/session gym keys', () => {
    localStorage.setItem('gym_water', JSON.stringify([{ id: 'w1' }]))
    mergeBackup({ gym_water: [{ id: 'w2' }] }, 'merge')
    expect(JSON.parse(localStorage.getItem('gym_water') ?? '[]')).toEqual([{ id: 'w2' }])
  })

  it('replace clears existing gym_ keys before writing', () => {
    localStorage.setItem('gym_exercises', JSON.stringify([{ id: 'a' }]))
    localStorage.setItem('gym_water', JSON.stringify([{ id: 'w1' }]))
    const result = mergeBackup({ gym_exercises: [{ id: 'z' }] }, 'replace')
    expect(result.exercises).toEqual([{ id: 'z' }])
    // gym_water was cleared and not in the backup, so it's gone.
    expect(localStorage.getItem('gym_water')).toBeNull()
  })

  it('ignores non-gym keys', () => {
    mergeBackup({ malicious: 'x', gym_sessions: [{ id: 's1' }] }, 'replace')
    expect(localStorage.getItem('malicious')).toBeNull()
    expect(JSON.parse(localStorage.getItem('gym_sessions') ?? '[]')).toEqual([{ id: 's1' }])
  })

  it('returns empty arrays when nothing was imported', () => {
    const result = mergeBackup({}, 'merge')
    expect(result).toEqual({ exercises: [], sessions: [] })
  })
})
