import { describe, expect, it } from 'vitest'
import type { Exercise, LibraryExercise } from '../types'
import { relinkLibraryIds } from './relinkImages'

const lib = (id: string, name: string): LibraryExercise => ({
  id,
  name,
  category: 'strength',
  primaryMuscles: [],
  secondaryMuscles: [],
  instructions: [],
  equipment: null,
  level: 'beginner',
  force: null,
  mechanic: null,
  imageFolder: id,
  imageCount: 2,
})

const ex = (over: Partial<Exercise>): Exercise => ({
  id: 'x',
  name: 'Squat',
  muscleGroups: [],
  primaryMuscles: [],
  secondaryMuscles: [],
  notes: '',
  createdAt: '2026-01-01',
  ...over,
})

const library = [lib('Barbell_Squat', 'Barbell Squat'), lib('Dumbbell_Bench_Press', 'Dumbbell Bench Press')]

describe('relinkLibraryIds', () => {
  it('links an unlinked exercise by direct dataset-name match', () => {
    const { exercises, changed } = relinkLibraryIds([ex({ name: 'Barbell Squat' })], library)
    expect(changed).toBe(1)
    expect(exercises[0].libraryId).toBe('Barbell_Squat')
  })

  it('links via the alias map (Bench Press (Dumbbell) → slug)', () => {
    const { exercises } = relinkLibraryIds([ex({ name: 'Bench Press (Dumbbell)' })], library)
    expect(exercises[0].libraryId).toBe('Dumbbell_Bench_Press')
  })

  it('leaves already-linked exercises untouched without force', () => {
    const input = [ex({ name: 'Barbell Squat', libraryId: 'Some_Manual_Link' })]
    const { exercises, changed } = relinkLibraryIds(input, library)
    expect(changed).toBe(0)
    expect(exercises[0].libraryId).toBe('Some_Manual_Link')
  })

  it('overwrites an existing link when force is set', () => {
    const input = [ex({ name: 'Barbell Squat', libraryId: 'Wrong_Slug' })]
    const { exercises, changed } = relinkLibraryIds(input, library, { force: true })
    expect(changed).toBe(1)
    expect(exercises[0].libraryId).toBe('Barbell_Squat')
  })

  it('leaves unmatched exercises alone and reports no change', () => {
    const input = [ex({ name: 'Totally Made Up Lift' })]
    const { exercises, changed } = relinkLibraryIds(input, library)
    expect(changed).toBe(0)
    expect(exercises[0].libraryId).toBeUndefined()
    expect(exercises).toBe(input) // same reference when nothing changed
  })
})
