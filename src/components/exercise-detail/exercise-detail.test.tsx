import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Exercise } from '../../types'
import { ExerciseDetail } from './exercise-detail'

vi.mock('../../hooks/useLibraryEntry', () => ({
  useLibraryEntry: () => null,
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
})
