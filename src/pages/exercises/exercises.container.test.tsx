import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise, Session } from '../../types'
import { ExerciseList } from './exercises.container'

const makeExercise = (id: string, name: string, muscles: string[] = []): Exercise => ({
  id,
  name,
  primaryMuscles: muscles as any,
  secondaryMuscles: [],
  muscleGroups: muscles as any,
  notes: '',
  createdAt: new Date().toISOString(),
})

const defaultProps = {
  exercises: [],
  sessions: [] as Session[],
  savedPlans: [],
  onSave: vi.fn(),
  onDelete: vi.fn(),
  onStartWith: vi.fn(),
  onSavePlan: vi.fn(),
  onUpdatePlan: vi.fn(),
  onDeletePlan: vi.fn(),
}

describe('ExerciseList container', () => {
  it('shows empty state when no exercises', () => {
    render(<ExerciseList {...defaultProps} />)
    expect(screen.getByText(/No exercises yet/)).toBeInTheDocument()
  })

  it('renders exercise names', () => {
    const exercises = [makeExercise('ex1', 'Bench Press'), makeExercise('ex2', 'Squat')]
    render(<ExerciseList {...defaultProps} exercises={exercises} />)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Squat')).toBeInTheDocument()
  })

  it('filters by search term', async () => {
    const exercises = [makeExercise('ex1', 'Bench Press'), makeExercise('ex2', 'Squat')]
    render(<ExerciseList {...defaultProps} exercises={exercises} />)
    await userEvent.type(screen.getByPlaceholderText('Search exercises...'), 'bench')
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.queryByText('Squat')).not.toBeInTheDocument()
  })

  it('shows no matches message when search has no results', async () => {
    const exercises = [makeExercise('ex1', 'Bench Press')]
    render(<ExerciseList {...defaultProps} exercises={exercises} />)
    await userEvent.type(screen.getByPlaceholderText('Search exercises...'), 'zzzzz')
    expect(screen.getByText('No matches.')).toBeInTheDocument()
  })

  it('switches to wiki tab when Wiki & Plans clicked', async () => {
    render(<ExerciseList {...defaultProps} />)
    await userEvent.click(screen.getByText('Wiki & Plans'))
    // Wiki component should render — check for something unique to wiki view
    expect(screen.queryByText('Search exercises...')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete confirmed', async () => {
    const onDelete = vi.fn()
    const exercises = [makeExercise('ex1', 'Bench Press')]
    render(<ExerciseList {...defaultProps} exercises={exercises} onDelete={onDelete} />)
    // Row has: name button, pencil button, trash button — trash is last in row
    const allBtns = screen.getAllByRole('button')
    // Trash button has hover:bg-red-900/30 class
    const trashBtn = allBtns.find((b) => b.className.includes('red-900'))
    expect(trashBtn).toBeTruthy()
    await userEvent.click(trashBtn!)
    // Confirm dialog appears
    expect(screen.getByText('Delete Exercise')).toBeInTheDocument()
    // Click the "Delete" confirm button
    const deleteBtns = screen.getAllByText('Delete')
    await userEvent.click(deleteBtns[deleteBtns.length - 1])
    expect(onDelete).toHaveBeenCalledWith('ex1')
  })
})
