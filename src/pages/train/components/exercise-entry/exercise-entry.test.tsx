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

  it('shows move up and down buttons when both handlers are provided', () => {
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />,
    )
    expect(screen.getByTitle('Move exercise up')).toBeInTheDocument()
    expect(screen.getByTitle('Move exercise down')).toBeInTheDocument()
  })

  it('calls onMoveUp when move up button is clicked', async () => {
    const onMoveUp = vi.fn()
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onMoveUp={onMoveUp}
        onMoveDown={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByTitle('Move exercise up'))
    expect(onMoveUp).toHaveBeenCalledOnce()
  })

  it('disables move up button when onMoveUp is not provided', () => {
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onMoveDown={vi.fn()}
      />,
    )
    const upBtn = screen.getByTitle('Move exercise up')
    expect(upBtn).toBeDisabled()
  })

  it('does not show move buttons when neither handler is provided', () => {
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={vi.fn()} onRemove={vi.fn()} />,
    )
    expect(screen.queryByTitle('Move exercise up')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Move exercise down')).not.toBeInTheDocument()
  })

  it('shows warmup default prompt after adding a warmup set when onUpdateExercise is provided', async () => {
    const onUpdateExercise = vi.fn()
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onUpdateExercise={onUpdateExercise}
      />,
    )
    await userEvent.click(screen.getByText('Warmup'))
    expect(screen.getByText('Default Warmup')).toBeInTheDocument()
  })

  it('calls onUpdateExercise with defaultWarmup: true when user confirms prompt', async () => {
    const onUpdateExercise = vi.fn()
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onUpdateExercise={onUpdateExercise}
      />,
    )
    await userEvent.click(screen.getByText('Warmup'))
    await userEvent.click(screen.getByRole('button', { name: 'Make default' }))
    expect(onUpdateExercise).toHaveBeenCalledWith({ ...exercise, defaultWarmup: true })
  })

  it('does not show warmup default prompt when exercise already has defaultWarmup: true', async () => {
    const onUpdateExercise = vi.fn()
    render(
      <ExerciseEntryComponent
        exercise={{ ...exercise, defaultWarmup: true }}
        entry={entry}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onUpdateExercise={onUpdateExercise}
      />,
    )
    await userEvent.click(screen.getByText('Warmup'))
    expect(screen.queryByText('Default Warmup')).not.toBeInTheDocument()
  })

  it('does not show warmup default prompt when onUpdateExercise is not provided', async () => {
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={vi.fn()} onRemove={vi.fn()} />,
    )
    await userEvent.click(screen.getByText('Warmup'))
    expect(screen.queryByText('Default Warmup')).not.toBeInTheDocument()
  })
})
