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

  it('shows the replace button when onReplace is provided', () => {
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onReplace={vi.fn()}
      />,
    )
    expect(screen.getByTitle('Replace exercise')).toBeInTheDocument()
  })

  it('calls onReplace when the replace button is clicked', async () => {
    const onReplace = vi.fn()
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onReplace={onReplace}
      />,
    )
    await userEvent.click(screen.getByTitle('Replace exercise'))
    expect(onReplace).toHaveBeenCalledOnce()
  })

  it('does not show the replace button when onReplace is not provided', () => {
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={vi.fn()} onRemove={vi.fn()} />,
    )
    expect(screen.queryByTitle('Replace exercise')).not.toBeInTheDocument()
  })
})
