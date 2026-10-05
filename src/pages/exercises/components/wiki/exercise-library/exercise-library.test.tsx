import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, LibraryExercise } from '../../../../../types'
import { ExerciseLibrary } from './exercise-library'

const bench: LibraryExercise = {
  id: 'Barbell_Bench_Press',
  name: 'Barbell Bench Press',
  category: 'strength',
  primaryMuscles: ['Mid Chest'],
  secondaryMuscles: ['Triceps Long Head'],
  instructions: ['Lie on the bench.', 'Press the bar up.'],
  equipment: 'barbell',
  level: 'beginner',
  force: 'push',
  mechanic: 'compound',
  imageFolder: 'Barbell_Bench_Press',
  imageCount: 2,
}

vi.mock('../../../../../data/freeExerciseDb', () => ({
  loadLibrary: () => Promise.resolve([bench]),
}))

vi.mock('../../../../../hooks/useExerciseImage', () => ({
  useExerciseImage: () => ({ src: '/test.jpg', error: false, loading: false }),
}))

function renderLibrary(userExercises: Exercise[] = []) {
  const onAddExercise = vi.fn()
  render(<ExerciseLibrary userExercises={userExercises} onAddExercise={onAddExercise} />)
  return { onAddExercise }
}

describe('ExerciseLibrary', () => {
  it('opens the detail view when a search result is clicked, without adding it', async () => {
    const { onAddExercise } = renderLibrary()
    await userEvent.click(await screen.findByRole('button', { name: 'View Barbell Bench Press' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Press the bar up.')).toBeInTheDocument()
    expect(onAddExercise).not.toHaveBeenCalled()
  })

  it('can add the exercise from the detail view', async () => {
    const { onAddExercise } = renderLibrary()
    await userEvent.click(await screen.findByRole('button', { name: 'View Barbell Bench Press' }))
    await userEvent.click(screen.getByRole('button', { name: /Add to my exercises/ }))
    expect(onAddExercise).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Barbell Bench Press', libraryId: 'Barbell_Bench_Press' }),
    )
    expect(screen.getByRole('button', { name: /In your exercises/ })).toBeDisabled()
  })

  it('shows an already-owned exercise as added in the detail view', async () => {
    const owned: Exercise = {
      id: 'u1',
      name: 'Barbell Bench Press',
      muscleGroups: ['Mid Chest'],
      primaryMuscles: ['Mid Chest'],
      secondaryMuscles: [],
      notes: '',
      createdAt: '2026-01-01',
      libraryId: 'Barbell_Bench_Press',
    }
    renderLibrary([owned])
    await userEvent.click(await screen.findByRole('button', { name: 'View Barbell Bench Press' }))
    expect(screen.getByRole('button', { name: /In your exercises/ })).toBeDisabled()
  })
})
