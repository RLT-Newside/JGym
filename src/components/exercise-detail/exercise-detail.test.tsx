import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Exercise } from '../../types'
import { ExerciseDetail } from './exercise-detail'

const { mockLibraryEntry } = vi.hoisted(() => ({ mockLibraryEntry: vi.fn() }))

vi.mock('../../hooks/useLibraryEntry', () => ({
  useLibraryEntry: () => mockLibraryEntry(),
}))

vi.mock('../../hooks/useExerciseImage', () => ({
  useExerciseImage: () => ({ src: '/test.jpg', error: false, loading: false }),
}))

const base: Exercise = {
  id: 'ex1',
  name: 'Test Exercise',
  muscleGroups: [],
  primaryMuscles: [],
  secondaryMuscles: [],
  notes: '',
  createdAt: '2026-01-01',
}

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  sessions: [],
  onStartWith: vi.fn(),
}

describe('ExerciseDetail', () => {
  beforeEach(() => {
    mockLibraryEntry.mockReturnValue(null)
  })

  it('displays a custom description when present', () => {
    render(<ExerciseDetail {...defaultProps} exercise={{ ...base, description: 'Keep back straight' }} />)
    expect(screen.getByText('Keep back straight')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('does not render the description section when absent', () => {
    render(<ExerciseDetail {...defaultProps} exercise={base} />)
    expect(screen.queryByText('Description')).not.toBeInTheDocument()
  })

  it('displays custom images when present', () => {
    const exercise = { ...base, customImages: ['data:image/jpeg;base64,abc'] }
    render(<ExerciseDetail {...defaultProps} exercise={exercise} />)
    const img = screen.getByAltText('Test Exercise')
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,abc')
  })

  it('shows a carousel toggle for multiple custom images', async () => {
    const exercise = { ...base, customImages: ['data:image/jpeg;base64,img1', 'data:image/jpeg;base64,img2'] }
    render(<ExerciseDetail {...defaultProps} exercise={exercise} />)
    expect(screen.getByText('1/2')).toBeInTheDocument()
    await userEvent.click(screen.getByText('1/2'))
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('does not render custom images section when absent', () => {
    render(<ExerciseDetail {...defaultProps} exercise={base} />)
    expect(screen.queryByAltText('Test Exercise')).not.toBeInTheDocument()
  })

  it('shows edit button when onEdit is provided', () => {
    render(<ExerciseDetail {...defaultProps} exercise={base} onEdit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('does not show edit button when onEdit is not provided', () => {
    render(<ExerciseDetail {...defaultProps} exercise={base} />)
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
  })

  it('calls onEdit and onClose when edit button is clicked', async () => {
    const onEdit = vi.fn()
    const onClose = vi.fn()
    render(<ExerciseDetail {...defaultProps} exercise={base} onEdit={onEdit} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(base)
    expect(onClose).toHaveBeenCalled()
  })

  it('shows reset progress button when onResetProgress is provided', () => {
    render(<ExerciseDetail {...defaultProps} exercise={base} onResetProgress={vi.fn()} />)
    expect(screen.getByText('Reset progress')).toBeInTheDocument()
  })

  it('does not show reset progress button when onResetProgress is not provided', () => {
    render(<ExerciseDetail {...defaultProps} exercise={base} />)
    expect(screen.queryByText('Reset progress')).not.toBeInTheDocument()
  })

  it('calls onResetProgress when confirmed through dialog', async () => {
    const onResetProgress = vi.fn()
    render(<ExerciseDetail {...defaultProps} exercise={base} onResetProgress={onResetProgress} />)
    await userEvent.click(screen.getByText('Reset progress'))
    expect(screen.getByText('Reset Progress')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onResetProgress).toHaveBeenCalledWith(base)
  })

  it('shows updated reset message indicating PR will also be cleared', async () => {
    render(<ExerciseDetail {...defaultProps} exercise={base} onResetProgress={vi.fn()} />)
    await userEvent.click(screen.getByText('Reset progress'))
    expect(screen.getByText(/reset your PR/i)).toBeInTheDocument()
  })

  it('shows PR as dash when progressResetAt excludes all sessions', () => {
    const sessions = [
      {
        id: 's1',
        date: '2024-01-01',
        label: '',
        entries: [{ exerciseId: 'ex1', sets: [{ reps: 10, weight: 100, unit: 'kg' as const }] }],
      },
    ]
    render(
      <ExerciseDetail
        {...defaultProps}
        exercise={{ ...base, progressResetAt: '2024-01-02T00:00:00.000Z' }}
        sessions={sessions}
      />,
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})

describe('ExerciseDetail image navigation', () => {
  const baseProps = {
    open: true,
    onClose: vi.fn(),
    exercise: { id: '1', name: 'Bench Press', libraryId: 'bench', muscles: [], secondary: [] } as never,
    sessions: [],
    onStartWith: vi.fn(),
  }

  beforeEach(() => {
    mockLibraryEntry.mockReturnValue({
      name: 'Bench Press',
      imageFolder: 'bench',
      imageCount: 3,
      equipment: 'barbell',
      level: 'intermediate',
      mechanic: 'compound',
      force: 'push',
      instructions: ['Step 1'],
      primaryMuscles: [],
      secondaryMuscles: [],
      category: 'strength',
    })
  })

  it('renders prev/next arrow buttons when multiple images exist', () => {
    render(<ExerciseDetail {...baseProps} />)
    const buttons = screen.getAllByRole('button')
    const arrowButtons = buttons.filter(
      (b) => b.querySelector('svg') && b.className.includes('absolute') && b.className.includes('top-1/2'),
    )
    expect(arrowButtons).toHaveLength(2)
  })

  it('renders image counter indicator', () => {
    render(<ExerciseDetail {...baseProps} />)
    expect(screen.getByText('1/3')).toBeInTheDocument()
  })

  it('advances image on next button click', async () => {
    render(<ExerciseDetail {...baseProps} />)
    const nextBtn = screen
      .getAllByRole('button')
      .find((b) => b.querySelector('svg') && b.className.includes('right-2'))!
    await userEvent.click(nextBtn)
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('goes back on prev button click', async () => {
    render(<ExerciseDetail {...baseProps} />)
    const prevBtn = screen.getAllByRole('button').find((b) => b.querySelector('svg') && b.className.includes('left-2'))!
    await userEvent.click(prevBtn)
    expect(screen.getByText('3/3')).toBeInTheDocument()
  })

  it('advances on swipe left gesture', () => {
    render(<ExerciseDetail {...baseProps} />)
    const container = screen.getByText('1/3').parentElement!

    fireEvent.touchStart(container, { touches: [{ clientX: 200 }] })
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 100 }] })

    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('goes back on swipe right gesture', () => {
    render(<ExerciseDetail {...baseProps} />)
    const container = screen.getByText('1/3').parentElement!

    fireEvent.touchStart(container, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 200 }] })

    expect(screen.getByText('3/3')).toBeInTheDocument()
  })
})
