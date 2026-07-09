import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ExerciseForm } from './exercise-form'

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
}

describe('ExerciseForm', () => {
  it('saves a description when provided', async () => {
    const onSave = vi.fn()
    render(<ExerciseForm {...defaultProps} onSave={onSave} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Bench Press'), 'My Exercise')
    await userEvent.type(screen.getByPlaceholderText('How to perform this exercise...'), 'Step one then step two')
    await userEvent.click(screen.getByText('Save'))
    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave.mock.calls[0][0].description).toBe('Step one then step two')
  })

  it('omits description when left empty', async () => {
    const onSave = vi.fn()
    render(<ExerciseForm {...defaultProps} onSave={onSave} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Bench Press'), 'My Exercise')
    await userEvent.click(screen.getByText('Save'))
    expect(onSave.mock.calls[0][0].description).toBeUndefined()
  })

  it('pre-fills description when editing an existing exercise', () => {
    render(
      <ExerciseForm
        {...defaultProps}
        exercise={{
          id: 'ex1',
          name: 'Squat',
          muscleGroups: [],
          primaryMuscles: [],
          secondaryMuscles: [],
          notes: '',
          createdAt: '2026-01-01',
          description: 'Existing description',
        }}
      />,
    )
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
  })

  it('renders the add image button', () => {
    render(<ExerciseForm {...defaultProps} />)
    expect(screen.getByText('Add image')).toBeInTheDocument()
  })

  it('shows existing custom images when editing', () => {
    render(
      <ExerciseForm
        {...defaultProps}
        exercise={{
          id: 'ex1',
          name: 'Squat',
          muscleGroups: [],
          primaryMuscles: [],
          secondaryMuscles: [],
          notes: '',
          createdAt: '2026-01-01',
          customImages: ['data:image/jpeg;base64,abc'],
        }}
      />,
    )
    const images = screen.getAllByAltText(/Custom/)
    expect(images).toHaveLength(1)
    expect(images[0]).toHaveAttribute('src', 'data:image/jpeg;base64,abc')
  })

  it('does not save defaultWarmup when left at default', async () => {
    const onSave = vi.fn()
    render(<ExerciseForm {...defaultProps} onSave={onSave} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Bench Press'), 'Deadlift')
    await userEvent.click(screen.getByText('Save'))
    expect(onSave.mock.calls[0][0].defaultWarmup).toBeUndefined()
  })

  it('saves defaultWarmup: true when With warmup is selected', async () => {
    const onSave = vi.fn()
    render(<ExerciseForm {...defaultProps} onSave={onSave} />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Bench Press'), 'Deadlift')
    await userEvent.click(screen.getByText('With warmup'))
    await userEvent.click(screen.getByText('Save'))
    expect(onSave.mock.calls[0][0].defaultWarmup).toBe(true)
  })

  it('pre-fills With warmup when editing an exercise with defaultWarmup: true', async () => {
    const onSave = vi.fn()
    render(
      <ExerciseForm
        {...defaultProps}
        onSave={onSave}
        exercise={{
          id: 'ex1',
          name: 'Squat',
          muscleGroups: [],
          primaryMuscles: [],
          secondaryMuscles: [],
          notes: '',
          createdAt: '2026-01-01',
          defaultWarmup: true,
        }}
      />,
    )
    await userEvent.click(screen.getByText('Save'))
    expect(onSave.mock.calls[0][0].defaultWarmup).toBe(true)
  })

  it('removes a custom image when the delete button is clicked', async () => {
    const onSave = vi.fn()
    render(
      <ExerciseForm
        {...defaultProps}
        onSave={onSave}
        exercise={{
          id: 'ex1',
          name: 'Squat',
          muscleGroups: [],
          primaryMuscles: [],
          secondaryMuscles: [],
          notes: '',
          createdAt: '2026-01-01',
          customImages: ['data:image/jpeg;base64,img1', 'data:image/jpeg;base64,img2'],
        }}
      />,
    )
    expect(screen.getAllByAltText(/Custom/)).toHaveLength(2)
    const removeButtons = screen.getAllByRole('button').filter((b) => b.querySelector('svg'))
    const xButton = removeButtons.find((b) => b.className.includes('bg-black/60'))
    expect(xButton).toBeTruthy()
    await userEvent.click(xButton!)
    expect(screen.getAllByAltText(/Custom/)).toHaveLength(1)
  })
})
