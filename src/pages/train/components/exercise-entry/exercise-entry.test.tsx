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

  it('shows "Set target" button when no repRange is set', () => {
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={vi.fn()} onRemove={vi.fn()} />,
    )
    expect(screen.getByTitle('Set rep range target')).toBeInTheDocument()
  })

  it('shows existing repRange with edit button', () => {
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={{ ...entry, repRange: '8-12' }}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    )
    expect(screen.getByTitle('Edit rep range target')).toBeInTheDocument()
    expect(screen.getByText(/Target: 8-12 reps/)).toBeInTheDocument()
  })

  it('opens inline editor when "Set target" is clicked', async () => {
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={vi.fn()} onRemove={vi.fn()} />,
    )
    await userEvent.click(screen.getByTitle('Set rep range target'))
    expect(screen.getByRole('textbox', { name: 'Rep range target' })).toBeInTheDocument()
  })

  it('opens inline editor pre-filled with existing repRange when edit button is clicked', async () => {
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={{ ...entry, repRange: '8-12' }}
        sessions={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByTitle('Edit rep range target'))
    const input = screen.getByRole('textbox', { name: 'Rep range target' }) as HTMLInputElement
    expect(input.value).toBe('8-12')
  })

  it('calls onChange with new repRange when a valid value is saved', async () => {
    const onChange = vi.fn()
    const entryWithRange: SessionExerciseEntry = { ...entry, repRange: '8-12' }
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entryWithRange}
        sessions={[]}
        onChange={onChange}
        onRemove={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByTitle('Edit rep range target'))
    const input = screen.getByRole('textbox', { name: 'Rep range target' })
    await userEvent.clear(input)
    await userEvent.type(input, '10-15')
    await userEvent.click(screen.getByTitle('Save target'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ repRange: '10-15' }))
  })

  it('calls onChange with undefined repRange when input is cleared and saved', async () => {
    const onChange = vi.fn()
    const entryWithRange: SessionExerciseEntry = { ...entry, repRange: '8-12' }
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entryWithRange}
        sessions={[]}
        onChange={onChange}
        onRemove={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByTitle('Edit rep range target'))
    const input = screen.getByRole('textbox', { name: 'Rep range target' })
    await userEvent.clear(input)
    await userEvent.click(screen.getByTitle('Save target'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ repRange: undefined }))
  })

  it('does not call onChange with an invalid repRange value', async () => {
    const onChange = vi.fn()
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={onChange} onRemove={vi.fn()} />,
    )
    await userEvent.click(screen.getByTitle('Set rep range target'))
    const input = screen.getByRole('textbox', { name: 'Rep range target' })
    await userEvent.type(input, 'notvalid')
    await userEvent.click(screen.getByTitle('Save target'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('cancels editing without calling onChange when cancel is clicked', async () => {
    const onChange = vi.fn()
    const entryWithRange: SessionExerciseEntry = { ...entry, repRange: '8-12' }
    render(
      <ExerciseEntryComponent
        exercise={exercise}
        entry={entryWithRange}
        sessions={[]}
        onChange={onChange}
        onRemove={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByTitle('Edit rep range target'))
    await userEvent.click(screen.getByTitle('Cancel'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox', { name: 'Rep range target' })).not.toBeInTheDocument()
  })

  it('saves repRange when Enter is pressed', async () => {
    const onChange = vi.fn()
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={onChange} onRemove={vi.fn()} />,
    )
    await userEvent.click(screen.getByTitle('Set rep range target'))
    const input = screen.getByRole('textbox', { name: 'Rep range target' })
    await userEvent.type(input, '6-10{Enter}')
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ repRange: '6-10' }))
  })

  it('cancels editing when Escape is pressed', async () => {
    const onChange = vi.fn()
    render(
      <ExerciseEntryComponent exercise={exercise} entry={entry} sessions={[]} onChange={onChange} onRemove={vi.fn()} />,
    )
    await userEvent.click(screen.getByTitle('Set rep range target'))
    const input = screen.getByRole('textbox', { name: 'Rep range target' })
    await userEvent.type(input, '6-10{Escape}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('textbox', { name: 'Rep range target' })).not.toBeInTheDocument()
  })
})
