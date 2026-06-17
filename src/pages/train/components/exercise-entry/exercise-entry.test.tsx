import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, SessionExerciseEntry } from '../../../../types'
import { ExerciseEntryComponent } from './exercise-entry'

const exercise: Exercise = {
  id: 'ex1',
  name: 'Barbell Squat',
  muscleGroups: [],
  primaryMuscles: [],
  secondaryMuscles: [],
  notes: '',
  createdAt: '2026-01-01',
}

const entry: SessionExerciseEntry = {
  exerciseId: 'ex1',
  sets: [{ reps: 5, weight: 100, unit: 'kg' }],
}

describe('ExerciseEntryComponent', () => {
  it('opens the exercise detail when the name is clicked (active entry)', async () => {
    const onOpenDetail = vi.fn()
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onOpenDetail={onOpenDetail}
      />,
    )
    await userEvent.click(screen.getByText('Barbell Squat'))
    expect(onOpenDetail).toHaveBeenCalledOnce()
  })

  it('opens the exercise detail from the finished view too', async () => {
    const onOpenDetail = vi.fn()
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={{ ...entry, finished: true }}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onOpenDetail={onOpenDetail}
      />,
    )
    await userEvent.click(screen.getByText('Barbell Squat'))
    expect(onOpenDetail).toHaveBeenCalledOnce()
  })
})
